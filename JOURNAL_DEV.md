# Development Journal

This journal tracks all code changes, bug fixes, and feature additions to maintain a clear history of development activities.

---

## 2025-01-XX - Correction HomeScreen : Suppression Superpositions et Ajout Bouton Onboarding

**Action:** Correction des superpositions sur l'écran Home et ajout du bouton pour revenir à l'onboarding

**Context:**
- L'utilisateur signalait des superpositions sur l'écran Home :
  - Un logo violet se superposait devant le visage de Sofia
  - Le bandeau "Accéder à Sofia" se superposait aussi
- Besoin d'un bouton pour revenir à l'onboarding (pour le développement)

**Changes:**

### 1. Suppression du Logo Violet
- **Avant:** `AvatarContainer` affichait un placeholder violet (`colors.primaryLight`) avec opacité 0.3
- **Après:** Placeholder rendu transparent et invisible (`backgroundColor: 'transparent'`, `opacity: 0`)
- Le logo violet ne se superpose plus devant Sofia

### 2. Réorganisation du Layout
- **Avant:** Le bouton "Accéder à Sofia" était dans le ScrollView, pouvant se superposer avec l'avatar
- **Après:** 
  - Bouton "Accéder à Sofia" déplacé en position fixe en bas, au-dessus de la BottomNavBar
  - Container des boutons positionné en `absolute` avec `zIndex: 3`
  - ScrollView avec `paddingBottom: 200` pour éviter les superpositions
  - Avatar Container isolé sans éléments superposés

### 3. Ajout du Bouton Onboarding
- Bouton "Retour à l'onboarding" ajouté sous le bouton "Accéder à Sofia"
- Style discret avec opacité réduite pour ne pas perturber l'UX
- Permet de revenir facilement à l'onboarding pour les tests de développement

### 4. Ajout du Menu Burger
- Menu burger (☰) ajouté en haut à droite
- Style cohérent avec le reste de l'interface
- Prêt pour implémentation future de fonctionnalités

**Files Modified:**
- `src/screens/home/HomeScreen.tsx` (réorganisation layout, ajout boutons)
- `src/components/ui/AvatarContainer.tsx` (suppression logo violet)

**Result:**
- ✅ Plus de logo violet qui se superpose
- ✅ Plus de bandeau qui se superpose avec l'avatar
- ✅ Layout propre et organisé
- ✅ Bouton onboarding disponible pour le développement
- ✅ Menu burger ajouté pour futures fonctionnalités

---

## 2025-01-XX - Correction Doublon Audio : Suppression du Son de la Vidéo Sofia

**Action:** Suppression de l'audio de la vidéo hola.mp4 pour éviter le doublon avec la voix ElevenLabs

**Context:**
- L'utilisateur signalait entendre deux voix en même temps lors de l'appel
- La vidéo `hola.mp4` jouait avec son audio original
- En même temps, ElevenLabs générait la voix de Sofia
- Cela créait un doublon où la même phrase était dite deux fois avec deux voix différentes

**Changes:**
- **Avant:** Vidéo `hola.mp4` avec `isMuted={false}` et `volume={1.0}`
- **Après:** Vidéo `hola.mp4` avec `isMuted={true}` et `volume={0}`
- Ajout de vérifications pour s'assurer que la vidéo reste en muet
- Modification de `onLoad` pour forcer le muet au chargement
- Modification de `onPlaybackStatusUpdate` pour maintenir le muet si la vidéo tente de réactiver le son

**Files Modified:**
- `src/screens/chat/ChatScreen.tsx` (suppression audio vidéo hola.mp4)

**Result:**
- ✅ Plus de doublon audio
- ✅ Seule la voix ElevenLabs est entendue
- ✅ La vidéo continue de jouer visuellement mais sans son
- ✅ Expérience utilisateur améliorée

**Note:** La vidéo `call_standing.mp4` était déjà en muet, donc pas de modification nécessaire.

---

## 2025-01-XX - Amélioration IA Vocale : Transcription Multilingue et Prompt Compréhensif

**Action:** Correction de la transcription vocale pour comprendre l'espagnol avec accents, et amélioration du prompt de Sofia pour qu'elle soit plus compréhensive des erreurs et accents

**Context:**
- L'utilisateur a signalé que l'IA vocale ne fonctionnait pas bien
- La transcription était configurée pour l'anglais uniquement, ne comprenant pas l'espagnol avec accents
- Le prompt de Sofia n'était pas assez compréhensif des accents et erreurs de prononciation

