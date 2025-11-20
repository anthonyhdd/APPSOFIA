import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configurer le handler des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import OnboardingHeader from '../../components/layout/OnboardingHeader';
import AvatarContainer from '../../components/ui/AvatarContainer';
import ProgressBar from '../../components/ui/ProgressBar';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useLanguage, getLanguageCode } from '../../context/LanguageContext';
import { triggerHapticFeedback } from '../../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen({ navigation, route }: any) {
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    answers,
    nextStep,
    previousStep,
    goToStepByType,
    setAnswer,
    isComplete,
  } = useOnboarding();
  const { setLanguage, t } = useLanguage();

  const insets = useSafeAreaInsets();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideshowIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const slideshowScrollRef = React.useRef<ScrollView>(null);
  const pressHoldScaleAnim = React.useRef(new Animated.Value(1)).current;
  const pressHoldGlowAnim = React.useRef(new Animated.Value(0)).current;
  const fullScreenProgressAnim = React.useRef(new Animated.Value(0)).current;
  const nextButtonShakeAnim = React.useRef(new Animated.Value(0)).current;
  const [planProgress, setPlanProgress] = useState(0);
  const planProgressAnim = React.useRef(new Animated.Value(0)).current;
  const videoRef = React.useRef<Video>(null);
  const paywallVideoRef = React.useRef<Video>(null);
  const celebrationVideoRef = React.useRef<Video>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [paywallVideoReady, setPaywallVideoReady] = useState(false);
  const [celebrationVideoReady, setCelebrationVideoReady] = useState(false);
  const cachedVideoUri = React.useRef<string | null>(null);
  const [cachedVideoUriState, setCachedVideoUriState] = React.useState<string | null>(null);
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const autoNextTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const progress = (currentStep + 1) / totalSteps;

  // Animation de la barre de progression pour personalized_plan
  useEffect(() => {
    if (currentQuestion.type === 'personalized_plan') {
      // Réinitialiser la progression
      planProgressAnim.setValue(0);
      setPlanProgress(0);
      
      // Animer la progression de 0 à 1 en 6 secondes
      Animated.timing(planProgressAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: false,
      }).start();

      // Mettre à jour l'état de progression
      const listener = planProgressAnim.addListener(({ value }) => {
        setPlanProgress(value);
      });

      return () => {
        planProgressAnim.removeListener(listener);
      };
    }
  }, [currentQuestion.type, planProgressAnim]);

  // Animation de chargement
  useEffect(() => {
    if (videoLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [videoLoading]);

  // Précharger la vidéo et configurer l'audio quand on arrive sur l'écran vidéo
  useEffect(() => {
    if (currentQuestion.type === 'intro_video' && currentQuestion.videoUrl) {
      const setupVideo = async () => {
        try {
          // Configurer le mode audio pour permettre le son
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
          });

          setVideoLoading(true);
          setVideoReady(false);
          
          // Nettoyer le timer précédent s'il existe
          if (autoNextTimerRef.current) {
            clearTimeout(autoNextTimerRef.current);
            autoNextTimerRef.current = null;
          }
        } catch (error) {
          console.error('Error setting up video:', error);
        }
      };
      setupVideo();
    }
    
    // Nettoyer le timer quand on quitte l'écran vidéo
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
    };
  }, [currentQuestion.type, currentQuestion.videoUrl]);

  // Précharger la vidéo dès le début de l'onboarding pour un chargement plus rapide
  useEffect(() => {
    const preloadVideo = async () => {
      try {
        // Configurer le mode audio dès le début
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio mode configured for video');

        // Utiliser le fichier vidéo local
        const videoSource = currentQuestion.videoUrl || require('../../assets/media/videos/sofiaa.mp4');
        cachedVideoUri.current = typeof videoSource === 'string' ? videoSource : videoSource.uri;
        setCachedVideoUriState(typeof videoSource === 'string' ? videoSource : videoSource.uri);
        console.log('✅ Video source set (local file)');
      } catch (error) {
        console.error('Error setting up video:', error);
        // En cas d'erreur, utiliser le fichier local
        const videoSource = require('../../assets/media/videos/sofiaa.mp4');
        cachedVideoUri.current = typeof videoSource === 'string' ? videoSource : videoSource.uri;
        setCachedVideoUriState(typeof videoSource === 'string' ? videoSource : videoSource.uri);
      }
    };
    preloadVideo();
  }, []);


  // Réinitialiser les sélections quand on change d'étape
  useEffect(() => {
    const currentAnswer = answers[currentQuestion.id];
    if (Array.isArray(currentAnswer)) {
      setSelectedOptions(currentAnswer);
    } else if (currentAnswer) {
      setTextInput(currentAnswer);
      if (currentQuestion.type === 'native_language' || currentQuestion.type === 'gender' || currentQuestion.type === 'age') {
        setSelectedOptions([currentAnswer]);
      }
    } else {
      setSelectedOptions([]);
      setTextInput('');
    }
  }, [currentQuestion.id, answers]);

  // Naviguer vers PaywallScreen quand on arrive à l'étape paywall
  useEffect(() => {
    if (currentQuestion.type === 'paywall') {
      navigation.navigate('Paywall', { fromOnboarding: true });
    }
  }, [currentQuestion.type, navigation]);

  // Auto-advance slideshow
  useEffect(() => {
    if (currentQuestion.type === 'slideshow' && currentQuestion.slides) {
      // Reset slide index when slideshow screen appears
      setCurrentSlideIndex(0);
      // Scroll to first slide
      setTimeout(() => {
        slideshowScrollRef.current?.scrollTo({ x: 0, animated: false });
      }, 100);
      
      // Auto-advance slides every 3 seconds
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => {
          const nextIndex = (prev + 1) % currentQuestion.slides!.length;
          const slideWidth = Dimensions.get('window').width;
          slideshowScrollRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
          return nextIndex;
        });
      }, 3000);

      return () => {
        if (slideshowIntervalRef.current) {
          clearInterval(slideshowIntervalRef.current);
        }
      };
    }
  }, [currentQuestion.type, currentQuestion.slides]);

  // Écouter les paramètres de navigation pour aller à une étape spécifique
  useEffect(() => {
    const targetStep = route?.params?.targetStep;
    if (targetStep) {
      goToStepByType(targetStep);
      // Nettoyer le paramètre pour éviter de revenir à cette étape à chaque focus
      navigation.setParams({ targetStep: undefined });
    }
  }, [route?.params?.targetStep, goToStepByType, navigation]);

  const handleOptionSelect = (option: string) => {
    triggerHapticFeedback();
    if (currentQuestion.multiSelect) {
      // Multi-sélection (interests)
      const newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter(o => o !== option)
        : [...selectedOptions, option];
      setSelectedOptions(newSelection);
      setAnswer(currentQuestion.id, newSelection);
    } else {
      // Sélection unique
      setSelectedOptions([option]);
      setAnswer(currentQuestion.id, option);
      
      // Si c'est la sélection de la langue maternelle, sauvegarder la langue de l'app
      if (currentQuestion.type === 'native_language') {
        const languageCode = getLanguageCode(option);
        setLanguage(languageCode).catch((error) => {
          console.error('❌ Error setting language:', error);
        });
        console.log('🌍 Language set to:', languageCode);
      }
    }
  };

  const requestNotificationPermission = async () => {
    try {
      console.log('🔔 Requesting notification permission...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📊 Current notification permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('📝 Requesting permission...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
        console.log('📊 New permission status:', finalStatus);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        return false;
      }
      
      console.log('✅ Notification permission granted');
      
      // Envoyer une notification push de test
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Welcome to Sofia! 🎉',
            body: 'You won\'t forget to practice with me. Let\'s start your Spanish learning journey!',
            sound: true,
            badge: 1,
          },
          trigger: null, // Envoyer immédiatement
        });
        console.log('✅ Test notification sent');
      } catch (notificationError) {
        console.error('❌ Error sending test notification:', notificationError);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  };

  const handleNext = () => {
    triggerHapticFeedback();
    
    // Vérifier si le bouton devrait être désactivé
    const isDisabled = 
      (currentQuestion.type === 'text' && !textInput.trim()) ||
      (!currentQuestion.multiSelect && selectedOptions.length === 0 && 
       (currentQuestion.type === 'native_language' || currentQuestion.type === 'gender' || 
        currentQuestion.type === 'age' || currentQuestion.type === 'current_learning' ||
        currentQuestion.type === 'main_goal' || currentQuestion.type === 'speaking_frequency' ||
        currentQuestion.type === 'fear_ridiculous' || currentQuestion.type === 'improvement_areas' ||
        currentQuestion.type === 'commitment')) ||
      (currentQuestion.multiSelect && selectedOptions.length === 0);
    
    if (isDisabled) {
      // Animation de shake pour indiquer que le bouton ne fonctionne pas
      nextButtonShakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(nextButtonShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(nextButtonShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    
    // Validation selon le type
    if (currentQuestion.type === 'text' && !textInput.trim()) {
      return;
    }
    if (!currentQuestion.multiSelect && selectedOptions.length === 0 && 
        (currentQuestion.type === 'native_language' || currentQuestion.type === 'gender' || 
         currentQuestion.type === 'age' || currentQuestion.type === 'current_learning' ||
         currentQuestion.type === 'main_goal' || currentQuestion.type === 'speaking_frequency' ||
         currentQuestion.type === 'fear_ridiculous' || currentQuestion.type === 'improvement_areas' ||
         currentQuestion.type === 'commitment')) {
      return;
    }
    if (currentQuestion.multiSelect && selectedOptions.length === 0) {
      return;
    }

    // Sauvegarder le prénom si c'est la question du nom
    if (currentQuestion.id === '3' && textInput.trim()) {
      const { setStorageItem } = require('../../utils/storage');
      const firstName = textInput.trim().split(' ')[0];
      if (firstName) {
        setStorageItem('user_name', firstName)
          .then(() => {
            console.log('✅ User name saved in handleNext:', firstName);
          })
          .catch((err: any) => {
            console.error('❌ Error saving user name in handleNext:', err);
          });
      }
    }

    if (isComplete) {
      // Marquer l'utilisateur comme inscrit
      const { setStorageItem } = require('../../utils/storage');
      setStorageItem('user_signed_up', 'true').catch((err: any) => {
        console.error('Error saving sign up status:', err);
      });
      navigation.replace('Home');
    } else {
      nextStep();
    }
  };

  const handlePressHold = () => {
    triggerHapticFeedback();
    // Animation de scale (gonflement)
    Animated.parallel([
      Animated.spring(pressHoldScaleAnim, {
        toValue: 1.15,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(pressHoldGlowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animation de progression plein écran (gradient orange/rouge)
    Animated.timing(fullScreenProgressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      handleNext();
    });
  };

  const handlePressRelease = () => {
    // Retour à l'état initial
    Animated.parallel([
      Animated.timing(fullScreenProgressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(pressHoldScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(pressHoldGlowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fonction helper pour traduire les questions
  const getTranslatedQuestion = (question: string | undefined, type: string): string => {
    if (!question) return '';
    const questionMap: Record<string, string> = {
      'What is your level in Spanish?': 'onboarding.spanish_level',
      'What is your native language?': 'onboarding.native_language',
      'What is your name?': 'onboarding.name',
      'What is your gender?': 'onboarding.gender',
      'How old are you?': 'onboarding.age',
      'How are you currently improving your Spanish?': 'onboarding.current_learning.question',
      'What is your main goal for improving your Spanish?': 'onboarding.main_goal.question',
      'How often do you speak Spanish in your daily life?': 'onboarding.speaking_frequency.question',
      'Are you afraid of sounding silly when you speak Spanish?': 'onboarding.fear.question',
      'Where do you want to improve?': 'onboarding.improvement.question',
      'What topics interest you?': 'onboarding.interests.question',
      'What is your commitment to progress?': 'onboarding.commitment.question',
      'With me, you won\'t forget to practice': 'onboarding.notifications.question',
    };
    const key = questionMap[question];
    return key ? t(key) : question;
  };

  // Fonction helper pour traduire les options
  const getTranslatedOption = (option: string, type: string, index: number): string => {
    // Traduction pour le niveau en espagnol
    if (type === 'spanish_level') {
      const levelKey = option.toLowerCase();
      return t(`onboarding.spanish_level.${levelKey}`);
    }
    const optionMap: Record<string, Record<string, string>> = {
      gender: {
        'Male': 'onboarding.gender.male',
        'Female': 'onboarding.gender.female',
        'Prefer not to say': 'onboarding.gender.prefer_not',
      },
      age: {
        'Under 18': 'onboarding.age.under_18',
        '18 - 24': 'onboarding.age.18_24',
        '25 - 34': 'onboarding.age.25_34',
        '35 - 54': 'onboarding.age.35_54',
        '55 and over': 'onboarding.age.55_over',
        'Prefer not to say': 'onboarding.age.prefer_not',
      },
      current_learning: {
        'Courses or training': 'onboarding.current_learning.courses',
        'Language apps': 'onboarding.current_learning.apps',
        'Videos or movies': 'onboarding.current_learning.videos',
        'Podcasts or audiobooks': 'onboarding.current_learning.podcasts',
        'By speaking with other people': 'onboarding.current_learning.speaking',
        'I\'m not currently learning': 'onboarding.current_learning.not_learning',
      },
      main_goal: {
        'Work': 'onboarding.main_goal.work',
        'Living abroad': 'onboarding.main_goal.living_abroad',
        'Traveling': 'onboarding.main_goal.traveling',
        'Developing my skills': 'onboarding.main_goal.skills',
        'Speaking with friends': 'onboarding.main_goal.friends',
        'Studying': 'onboarding.main_goal.studying',
      },
      speaking_frequency: {
        'Every day': 'onboarding.speaking_frequency.everyday',
        'A few days a week': 'onboarding.speaking_frequency.few_week',
        'A few days a month': 'onboarding.speaking_frequency.few_month',
        'Never': 'onboarding.speaking_frequency.never',
      },
      fear_ridiculous: {
        'No': 'onboarding.fear.no',
        'Maybe': 'onboarding.fear.maybe',
        'Yes': 'onboarding.fear.yes',
      },
      improvement_areas: {
        'Speaking with confidence': 'onboarding.improvement.speaking',
        'Improving pronunciation': 'onboarding.improvement.pronunciation',
        'Enriching vocabulary': 'onboarding.improvement.vocabulary',
        'Being good at grammar': 'onboarding.improvement.grammar',
        'Understanding native speakers': 'onboarding.improvement.understanding',
        'Writing more fluently': 'onboarding.improvement.writing',
        'Something else': 'onboarding.improvement.else',
      },
      interests: {
        'Memes': 'onboarding.interests.memes',
        'Humor': 'onboarding.interests.humor',
        'Tech': 'onboarding.interests.tech',
        'Business': 'onboarding.interests.business',
        'Video games': 'onboarding.interests.games',
        'Music': 'onboarding.interests.music',
        'Movies': 'onboarding.interests.movies',
        'News': 'onboarding.interests.news',
        'Books': 'onboarding.interests.books',
        'Podcasts': 'onboarding.interests.podcasts',
        'Fitness': 'onboarding.interests.fitness',
        'Food': 'onboarding.interests.food',
        'Crafts': 'onboarding.interests.crafts',
        'Travel': 'onboarding.interests.travel',
        'Science': 'onboarding.interests.science',
      },
      commitment: {
        '7-day streak': 'onboarding.commitment.7_days',
        '14-day streak': 'onboarding.commitment.14_days',
        '30-day streak': 'onboarding.commitment.30_days',
        '50-day streak': 'onboarding.commitment.50_days',
      },
    };
    const typeMap = optionMap[type];
    if (typeMap && typeMap[option]) {
      return t(typeMap[option]);
    }
    return option;
  };

  const renderContent = () => {
    console.log('🔍 Rendering content for type:', currentQuestion.type, 'step:', currentQuestion.step, 'id:', currentQuestion.id);
    switch (currentQuestion.type) {
      case 'intro_video':
        return (
          <TouchableOpacity
            style={styles.videoContainer}
            activeOpacity={1}
            onPress={() => {
              // Annuler le timer d'auto-avancement
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              // Passer directement à la première étape
              triggerHapticFeedback();
              handleNext();
            }}
          >
            {/* Animation de chargement */}
            {videoLoading && (
              <View style={styles.loadingContainer}>
                <Animated.View
                  style={[
                    styles.loadingSpinner,
                    {
                      transform: [
                        {
                          rotate: spinAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.spinnerCircle} />
                </Animated.View>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}

            {/* Vidéo */}
            {(cachedVideoUriState || currentQuestion.videoUrl) && (
              <Video
                ref={videoRef}
                source={cachedVideoUriState 
                  ? { uri: cachedVideoUriState }
                  : (typeof currentQuestion.videoUrl === 'string' 
                      ? { uri: currentQuestion.videoUrl }
                      : currentQuestion.videoUrl || require('../../assets/media/videos/sofiaa.mp4'))
                }
                style={[styles.video, !videoReady && styles.videoHidden]}
                shouldPlay={videoReady}
                isLooping
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
                isMuted={false}
                volume={1.0}
                progressUpdateIntervalMillis={100}
                onLoadStart={() => {
                  console.log('🎬 Video load started');
                  setVideoLoading(true);
                  setVideoReady(false);
                }}
                onLoad={(status) => {
                  console.log('✅ Video loaded:', status);
                  setVideoLoading(false);
                  setVideoReady(true);
                  // S'assurer que la vidéo joue avec le son
                  videoRef.current?.setIsMutedAsync(false);
                  videoRef.current?.setVolumeAsync(1.0);
                  videoRef.current?.playAsync();
                }}
                onError={(error) => {
                  console.error('❌ Video error:', error);
                  setVideoLoading(false);
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded) {
                    // Si la vidéo est chargée mais ne joue pas, forcer la lecture
                    if (!status.isPlaying && !status.isBuffering && videoReady) {
                      videoRef.current?.playAsync();
                    }
                    // S'assurer que le son est activé
                    if (status.isMuted) {
                      videoRef.current?.setIsMutedAsync(false);
                    }
                    // Passer automatiquement à l'étape suivante après 6 secondes quand la vidéo commence à jouer
                    if (status.isPlaying && !autoNextTimerRef.current && currentQuestion.type === 'intro_video') {
                      autoNextTimerRef.current = setTimeout(() => {
                        console.log('⏭️ Auto-advancing to next step after 6 seconds');
                        handleNext();
                        autoNextTimerRef.current = null;
                      }, 6000);
                    }
                  }
                }}
              />
            )}
          </TouchableOpacity>
        );

      case 'native_language':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.languageOption,
                    selectedOptions.includes(option) && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={styles.flagEmoji}>{currentQuestion.flags?.[index]}</Text>
                  <Text style={[
                    styles.languageOptionText,
                    selectedOptions.includes(option) && styles.languageOptionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'text':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={(text) => {
                setTextInput(text);
                setAnswer(currentQuestion.id, text);
                // Sauvegarder le nom de l'utilisateur si c'est la question du nom
                if (currentQuestion.id === '3') {
                  const { setStorageItem } = require('../../utils/storage');
                  const firstName = text.trim().split(' ')[0];
                  if (firstName) {
                    setStorageItem('user_name', firstName)
                      .then(() => {
                        console.log('✅ User name saved:', firstName);
                      })
                      .catch((err: any) => {
                        console.error('❌ Error saving user name:', err);
                      });
                  }
                }
              }}
              placeholder={currentQuestion.placeholder ? t(`onboarding.placeholder.${currentQuestion.step}`) : undefined}
              placeholderTextColor={colors.textLight}
              autoFocus
            />
          </View>
        );

      case 'slideshow':
        const handleScroll = (event: any) => {
          const slideWidth = Dimensions.get('window').width;
          const offsetX = event.nativeEvent.contentOffset.x;
          const newIndex = Math.round(offsetX / slideWidth);
          if (newIndex !== currentSlideIndex && newIndex >= 0 && newIndex < (currentQuestion.slides?.length || 0)) {
            setCurrentSlideIndex(newIndex);
            // Clear and restart auto-advance timer when user manually swipes
            if (slideshowIntervalRef.current) {
              clearInterval(slideshowIntervalRef.current);
            }
            slideshowIntervalRef.current = setInterval(() => {
              setCurrentSlideIndex((prev) => {
                const nextIndex = (prev + 1) % currentQuestion.slides!.length;
                const slideWidth = Dimensions.get('window').width;
                slideshowScrollRef.current?.scrollTo({ 
                  x: nextIndex * slideWidth, 
                  animated: true 
                });
                return nextIndex;
              });
            }, 3000);
          }
        };

        return (
          <View style={styles.contentContainer}>
            {currentQuestion.slides && currentQuestion.slides.length > 0 && (
              <ScrollView
                ref={slideshowScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={Dimensions.get('window').width}
                snapToAlignment="start"
                style={styles.slideshowScrollView}
                contentContainerStyle={styles.slideshowScrollContent}
              >
                {currentQuestion.slides.map((slide, index) => {
                  const slideLabels = ['At the hotel', 'In vacation'];
                  return (
                    <View key={index} style={styles.slideshowSlideContainer}>
                      <View style={styles.slideshowImageWrapper}>
                        <Image
                          source={slide}
                          style={styles.slideshowImage}
                          resizeMode="cover"
                        />
                        <Text style={styles.slideshowSlideLabel}>
                          {slideLabels[index] || ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.slideshowTextContainer}>
              <Text style={styles.slideshowTitle}>
                Speak with <Text style={styles.slideshowBoldText}>Sofia</Text>
              </Text>
              <View style={styles.slideshowSubtitleContainer}>
                <Text style={styles.slideshowSubtitle}>
                  {currentQuestion.subtitle || 'in more than'}{' '}
                </Text>
                <MaskedView
                  maskElement={
                    <Text style={styles.slideshowHighlightMask}>1000</Text>
                  }
                  style={styles.slideshowMaskedView}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FF4500', '#FF0000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.slideshowHighlightGradient}
                  >
                    <Text style={[styles.slideshowHighlightMask, { opacity: 0 }]}>
                      1000
                    </Text>
                  </LinearGradient>
                </MaskedView>
                <Text style={styles.slideshowSubtitle}>
                  {' '}{currentQuestion.highlightText || 'situations!'}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'gender':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.genderOption,
                    selectedOptions.includes(option) && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons?.[index] && (
                    <View style={styles.emojiCircleSmall}>
                      <Text style={styles.genderIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.genderOptionText,
                    selectedOptions.includes(option) && styles.genderOptionTextSelected,
                  ]}>
                    {getTranslatedOption(option, currentQuestion.type, index)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'age':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.ageOption,
                    selectedOptions.includes(option) && styles.ageOptionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons?.[index] && (
                    <View style={styles.emojiCircleSmall}>
                      <Text style={styles.ageIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.ageOptionText,
                    selectedOptions.includes(option) && styles.ageOptionTextSelected,
                  ]}>
                    {getTranslatedOption(option, currentQuestion.type, index)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'current_learning':
      case 'main_goal':
      case 'spanish_level':
      case 'speaking_frequency':
      case 'improvement_areas':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.standardOption,
                    selectedOptions.includes(option) && styles.standardOptionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons && currentQuestion.icons[index] && (
                    <View style={styles.emojiCircleSmall}>
                      <Text style={styles.optionIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.standardOptionText,
                    selectedOptions.includes(option) && styles.standardOptionTextSelected,
                  ]}>
                    {getTranslatedOption(option, currentQuestion.type, index)}
                  </Text>
                  {!currentQuestion.multiSelect && (
                    <View style={[
                      styles.radioButton,
                      selectedOptions.includes(option) && styles.radioButtonSelected,
                    ]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'fear_ridiculous':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.horizontalOptions}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.fearOption,
                    selectedOptions.includes(option) && styles.fearOptionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons?.[index] && (
                    <View style={styles.emojiCircle}>
                      <Text style={styles.fearIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <Text 
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.fearOptionText,
                      selectedOptions.includes(option) && styles.fearOptionTextSelected,
                    ]}>
                    {getTranslatedOption(option, currentQuestion.type, index)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'interests':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            {currentQuestion.subtitle && (
              <Text style={styles.subtitle}>{t('onboarding.interests.subtitle')}</Text>
            )}
            <View style={styles.interestsGrid}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.interestCard,
                    selectedOptions.includes(option) && styles.interestCardSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons?.[index] && (
                    <View style={styles.emojiCircle}>
                      <Text style={styles.interestIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.interestText,
                    selectedOptions.includes(option) && styles.interestTextSelected,
                  ]}>
                    {getTranslatedOption(option, currentQuestion.type, index)}
                  </Text>
                  {selectedOptions.includes(option) && (
                    <View style={styles.interestCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'commitment':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.optionsList}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.commitmentOption,
                    selectedOptions.includes(option) && styles.commitmentOptionSelected,
                    option === currentQuestion.mostChosen && styles.commitmentOptionMostChosen,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  {currentQuestion.icons?.[index] && (
                    <View style={styles.emojiCircle}>
                      <Text style={styles.commitmentIcon}>{currentQuestion.icons[index]}</Text>
                    </View>
                  )}
                  <View style={styles.commitmentTextContainer}>
                    <Text style={[
                      styles.commitmentOptionText,
                      selectedOptions.includes(option) && styles.commitmentOptionTextSelected,
                    ]}>
                      {getTranslatedOption(option, currentQuestion.type, index)}
                    </Text>
                    {currentQuestion.labels && (
                      <Text style={[
                        styles.commitmentLabel,
                        selectedOptions.includes(option) && styles.commitmentLabelSelected,
                      ]}>
                        {t(`onboarding.commitment.${['promising', 'determined', 'impressive', 'unstoppable'][index]}`)}
                      </Text>
                    )}
                  </View>
                  {option === currentQuestion.mostChosen && (
                    <View style={styles.mostChosenBadge}>
                      <Text style={styles.mostChosenText}>LE PLUS CHOISI</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'motivation_commitment':
        return (
          <View style={styles.motivationScreenContainer}>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationIcon}>{currentQuestion.icon}</Text>
              <Text style={styles.motivationTitle}>{t('onboarding.motivation.title')}</Text>
              {t('onboarding.motivation.message').split('\n\n').map((paragraph, index) => (
                <Text key={index} style={[styles.motivationMessage, index > 0 && styles.motivationMessageSpacing]}>
                  {paragraph}
                </Text>
              ))}
              {/* Signature stylisée */}
              <View style={styles.motivationSignature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>
                  {(() => {
                    const nameAnswer = answers['2'] || '';
                    const firstName = typeof nameAnswer === 'string' ? nameAnswer.split(' ')[0] : '';
                    return firstName || 'Signature';
                  })()}
                </Text>
              </View>
            </View>
            <View style={styles.pressHoldContainer}>
              <View style={styles.pressHoldInstructionContainer}>
                <MaskedView
                  maskElement={
                    <Text style={styles.pressHoldInstruction}>
                      {t('onboarding.motivation.press_hold')}
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#000000', '#4A4A4A', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pressHoldInstructionGradient}
                  >
                    <Text style={[styles.pressHoldInstruction, { opacity: 0 }]}>
                      {t('onboarding.motivation.press_hold')}
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </View>
              <Animated.View
                style={[
                  {
                    transform: [{ scale: pressHoldScaleAnim }],
                    shadowOpacity: pressHoldGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                    shadowRadius: pressHoldGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 20],
                    }),
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.pressHoldButton}
                  onPressIn={handlePressHold}
                  onPressOut={handlePressRelease}
                  activeOpacity={1}
                >
                  <LottieView
                    source={require('../../assets/media/videos/fingerprint-scanner.json')}
                    autoPlay
                    loop
                    style={styles.fingerprintImage}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        );

      case 'future_message':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.futureMessageCard}>
              <View style={styles.futureMessageHeader}>
                <Text style={styles.futureMessageTitle}>{t('onboarding.future.title')}</Text>
                <Text style={styles.futureMessageArrow}>→</Text>
              </View>
              <View style={styles.futureMessageMeta}>
                <Text style={styles.futureMessageSender}>👤 {t('onboarding.future.sender')}</Text>
                <Text style={styles.futureMessageDate}>{t('onboarding.future.date')}</Text>
              </View>
              <Text style={styles.futureMessageText}>{t('onboarding.future.message')}</Text>
            </View>
          </View>
        );

      case 'personalized_plan':
        return (
          <View style={styles.contentContainer}>
            <Image
              source={require('../../assets/media/videos/plan.png')}
              style={styles.planImage}
              resizeMode="contain"
            />
            <Text style={styles.planTitle}>{t('onboarding.plan.title')}</Text>
            {currentQuestion.subtitle && (
              <Text style={styles.planSubtitle}>{t('onboarding.plan.subtitle')}</Text>
            )}
            <View style={styles.planProgressContainer}>
              <View style={styles.planProgressHeader}>
                <Text style={styles.planProgressLabel}>
                  {planProgress < 0.33 
                    ? 'Analysis' 
                    : planProgress < 0.66 
                    ? 'Reflexion' 
                    : 'Personalization'}
                </Text>
                <Text style={styles.planProgressPercent}>{Math.round(planProgress * 100)}%</Text>
              </View>
              <ProgressBar progress={planProgress} height={8} />
            </View>
            <View style={styles.planBubble}>
              <Text style={styles.planBubbleText}>{currentQuestion.message}</Text>
            </View>
            {currentQuestion.researchLogos && (
              <View style={styles.researchLogos}>
                {currentQuestion.researchLogos.map((logo, index) => (
                  <Text key={index} style={styles.researchLogo}>{logo}</Text>
                ))}
              </View>
            )}
            <LinearGradient
              colors={['#808080', '#A0A0A0', '#C0C0C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.planSofiaBubble}
            >
              <Text style={styles.planSofiaBubbleText}>{t('onboarding.plan.sofia')}</Text>
            </LinearGradient>
          </View>
        );

      case 'comparison':
        return (
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonCards}>
              <View style={styles.comparisonCardOther}>
                <Text style={styles.comparisonCardTitle}>OTHER APPS</Text>
                <Image
                  source={require('../../assets/media/videos/duolingovs.png')}
                  style={styles.comparisonImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.comparisonCardEmma}>
                <Text style={styles.comparisonCardTitleEmma}>SOFIA</Text>
                <Image
                  source={require('../../assets/media/videos/sofiavs.png')}
                  style={styles.comparisonImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.comparisonText}>
              {t('onboarding.comparison.title')}
            </Text>
          </View>
        );

      case 'notifications':
        return (
          <TouchableOpacity
            style={styles.contentContainer}
            activeOpacity={1}
            onPress={async () => {
              triggerHapticFeedback();
              console.log('🔔 Screen clicked, requesting notification permission...');
              await requestNotificationPermission();
            }}
          >
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
            <View style={styles.notificationModal}>
              <Text style={styles.notificationTitle}>
                Allow « Sofia » to send you notifications
              </Text>
              <Text style={styles.notificationBody}>
                Notifications may include alerts, sounds, and icon badges. You can configure them in Settings.
              </Text>
              <View style={styles.notificationButtons}>
                <TouchableOpacity
                  style={styles.notificationButtonRefuse}
                  onPress={handleNext}
                >
                  <Text style={styles.notificationButtonTextRefuse}>Don't Allow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notificationButtonAllow}
                  onPress={async () => {
                    triggerHapticFeedback();
                    await requestNotificationPermission();
                    handleNext();
                  }}
                >
                  <Text style={styles.notificationButtonTextAllow}>Allow</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.notificationArrow}>↑</Text>
          </TouchableOpacity>
        );

      case 'paywall':
        // L'écran PaywallScreen sera affiché via navigation dans useEffect
        return null;

      case 'message':
        return (
          <View style={styles.contentContainer}>
            {currentQuestion.step === 'first_session' && (
              <Video
                ref={celebrationVideoRef}
                source={require('../../assets/media/videos/celebrationfinal.mp4')}
                style={styles.celebrationVideo}
                shouldPlay={celebrationVideoReady}
                isLooping
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
                isMuted={false}
                volume={1.0}
                progressUpdateIntervalMillis={100}
                onLoadStart={() => {
                  console.log('🎬 Celebration video load started');
                  setCelebrationVideoReady(false);
                }}
                onLoad={(status) => {
                  console.log('✅ Celebration video loaded:', status);
                  setCelebrationVideoReady(true);
                  celebrationVideoRef.current?.setIsMutedAsync(false);
                  celebrationVideoRef.current?.setVolumeAsync(1.0);
                  celebrationVideoRef.current?.playAsync();
                }}
                onError={(error) => {
                  console.error('❌ Celebration video error:', error);
                  setCelebrationVideoReady(false);
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded) {
                    if (!status.isPlaying && !status.isBuffering && celebrationVideoReady) {
                      celebrationVideoRef.current?.playAsync();
                    }
                    if (status.isMuted) {
                      celebrationVideoRef.current?.setIsMutedAsync(false);
                    }
                  }
                }}
              />
            )}
            <Text style={styles.messageText}>{t('onboarding.first_session')}</Text>
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.question}>{getTranslatedQuestion(currentQuestion.question, currentQuestion.type)}</Text>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {currentQuestion.type === 'intro_video' ? (
        <View style={styles.videoFullScreen}>
          {renderContent()}
          {/* Texte "Tap to start" en bas */}
          <View style={styles.videoOverlayContent}>
            <Text style={styles.videoTapHint}>Tap to start</Text>
          </View>
        </View>
      ) : (
        <View
          style={[styles.gradient, { paddingTop: insets.top, backgroundColor: colors.background }]}
        >
          {/* Overlay avec dégradé rouge/orange/transparent depuis le haut */}
          <LinearGradient
            colors={['rgba(255, 107, 53, 0.15)', 'rgba(255, 69, 0, 0.15)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.overlayGradient}
            pointerEvents="none"
          />
          
          <View style={styles.contentWrapper}>
            {/* Progression plein écran (bleu) - seulement pour motivation_commitment */}
            {currentQuestion.type === 'motivation_commitment' && (
              <Animated.View
                style={[
                  styles.fullScreenProgress,
                  {
                    height: fullScreenProgressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, SCREEN_HEIGHT],
                    }),
                  },
                ]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={['#FF6B35', '#FF4500', '#FF0000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
            
            {currentQuestion.type !== 'personalized_plan' && (
              <OnboardingHeader
                progress={progress}
                onClose={() => navigation.replace('Home')}
                onBack={currentStep > 0 ? previousStep : undefined}
              />
            )}

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
            {/* Contenu selon le type */}
            {renderContent()}
            </ScrollView>

            {/* Bouton SUIVANT */}
            {(currentQuestion.type !== 'motivation_commitment' && currentQuestion.type !== 'notifications') && (
              <View style={styles.footer}>
              <Animated.View
                style={[
                  {
                    transform: [
                      {
                        translateX: nextButtonShakeAnim,
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    ((currentQuestion.type === 'text' && !textInput.trim()) ||
                     (!currentQuestion.multiSelect && selectedOptions.length === 0 && 
                      (currentQuestion.type === 'native_language' || currentQuestion.type === 'gender' || 
                       currentQuestion.type === 'age' || currentQuestion.type === 'current_learning' ||
                       currentQuestion.type === 'main_goal' || currentQuestion.type === 'speaking_frequency' ||
                       currentQuestion.type === 'fear_ridiculous' || currentQuestion.type === 'improvement_areas' ||
                       currentQuestion.type === 'commitment')) ||
                     (currentQuestion.multiSelect && selectedOptions.length === 0)) && styles.nextButtonDisabled
                  ]}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  {/* Bordure avec gradient */}
                  <LinearGradient
                    colors={['#FF6B35', '#FF4500', '#FF0000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextButtonBorder}
                  >
                    {/* Contenu du bouton avec fond blanc pour que la bordure soit visible */}
                    <View style={styles.nextButtonInner}>
                      <LinearGradient
                        colors={['#FF6B35', '#FF4500', '#FF0000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                      >
                        <Text style={styles.nextButtonText}>NEXT</Text>
                      </LinearGradient>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Styles - Je vais créer un fichier de styles complet dans la prochaine étape
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%', // Plus petit, seulement le haut de l'écran
    zIndex: 0,
  },
  contentWrapper: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  avatarContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  contentContainer: {
    width: '100%',
  },
  question: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // ... Je vais continuer avec tous les styles nécessaires
  // Pour l'instant, je vais créer les styles de base et continuer
  optionsList: {
    gap: spacing.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  languageOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  flagEmoji: {
    fontSize: 32,
  },
  languageOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  languageOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  nextButtonBorder: {
    borderRadius: borderRadius.lg,
    padding: 1,
  },
  nextButtonInner: {
    borderRadius: borderRadius.lg - 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 1,
  },
  nextButtonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.bold,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  genderOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  genderIcon: {
    fontSize: 32,
  },
  genderOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  genderOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  ageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ageOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  ageIcon: {
    fontSize: 32,
  },
  ageOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  ageOptionTextSelected: {
    color: colors.textWhite,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  standardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
  },
  standardOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  optionIcon: {
    fontSize: 24,
  },
  standardOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  standardOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioButtonSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  horizontalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  fearOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  fearOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emojiCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fearIcon: {
    fontSize: 48,
  },
  fearOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    flexShrink: 0,
  },
  fearOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  interestCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
    position: 'relative',
  },
  interestCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  interestText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  interestTextSelected: {
    color: '#FF6B35',
    fontWeight: typography.fontWeight.semibold,
  },
  interestCheckmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  commitmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
    position: 'relative',
  },
  commitmentOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  commitmentOptionMostChosen: {
    borderColor: '#FF6B35',
  },
  commitmentIcon: {
    fontSize: 32,
  },
  commitmentTextContainer: {
    flex: 1,
  },
  commitmentOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  commitmentOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: typography.fontWeight.bold,
  },
  commitmentLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  commitmentLabelSelected: {
    color: '#FF6B35',
  },
  mostChosenBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: '#FF6B35',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mostChosenText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  motivationScreenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  motivationCard: {
    backgroundColor: '#FEFEFE',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'flex-start',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Style de lettre - hauteur relative pour contenir tout le texte
    flexShrink: 1,
  },
  motivationIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  motivationTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.bold,
    fontStyle: 'italic',
  },
  motivationMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * 1.3, // Réduire l'espacement entre les lignes
    textAlign: 'left',
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.bold,
  },
  motivationMessageSpacing: {
    marginTop: spacing.sm, // Réduire l'espacement entre les paragraphes
  },
  motivationSignature: {
    marginTop: spacing.xl,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    width: '100%',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: spacing.xs,
  },
  signatureText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: Platform.select({
      ios: 'Marker Felt', // Police manuscrite iOS
      android: 'cursive', // Police cursive Android
      default: 'serif',
    }),
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: 1.5,
    transform: [{ skewX: '-3deg' }], // Légère inclinaison pour effet manuscrit
  },
  pressHoldContainer: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  pressHoldInstructionContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressHoldInstructionGradient: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressHoldInstruction: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
  },
  pressHoldButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF', // Fond blanc
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  fullScreenProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    width: '100%',
    overflow: 'hidden',
  },
  fingerprintImage: {
    width: 100,
    height: 100,
    zIndex: 1,
  },
  fingerprintContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fingerprintCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fingerprintArc: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    top: 8,
    left: 8,
    opacity: 0.9,
  },
  fingerprintArc2: {
    width: 26,
    height: 26,
    borderRadius: 13,
    top: 4,
    left: 4,
    transform: [{ rotate: '60deg' }],
    opacity: 0.8,
  },
  fingerprintArc3: {
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 10,
    left: 10,
    transform: [{ rotate: '-45deg' }],
    opacity: 0.7,
  },
  fingerprintArc4: {
    width: 32,
    height: 32,
    borderRadius: 16,
    top: 1,
    left: 1,
    transform: [{ rotate: '120deg' }],
    opacity: 0.6,
  },
  fingerprintCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 22,
    left: 22,
    opacity: 0.9,
  },
  fingerprintDot1: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    top: 12,
    left: 15,
    opacity: 0.8,
  },
  fingerprintDot2: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
    top: 18,
    left: 28,
    opacity: 0.7,
  },
  fingerprintDot3: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
    top: 28,
    left: 18,
    opacity: 0.7,
  },
  futureMessageCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  futureMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  futureMessageTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
  },
  futureMessageArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.textLight,
  },
  futureMessageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  futureMessageSender: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  futureMessageDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  futureMessageText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  planTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  planImage: {
    width: '100%',
    height: 200,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  planProgressContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  planProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planProgressLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  planProgressPercent: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '900',
    fontFamily: typography.fontFamily.bold,
  },
  planBubble: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planBubbleText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  researchLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  researchLogo: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  planSofiaBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  planSofiaBubbleText: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  comparisonContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  comparisonCardOther: {
    width: 150,
    height: 200,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...shadows.md,
  },
  comparisonCardEmma: {
    width: 150,
    height: 200,
    backgroundColor: '#FF6B35',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...shadows.md,
  },
  comparisonCardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  comparisonCardTitleEmma: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  comparisonImage: {
    width: '100%',
    height: 120,
    flex: 1,
  },
  comparisonText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  comparisonHighlight: {
    color: '#FF6B35',
  },
  notificationModal: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
    marginTop: spacing.xl,

  },
  notificationTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  notificationBody: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  notificationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationButtonRefuse: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  notificationButtonTextRefuse: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  notificationButtonAllow: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  notificationButtonTextAllow: {
    fontSize: typography.fontSize.base,
    color: '#FF6B35',
    fontWeight: typography.fontWeight.semibold,
  },
  notificationArrow: {
    fontSize: 48,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  paywallOnboardingContainer: {
    flex: 1,
    width: '100%',
  },
  paywallOnboardingVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 180,
    zIndex: 1,
  },
  paywallOnboardingContent: {
    marginTop: 180,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  celebrationVideo: {
    width: '100%',
    height: 300,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  paywallTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  paywallTrial: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subscriptionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  subscriptionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  subscriptionButtonActive: {
    backgroundColor: '#FF4500',
    borderColor: '#FF6B35',
  },
  subscriptionButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  subscriptionButtonTextActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semibold,
  },
  timeline: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconText: {
    fontSize: 20,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timelineText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  paymentAssurance: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  messageText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize['2xl'],
  },
  videoFullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundDark,
    paddingTop: 0,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoTitle: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    fontSize: 64,
    fontWeight: '900',
    color: colors.textWhite,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 4,
    zIndex: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl + 20,
  },
  videoOverlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTapHint: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: typography.fontFamily.bold,
  },
  videoHidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    zIndex: 5,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spinnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.primary + '30',
    borderTopColor: colors.primary,
  },
  loadingText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  slideshowContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  slideshowScrollView: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  slideshowScrollContent: {
    alignItems: 'flex-start',
  },
  slideshowSlideContainer: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    position: 'relative',
  },
  slideshowImageWrapper: {
    width: Dimensions.get('window').width - (spacing.lg * 2),
    height: 380,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
    alignSelf: 'center',
    marginHorizontal: spacing.lg,
  },
  slideshowImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  slideshowSlideLabel: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
    color: colors.textWhite,
    zIndex: 10,
  },
  slideshowTextContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  slideshowTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.medium,
  },
  slideshowBoldText: {
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
  slideshowSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  slideshowSubtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
  },
  slideshowHighlightMask: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  slideshowMaskedView: {
    height: typography.fontSize.xl * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowHighlightGradient: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowHighlight: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
});

