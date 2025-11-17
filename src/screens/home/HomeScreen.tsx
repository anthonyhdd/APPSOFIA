import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';
import { getStorageItem } from '../../utils/storage';
import { useProgress } from '../../hooks/useProgress';
import { triggerHapticFeedback } from '../../utils/haptics';
import BottomNavBar from '../../components/layout/BottomNavBar';
import IconCounter from '../../components/ui/IconCounter';
import AvatarContainer from '../../components/ui/AvatarContainer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useProgress();
  const [userName, setUserName] = useState<string>('');
  const videoRef = useRef<Video>(null);

  // Charger le nom de l'utilisateur
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedName = await getStorageItem('user_name');
        if (storedName && storedName.trim()) {
          setUserName(storedName.trim());
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

  const handleOnboardingPress = () => {
    triggerHapticFeedback();
    navigation.navigate('Onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Video Background */}
      <Video
        ref={videoRef}
        source={require('../../assets/media/videos/home.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        volume={0}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar with Burger Menu */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                {userName ? `Salut ${userName}` : 'Salut'}
              </Text>
            </View>
            <View style={styles.countersContainer}>
              <IconCounter
                lottieSource={require('../../assets/media/videos/fire.json')}
                value={user.streak}
                isWhite={true}
                size="sm"
              />
              <IconCounter
                icon="💎"
                value={user.gems}
                isWhite={true}
                size="sm"
              />
              <IconCounter
                icon="🗝️"
                value={user.keys}
                isWhite={true}
                size="sm"
              />
            </View>
          </View>
          {/* Burger Menu Button */}
          <TouchableOpacity
            style={styles.burgerMenuButton}
            onPress={() => {
              triggerHapticFeedback();
              // TODO: Implement burger menu functionality
            }}
          >
            <Text style={styles.burgerMenuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Container - Centered, no overlapping elements */}
        <View style={styles.avatarContainer}>
          <AvatarContainer size={SCREEN_WIDTH * 0.6} />
        </View>
      </ScrollView>

      {/* Buttons Container - Fixed at bottom, above BottomNavBar */}
      <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 80 }]}>
        <TouchableOpacity
          style={styles.paywallButton}
          onPress={handlePaywallPress}
          activeOpacity={0.8}
        >
          <Text style={styles.paywallButtonText}>Accéder à Sofia</Text>
        </TouchableOpacity>
        
        {/* Onboarding Button for Development */}
        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={handleOnboardingPress}
          activeOpacity={0.8}
        >
          <Text style={styles.onboardingButtonText}>Retour à l'onboarding</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          onCallPress={handleCallPress}
          onLevelPress={handleLevelPress}
          onQuestsPress={handleQuestsPress}
          activeTab="call"
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
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 200, // Espace pour les boutons et la bottom nav
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  topBarLeft: {
    flex: 1,
  },
  greetingContainer: {
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countersContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  burgerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  burgerMenuIcon: {
    fontSize: 20,
    color: colors.textWhite,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    minHeight: SCREEN_WIDTH * 0.6,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    zIndex: 3,
    gap: spacing.md,
  },
  paywallButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  paywallButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  onboardingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  onboardingButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.regular,
    opacity: 0.8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
