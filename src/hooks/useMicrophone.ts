import { useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface UseMicrophoneReturn {
  listening: boolean;
  startListening: () => Promise<void>;
  startListeningWithAutoStop: (validateCallback: (text: string | undefined | null) => Promise<boolean>) => Promise<void>;
  stopListening: () => Promise<string>;
  transcript: string;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

// Configuration de l'API de transcription
// Vous pouvez utiliser l'API Whisper d'OpenAI (gratuite jusqu'à une limite)
// ou une autre API open source
const TRANSCRIPTION_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSCRIPTION_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

// Debug: Vérifier si la clé API est chargée
if (__DEV__) {
  console.log('🔑 API Key loaded:', TRANSCRIPTION_API_KEY ? 'YES (length: ' + TRANSCRIPTION_API_KEY.length + ')' : 'NO');
  console.log('🔑 API Key first 10 chars:', TRANSCRIPTION_API_KEY ? TRANSCRIPTION_API_KEY.substring(0, 10) + '...' : 'N/A');
  console.log('🔑 API URL:', TRANSCRIPTION_API_URL);
}

// Alternative: Utiliser une API locale ou un service hébergé
// Exemple avec un service Whisper hébergé (gratuit):
// const TRANSCRIPTION_API_URL = 'https://your-whisper-api.com/transcribe';

export function useMicrophone(): UseMicrophoneReturn {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const uriRef = useRef<string | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const validateCallbackRef = useRef<((text: string | undefined | null) => Promise<boolean>) | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCreatingRecordingRef = useRef<boolean>(false); // Verrou pour éviter les créations simultanées

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('🎤 Permission status:', status);
      
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        console.log('❌ Microphone permission denied');
        Alert.alert(
          'Permission requise',
          'L\'application a besoin d\'accéder au microphone pour fonctionner. Veuillez activer la permission dans les paramètres de votre appareil.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'OK', style: 'default' },
          ]
        );
      } else {
        console.log('✅ Microphone permission granted');
      }
      
      return granted;
    } catch (err) {
      console.error('❌ Error requesting permission:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la demande de permission';
      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
      return false;
    }
  }, []);

  // Helper function to safely stop and unload a recording
  const safelyStopAndUnloadRecording = useCallback(async (
    recording: Audio.Recording
  ): Promise<string | null> => {
    try {
      // Get URI before unloading (once unloaded, getURI() returns null)
      const uri = recording.getURI();
      
      // Try to stop and unload
      try {
        await recording.stopAndUnloadAsync();
        console.log('✅ Recording stopped and unloaded successfully');
      } catch (stopError: any) {
        // Check if error is because recording is already unloaded
        const errorMessage = stopError?.message || String(stopError);
        if (errorMessage.includes('already been unloaded') || 
            errorMessage.includes('unloaded') ||
            errorMessage.includes('not loaded')) {
          console.log('⚠️ Recording already unloaded, skipping stopAndUnloadAsync');
        } else {
          // Re-throw if it's a different error
          throw stopError;
        }
      }
      
      return uri;
    } catch (err) {
      console.error('❌ Error in safelyStopAndUnloadRecording:', err);
      return null;
    }
  }, []);

  // Fonction pour créer un nouvel enregistrement de manière sécurisée
  const createRecordingSafely = useCallback(async (): Promise<Audio.Recording | null> => {
    // Vérifier le verrou
    if (isCreatingRecordingRef.current) {
      console.log('⚠️ Already creating a recording, skipping...');
      return null;
    }

    // Vérifier qu'il n'y a pas d'enregistrement en cours
    if (recordingRef.current) {
      console.log('⚠️ Recording already exists, cleaning up first...');
      const uri = await safelyStopAndUnloadRecording(recordingRef.current);
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (e) {
          // Ignorer les erreurs de suppression
        }
      }
      recordingRef.current = null;
    }

    // Activer le verrou
    isCreatingRecordingRef.current = true;

    try {
      console.log('🎙️ Creating new recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      console.log('✅ Recording created successfully');
      return recording;
    } catch (err) {
      console.error('❌ Error creating recording:', err);
      return null;
    } finally {
      // Désactiver le verrou
      isCreatingRecordingRef.current = false;
    }
  }, [safelyStopAndUnloadRecording]);

  const transcribeAudio = useCallback(async (audioUri: string): Promise<string> => {
    try {
      console.log('🌐 Starting transcription with API...');
      
      // Si vous utilisez l'API OpenAI Whisper
      if (!TRANSCRIPTION_API_KEY || TRANSCRIPTION_API_KEY.trim() === '') {
        console.error('❌ TRANSCRIPTION_API_KEY is missing or empty');
        console.error('❌ Check your .env file and ensure EXPO_PUBLIC_OPENAI_API_KEY is set');
        throw new Error('Clé API OpenAI non configurée. Vérifiez votre fichier .env et redémarrez l\'app.');
      }
      
      console.log('✅ API Key is present, length:', TRANSCRIPTION_API_KEY.length);

      console.log('📤 Preparing FormData...');
      // Créer le FormData pour React Native
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      // Ne pas spécifier la langue pour laisser Whisper détecter automatiquement
      // Cela permet de comprendre l'espagnol avec différents accents
      // formData.append('language', 'es'); // Optionnel : forcer l'espagnol si nécessaire

      console.log('📡 Sending request to OpenAI API...');
      const response = await fetch(TRANSCRIPTION_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRANSCRIPTION_API_KEY}`,
          // Ne pas définir Content-Type, laisse React Native le faire pour FormData
        },
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Transcription successful:', data.text);
      return data.text || '';
    } catch (err) {
      console.error('❌ Transcription error:', err);
      throw err;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      console.log('🎤 Starting to listen...');
      setError(null);
      setTranscript('');

      // Vérifier et demander la permission
      if (!hasPermission) {
        console.log('⚠️ No permission, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          console.log('❌ Permission not granted, cannot start recording');
          Alert.alert('Permission requise', 'Vous devez autoriser l\'accès au microphone pour utiliser cette fonctionnalité.');
          return;
        }
      }

      console.log('🔧 Configuring audio mode...');
      // Configurer le mode audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎙️ Creating recording...');
      // Créer un nouvel enregistrement de manière sécurisée
      const recording = await createRecordingSafely();
      if (!recording) {
        throw new Error('Impossible de créer l\'enregistrement');
      }

      recordingRef.current = recording;
      setListening(true);
      console.log('✅ Recording started successfully');
    } catch (err) {
      console.error('❌ Error starting recording:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du démarrage de l\'enregistrement';
      setError(errorMsg);
      setListening(false);
      isCreatingRecordingRef.current = false; // Libérer le verrou en cas d'erreur
      Alert.alert('Erreur', `Impossible de démarrer l'enregistrement: ${errorMsg}`);
    }
  }, [hasPermission, requestPermission, createRecordingSafely]);

  const stopListening = useCallback(async (): Promise<string> => {
    try {
      console.log('🛑 Stopping recording...');
      
      // Arrêter l'intervalle de validation si actif
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
      // Arrêter le timeout d'inactivité si actif
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      validateCallbackRef.current = null;
      
      if (!recordingRef.current) {
        console.log('⚠️ No recording to stop');
        return '';
      }

      setListening(false);

      // Arrêter l'enregistrement de manière sécurisée
      console.log('⏹️ Stopping and unloading recording...');
      const recording = recordingRef.current;
      recordingRef.current = null; // Libérer la référence immédiatement
      
      const uri = await safelyStopAndUnloadRecording(recording);
      
      if (!uri) {
        throw new Error('Aucun fichier audio enregistré');
      }

      console.log('📁 Audio file saved at:', uri);
      uriRef.current = uri;

      // Vérifier que la clé API est présente
      if (!TRANSCRIPTION_API_KEY) {
        throw new Error('Clé API OpenAI non configurée. Vérifiez votre fichier .env');
      }

      // Transcrire l'audio
      console.log('🔄 Transcribing audio...');
      const transcribedText = await transcribeAudio(uri);
      console.log('✅ Transcription result:', transcribedText);
      setTranscript(transcribedText);

      // Optionnel: Supprimer le fichier temporaire
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log('🗑️ Temp file deleted');
      } catch (deleteErr) {
        // Ignorer les erreurs de suppression
        console.log('⚠️ Could not delete temp file:', deleteErr);
      }

      return transcribedText;
    } catch (err) {
      console.error('❌ Error stopping recording:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'arrêt de l\'enregistrement';
      setError(errorMessage);
      setListening(false);
      Alert.alert('Erreur', errorMessage);
      return '';
    }
  }, [transcribeAudio, safelyStopAndUnloadRecording]);

  // Fonction pour transcrire un segment d'audio sans arrêter l'enregistrement
  const transcribeCurrentSegment = useCallback(async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) {
        return null;
      }

      // Créer une copie temporaire de l'enregistrement actuel
      const tempUri = recordingRef.current.getURI();
      if (!tempUri) {
        return null;
      }

      // Pour transcrire un segment, on doit d'abord arrêter temporairement
      // Puis reprendre. Mais avec expo-av, on ne peut pas faire ça facilement.
      // Solution: on va créer un nouvel enregistrement à chaque fois
      // et fusionner les segments, ou mieux: on va attendre un peu puis transcrire
      
      // Pour l'instant, on va transcrire l'audio actuel
      // Note: Cette approche nécessite d'arrêter l'enregistrement
      // Une meilleure solution serait d'utiliser un buffer audio
      
      return null;
    } catch (err) {
      console.error('Error transcribing segment:', err);
      return null;
    }
  }, []);


  // Fonction pour valider périodiquement pendant l'enregistrement
  const validatePeriodically = useCallback(async () => {
    // Vérifier que l'enregistrement est toujours actif et que le callback existe
    if (!recordingRef.current || !validateCallbackRef.current) {
      console.log('⚠️ No recording or callback, stopping validation');
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
      return;
    }

    // Vérifier le verrou avant de continuer
    if (isCreatingRecordingRef.current) {
      console.log('⚠️ Already processing, skipping validation cycle...');
      return;
    }

    try {
      console.log('🔍 Checking for valid answer...');
      
      // Arrêter temporairement l'enregistrement pour transcrire
      const recording = recordingRef.current;
      recordingRef.current = null; // Libérer la référence immédiatement
      
      // Arrêter l'enregistrement de manière sécurisée
      const uri = await safelyStopAndUnloadRecording(recording);
      
      if (!uri) {
        console.log('⚠️ No URI from recording, creating new one...');
        // Reprendre l'enregistrement
        const newRecording = await createRecordingSafely();
        if (newRecording) {
          recordingRef.current = newRecording;
        }
        return;
      }

      // Transcrire le segment
      let transcribedText: string | undefined;
      try {
        transcribedText = await transcribeAudio(uri);
        console.log('🔍 Current transcription:', transcribedText);
      } catch (transcribeError) {
        console.error('❌ Error transcribing audio:', transcribeError);
        transcribedText = undefined;
      }

      // Supprimer le fichier temporaire après transcription
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        // Ignorer
      }

      if (transcribedText && typeof transcribedText === 'string' && transcribedText.trim().length > 0 && validateCallbackRef.current) {
        // Valider avec le callback
        try {
          const isValid = await validateCallbackRef.current(transcribedText);
          
          if (isValid) {
            console.log('✅ Valid answer detected! Stopping automatically...');
            // Arrêter l'intervalle
            if (validationIntervalRef.current) {
              clearInterval(validationIntervalRef.current);
              validationIntervalRef.current = null;
            }
            // Arrêter le timeout d'inactivité
            if (inactivityTimeoutRef.current) {
              clearTimeout(inactivityTimeoutRef.current);
              inactivityTimeoutRef.current = null;
            }
            
            // Mettre à jour le transcript
            setTranscript(transcribedText);
            setListening(false);
            
            // Nettoyer
            recordingRef.current = null;
            validateCallbackRef.current = null;
            
            return;
          }
        } catch (callbackError) {
          console.error('❌ Error in validation callback:', callbackError);
          // Continuer l'enregistrement même si le callback échoue
        }
      }

      // Si pas valide, reprendre l'enregistrement
      console.log('⏩ Answer not valid yet, continuing...');
      const newRecording = await createRecordingSafely();
      if (newRecording) {
        recordingRef.current = newRecording;
      }
      
    } catch (err) {
      console.error('Error in periodic validation:', err);
      // En cas d'erreur, essayer de reprendre l'enregistrement
      // Ne pas propager l'erreur pour éviter de casser l'enregistrement
      try {
        const newRecording = await createRecordingSafely();
        if (newRecording) {
          recordingRef.current = newRecording;
        }
      } catch (recoveryErr) {
        console.error('Error recovering from validation error:', recoveryErr);
        // Ne rien faire, juste logger l'erreur
      }
    }
  }, [transcribeAudio, createRecordingSafely, safelyStopAndUnloadRecording]);

  const startListeningWithAutoStop = useCallback(async (
    validateCallback: (text: string | undefined | null) => Promise<boolean>
  ) => {
    try {
      console.log('🎤 Starting to listen with auto-stop...');
      setError(null);
      setTranscript('');

      // Sauvegarder le callback de validation
      validateCallbackRef.current = validateCallback;

      // Vérifier et demander la permission
      if (!hasPermission) {
        console.log('⚠️ No permission, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          console.log('❌ Permission not granted, cannot start recording');
          Alert.alert('Permission requise', 'Vous devez autoriser l\'accès au microphone pour utiliser cette fonctionnalité.');
          return;
        }
      }

      console.log('🔧 Configuring audio mode...');
      // Configurer le mode audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎙️ Creating recording...');
      // Créer un nouvel enregistrement de manière sécurisée
      const recording = await createRecordingSafely();
      if (!recording) {
        throw new Error('Impossible de créer l\'enregistrement');
      }

      recordingRef.current = recording;
      setListening(true);
      console.log('✅ Recording started successfully');

      // Démarrer la validation périodique (toutes les 2 secondes)
      validationIntervalRef.current = setInterval(() => {
        validatePeriodically();
      }, 2000);

      // Timeout d'inactivité : arrêter après 30 secondes sans validation réussie
      inactivityTimeoutRef.current = setTimeout(async () => {
        console.log('⏱️ Inactivity timeout: stopping microphone');
        if (recordingRef.current) {
          const recording = recordingRef.current;
          recordingRef.current = null;
          const uri = await safelyStopAndUnloadRecording(recording);
          if (uri) {
            try { 
              await FileSystem.deleteAsync(uri, { idempotent: true }); 
            } catch (e) {
              // Ignorer les erreurs de suppression
            }
          }
        }
        if (validationIntervalRef.current) {
          clearInterval(validationIntervalRef.current);
          validationIntervalRef.current = null;
        }
        validateCallbackRef.current = null;
        setListening(false);
        setError('Enregistrement arrêté après 30 secondes d\'inactivité');
      }, 30000); // 30 secondes
      
    } catch (err) {
      console.error('❌ Error starting recording:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du démarrage de l\'enregistrement';
      setError(errorMsg);
      setListening(false);
      isCreatingRecordingRef.current = false; // Libérer le verrou en cas d'erreur
      Alert.alert('Erreur', `Impossible de démarrer l'enregistrement: ${errorMsg}`);
    }
  }, [hasPermission, requestPermission, validatePeriodically, createRecordingSafely, safelyStopAndUnloadRecording]);

  return {
    listening,
    startListening,
    startListeningWithAutoStop,
    stopListening,
    transcript,
    error,
    hasPermission,
    requestPermission,
  };
}
