// Wrapper sécurisé pour AsyncStorage qui gère toutes les erreurs SQLite
// Utilise un fallback en mémoire si AsyncStorage ne fonctionne pas

// Fallback en mémoire si AsyncStorage ne fonctionne pas
const memoryStorage: Record<string, string> = {};
let storageAvailable: boolean | null = null; // null = pas encore testé, false = indisponible, true = disponible
let storageCheckPromise: Promise<boolean> | null = null;

/**
 * Vérifie si AsyncStorage est disponible (une seule fois)
 */
async function checkStorageAvailability(): Promise<boolean> {
  // Si on a déjà déterminé que c'est indisponible, retourner false immédiatement
  if (storageAvailable === false) return false;
  
  // Si on est en train de vérifier, attendre le résultat
  if (storageCheckPromise) {
    return storageCheckPromise;
  }
  
  // Créer une nouvelle vérification
  storageCheckPromise = (async () => {
    try {
      // Importer AsyncStorage de manière dynamique pour éviter les erreurs au démarrage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Test rapide avec timeout très court
      await Promise.race([
        AsyncStorage.getItem('__storage_test__'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500)),
      ]);
      storageAvailable = true;
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || '';
      const errorString = String(error);
      
      // Détecter toutes les variantes d'erreur SQLite
      if (
        errorMessage.includes('sqlite') || 
        errorMessage.includes('db file') || 
        errorMessage.includes('unable to open') ||
        errorMessage.includes('Timeout') ||
        errorString.includes('sqlite') ||
        errorString.includes('db file') ||
        errorString.includes('unable to open')
      ) {
        storageAvailable = false;
        console.warn('⚠️ AsyncStorage unavailable (SQLite error), using memory fallback');
        return false;
      }
      // Pour les autres erreurs, considérer comme disponible (peut être temporaire)
      storageAvailable = true;
      return true;
    }
  })();
  
  return storageCheckPromise;
}

/**
 * Récupère une valeur depuis le stockage
 */
export async function getStorageItem(key: string): Promise<string | null> {
  // Vérifier la disponibilité
  const isAvailable = await checkStorageAvailability();
  
  // Si AsyncStorage n'est pas disponible, utiliser la mémoire
  if (!isAvailable) {
    return memoryStorage[key] || null;
  }

  // Essayer AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const value = await Promise.race([
      AsyncStorage.getItem(key),
      new Promise<string | null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      ),
    ]) as string | null;
    return value;
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || '';
    const errorString = String(error);
    
    // Détecter les erreurs SQLite
    if (
      errorMessage.includes('sqlite') || 
      errorMessage.includes('db file') || 
      errorMessage.includes('unable to open') ||
      errorMessage.includes('Timeout') ||
      errorString.includes('sqlite') ||
      errorString.includes('db file') ||
      errorString.includes('unable to open')
    ) {
      storageAvailable = false;
      // Retourner la valeur depuis la mémoire si elle existe
      return memoryStorage[key] || null;
    }
    // Pour les autres erreurs, retourner null
    return null;
  }
}

/**
 * Sauvegarde une valeur dans le stockage
 */
export async function setStorageItem(key: string, value: string): Promise<void> {
  // Toujours sauvegarder en mémoire d'abord
  memoryStorage[key] = value;

  // Vérifier la disponibilité
  const isAvailable = await checkStorageAvailability();
  
  // Si AsyncStorage n'est pas disponible, ne pas essayer
  if (!isAvailable) {
    return;
  }

  // Essayer AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await Promise.race([
      AsyncStorage.setItem(key, value),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      ),
    ]);
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || '';
    const errorString = String(error);
    
    // Détecter les erreurs SQLite
    if (
      errorMessage.includes('sqlite') || 
      errorMessage.includes('db file') || 
      errorMessage.includes('unable to open') ||
      errorMessage.includes('Timeout') ||
      errorString.includes('sqlite') ||
      errorString.includes('db file') ||
      errorString.includes('unable to open')
    ) {
      storageAvailable = false;
      // La valeur est déjà sauvegardée en mémoire, donc on continue
      console.warn('⚠️ AsyncStorage failed, using memory fallback for:', key);
    }
    // Ignorer silencieusement les autres erreurs
  }
}

/**
 * Supprime une valeur du stockage
 */
export async function removeStorageItem(key: string): Promise<void> {
  delete memoryStorage[key];

  const isAvailable = await checkStorageAvailability();
  if (!isAvailable) {
    return;
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await Promise.race([
      AsyncStorage.removeItem(key),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      ),
    ]);
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || '';
    const errorString = String(error);
    
    if (
      errorMessage.includes('sqlite') || 
      errorMessage.includes('db file') || 
      errorMessage.includes('unable to open') ||
      errorMessage.includes('Timeout') ||
      errorString.includes('sqlite') ||
      errorString.includes('db file') ||
      errorString.includes('unable to open')
    ) {
      storageAvailable = false;
    }
  }
}

/**
 * Vide tout le stockage
 */
export async function clearStorage(): Promise<void> {
  Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);

  const isAvailable = await checkStorageAvailability();
  if (!isAvailable) {
    return;
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await Promise.race([
      AsyncStorage.clear(),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      ),
    ]);
  } catch (error: any) {
    const errorMessage = error?.message || String(error) || '';
    const errorString = String(error);
    
    if (
      errorMessage.includes('sqlite') || 
      errorMessage.includes('db file') || 
      errorMessage.includes('unable to open') ||
      errorMessage.includes('Timeout') ||
      errorString.includes('sqlite') ||
      errorString.includes('db file') ||
      errorString.includes('unable to open')
    ) {
      storageAvailable = false;
    }
  }
}