**Changes:**

### 1. Correction de la Transcription Vocale
- **Avant:** Langue fixée à `'en'` (anglais) dans `useMicrophone.ts`
- **Après:** Suppression de la spécification de langue pour laisser Whisper détecter automatiquement
- Cela permet à Whisper de comprendre l'espagnol avec différents accents (français, anglais, etc.)
- Whisper peut maintenant détecter automatiquement la langue parlée, même avec un accent fort

### 2. Amélioration du Prompt de Sofia
- **Avant:** Prompt basique qui ne mentionnait pas spécifiquement la compréhension des accents
- **Après:** Prompt amélioré avec instructions détaillées sur :
  - Compréhension des accents forts et erreurs de prononciation
  - Patience avec les étudiants qui mélangent les langues
  - Corrections douces et positives des erreurs
  - Questions amicales pour clarifier si nécessaire
  - Valorisation de l'effort même avec prononciation imparfaite
  - Exemples de réponses compréhensives

**Files Modified:**
- `src/hooks/useMicrophone.ts` (correction langue transcription)
- `src/utils/aiChat.ts` (amélioration prompt système)

**Result:**
- ✅ Transcription vocale comprend maintenant l'espagnol avec différents accents
- ✅ Sofia est plus compréhensive et patiente avec les erreurs
- ✅ Meilleure expérience pour les étudiants avec accents forts
- ✅ Sofia ne critique jamais la prononciation, seulement encourage

---

## 2025-01-XX - Configuration API OpenAI et Restauration des Écrans

**Action:** Configuration de la clé API OpenAI, restauration complète du HomeScreen et de l'écran de célébration, amélioration de la gestion des erreurs

**Context:** 
- L'utilisateur a fourni la clé API OpenAI pour activer les conversations avec Sofia
- L'écran Home était minimaliste et redirigeait automatiquement vers LevelSelection
- L'écran de célébration (CallEndScreen) n'affichait pas la vidéo celebrationfinal.mp4
- Besoin d'améliorer la gestion des erreurs de configuration API

**Changes:**

### 1. Configuration API OpenAI
- Création du fichier `.env` à la racine du projet
- Configuration de `EXPO_PUBLIC_OPENAI_API_KEY` avec la clé fournie
- Vérification que `.env` est bien dans `.gitignore` pour la sécurité

### 2. Restauration du HomeScreen Complet
- **Avant:** Écran minimaliste qui redirigeait automatiquement vers LevelSelection
- **Après:** Écran complet avec :
  - Vidéo de fond `home.mp4` en plein écran
  - Gradient overlay pour améliorer la lisibilité
  - `AvatarContainer` au centre de l'écran
  - Compteurs (streak, gems, keys) avec animations Lottie
  - Salutation personnalisée avec le nom de l'utilisateur
  - Bouton "Accéder à Sofia" (paywall)
  - `BottomNavBar` en bas (Call, Level, Quests)
  - ScrollView pour gérer le contenu

### 3. Restauration de l'Écran de Célébration (CallEndScreen)
- **Avant:** Écran simple avec image statique
- **Après:** Écran complet avec :
  - Vidéo `celebrationfinal.mp4` en arrière-plan avec son
  - Gradient overlay pour la lisibilité
  - Cartes de récompenses (XP et Gems)
  - Bouton "Suivant" pour retourner à l'accueil
  - Gestion automatique de la lecture vidéo

### 4. Amélioration de la Gestion des Erreurs API
- Vérification automatique de la clé API au démarrage de `ChatScreen`
- Message d'erreur visible dans l'interface si la clé n'est pas configurée
- Logs détaillés dans la console pour le débogage
- Vérification du format de la clé (doit commencer par `sk-`)
- Messages d'erreur clairs avec instructions pour corriger
- Affichage d'une bannière d'erreur orange dans ChatScreen si problème détecté

### 5. Correction du Flux Onboarding après Paywall
- Amélioration de la navigation depuis `PaywallScreen` vers `Onboarding` avec `targetStep: 'first_session'`
- Ajout de logs pour le débogage
- Correction de la logique dans `handleNext` pour détecter correctement l'étape `first_session`
- Ajout d'un timeout pour s'assurer que la navigation se fait après le rendu

