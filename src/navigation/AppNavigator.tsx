import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { getStorageItem } from '../utils/storage';
import { colors } from '../theme';

// Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import HomeScreen from '../screens/home/HomeScreen';
import LessonScreen from '../screens/lessons/LessonScreen';
import LevelSelectionScreen from '../screens/levels/LevelSelectionScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import CallEndScreen from '../screens/call/CallEndScreen';
import QuestsScreen from '../screens/quests/QuestsScreen';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import SettingsScreen from '../../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isSignedUp, setIsSignedUp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSignUpStatus = async () => {
      try {
        const signedUp = await getStorageItem('user_signed_up');
        setIsSignedUp(signedUp === 'true');
      } catch (error) {
        console.error('Error checking sign up status:', error);
        setIsSignedUp(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSignUpStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName={isSignedUp ? 'Home' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="CallEnd" component={CallEndScreen} />
        <Stack.Screen name="Quests" component={QuestsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
