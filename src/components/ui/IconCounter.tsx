import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, typography, spacing } from '../../theme';

interface IconCounterProps {
  icon?: string;
  lottieSource?: any;
  value: number | string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  isWhite?: boolean;
}

export default function IconCounter({
  icon,
  lottieSource,
  value,
  color,
  size = 'md',
  isWhite = false,
}: IconCounterProps) {
  const iconSize = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
  const fontSize = size === 'sm' ? typography.fontSize.base : size === 'md' ? typography.fontSize.lg : typography.fontSize.xl;

  return (
    <View style={styles.container}>
      {lottieSource ? (
        <View style={[styles.lottieContainer, { width: iconSize, height: iconSize }]}>
          <LottieView
            source={lottieSource}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      ) : (
        <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
      )}
      <Text
        style={[
          styles.value,
          {
            fontSize,
            color: isWhite ? colors.textWhite : (color || colors.text),
            fontWeight: isWhite ? typography.fontWeight.black : typography.fontWeight.bold,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    lineHeight: 32,
  },
  lottieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  value: {
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
});

