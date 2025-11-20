import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import SpeechBubble from '../../components/ui/SpeechBubble';
import MicrophoneButton from '../../components/ui/MicrophoneButton';
import TypewriterText from '../../components/ui/TypewriterText';
import { useMicrophone } from '../../hooks/useMicrophone';
import { ChatMessage } from '../../types';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';
import { generateAIResponse, ChatMessage as AIChatMessage } from '../../utils/aiChat';
import { speakSpanish, stopSpeaking } from '../../utils/textToSpeech';

export default function ChatScreen({ navigation }: any) {
  const { t } = useLanguage();
  const { 
    listening, 
    startListening, 
    startListeningWithAutoStop,
    stopListening, 
    transcript,
    hasPermission,
    requestPermission,
  } = useMicrophone();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const standingVideoRef = useRef<Video>(null);
  const [currentVideo, setCurrentVideo] = useState<'hola' | 'standing'>('hola');
  const [holaVideoSource, setHolaVideoSource] = useState<any>(null);
  const [standingVideoSource, setStandingVideoSource] = useState<any>(null);
  const [holaVideoReady, setHolaVideoReady] = useState(false);
  const [standingVideoReady, setStandingVideoReady] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showGreetingPart2, setShowGreetingPart2] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [userTranscription, setUserTranscription] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const lastSentMessageRef = React.useRef<string>('');
  const greetingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const holaPlayedRef = React.useRef<boolean>(false);
  const holaStartTimeRef = React.useRef<number | null>(null);

  // Vérifier la configuration de l'API au démarrage
  React.useEffect(() => {
    const checkApiKey = () => {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
      if (!apiKey || apiKey.trim() === '') {
        setApiError('Clé API OpenAI non configurée. Vérifiez votre fichier .env et redémarrez le serveur.');
        console.error('❌ OPENAI_API_KEY is not configured');
        console.error('❌ Please check:');
        console.error('   1. Create a .env file in the project root');
        console.error('   2. Add: EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here');
        console.error('   3. Restart the Expo server (npm start)');
      } else {
        setApiError(null);
        console.log('✅ OPENAI_API_KEY is configured (length:', apiKey.length, ')');
      }
    };
    checkApiKey();
  }, []);

  // Charger les deux vidéos
  useEffect(() => {
    const setupVideos = async () => {
      try {
        // Configurer le mode audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Charger les deux vidéos
        const holaSource = require('../../assets/media/videos/hola.mp4');
        const standingSource = require('../../assets/media/videos/call_standing.mp4');
        setHolaVideoSource(holaSource);
        setStandingVideoSource(standingSource);
        setCurrentVideo('hola');
        console.log('✅ Videos loaded (hola and standing)');
      } catch (error) {
        console.error('Error setting up videos:', error);
      }
    };
    setupVideos();
  }, []);

  // Cacher le texte de salutation quand on passe à standing
  useEffect(() => {
    if (currentVideo === 'standing') {
      setShowGreeting(false);
      setShowGreetingPart2(false);
    }
  }, [currentVideo]);

  // Faire disparaître le texte si l'utilisateur n'a pas encore appuyé sur record
  useEffect(() => {
    // Si l'utilisateur a appuyé sur record, le texte reste visible
    if (hasStartedRecording) {
      return;
    }
    // Si l'utilisateur n'a pas encore appuyé sur record, le texte disparaît après 3 secondes
    if (showGreeting && !hasStartedRecording) {
      const hideTimer = setTimeout(() => {
        setShowGreeting(false);
        console.log('✅ Greeting text hidden (user has not pressed record)');
      }, 3000); // Disparaît après 3 secondes si pas d'interaction

      return () => clearTimeout(hideTimer);
    }
  }, [showGreeting, hasStartedRecording]);

  // Lancer immédiatement la vidéo standing quand on passe à 'standing'
  useEffect(() => {
    if (currentVideo === 'standing' && standingVideoReady && standingVideoRef.current) {
      console.log('▶️ Launching standing video immediately');
      standingVideoRef.current.setIsMutedAsync(true);
      standingVideoRef.current.setVolumeAsync(0);
      standingVideoRef.current.playAsync();
    }
  }, [currentVideo, standingVideoReady]);

  // Fonction pour générer une réponse de l'IA en espagnol
  const getAIResponse = React.useCallback(async (userMessage: string): Promise<string> => {
    try {
      setIsGeneratingResponse(true);
      
      // Construire l'historique de conversation en alternant user/assistant
      const conversationHistory: AIChatMessage[] = [];
      
      // Parcourir les messages dans l'ordre et construire l'historique
      for (const msg of messages.slice(-10)) { // Garder seulement les 10 derniers messages
        conversationHistory.push({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        });
      }
      
      // Appeler l'API OpenAI
      const aiResponse = await generateAIResponse(userMessage, conversationHistory);
      return aiResponse;
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      // Retourner une réponse de fallback
      return '¿Qué más quieres decir?';
    } finally {
      setIsGeneratingResponse(false);
    }
  }, [messages]);

  const handleSend = React.useCallback(async (textToSend?: string) => {
    const text = textToSend || inputText || transcript;
    if (text && typeof text === 'string' && text.trim()) {
      // Éviter le double envoi
      if (lastSentMessageRef.current === text.trim()) {
        console.log('⚠️ Message déjà envoyé, ignoré');
        return;
      }
      
      lastSentMessageRef.current = text.trim();
      
      // Afficher la transcription de l'utilisateur en haut
      setUserTranscription(text.trim());
      setShowGreeting(false); // Cacher le texte "Hola, ¿cómo estás?"
      setShowGreetingPart2(false);
      
      // Ajouter le message utilisateur à l'historique
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Générer une réponse de l'IA en espagnol
      try {
        const aiResponseText = await getAIResponse(text.trim());
        
        // Si la réponse contient une erreur de configuration, l'afficher
        if (aiResponseText.includes('non configurée') || aiResponseText.includes('not configured')) {
          setApiError(aiResponseText);
        } else {
          setApiError(null);
        }
        
        // Ajouter la réponse de l'IA à l'historique
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Afficher la réponse de l'IA en haut
        setUserTranscription(aiResponseText);
        
        // Faire parler Sofia à voix haute en espagnol
        await speakSpanish(aiResponseText, true);
      } catch (error: any) {
        console.error('❌ Error in handleSend:', error);
        const errorMessage = error?.message || 'Lo siento, hubo un error. ¿Puedes repetir?';
        
        // Si c'est une erreur de configuration API, l'afficher clairement
        if (errorMessage.includes('non configurée') || errorMessage.includes('not configured')) {
          setApiError(errorMessage);
        }
        
        // Afficher un message d'erreur
        setUserTranscription(errorMessage);
        // Parler le message d'erreur aussi
        await speakSpanish(errorMessage, false);
      }
    }
  }, [inputText, transcript, getAIResponse]);

  // Fonction de validation pour l'arrêt automatique (envoie automatiquement le message)
  const validateAndSend = React.useCallback(async (transcribedText: string | undefined | null): Promise<boolean> => {
    console.log('🔍 ChatScreen validateAndSend called with:', transcribedText);
    if (transcribedText && typeof transcribedText === 'string' && transcribedText.trim().length > 0) {
      console.log('✅ Valid text found, sending message and stopping recording');
      // Envoyer automatiquement le message
      handleSend(transcribedText);
      return true; // Arrêter l'enregistrement
    }
    console.log('⏳ No valid text yet, continuing recording');
    return false; // Continuer si pas de texte
  }, [handleSend]);

  // Arrêter le micro et la synthèse vocale quand on quitte l'écran
  React.useEffect(() => {
    return () => {
      if (listening) {
        console.log('🛑 ChatScreen unmounting: stopping microphone');
        stopListening().catch(err => console.error('Error stopping mic on unmount:', err));
      }
      // Arrêter toute synthèse vocale en cours
      stopSpeaking();
      // Nettoyer le timer de salutation
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
    };
  }, [listening, stopListening]);

  const handleMicrophonePress = async () => {
    console.log('🎤 ChatScreen handleMicrophonePress called, listening:', listening);
    
    // Marquer que l'utilisateur a commencé à enregistrer et réafficher le texte
    if (!hasStartedRecording) {
      setHasStartedRecording(true);
      // Réafficher le texte de salutation si l'utilisateur appuie sur record
      if (!showGreeting) {
        setShowGreeting(true);
      }
    }
    
    if (listening) {
      // Arrêter manuellement
      console.log('⏹️ Stopping recording manually');
      try {
        const transcribedText = await stopListening();
        if (transcribedText && typeof transcribedText === 'string' && transcribedText.trim().length > 0) {
          handleSend(transcribedText);
        }
      } catch (error) {
        console.error('❌ Error stopping recording:', error);
      }
    } else {
      console.log('▶️ Starting recording...');
      // Vérifier la permission
      if (!hasPermission) {
        console.log('⚠️ No permission, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          console.log('❌ Permission not granted');
          return;
        }
      }
      
      console.log('✅ Permission OK, starting with auto-stop');
      // Démarrer avec validation automatique (envoie automatiquement quand il y a du texte)
      try {
        await startListeningWithAutoStop(validateAndSend);
        console.log('✅ Recording started successfully');
      } catch (error) {
        console.error('❌ Error starting recording:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Vidéos en arrière-plan avec fondu */}
      <View style={styles.videoWrapper}>
        {/* Vidéo hola.mp4 */}
        {holaVideoSource && currentVideo === 'hola' && (
          <View style={[styles.videoContainer, { zIndex: 1 }]}>
            <Video
              ref={videoRef}
              source={holaVideoSource}
              style={[styles.backgroundVideo, !holaVideoReady && styles.videoHidden]}
              shouldPlay={holaVideoReady}
              isLooping={false}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
              isMuted={true}
              volume={0}
              progressUpdateIntervalMillis={100}
              onLoadStart={() => {
                console.log('🎬 Hola video load started');
                setHolaVideoReady(false);
                // Réinitialiser le timer de démarrage
                holaStartTimeRef.current = null;
                // Réinitialiser les états du texte
                setShowGreeting(false);
                setShowGreetingPart2(false);
                // Nettoyer le timer de texte s'il existe
                if (greetingTimerRef.current) {
                  clearTimeout(greetingTimerRef.current);
                  greetingTimerRef.current = null;
                }
              }}
              onLoad={(status) => {
                console.log('✅ Hola video loaded:', status);
                setHolaVideoReady(true);
                // Garder la vidéo en muet pour éviter le doublon avec ElevenLabs
                videoRef.current?.setIsMutedAsync(true);
                videoRef.current?.setVolumeAsync(0);
                videoRef.current?.playAsync();
              }}
              onError={(error) => {
                console.error('❌ Hola video error:', error);
                setHolaVideoReady(false);
              }}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  // Détecter quand la vidéo commence à jouer pour déclencher le timer du texte
                  if (status.isPlaying && holaStartTimeRef.current === null) {
                    holaStartTimeRef.current = Date.now();
                    console.log('▶️ Hola video started playing, starting greeting timer');
                    // Afficher "Hola" après 1 seconde
                    greetingTimerRef.current = setTimeout(() => {
                      setShowGreeting(true);
                      console.log('✅ "Hola" displayed');
                      // Afficher "¿cómo estás?" après 2 secondes supplémentaires
                      setTimeout(() => {
                        setShowGreetingPart2(true);
                        console.log('✅ "¿cómo estás?" displayed');
                        // Faire parler Sofia : "Hola, ¿cómo estás?"
                        speakSpanish('Hola, ¿cómo estás?', true).catch(err => {
                          console.error('❌ Error speaking greeting:', err);
                        });
                      }, 2000);
                    }, 1000);
                  }
                  
                  // Si la vidéo hola est terminée, passer directement à call_standing
                  if (status.didJustFinish && !holaPlayedRef.current) {
                    console.log('✅ Hola video finished, switching to call_standing');
                    holaPlayedRef.current = true;
                    // Nettoyer le timer si la vidéo se termine avant que le texte n'apparaisse
                    if (greetingTimerRef.current) {
                      clearTimeout(greetingTimerRef.current);
                      greetingTimerRef.current = null;
                    }
                    // Arrêter la vidéo hola immédiatement
                    videoRef.current?.pauseAsync();
                    // Passer à standing - la vidéo est déjà en train de jouer en arrière-plan
                    setCurrentVideo('standing');
                  }
                  if (!status.isPlaying && !status.isBuffering && holaVideoReady && !status.didJustFinish) {
                    videoRef.current?.playAsync();
                  }
                  // Garder la vidéo en muet pour éviter le doublon avec ElevenLabs
                  if (!status.isMuted) {
                    videoRef.current?.setIsMutedAsync(true);
                    videoRef.current?.setVolumeAsync(0);
                  }
                }
              }}
            />
          </View>
        )}

        {/* Vidéo call_standing.mp4 - préchargée et jouée en arrière-plan pour transition instantanée */}
        {standingVideoSource && (
          <View style={[styles.videoContainer, styles.standingVideoContainer, currentVideo !== 'standing' && styles.videoBehind]}>
            <Video
              ref={standingVideoRef}
              source={standingVideoSource}
              style={styles.backgroundVideo}
              shouldPlay={standingVideoReady}
              isLooping={true}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
              isMuted={true}
              volume={0}
              progressUpdateIntervalMillis={100}
              onLoadStart={() => {
                console.log('🎬 Standing video load started');
                setStandingVideoReady(false);
              }}
              onLoad={(status) => {
                console.log('✅ Standing video loaded:', status);
                setStandingVideoReady(true);
                // Lancer immédiatement la vidéo en arrière-plan
                standingVideoRef.current?.setIsMutedAsync(true);
                standingVideoRef.current?.setVolumeAsync(0);
                standingVideoRef.current?.playAsync();
              }}
              onError={(error) => {
                console.error('❌ Standing video error:', error);
                setStandingVideoReady(false);
              }}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  // Si la vidéo se termine, la relancer automatiquement
                  if (status.didJustFinish) {
                    console.log('🔄 Standing video finished, restarting loop');
                    standingVideoRef.current?.setPositionAsync(0);
                    standingVideoRef.current?.playAsync();
                  }
                  // Si la vidéo n'est pas en train de jouer et n'est pas en train de charger, la relancer (toujours en arrière-plan)
                  if (!status.isPlaying && !status.isBuffering && standingVideoReady && !status.didJustFinish) {
                    standingVideoRef.current?.playAsync();
                  }
                  if (!status.isMuted) {
                    standingVideoRef.current?.setIsMutedAsync(true);
                    standingVideoRef.current?.setVolumeAsync(0);
                  }
                }
              }}
            />
          </View>
        )}
      </View>

      {/* Overlay léger pour améliorer la lisibilité */}
      <View style={styles.overlay} />
      
      {/* Masquer toute bordure multicolore */}
      <View style={styles.borderMask} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              triggerHapticFeedback();
              navigation.navigate('CallEnd');
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.minimizeButton}
            onPress={() => triggerHapticFeedback()}
          >
            <Text style={styles.minimizeIcon}>⤓</Text>
          </TouchableOpacity>
        </View>

        {/* Message d'erreur API si la clé n'est pas configurée */}
        {apiError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {apiError}</Text>
            <Text style={styles.errorSubtext}>
              Vérifiez votre fichier .env et redémarrez le serveur Expo
            </Text>
          </View>
        )}

        {/* Texte de l'utilisateur ou salutation en haut */}
        {(showGreeting || userTranscription) && (
          <View style={styles.topTextContainer}>
            {userTranscription ? (
              <TypewriterText
                text={userTranscription}
                speed={50}
                style={styles.topText}
              />
            ) : (
              <Text style={styles.topText}>
                Hola{showGreetingPart2 ? ', ¿cómo estás?' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Messages - seulement les messages de l'IA (pas les messages utilisateur) */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages
            .filter((message) => !message.isUser) // Filtrer les messages utilisateur
            .map((message) => (
              <SpeechBubble
                key={message.id}
                text={message.text}
                isUser={message.isUser}
                translation={message.translation}
                explanation={message.explanation}
                textOnly={!message.isUser} // Texte seulement pour les messages de l'IA
              />
            ))}
        </ScrollView>

        {/* Microphone Button Only */}
        <View style={styles.microphoneContainer}>
          <TouchableOpacity
            style={styles.microphoneButtonContainer}
            onPress={handleMicrophonePress}
          >
            <MicrophoneButton
              listening={listening}
              onPress={handleMicrophonePress}
              size={60}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    borderRadius: 0,
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  standingVideoContainer: {
    zIndex: 0, // Derrière hola qui a zIndex: 1
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  videoHidden: {
    opacity: 0,
  },
  videoBehind: {
    zIndex: 0, // Derrière hola
    opacity: 1, // Toujours visible mais derrière
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 0,
  },
  borderMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    zIndex: 999,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    zIndex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    fontFamily: typography.fontFamily.bold,
  },
  minimizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimizeIcon: {
    fontSize: 18,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  topTextContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  topText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '900',
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'left',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xl * 2, // Espace pour éviter la navbar
  },
  microphoneButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.regular,
    opacity: 0.9,
  },
});
