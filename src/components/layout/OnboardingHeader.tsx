import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import ProgressBar from '../ui/ProgressBar';
import { triggerHapticFeedback } from '../../utils/haptics';

interface OnboardingHeaderProps {
  progress: number; // 0-1
  onClose?: () => void;
  onBack?: () => void;
  showClose?: boolean;
}

export default function OnboardingHeader({
  progress,
  onClose,
  onBack,
  showClose = true,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity 
            onPress={() => {
              triggerHapticFeedback();
              onBack();
            }} 
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : showClose && onClose ? (
          <TouchableOpacity 
            onPress={() => {
              triggerHapticFeedback();
              onClose();
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
        </View>
        <Image
          source={require('../../assets/media/videos/progress_girl.png')}
          style={styles.progressImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    fontFamily: typography.fontFamily.bold,
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
  placeholder: {
    width: 32,
    height: 32,
  },
  progressContainer: {
    flex: 1,
  },
  progressImage: {
    width: 44,
    height: 44,
  },
});

