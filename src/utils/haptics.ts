import * as Haptics from 'expo-haptics';

/**
 * Déclenche une vibration légère pour les interactions utilisateur
 */
export function triggerHapticFeedback() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Ignorer les erreurs si les haptics ne sont pas supportés
    console.log('Haptics not available');
  }
}

/**
 * Déclenche une vibration moyenne pour les actions importantes
 */
export function triggerHapticFeedbackMedium() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.log('Haptics not available');
  }
}

/**
 * Déclenche une vibration forte pour les actions critiques
 */
export function triggerHapticFeedbackHeavy() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.log('Haptics not available');
  }
}







