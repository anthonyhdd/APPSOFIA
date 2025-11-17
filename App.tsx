import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <StatusBar 
        style="light" 
        translucent={true}
        backgroundColor="transparent"
      />
      <AppNavigator />
    </LanguageProvider>
  );
}
