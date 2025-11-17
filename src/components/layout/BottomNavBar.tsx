import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavBarProps {
  onCallPress: () => void;
  onLevelPress: () => void;
  onQuestsPress: () => void;
  activeTab?: 'call' | 'level' | 'quests';
  level?: number;
}

export default function BottomNavBar({
  onCallPress,
  onLevelPress,
  onQuestsPress,
  activeTab = 'level',
  level = 1,
}: BottomNavBarProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <TouchableOpacity
        style={[styles.button, activeTab === 'call' && styles.activeButton]}
        onPress={() => {
          triggerHapticFeedback();
          onCallPress();
        }}
      >
        {activeTab === 'call' ? (
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.iconContainer, styles.activeIconContainer, styles.shadowButton]}
          >
            <Text style={styles.icon}>📞</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, styles.shadowButton, styles.whiteIconContainer]}>
            <Text style={styles.icon}>📞</Text>
          </View>
        )}
        <Text style={styles.label}>{t('home.call')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, activeTab === 'level' && styles.activeButton]}
        onPress={() => {
          triggerHapticFeedback();
          onLevelPress();
        }}
      >
        {activeTab === 'level' ? (
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.iconContainer, styles.levelIconContainer]}
          >
            <Text style={[styles.icon, styles.whiteIcon]}>▶</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, styles.levelIconContainer]}>
            <Text style={[styles.icon, styles.whiteIcon]}>▶</Text>
          </View>
        )}
        <Text style={[styles.label, styles.levelLabel]}>{t('home.level')} {level}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, activeTab === 'quests' && styles.activeButton]}
        onPress={() => {
          triggerHapticFeedback();
          onQuestsPress();
        }}
      >
        {activeTab === 'quests' ? (
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.iconContainer, styles.activeIconContainer, styles.shadowButton]}
          >
            <Text style={styles.icon}>📜</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, styles.shadowButton, styles.whiteIconContainer]}>
            <Text style={styles.icon}>📜</Text>
          </View>
        )}
        <Text style={styles.label}>{t('home.quests')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    zIndex: 10,
    position: 'relative',
  },
  button: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeButton: {
    // Style pour le bouton actif si nécessaire
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  whiteIconContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  levelIconContainer: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  activeIconContainer: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
  },
  icon: {
    fontSize: 24,
  },
  whiteIcon: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '900',
    color: colors.textWhite,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.bold,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  levelLabel: {
    color: colors.textWhite,
    fontWeight: '900',
    fontSize: typography.fontSize.sm,
  },
  shadowButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

