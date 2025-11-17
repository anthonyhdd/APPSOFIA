import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface TutorialCardProps {
  title: string;
  subtitle?: string;
  keys?: number;
  maxKeys?: number;
  icon?: string;
  onPress?: () => void;
}

export default function TutorialCard({
  title,
  subtitle,
  keys = 0,
  maxKeys = 4,
  icon = '🔑',
  onPress,
}: TutorialCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper 
      style={styles.container}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <MaskedView
            maskElement={
              <Text style={styles.title}>{title}</Text>
            }
          >
            <LinearGradient
              colors={['#FF6B35', '#FF4500', '#FF0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={[styles.title, { opacity: 0 }]}>{title}</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.keysContainer}>
          {Array.from({ length: maxKeys }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.key,
                index < keys && styles.keyUnlocked,
              ]}
            >
              <Text style={styles.keyIcon}>{icon}</Text>
            </View>
          ))}
        </View>
      </View>
      {icon === '🔑' && (
        <View style={styles.chestContainer}>
          <Text style={styles.chestIcon}>💎</Text>
        </View>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 0,
  },
  titleGradient: {
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.bold,
    lineHeight: typography.fontSize.lg * 1.1,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginTop: -2,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.bold,
    lineHeight: typography.fontSize.base * 1.1,
  },
  keysContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  key: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyUnlocked: {
    backgroundColor: colors.keyUnlocked,
  },
  keyIcon: {
    fontSize: 16,
  },
  chestContainer: {
    marginLeft: spacing.md,
  },
  chestIcon: {
    fontSize: 48,
  },
});

