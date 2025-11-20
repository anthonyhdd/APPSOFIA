import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { useProgress } from '../../hooks/useProgress';
import { getStorageItem } from '../../utils/storage';
import IconCounter from '../../components/ui/IconCounter';
import BottomNavBar from '../../components/layout/BottomNavBar';
import { triggerHapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { t } = useLanguage();
  const { user } = useProgress();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState<string>('');
  const videoRef = useRef<Video>(null);
  const [showStreakNotification, setShowStreakNotification] = useState(true);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await getStorageItem('user_name');
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };
    loadUserName();
  }, []);

  const handleCallPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Chat');
  };

  const handleLevelPress = () => {
    triggerHapticFeedback();
    navigation.navigate('LevelSelection');
  };

  const handleQuestsPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Quests');
  };

  const handlePaywallPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Paywall');
  };

  const handleBurgerMenuPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Settings');
  };

  const handleOnboardingPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Video */}
      <Video
        ref={videoRef}
        source={require('../../assets/media/videos/home.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Daily Streak Notification - Glass Design */}
      {showStreakNotification && user.streak > 0 && (
        <View style={[styles.streakNotificationContainer, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.streakNotificationGlass}>
            <View style={styles.streakNotificationContent}>
              <View style={styles.streakNotificationHeader}>
                <Text style={styles.streakNotificationIcon}>🔥</Text>
                <Text style={styles.streakNotificationTitle}>
                  {t('home.streak.title') || 'Daily Streak!'}
                </Text>
                <TouchableOpacity
                  style={styles.streakNotificationClose}
                  onPress={() => {
                    triggerHapticFeedback();
                    setShowStreakNotification(false);
                  }}
                >
                  <Text style={styles.streakNotificationCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.streakNotificationText}>
                {t('home.streak.message') || `You're on a ${user.streak} day streak! Keep it up!`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Top Bar with Stats */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>
              {t('home.greeting')}, {userName || 'there'}!
            </Text>
            <TouchableOpacity
              style={styles.burgerMenu}
              onPress={handleBurgerMenuPress}
              activeOpacity={0.7}
            >
              <Text style={styles.burgerIcon}>☰</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.currencyIcons}>
            <IconCounter
              lottieSource={require('../../assets/media/videos/fire.json')}
              value={user.streak}
              color={colors.textWhite}
              isWhite={true}
            />
            <IconCounter
              icon="💎"
              value={user.gems}
              color={colors.textWhite}
              isWhite={true}
            />
          </View>
        </View>
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handlePaywallPress}
          activeOpacity={0.8}
          style={styles.paywallButtonContainer}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paywallButton}
          >
            <Text style={styles.paywallButtonText}>
              {t('paywall.access_sofia')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={handleOnboardingPress}
          activeOpacity={0.8}
        >
          <Text style={styles.onboardingButtonText}>
            Onboarding
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          onCallPress={handleCallPress}
          onLevelPress={handleLevelPress}
          onQuestsPress={handleQuestsPress}
          activeTab="level"
          level={user.level}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBarContent: {
    alignItems: 'flex-start',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    flex: 1,
  },
  burgerMenu: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  burgerIcon: {
    fontSize: 28,
    color: colors.textWhite,
    fontWeight: 'bold',
  },
  currencyIcons: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  paywallButtonContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    minWidth: 200,
  },
  paywallButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  onboardingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  onboardingButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  streakNotificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  streakNotificationGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    // Glass effect with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  streakNotificationContent: {
    padding: spacing.md,
    // Backdrop blur effect simulation with gradient overlay
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  streakNotificationIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  streakNotificationTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  streakNotificationClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNotificationCloseIcon: {
    fontSize: 14,
    color: colors.textWhite,
    fontWeight: '600',
  },
  streakNotificationText: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    opacity: 0.9,
    fontFamily: typography.fontFamily.regular,
    lineHeight: typography.fontSize.base * 1.4,
  },
});
