import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';
import { getStorageItem } from '../../utils/storage';

export default function PaywallScreen({ navigation, route }: any) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState<string>('');
  const videoRef = useRef<Video>(null);
  const [videoSource, setVideoSource] = useState<any>(null);
  const [videoReady, setVideoReady] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fromOnboarding = route?.params?.fromOnboarding || false;
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Carrousel automatique des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 3000); // Change toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  // Charger le nom de l'utilisateur
  useEffect(() => {
    const loadUserName = async () => {
      try {
        // Récupérer le prénom depuis le storage
        const storedName = await getStorageItem('user_name');
        console.log('📝 Paywall - Loaded user name from storage:', storedName);
        if (storedName && storedName.trim()) {
          setUserName(storedName.trim());
        } else {
          console.warn('⚠️ Paywall - No user name found in storage');
          // Essayer de recharger après un court délai au cas où il serait en train d'être sauvegardé
          setTimeout(async () => {
            const retryName = await getStorageItem('user_name');
            if (retryName && retryName.trim()) {
              console.log('✅ Paywall - User name loaded on retry:', retryName);
              setUserName(retryName.trim());
            }
          }, 500);
        }
      } catch (error) {
        console.error('❌ Error loading user name:', error);
      }
    };
    loadUserName();
  }, []);

  // Recharger le prénom quand l'écran est focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const name = await getStorageItem('user_name');
        if (name && name.trim()) {
          setUserName(name.trim());
        }
      } catch (error) {
        console.error('❌ Error reloading user name on focus:', error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Charger la vidéo
  useEffect(() => {
    const setupVideo = async () => {
      try {
        // Configurer le mode audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Charger la vidéo locale
        const source = require('../../assets/media/videos/paywall_top.mp4');
        setVideoSource(source);
        console.log('✅ Paywall video source set (local file)');
      } catch (error) {
        console.error('Error setting up paywall video:', error);
      }
    };
    setupVideo();
  }, []);

  const paywallData = {
    title: userName ? `${userName}, ${t('paywall.access_sofia')}` : t('paywall.access_sofia'),
    trialText: t('paywall.trial_text'),
    subscriptionTypes: [
      { type: t('paywall.annual'), price: '$99.99 ($8.33/month)' },
      { type: t('paywall.monthly'), price: '$9.5/month' },
    ],
    timeline: [
      {
        label: t('paywall.today'),
        icon: '🔒',
        text: t('paywall.unlock_practice'),
      },
      {
        label: t('paywall.in_5_days'),
        icon: '🔔',
        text: t('paywall.reminder_trial'),
      },
      {
        label: t('paywall.in_7_days'),
        icon: '⭐',
        text: t('paywall.charged_cancel'),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Vidéo en haut - positionnée absolument */}
      {videoSource && (
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.topVideo}
          shouldPlay={true}
          isLooping
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
          isMuted={false}
          volume={0.5}
          progressUpdateIntervalMillis={100}
          onLoadStart={() => {
            console.log('🎬 Paywall video load started');
          }}
          onLoad={(status) => {
            console.log('✅ Paywall video loaded:', status);
            setVideoReady(true);
            videoRef.current?.setIsMutedAsync(false);
            videoRef.current?.setVolumeAsync(0.5);
            videoRef.current?.playAsync();
          }}
          onError={(error) => {
            console.error('❌ Paywall video error:', error);
            console.error('Video source:', videoSource);
          }}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              if (!status.isPlaying && !status.isBuffering) {
                videoRef.current?.playAsync();
              }
              if (status.isMuted) {
                videoRef.current?.setIsMutedAsync(false);
              }
            }
          }}
        />
      )}

      {/* Header avec position absolue pour être au-dessus de la vidéo */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          onPress={() => {
            triggerHapticFeedback();
            if (fromOnboarding) {
              // Si on vient de l'onboarding, naviguer vers la page de félicitations (first_session)
              navigation.navigate('Onboarding', { targetStep: 'first_session' });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Fond blanc qui monte avec le scroll */}
      <Animated.View
        style={[
          styles.whiteOverlay,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100, 300],
              outputRange: [0, 0.5, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 180],
                  outputRange: [180, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={{ zIndex: 3 }}
      >
        {/* Espace pour la vidéo */}
        <View style={styles.videoSpacer} />
        
        {/* Contenu avec fond blanc */}
        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            <Text style={styles.paywallTitle}>{paywallData.title}</Text>
            <Text style={styles.paywallTrial}>{paywallData.trialText}</Text>
          
          <View style={styles.subscriptionButtons}>
            {paywallData.subscriptionTypes.map((subscription) => (
              <TouchableOpacity
                key={subscription.type}
                style={styles.subscriptionButton}
                onPress={() => {
                  triggerHapticFeedback();
                  // TODO: Handle subscription selection
                }}
                activeOpacity={1}
              >
                {subscription.type === t('paywall.annual') ? (
                  <LinearGradient
                    colors={['#FF6B35', '#FF4500', '#FF0000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subscriptionButtonGradient}
                  >
                    <Text style={styles.subscriptionButtonTextActive}>
                      {subscription.type}
                    </Text>
                    <Text style={styles.subscriptionButtonPriceActive}>
                      {subscription.price}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.subscriptionButtonContent}>
                    <Text style={styles.subscriptionButtonText}>
                      {subscription.type}
                    </Text>
                    <Text style={styles.subscriptionButtonPrice}>
                      {subscription.price}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {paywallData.timeline && (
            <View style={styles.timeline}>
              {paywallData.timeline.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconContainer}>
                    <LinearGradient
                      colors={['#FFB88C', '#FF8C69', '#FF7A50']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.timelineIcon}
                    >
                      <Text style={styles.timelineIconText}>{item.icon}</Text>
                    </LinearGradient>
                    {/* Ligne verticale qui relie les icônes */}
                    {index < paywallData.timeline.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>{item.label}</Text>
                    <Text style={styles.timelineText}>{item.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          </View>
        </View>
      </Animated.ScrollView>

      {/* Bouton principal fixe en bas */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            triggerHapticFeedback();
            if (fromOnboarding) {
              // Si on vient de l'onboarding, naviguer vers la page de félicitations (first_session)
              console.log('🎯 Paywall: Navigating back to Onboarding with targetStep: first_session');
              navigation.navigate('Onboarding', { targetStep: 'first_session' });
            } else {
              // TODO: Handle free trial start
              navigation.navigate('Home');
            }
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainButtonGradient}
          >
            <Text style={styles.mainButtonText}>{t('paywall.start_free_trial')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.mainButtonSubtitle}>{t('paywall.no_payment_due')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 180,
    zIndex: 1,
  },
  whiteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: colors.background,
    zIndex: 2,
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 30,
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
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  videoSpacer: {
    height: 180,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  contentContainer: {
    width: '100%',
    padding: spacing.lg,
    paddingBottom: 120, // Espace pour le footer fixe
    backgroundColor: colors.background,
  },
  paywallTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.bold,
  },
  paywallTrial: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.bold,
  },
  subscriptionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  subscriptionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  subscriptionButtonContent: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    minHeight: 80,
  },
  subscriptionButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
  subscriptionButtonTextActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  subscriptionButtonPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.bold,
  },
  subscriptionButtonPriceActive: {
    fontSize: typography.fontSize.sm,
    color: colors.textWhite,
    marginTop: spacing.xs,
    opacity: 0.9,
    fontFamily: typography.fontFamily.bold,
  },
  timeline: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineIconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 40,
    left: 19,
    width: 4,
    height: spacing.lg + 20,
    backgroundColor: '#E0E0E0',
    zIndex: 0,
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
    fontFamily: typography.fontFamily.bold,
  },
  timelineText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.bold,
  },
  paymentAssurance: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.bold,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 10,
  },
  mainButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  mainButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  mainButtonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
  },
});

