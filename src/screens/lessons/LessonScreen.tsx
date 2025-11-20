import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Speech from 'expo-speech';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import MicrophoneButton from '../../components/ui/MicrophoneButton';
import ProgressBar from '../../components/ui/ProgressBar';
import { useMicrophone } from '../../hooks/useMicrophone';
import { validateVoiceAnswer } from '../../utils/voiceRecognition';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

interface LessonScreenProps {
  route?: {
    params?: {
      lessonId?: string;
    };
  };
}

export default function LessonScreen({ route, navigation }: any) {
  const { 
    listening, 
    startListening, 
    startListeningWithAutoStop,
    stopListening, 
    transcript,
    hasPermission,
    requestPermission,
  } = useMicrophone();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [answer, setAnswer] = useState('');
  const [completed, setCompleted] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Liste de 10 leçons pour le niveau 1
  const lessons = [
    {
      id: '1',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'chair',
      correctAnswerSpanish: 'silla',
      imageEmoji: '🪑',
    },
    {
      id: '2',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'table',
      correctAnswerSpanish: 'mesa',
      imageEmoji: '🪑',
    },
    {
      id: '3',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'door',
      correctAnswerSpanish: 'puerta',
      imageEmoji: '🚪',
    },
    {
      id: '4',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'window',
      correctAnswerSpanish: 'ventana',
      imageEmoji: '🪟',
    },
    {
      id: '5',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'book',
      correctAnswerSpanish: 'libro',
      imageEmoji: '📚',
    },
    {
      id: '6',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'pen',
      correctAnswerSpanish: 'bolígrafo',
      imageEmoji: '✏️',
    },
    {
      id: '7',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'phone',
      correctAnswerSpanish: 'teléfono',
      imageEmoji: '📱',
    },
    {
      id: '8',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'computer',
      correctAnswerSpanish: 'computadora',
      imageEmoji: '💻',
    },
    {
      id: '9',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'car',
      correctAnswerSpanish: 'coche',
      imageEmoji: '🚗',
    },
    {
      id: '10',
      imageUrl: 'https://via.placeholder.com/300',
      prompt: 'SAY IN SPANISH',
      question: 'This is a',
      correctAnswer: 'house',
      correctAnswerSpanish: 'casa',
      imageEmoji: '🏠',
    },
  ];

  const lesson = lessons[currentLessonIndex] || lessons[0];

  // Fonction pour prononcer le mot en espagnol
  const handleLearnPress = async () => {
    try {
      triggerHapticFeedback();
      const spanishWord = lesson.correctAnswerSpanish || lesson.correctAnswer;
      console.log('🔊 Speaking Spanish word:', spanishWord);
      
      if (spanishWord) {
        // Arrêter toute prononciation en cours
        Speech.stop();
        
        // Configurer le mode audio pour un volume maximum
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
        
        // Prononcer le mot en espagnol avec volume maximum
        await Speech.speak(spanishWord, {
          language: 'es-ES', // Espagnol d'Espagne
          pitch: 1.0,
          rate: 0.85,
          volume: 1.0, // Volume maximum
        });
        console.log('✅ Speech started successfully');
      } else {
        console.warn('⚠️ No Spanish word to speak');
      }
    } catch (error) {
      console.error('❌ Error speaking word:', error);
    }
  };

  // Fonction pour générer et jouer le feedback audio avec Eleven Labs
  const playFeedbackAudio = React.useCallback(async (isCorrect: boolean, userAnswer: string) => {
    try {
      const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || '';
      const ELEVEN_LABS_VOICE_ID = process.env.EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Voix par défaut (Rachel - voix de femme)
      
      // Obtenir la langue de l'utilisateur pour la synthèse vocale
      const languageCodeMap: Record<string, string> = {
        'fr': 'fr-FR',
        'en': 'en-US',
        'de': 'de-DE',
        'es': 'es-ES',
        'it': 'it-IT',
        'pt': 'pt-PT',
      };
      const speechLanguage = languageCodeMap[language] || 'en-US';
      
      // Obtenir les traductions du feedback dans la langue de l'utilisateur
      const feedbackText = isCorrect
        ? t('lesson.feedback.correct').replace('{answer}', userAnswer)
        : t('lesson.feedback.incorrect').replace('{answer}', userAnswer);
      
      if (!ELEVEN_LABS_API_KEY) {
        console.warn('⚠️ Eleven Labs API key not configured, using fallback speech');
        // Configurer le mode audio pour un volume maximum
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          allowsRecordingIOS: false,
        });
        // Fallback vers expo-speech avec volume maximum dans la langue de l'utilisateur
        await Speech.speak(feedbackText, { 
          language: speechLanguage, 
          rate: 0.85,
          volume: 1.0,
          pitch: 1.0,
        });
        return;
      }

      console.log('🔊 Generating feedback audio with Eleven Labs:', feedbackText);

      // Appeler l'API Eleven Labs
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
            text: feedbackText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Eleven Labs API error: ${response.status}`);
      }

      // Sauvegarder l'audio dans un fichier temporaire
      const cacheDir = (FileSystem as any).cacheDirectory || `${(FileSystem as any).documentDirectory}cache/`;
      const audioUri = `${cacheDir}feedback_${Date.now()}.mp3`;
      
      // Convertir la réponse en blob puis en base64
      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convertir en base64 (méthode compatible React Native)
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

      // Configurer le mode audio pour un volume maximum
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        allowsRecordingIOS: false,
      });

      // Jouer l'audio avec volume maximum (1.0 est le maximum)
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: true, 
          volume: 1.0,
          isMuted: false,
        }
      );
      
      // S'assurer que le volume est au maximum après la création
      await sound.setVolumeAsync(1.0);

      // Nettoyer après la lecture
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          FileSystem.deleteAsync(audioUri, { idempotent: true });
        }
      });

      console.log('✅ Feedback audio playing');
    } catch (error) {
      console.error('❌ Error playing feedback audio:', error);
      // Configurer le mode audio pour un volume maximum
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          allowsRecordingIOS: false,
        });
      // Obtenir la langue de l'utilisateur pour le fallback
      const languageCodeMap: Record<string, string> = {
        'fr': 'fr-FR',
        'en': 'en-US',
        'de': 'de-DE',
        'es': 'es-ES',
        'it': 'it-IT',
        'pt': 'pt-PT',
      };
      const speechLanguage = languageCodeMap[language] || 'en-US';
      const feedbackText = isCorrect 
        ? t('lesson.feedback.correct') || `Excellent! You said "${userAnswer}". Well done.`
        : t('lesson.feedback.incorrect') || `Not correct. You said "${userAnswer}". Try again.`;
      await Speech.speak(feedbackText, { 
        language: speechLanguage, 
        rate: 0.85,
        volume: 1.0,
        pitch: 1.0,
      });
    }
  }, [language, t]);

  // Fonction de validation pour l'arrêt automatique
  const validateAnswer = React.useCallback(async (transcribedText: string | null | undefined): Promise<boolean> => {
    if (!transcribedText || transcribedText.trim() === '') {
      return false;
    }
    // Valider avec la réponse espagnole si disponible, sinon avec la réponse anglaise
    const answerToValidate = lesson.correctAnswerSpanish || lesson.correctAnswer;
    const validation = validateVoiceAnswer(transcribedText, answerToValidate);
    
    // Toujours valider et donner un feedback
    const isCorrect = validation.isValid;
    
    if (isCorrect) {
      setCompleted(true);
      setAnswer(lesson.correctAnswer);
      setValidationMessage(`✅ Correct! "${transcribedText}"`);
      
      // Afficher les confettis
      setShowConfetti(true);
      triggerHapticFeedback();
    } else {
      setValidationMessage(`❌ Incorrect. You said: "${transcribedText}".`);
      setCompleted(false);
    }
    
    // Toujours jouer le feedback audio
    await playFeedbackAudio(isCorrect, transcribedText);
    
    // Toujours passer à la question suivante après 3 secondes
    setTimeout(() => {
      setShowConfetti(false);
      setValidationMessage(null);
      setCompleted(false);
      setAnswer('');
      
      // Passer à la question suivante
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      } else {
        // Toutes les leçons sont terminées, revenir à la première
        setCurrentLessonIndex(0);
      }
    }, 3000);
    
    return isCorrect;
  }, [playFeedbackAudio, lesson, currentLessonIndex, lessons.length, t]);

  // Arrêter le micro quand on quitte l'écran
  React.useEffect(() => {
    return () => {
      if (listening) {
        console.log('🛑 LessonScreen unmounting: stopping microphone');
        stopListening().catch(err => console.error('Error stopping mic on unmount:', err));
      }
    };
  }, [listening, stopListening]);

  // Observer les changements de transcript pour détecter l'arrêt automatique
  React.useEffect(() => {
    if (transcript && !listening && !completed) {
      // Le micro s'est arrêté automatiquement avec une transcription
      const validation = validateVoiceAnswer(transcript, lesson.correctAnswer);
      if (validation.isValid) {
        setCompleted(true);
        setAnswer(lesson.correctAnswer);
        setValidationMessage(`✅ Correct! "${transcript}"`);
      }
    }
  }, [transcript, listening, completed]);

  const handleMicrophonePress = async () => {
    if (listening) {
      // Arrêter manuellement
      const transcribedText = await stopListening();
      if (transcribedText) {
        await validateAnswer(transcribedText);
      }
    } else {
      // Vérifier la permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }
      
      setAnswer('');
      setCompleted(false);
      setValidationMessage(null);
      
      // Démarrer avec validation automatique
      await startListeningWithAutoStop(validateAnswer);
    }
  };

  // Calculer la progression basée sur la question actuelle (1/10, 2/10, etc.)
  const progress = (currentLessonIndex + 1) / lessons.length;
  const currentQuestionNumber = currentLessonIndex + 1;
  const totalQuestions = lessons.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Video Background */}
      <Video
        source={require('../../assets/media/videos/home.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        volume={0}
      />

      {/* Header */}
      <View style={[styles.header, { zIndex: 10 }]}>
        <TouchableOpacity 
          onPress={() => {
            triggerHapticFeedback();
            navigation.goBack();
          }} 
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            currentQuestion={currentQuestionNumber}
            totalQuestions={totalQuestions}
          />
        </View>
        <Image
          source={require('../../assets/media/videos/progress_girl.png')}
          style={styles.progressImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        {/* Confettis */}
        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            <LottieView
              source={require('../../assets/media/videos/confetti.json')}
              autoPlay
              loop={false}
              style={styles.confetti}
            />
          </View>
        )}

        {/* Image de la leçon */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleLearnPress}
          activeOpacity={0.8}
        >
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{lesson.imageEmoji || '🪑'}</Text>
          </View>
        </TouchableOpacity>

        {/* Bouton Microphone avec animation */}
        <View style={styles.microphoneContainer}>
          <View style={styles.microphoneButtonWrapper}>
            <MicrophoneButton
              listening={listening}
              onPress={handleMicrophonePress}
              size={60}
            />
          </View>
          <Text style={styles.sayInSpanishText}>{t('lesson.say_in_spanish')}</Text>
        </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <MaskedView
              maskElement={
                <Text style={styles.questionText}>{lesson.question}</Text>
              }
            >
              <LinearGradient
                colors={['#FF6B35', '#FF4500', '#FF0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.questionGradient}
              >
                <Text style={[styles.questionText, { opacity: 0 }]}>{lesson.question}</Text>
              </LinearGradient>
            </MaskedView>
            <View style={[
              styles.answerContainer,
              completed && styles.answerContainerSuccess
            ]}>
              <Text style={[
                styles.answerText,
                completed && styles.answerTextSuccess
              ]}>{answer || '___'}</Text>
            </View>
          </View>

          {/* Message de validation */}
          {validationMessage && (
            <View style={[
              styles.validationContainer,
              validationMessage.includes('✅') ? styles.validationSuccess : styles.validationError
            ]}>
              <Text style={[
                styles.validationText,
                validationMessage.includes('✅') ? styles.validationTextSuccess : styles.validationTextError
              ]}>
                {validationMessage}
              </Text>
            </View>
          )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
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
  progressContainer: {
    flex: 1,
  },
  progressImage: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  imageContainer: {
    width: width * 0.4,
    height: width * 0.4,
    marginTop: spacing['3xl'] * 3 + 100,
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  imagePlaceholderText: {
    fontSize: 120,
  },
  microphoneContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  microphoneButtonWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sayInSpanishText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  questionText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
  questionGradient: {
    paddingVertical: spacing.xs,
  },
  answerContainer: {
    minWidth: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FF6B35' + '30',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  answerContainerSuccess: {
    backgroundColor: '#10B981' + '30',
    borderColor: '#10B981',
  },
  answerText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  answerTextSuccess: {
    color: '#10B981',
  },
  timerContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.textWhite,
  },
  timerText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  validationContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  validationSuccess: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  validationError: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  validationText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
  },
  validationTextSuccess: {
    color: colors.success,
  },
  validationTextError: {
    color: colors.error,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
});
