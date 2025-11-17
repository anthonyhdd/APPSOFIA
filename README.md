# Emma - React Native App

Une application d'apprentissage de langues inspirée d'Emma, construite avec React Native et Expo.

## 🎯 Fonctionnalités

- ✨ **Onboarding interactif** : 5 écrans de questions pour personnaliser l'expérience
- 🎤 **Reconnaissance vocale** : Interaction par microphone avec feedback visuel
- 👤 **Avatar animé** : Interface avec avatar 3D/vidéo (placeholder pour l'instant)
- 📚 **Leçons interactives** : Apprentissage avec images et exercices vocaux
- 💬 **Chat avec IA** : Dialogue avec traduction et explications
- 🎮 **Gamification** : Système de progression avec flamme, trophées, gemmes et clés
- 🏆 **Quêtes** : Système de quêtes avec récompenses

## 📁 Structure du Projet

```
SPANISH/
├── src/
│   ├── navigation/          # Navigation principale
│   ├── screens/            # Tous les écrans
│   │   ├── onboarding/     # Écrans d'onboarding
│   │   ├── home/           # Écran d'accueil
│   │   ├── lessons/        # Écran de leçon
│   │   ├── chat/           # Écran de chat
│   │   └── quests/         # Écran des quêtes
│   ├── components/         # Composants réutilisables
│   │   ├── ui/             # Composants UI
│   │   └── layout/         # Composants de layout
│   ├── hooks/              # Hooks personnalisés
│   ├── theme/              # Thème (couleurs, typographie, espacements)
│   └── types/              # Types TypeScript
└── assets/                 # Images, vidéos, polices
```

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm start
```

3. Lancer sur iOS :
```bash
npm run ios
```

4. Lancer sur Android :
```bash
npm run android
```

## 📱 Écrans

### Onboarding
- 5 écrans de questions successives
- Types : texte, image, voix, préférences
- Barre de progression
- Sauvegarde automatique de l'état

### Home
- Salutation personnalisée
- Avatar 3D/vidéo
- Compteurs de progression (flamme, trophée, gemmes)
- Carte tutorielle avec clés
- Navigation : Appel / Niveau 1 / Quêtes

### Lesson
- Image de la leçon
- Bouton "SAY IN ENGLISH" avec animation
- Zone de réponse
- Timer/compteur
- Avatar en bas

### Chat
- Interface de conversation
- Bulles de dialogue (utilisateur/IA)
- Traduction et explications
- Microphone pour input vocal

### Quests
- Liste des quêtes disponibles
- Progression par quête
- Récompenses (gemmes, clés, trophées)

## 🎨 Thème

- **Couleur principale** : `#6C4CF0` (violet Emma)
- **Fond** : Dégradé sombre (`#0A0E27` → `#1A1F3A`)
- **Typographie** : Système (arrondie)
- **Composants** : Arrondis avec ombres douces

## 🔧 Technologies

- **React Native** : Framework mobile
- **Expo** : Plateforme de développement
- **TypeScript** : Typage statique
- **React Navigation** : Navigation native
- **Expo Linear Gradient** : Dégradés
- **Expo AV** : Audio/vidéo
- **AsyncStorage** : Stockage local

## 📝 Prochaines Étapes

À implémenter :
- [ ] Intégration de la vidéo de l'avatar (react-native-video)
- [ ] Reconnaissance vocale réelle (API Google Speech / Azure)
- [ ] Intégration IA pour le chat
- [ ] Système de niveaux complet
- [ ] Persistance des données utilisateur
- [ ] Animations avancées
- [ ] Notifications push


## 🐛 Dépannage

### Erreur de microphone
Assurez-vous d'avoir les permissions microphone activées dans les paramètres de l'appareil.

### Problème de navigation
Si l'onboarding ne se lance pas, supprimez l'app et réinstallez-la, ou effacez AsyncStorage.

### Erreurs de build
```bash
npm start -- --reset-cache
```

## 📄 Licence

Projet privé et propriétaire.
