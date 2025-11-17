import React from 'react';
import { View, StyleSheet, DimensionValue, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  currentQuestion?: number;
  totalQuestions?: number;
}

export default function ProgressBar({
  progress,
  height = 4,
  backgroundColor = colors.border,
  progressColor = colors.primary,
  currentQuestion,
  totalQuestions,
}: ProgressBarProps) {
  const progressWidth: DimensionValue = `${Math.min(100, Math.max(0, progress * 100))}%`;
  
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { height: Math.max(height, 24) }]}>
        <View style={[styles.backgroundBar, { height, backgroundColor }]}>
          <LinearGradient
            colors={['#FF6B35', '#FF4500', '#FF0000']} // Orange to Red gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progress,
              {
                width: progressWidth,
                height,
              },
            ]}
          />
        </View>
      </View>
      {currentQuestion && totalQuestions && (
        <View style={styles.textContainer}>
          <Text style={styles.progressText}>
            {currentQuestion}/{totalQuestions}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundBar: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'absolute',
  },
  progress: {
    borderRadius: borderRadius.full,
  },
  textContainer: {
    marginTop: spacing.xs,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
  },
});

