import React, { useState, useEffect } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypewriterTextProps extends TextProps {
  text: string;
  speed?: number; // Délai entre chaque lettre en millisecondes
  onComplete?: () => void;
}

/**
 * TypewriterText Component
 * 
 * Displays text letter by letter with a typewriter effect.
 * 
 * @param text - The full text to display
 * @param speed - Delay between each letter in milliseconds (default: 50)
 * @param onComplete - Callback when animation completes
 */
export default function TypewriterText({
  text,
  speed = 50,
  onComplete,
  style,
  ...props
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <Text style={style} {...props}>
      {displayedText}
      {currentIndex < text.length && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  cursor: {
    opacity: 0.7,
  },
});

