import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useProgress } from '../../hooks/useProgress';

interface CallEndScreenProps {
  navigation: any;
}

export default function CallEndScreen({ navigation }: CallEndScreenProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user } = useProgress();
  const celebrationVideoRef = useRef<Video>(null);
  const [celebrationVideoReady, setCelebrationVideoReady] = useState(false);

  useEffect(() => {
    // Auto-play celebration video when screen loads
    if (celebrationVideoRef.current && celebrationVideoReady) {
      celebrationVideoRef.current.playAsync();
    }
  }, [celebrationVideoReady]);

  const handleNext = () => {
    triggerHapticFeedback();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Celebration Video Background */}
      {celebrationVideoReady && (
        <Video
          ref={celebrationVideoRef}
          source={require('../../assets/media/videos/celebrationfinal.mp4')}
          style={styles.celebrationVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay={celebrationVideoReady}
          isLooping
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

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(255, 107, 53, 0.6)', 'transparent', 'rgba(0, 0, 0, 0.4)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.phoneIcon}>📞</Text>
              <Text style={styles.arrowIconOrange}>↓</Text>
            </View>
            <MaskedView
              maskElement={
                <Text style={styles.title}>{t('call.end.title')}</Text>
              }
            >
              <LinearGradient
                colors={['#FF6B35', '#FF4500', '#FF0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleGradient}
              >
                <Text style={[styles.title, { opacity: 0 }]}>{t('call.end.title')}</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <Text style={styles.subtitle}>{t('call.end.subtitle')}</Text>
        </View>

        {/* Rewards Cards */}
        <View style={styles.rewardsContainer}>
          {/* XP Card */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardHeaderText}>{t('call.end.xp')}</Text>
            </View>
            <View style={styles.rewardBody}>
              <Text style={styles.rewardIcon}>🧪</Text>
              <Text style={styles.rewardValue}>0 {t('call.end.xp')}</Text>
            </View>
          </View>

          {/* Gems Card */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeaderGem}>
              <Text style={styles.rewardHeaderText}>{t('call.end.gems')}</Text>
            </View>
            <View style={styles.rewardBody}>
              <Text style={styles.gemIcon}>💎</Text>
              <Text style={styles.gemValue}>+0</Text>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, { marginBottom: insets.bottom + spacing.md }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>{t('call.end.next')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  celebrationVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  phoneIcon: {
    fontSize: 24,
    color: colors.textWhite,
  },
  arrowIconOrange: {
    fontSize: 20,
    color: '#FF6B35',
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    fontFamily: typography.fontFamily.bold,
  },
  titleGradient: {
    flex: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textWhite,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: colors.textWhite,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 100,
    ...colors.shadows?.lg || {},
  },
  rewardHeader: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  rewardHeaderGem: {
    backgroundColor: '#FF4444',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  rewardHeaderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  rewardBody: {
    flex: 1,
    backgroundColor: colors.textWhite,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rewardIcon: {
    fontSize: 24,
  },
  gemIcon: {
    fontSize: 24,
  },
  rewardValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  gemValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FF4444',
    fontFamily: typography.fontFamily.bold,
  },
  nextButton: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.black,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
});
