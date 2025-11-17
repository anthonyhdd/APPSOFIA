import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import TypewriterText from './TypewriterText';

interface SpeechBubbleProps {
  text: string;
  isUser?: boolean;
  translation?: string;
  explanation?: string;
  onTranslationPress?: () => void;
  textOnly?: boolean; // Pour afficher seulement le texte sans bulle
}

export default function SpeechBubble({
  text,
  isUser = false,
  translation,
  explanation,
  onTranslationPress,
  textOnly = false,
}: SpeechBubbleProps) {
  if (textOnly && !isUser) {
    // Mode texte seulement pour les messages de l'IA avec effet typewriter
    return (
      <View style={styles.textOnlyContainer}>
        <TypewriterText
          text={text}
          speed={50}
          style={styles.textOnly}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.aiText,
          ]}
        >
          {text}
        </Text>
        {translation && (
          <View style={styles.translationContainer}>
            <Text style={styles.translation}>{translation}</Text>
            {onTranslationPress && (
              <TouchableOpacity onPress={onTranslationPress} style={styles.translationButton}>
                <Text style={styles.translationIcon}>A</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanation}>{explanation}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiBubble: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  userText: {
    color: colors.text,
  },
  aiText: {
    color: colors.textWhite,
  },
  translationContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  translation: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    fontFamily: typography.fontFamily.bold,
  },
  translationButton: {
    padding: spacing.xs,
  },
  translationIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  explanationContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  explanation: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  textOnlyContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-start',
  },
  textOnly: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '900',
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'left',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});

