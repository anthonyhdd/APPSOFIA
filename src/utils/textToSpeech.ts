/**
 * Utilitaire pour la synthèse vocale en espagnol
 * Utilise Eleven Labs si disponible, sinon expo-speech
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || '';
const ELEVEN_LABS_VOICE_ID = process.env.EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Voix par défaut (Rachel)

/**
 * Lit un texte à voix haute en espagnol
 * @param text Le texte à lire (en espagnol)
 * @param useElevenLabs Si true, utilise Eleven Labs (meilleure qualité), sinon expo-speech
 */
export async function speakSpanish(
  text: string,
  useElevenLabs: boolean = true
): Promise<void> {
  try {
    // Arrêter toute prononciation en cours
    Speech.stop();

    // Configurer le mode audio
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
    });

    // Essayer Eleven Labs si disponible et demandé
    if (useElevenLabs && ELEVEN_LABS_API_KEY) {
      try {
        await speakWithElevenLabs(text);
        return;
      } catch (error) {
        console.warn('⚠️ Eleven Labs failed, falling back to expo-speech:', error);
        // Continuer avec expo-speech en cas d'erreur
      }
    }

    // Fallback vers expo-speech
    await speakWithExpoSpeech(text);
  } catch (error) {
    console.error('❌ Error in speakSpanish:', error);
    // Dernier recours : expo-speech
    try {
      await speakWithExpoSpeech(text);
    } catch (fallbackError) {
      console.error('❌ Fallback speech also failed:', fallbackError);
    }
  }
}

/**
 * Utilise Eleven Labs pour la synthèse vocale (meilleure qualité)
 */
async function speakWithElevenLabs(text: string): Promise<void> {
  console.log('🔊 Generating speech with Eleven Labs:', text);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Modèle multilingue qui supporte bien l'espagnol
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eleven Labs API error (${response.status}): ${errorText}`);
  }

  // Sauvegarder l'audio dans un fichier temporaire
  const cacheDir = (FileSystem as any).cacheDirectory || `${(FileSystem as any).documentDirectory}cache/`;
  const audioUri = `${cacheDir}speech_${Date.now()}.mp3`;

  // Convertir la réponse en blob puis en base64
  const audioBlob = await response.blob();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convertir en base64
  let base64 = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    base64 += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64String = btoa(base64);

  // Créer le répertoire si nécessaire
  const dirInfo = await FileSystem.getInfoAsync(cacheDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  }

  await FileSystem.writeAsStringAsync(audioUri, base64String, {
    encoding: 'base64' as any,
  });

  // Configurer le mode audio
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
    allowsRecordingIOS: false,
  });

  // Jouer l'audio
  const { sound } = await Audio.Sound.createAsync(
    { uri: audioUri },
    {
      shouldPlay: true,
      volume: 1.0,
      isMuted: false,
    }
  );

  await sound.setVolumeAsync(1.0);

  // Nettoyer après la lecture
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
      FileSystem.deleteAsync(audioUri, { idempotent: true }).catch(() => {
        // Ignorer les erreurs de suppression
      });
    }
  });

  console.log('✅ Eleven Labs speech playing');
}

/**
 * Utilise expo-speech pour la synthèse vocale (fallback)
 */
async function speakWithExpoSpeech(text: string): Promise<void> {
  console.log('🔊 Using expo-speech for Spanish:', text);

  // Configurer le mode audio
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
    allowsRecordingIOS: false,
  });

  // Parler en espagnol
  await Speech.speak(text, {
    language: 'es-ES', // Espagnol d'Espagne
    rate: 0.85, // Vitesse légèrement ralentie pour la compréhension
    volume: 1.0, // Volume maximum
    pitch: 1.0, // Hauteur normale
  });

  console.log('✅ expo-speech started');
}

/**
 * Arrête toute synthèse vocale en cours
 */
export function stopSpeaking(): void {
  Speech.stop();
}


