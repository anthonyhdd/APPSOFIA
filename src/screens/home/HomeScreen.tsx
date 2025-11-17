import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Navigate to LevelSelection by default
  useEffect(() => {
    navigation.navigate('LevelSelection');
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HomeScreen will redirect to LevelSelection */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
