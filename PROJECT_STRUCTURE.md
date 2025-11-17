# Structure du Projet Emma

```
SPANISH/
├── App.tsx                          # Point d'entrée avec navigation principale
├── app.json                         # Configuration Expo
├── package.json                     # Dépendances
├── tsconfig.json                    # Configuration TypeScript
├── babel.config.js                  # Configuration Babel
│
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Navigation principale (Stack)
│   │   └── types.ts                 # Types TypeScript pour navigation
│   │
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── OnboardingScreen1.tsx    # Question textuelle
│   │   │   ├── OnboardingScreen2.tsx    # Question avec image
│   │   │   ├── OnboardingScreen3.tsx    # Interaction vocale
│   │   │   ├── OnboardingScreen4.tsx    # Préférences
│   │   │   └── OnboardingScreen5.tsx    # Confirmation
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.tsx       # Écran d'accueil principal
│   │   │
│   │   ├── lessons/
│   │   │   └── LessonScreen.tsx    # Écran de leçon interactive
│   │   │
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx       # Dialogue avec avatar
│   │   │
│   │   └── quests/
│   │       └── QuestsScreen.tsx     # Écran des quêtes
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AvatarContainer.tsx      # Container pour avatar 3D/vidéo
│   │   │   ├── MicrophoneButton.tsx     # Bouton micro avec animation
│   │   │   ├── QuestionCard.tsx        # Carte de question
│   │   │   ├── ProgressBar.tsx          # Barre de progression
│   │   │   ├── LessonCard.tsx           # Carte de leçon
│   │   │   ├── SpeechBubble.tsx         # Bulle de dialogue
│   │   │   ├── IconCounter.tsx         # Compteur avec icône (flamme, trophée, gemmes)
│   │   │   ├── TutorialCard.tsx        # Carte tutorielle
│   │   │   └── Button.tsx               # Bouton réutilisable
│   │   │
│   │   └── layout/
│   │       ├── OnboardingHeader.tsx     # Header pour onboarding
│   │       └── BottomNavBar.tsx         # Barre de navigation du bas
│   │
│   ├── hooks/
│   │   ├── useMicrophone.ts             # Hook pour gestion du micro
│   │   ├── useProgress.ts               # Hook pour progression
│   │   ├── useGamification.ts           # Hook pour gamification
│   │   └── useOnboarding.ts             # Hook pour onboarding
│   │
│   ├── theme/
│   │   ├── colors.ts                    # Palette de couleurs
│   │   ├── typography.ts                # Typographie
│   │   ├── spacing.ts                   # Espacements
│   │   └── index.ts                     # Export du thème
│   │
│   ├── types/
│   │   └── index.ts                     # Types TypeScript globaux
│   │
│   └── utils/
│       ├── animations.ts                # Animations réutilisables
│       └── constants.ts                 # Constantes
│
└── assets/
    ├── images/                          # Images statiques
    ├── videos/                          # Vidéos (avatar)
    └── fonts/                           # Polices personnalisées
```

## Flux de Navigation

```
Onboarding (5 écrans)
    ↓
Home Screen
    ├──→ Lesson Screen
    ├──→ Chat Screen
    └──→ Quests Screen
```




