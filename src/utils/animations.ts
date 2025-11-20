import { Animated } from 'react-native';

// Animation de fade in
export const fadeIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

// Animation de fade out
export const fadeOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

// Animation de scale
export const scale = (
  value: Animated.Value,
  toValue: number,
  duration: number = 300
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

// Animation de pulsation
export const pulse = (value: Animated.Value, min: number = 1, max: number = 1.2) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: max,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: min,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );
};