**Files Modified:**
- `.env` (créé)
- `src/screens/home/HomeScreen.tsx` (restauré complètement)
- `src/screens/call/CallEndScreen.tsx` (restauré avec vidéo)
- `src/screens/chat/ChatScreen.tsx` (amélioration gestion erreurs)
- `src/screens/onboarding/OnboardingScreen.tsx` (correction navigation après paywall)
- `src/screens/paywall/PaywallScreen.tsx` (amélioration logs)
- `src/utils/aiChat.ts` (amélioration messages d'erreur)

**Result:**
- ✅ Clé API OpenAI configurée et sécurisée
- ✅ HomeScreen restauré avec toutes les fonctionnalités
- ✅ Écran de célébration restauré avec vidéo
- ✅ Gestion d'erreurs API améliorée avec messages visibles
- ✅ Flux onboarding après paywall corrigé
- ✅ Logs détaillés pour faciliter le débogage

**Note de Sécurité:**
- Le fichier `.env` est dans `.gitignore` et ne sera pas commité
- La clé API est stockée localement uniquement
- Les messages d'erreur n'exposent pas la clé API

**Instructions pour l'Utilisateur:**
1. Redémarrer le serveur Expo pour que la clé API soit prise en compte :
   ```bash
   npm start
   ```
2. Si des erreurs apparaissent, vérifier les logs dans la console
3. Le message d'erreur dans ChatScreen disparaîtra automatiquement une fois la clé configurée

---

## 2025-01-XX - Bug Fixes: TypeScript Errors, Port Conflict, and Babel Configuration

**Action:** Fixed TypeScript compilation errors, port conflict, and Babel configuration preventing app launch

**Context:** User reported app not launching with QR code. Investigation revealed multiple issues:
1. TypeScript errors preventing compilation
2. Port 8081 already in use
3. Babel configuration issue with Flow syntax in Expo modules

**Issues Fixed:**
1. **TypeScript Error in HomeScreen.tsx**: Missing type annotation for `navigation` parameter
2. **TypeScript Errors in useMicrophone.ts**: Functions `createRecordingSafely` and `safelyStopAndUnloadRecording` used before declaration
3. **Port Conflict**: Port 8081 already in use by another process
4. **Babel Configuration**: Empty `babel.config.js` file causing Flow syntax parsing errors in Expo modules

**Changes:**
- Added explicit `any` type to `navigation` parameter in `HomeScreen.tsx`
- Reorganized `useMicrophone.ts` to declare helper functions before they are used:
  - Moved `safelyStopAndUnloadRecording` before `startListening` and `stopListening`
  - Moved `createRecordingSafely` before `startListening` and `validatePeriodically`
- Fixed dependency arrays in `useCallback` hooks to include all used functions
- Fixed `babel.config.js`: Was empty, now properly configured with `babel-preset-expo`
- Killed process on port 8081 to resolve conflict
- Started Expo server with `--clear` flag to clear cache

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`
- `src/hooks/useMicrophone.ts`
- `babel.config.js` (recreated with proper configuration)

**Result:**
- ✅ All TypeScript errors resolved
- ✅ No linter errors
- ✅ Babel properly configured for Expo
- ✅ Expo server can start successfully
- ✅ App should now launch with QR code without Flow syntax errors

---

## 2025-01-XX - Chat Feature: Integrated Real AI Conversation in Spanish with Voice

**Action:** Replaced basic keyword-based AI responses with real OpenAI GPT integration and added text-to-speech so Sofia speaks responses aloud in Spanish

**Context:** User requested that the "Call" feature (ChatScreen) should allow users to have real conversations with an AI in Spanish to learn the language. Previously, the ChatScreen used a simple `generateAIResponse` function that only returned short responses based on keywords. User also requested that Sofia should speak responses aloud, not just display them as text.

**Changes:**
- Created new utility file `src/utils/aiChat.ts` with OpenAI GPT integration
- Created new utility file `src/utils/textToSpeech.ts` for Spanish text-to-speech
- Implemented `generateAIResponse` function that calls OpenAI API (gpt-4o-mini model)
- Implemented `speakSpanish` function that uses Eleven Labs (if available) or expo-speech as fallback
- Configured system prompt to make AI speak ONLY in Spanish as "Sofia", a friendly Spanish teacher
- Added conversation history management to maintain context (last 10 messages)
- Modified `ChatScreen.tsx` to use real AI instead of keyword-based responses
- Updated `handleSend` to be async and properly handle AI responses with voice output
- Added text-to-speech for AI responses: Sofia now speaks all responses aloud in Spanish
- Added text-to-speech for initial greeting: "Hola, ¿cómo estás?" is spoken when video starts
- Added error handling with fallback responses in Spanish (both text and speech)
- Improved conversation flow: user messages are added to history, AI responses are generated, displayed, and spoken
- Added `isGeneratingResponse` state to track AI response generation
- Added cleanup to stop speech when leaving ChatScreen

**Technical Details:**
- Uses OpenAI GPT-4o-mini model (faster and cheaper, perfect for conversations)
- System prompt enforces Spanish-only responses, short and natural (max 2-3 sentences)
- Temperature set to 0.7 for moderate creativity
- Max tokens limited to 150 to keep responses short
- Conversation history limited to last 10 messages to avoid token limits
- Text-to-speech: Eleven Labs (eleven_multilingual_v2 model) if API key available, otherwise expo-speech (es-ES)
- Speech rate: 0.85 for better comprehension
- Volume: Maximum (1.0) for clear audio
- Fallback responses in Spanish if API fails (both text and speech)

**Files Modified:**
- `src/utils/aiChat.ts` (created)
- `src/utils/textToSpeech.ts` (created)
- `src/screens/chat/ChatScreen.tsx`

**API Configuration:**
- Uses existing `EXPO_PUBLIC_OPENAI_API_KEY` from `.env` for GPT
- Uses `EXPO_PUBLIC_ELEVEN_LABS_API_KEY` and `EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID` (optional, falls back to expo-speech if not configured)

**User Experience:**
- Users can now have natural conversations in Spanish with Sofia
- Sofia speaks all responses aloud in Spanish (not just text)
- AI responds contextually based on conversation history
- Responses are always in Spanish, helping users learn
- AI is friendly, patient, and encouraging
- Short responses keep conversation flowing naturally
- Initial greeting "Hola, ¿cómo estás?" is spoken when conversation starts

**Testing:**
- Verify OpenAI API key is configured in `.env`
- Test conversation flow: speak → transcription → AI response (text + voice)
- Verify AI responds only in Spanish (both text and speech)
- Verify Sofia speaks responses aloud
- Test error handling when API fails
- Test with and without Eleven Labs API key (should fallback to expo-speech)

---

## 2025-01-XX - Application Audit: Comprehensive Code Review and Documentation

**Action:** Complete application audit to understand architecture and current state

**Context:** New developer joining the project, needs to understand what has been built and current state of the application.

**Analysis Performed:**
- Reviewed entire codebase structure and architecture
- Analyzed all screens, components, hooks, and utilities
- Examined navigation flow and data management
- Reviewed configuration files and dependencies
- Checked implementation status of all features

**Key Findings:**
- **Architecture:** Well-structured React Native Expo app with modular design
- **Onboarding:** Fully functional with 5+ question screens, multilingual support
- **Voice Recognition:** OpenAI Whisper integration complete with auto-validation
- **Lessons System:** 10 lessons implemented with automatic answer validation
- **Multilingual:** 6 languages supported (FR, EN, DE, ES, IT, PT)
- **Storage:** Robust system with memory fallback for AsyncStorage failures
- **HomeScreen:** Currently minimal, redirects to LevelSelection (had more complete versions previously)
- **Progress Persistence:** useProgress hook uses local state, not persisted to storage
- **Gamification:** Structure in place but logic partially implemented (TODOs present)

**Files Analyzed:**
- All screens in `src/screens/`
- All hooks in `src/hooks/`
- All components in `src/components/`
- Navigation setup in `src/navigation/`
- Context providers in `src/context/`
- Utilities in `src/utils/`
- Theme configuration in `src/theme/`
- Type definitions in `src/types/`
- Configuration files (package.json, babel.config.js, etc.)

**Documentation Created:**
- `AUDIT_APPLICATION.md` - Comprehensive audit document with:
  - Complete architecture overview
  - Feature implementation status
  - Code structure explanations
  - Points of attention
  - Recommended next steps

**Files Modified:**
- `AUDIT_APPLICATION.md` (created)

**Next Steps Identified:**
1. Restore/improve HomeScreen with counters, video background, navigation buttons
2. Add persistence to useProgress hook using storage.ts
3. Complete gamification system logic
4. Integrate AI for chat functionality
5. Expand level system beyond level 1

---

## 2025-11-17 (Monday) - HomeScreen UI: Added Burger Menu and Onboarding Button

**Action:** Enhanced HomeScreen with navigation menu and onboarding access

**Changes:**
- Added burger menu icon (☰) aligned with greeting text on the right side
- Added onboarding navigation button below paywall button
- Restructured top bar layout to display greeting and burger menu on same row
- Created `greetingRow` container for horizontal alignment
- Added `handleBurgerMenuPress` and `handleOnboardingPress` handlers
- Updated button container to include both paywall and onboarding buttons
- Styled onboarding button with semi-transparent white background (`rgba(255, 255, 255, 0.2)`)
- Added border styling to onboarding button for better visibility

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

**TODO:**
- Implement burger menu functionality (currently placeholder with TODO comment)

---

## 2025-11-17 (Monday) - HomeScreen Layout: Repositioned Counters and Adjusted Text Size

**Action:** Reorganized HomeScreen layout per user requirements

**Changes:**
- Increased greeting text size from `xl` to `3xl` (typography.fontSize['3xl']) for better visibility
- Removed hand emoji (👋) from greeting text
- Repositioned fire counter to appear below greeting text (vertical layout)
- Positioned gem counter to the right of fire counter (horizontal layout using flexDirection: 'row')
- Changed text colors to white (`colors.textWhite`) for visibility on video background
- Updated currency icons to use white text styling (`isWhite={true}`)
- Restructured `topBarContent` to use vertical alignment for greeting and counters

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

---

## 2025-11-17 (Monday) - HomeScreen: Removed Gradient and Avatar, Added Video Background Only

**Action:** Simplified HomeScreen UI by removing overlay and avatar, keeping only video background

**Changes:**
- Removed blue gradient overlay (`LinearGradient` component with `colors.backgroundGradient`)
- Removed avatar image component (`AvatarContainer`)
- Added `home.mp4` video as full-screen background using `Video` component from expo-av
- Configured video to loop (`isLooping={true}`), play automatically (`shouldPlay={true}`), and be muted (`isMuted={true}`)
- Positioned video absolutely to cover entire screen (position: 'absolute', full width/height)
- Maintained all UI elements (greeting, counters, buttons) above video layer with proper z-index
- Changed background color to `colors.backgroundDark`
- Removed `ImageBackground` component that was incorrectly trying to use video file

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

---

## 2025-11-16 (Sunday) - HomeScreen: Simplified to Minimal Layout

**Action:** Removed complex UI elements, kept only essential components per user request

**Changes:**
- Removed avatar display (`AvatarContainer` component)
- Removed welcome message card
- Removed gradient overlay
- Kept only: greeting text, fire/gem counters, paywall button, and navigation bar
- Simplified layout structure by removing ScrollView and complex containers
- Changed background from video to simple `colors.background` (white)

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

---

## 2025-11-16 (Sunday) - HomeScreen: Complete Rebuild with Full UI

**Action:** Rebuilt HomeScreen with complete UI including avatar, video, and navigation

**Changes:**
- Created full HomeScreen component with greeting, avatar, stats, and navigation
- Integrated `home.mp4` video background with gradient overlay
- Added user name loading from storage using `getStorageItem('user_name')`
- Integrated `AvatarContainer` component with size calculation (`SCREEN_WIDTH * 0.6`)
- Added paywall navigation button with proper styling
- Integrated `BottomNavBar` for main navigation (Call, Level, Quests)
- Added progress counters (gems, keys, streak) using `IconCounter` component
- Implemented proper safe area handling with `useSafeAreaInsets`
- Added haptic feedback for all interactions using `triggerHapticFeedback`
- Used `useProgress` hook for user data (gems, streak, level, keys)
- Added video reference with `useRef<Video>(null)`
- Implemented handlers: `handleCallPress`, `handleLevelPress`, `handleQuestsPress`, `handlePaywallPress`

**Files Modified:**
- `src/screens/home/HomeScreen.tsx` (completely rewritten)

---

## 2025-11-16 (Sunday) - Navigation: Fixed Initial Route Logic and Auto-Redirect Issue

**Action:** Fixed app opening on wrong screen and removed unwanted auto-navigation

**Changes:**
- Removed automatic redirect from HomeScreen to LevelSelection (removed `useEffect` with `navigation.navigate('LevelSelection')`)
- HomeScreen now stays on screen instead of auto-navigating
- App correctly opens on Home if user is signed up, Onboarding if not (logic in AppNavigator)
- Navigation flow now allows proper access to all screens
- Fixed issue where app was opening on lessons menu instead of home

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

**Root Cause:** HomeScreen had `useEffect` that automatically navigated to LevelSelection on mount, preventing users from seeing the home screen.

---

## 2025-11-15 (Saturday Evening) - Babel Configuration: Fixed Empty Config File

**Action:** Fixed empty babel.config.js causing build errors

**Changes:**
- Created proper Babel configuration with expo preset
- Added `babel-preset-expo` to presets array
- Enabled API caching for better performance (`api.cache(true)`)
- Fixed module export format using `module.exports`
- Configured proper function structure for Babel API

**Files Modified:**
- `babel.config.js` (created from empty file)

**Note:** File was completely empty, causing "invalid value for component prop render error" and other build issues. Expo requires a proper Babel configuration to work.

---

## 2025-11-15 (Saturday Evening) - HomeScreen: Fixed TypeScript Syntax Errors

**Action:** Fixed syntax errors preventing compilation

**Changes:**
- Initially tried using interface `HomeScreenProps` but encountered parsing issues
- Removed inline type annotation `{ navigation }: any` causing "unexpected token ," error at line 6:49
- Changed to plain parameter `{ navigation }` without type annotation
- Fixed component export to ensure proper React component structure
- Resolved Babel/TypeScript parsing conflicts

**Files Modified:**
- `src/screens/home/HomeScreen.tsx`

**Error Details:** Error was "unexpected token ," at column 49 of line 6, which was the colon in the type annotation `{ navigation }: any`.

---

## 2025-11-15 (Saturday Evening) - HomeScreen: Created Component to Fix Navigation Error

**Action:** Fixed "invalid value for component prop render error" by creating HomeScreen component

**Changes:**
- Created HomeScreen component (file was completely empty)
- Added proper default export
- Implemented basic component structure with navigation prop
- Added automatic redirect to LevelSelection using `useEffect` (temporary solution)
- Fixed undefined component causing navigation stack errors
- Added minimal styling with `colors.background`
- Imported necessary React hooks (`useEffect`) and React Native components

**Files Modified:**
- `src/screens/home/HomeScreen.tsx` (created from empty file)

**Root Cause:** Empty HomeScreen.tsx file caused AppNavigator to receive `undefined` instead of a valid React component, breaking the navigation stack with error "invalid value for component prop render error".

**Initial Implementation:**
```typescript
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    navigation.navigate('LevelSelection');
  }, [navigation]);
  return <View style={styles.container}>...</View>;
}
```

---

## 2025-11-15 (Saturday Evening) - Initial Session: Project Structure Analysis and Issue Identification

**Action:** Initial conversation and comprehensive project analysis

**Context:** User reported "invalid value for component prop render error" when opening the app.

**Project Structure Analyzed:**
- React Native Expo application for Spanish learning
- Navigation: React Navigation with native stack navigator
- Screens: Onboarding, Home, Lesson, LevelSelection, Chat, CallEnd, Quests, Paywall
- Components: UI components (AvatarContainer, IconCounter, ProgressBar, etc.) and layout components (BottomNavBar, OnboardingHeader)
- Hooks: useMicrophone, useProgress, useGamification, useOnboarding
- Theme: Centralized colors, typography, spacing configuration
- Storage: AsyncStorage wrapper with memory fallback

**Files Analyzed:**
- `src/navigation/AppNavigator.tsx` - Navigation setup with initial route logic
- `src/screens/home/HomeScreen.tsx` - **FOUND EMPTY** (root cause of error)
- `src/screens/levels/LevelSelectionScreen.tsx` - Reference for screen structure
- `src/screens/onboarding/OnboardingScreen.tsx` - Reference for navigation patterns
- `src/components/layout/BottomNavBar.tsx` - Navigation component structure
- `src/theme/index.ts` - Theme exports
- `babel.config.js` - **FOUND EMPTY** (secondary issue)
- `package.json` - Dependencies check (babel-preset-expo present)

**Issues Identified:**
1. **Critical:** `src/screens/home/HomeScreen.tsx` was completely empty, causing AppNavigator to receive `undefined` instead of a React component
2. **Critical:** `babel.config.js` was empty, causing build/transpilation errors
3. Navigation stack configured to use HomeScreen but component didn't exist
4. AppNavigator had proper initial route logic (Home if signed up, Onboarding if not) but couldn't render HomeScreen

**Root Cause Analysis:**
- Error "invalid value for component prop render error" occurred because React Navigation's `Stack.Screen` component prop was `undefined`
- This happened when AppNavigator tried to render: `<Stack.Screen name="Home" component={HomeScreen} />` where `HomeScreen` was `undefined`

**Next Steps Identified:**
1. Create HomeScreen component with proper structure
2. Fix Babel configuration
3. Ensure proper navigation flow

---
