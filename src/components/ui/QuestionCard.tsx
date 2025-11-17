import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface QuestionCardProps {
  question: string;
  imageUrl?: string;
  children?: React.ReactNode;
}

export default function QuestionCard({
  question,
  imageUrl,
  children,
}: QuestionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>
      )}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    alignItems: 'center',
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.bold,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    width: '100%',
    marginTop: spacing.md,
  },
});

