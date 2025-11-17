import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';

interface MicrophoneButtonProps {
  listening: boolean;
  onPress: () => void;
  size?: number;
}

export default function MicrophoneButton({
  listening,
  onPress,
  size = 80,
}: MicrophoneButtonProps) {
  const { t } = useLanguage();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Arrêter l'animation précédente si elle existe
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (listening) {
      // Animation de scale
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current = animation;
      animation.start();
    } else {
      // Réinitialiser les valeurs immédiatement
      scaleAnim.setValue(1);
    }

    // Cleanup: arrêter l'animation quand le composant se démonte ou que listening change
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [listening, scaleAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          triggerHapticFeedback();
          onPress();
        }}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.innerButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#FFFFFF',
              transform: listening ? [{ scale: scaleAnim }] : [],
            },
          ]}
        >
          <View style={styles.recordIcon}>
            <View style={[
              styles.recordOuterCircle, 
              { borderColor: listening ? colors.error : '#000000' }
            ]} />
            <View style={[
              styles.recordInnerCircle, 
              { backgroundColor: listening ? colors.error : '#000000' }
            ]} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  innerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordOuterCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  recordInnerCircle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    top: 6,
    left: 6,
  },
  listeningText: {
    marginTop: spacing.sm,
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.fontFamily.bold,
  },
});

