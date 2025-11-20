# App Store Compliance Checklist

Ce document liste toutes les exigences pour la soumission à l'App Store et comment les configurer.

## ✅ Configuration Complétée

### 1. Permissions iOS (Info.plist)
- ✅ `NSMicrophoneUsageDescription` - Description détaillée pour l'accès au microphone
- ✅ `NSUserNotificationsUsageDescription` - Description pour les notifications
- ✅ `ITSAppUsesNonExemptEncryption` - Défini à `false` (pas de cryptage non exempté)

### 2. Métadonnées App Store
- ✅ Description de l'application dans `app.json`
- ✅ Mots-clés dans `app.json`
- ✅ Couleur primaire définie

### 3. Configuration iOS
- ✅ `bundleIdentifier` configuré : `com.blisscoach.sofia`
- ✅ `buildNumber` configuré
- ✅ `supportsTablet` activé

## ⚠️ À CONFIGURER AVANT LA SOUMISSION

### 1. URLs Requises (OBLIGATOIRE)

**Dans `screens/SettingsScreen.tsx`, remplacez ces URLs par vos vraies URLs :**

```typescript
const PRIVACY_POLICY_URL = 'https://yourwebsite.com/privacy-policy';
const TERMS_OF_SERVICE_URL = 'https://yourwebsite.com/terms-of-service';
const SUPPORT_URL = 'https://yourwebsite.com/support';
```

**Ces URLs DOIVENT être accessibles publiquement et contenir :**

#### Privacy Policy (Politique de Confidentialité)
Doit inclure :
- Quelles données sont collectées (audio, nom, progression)
- Comment les données sont utilisées
- Avec qui les données sont partagées (OpenAI, Eleven Labs)
- Comment les données sont stockées
- Comment supprimer les données
- Contact pour questions de confidentialité

#### Terms of Service (Conditions d'Utilisation)
Doit inclure :
- Conditions d'utilisation de l'application
- Limites de responsabilité
- Propriété intellectuelle
- Conditions d'annulation/remboursement (si achats in-app)

#### Support URL
- Page de contact ou email de support
- FAQ ou centre d'aide

### 2. Configuration App Store Connect

**Dans App Store Connect, configurez :**

1. **Privacy Policy URL** : URL de votre politique de confidentialité
2. **Support URL** : URL de votre page de support
3. **Marketing URL** (optionnel) : Site web de l'application

### 3. Achats In-App (si Paywall)

Si vous utilisez des achats in-app :
- ✅ Configurez les produits dans App Store Connect
- ✅ Ajoutez les identifiants de produits dans `PaywallScreen.tsx`
- ✅ Implémentez la gestion des achats avec `expo-in-app-purchases` ou `react-native-iap`
- ✅ Ajoutez les conditions de remboursement dans les Terms of Service

### 4. Assets Requis

Vérifiez que tous ces fichiers existent :
- ✅ `assets/icon.png` - Icône de l'application (1024x1024 pour iOS)
- ✅ `assets/splash-icon.png` - Écran de démarrage

### 5. Classification d'Âge

L'application devrait être classée **4+** (Tous les âges) car :
- Pas de contenu violent
- Pas de contenu inapproprié
- Éducation/apprentissage de langue

### 6. Description App Store

**Description courte (jusqu'à 170 caractères) :**
```
Apprenez l'espagnol avec Sofia, votre coach IA personnel. Améliorez votre prononciation grâce à des conversations interactives et suivez votre progression.
```

**Description complète :**
```
Sofia est votre compagnon intelligent pour apprendre l'espagnol. 

FONCTIONNALITÉS :
• Conversations interactives avec IA
• Reconnaissance vocale pour améliorer votre prononciation
• Leçons structurées par niveaux
• Suivi de progression et statistiques
• Notifications quotidiennes pour maintenir votre série

Apprenez à votre rythme avec des leçons adaptées à votre niveau. Sofia vous guide à travers chaque étape de votre apprentissage de l'espagnol.
```

### 7. Captures d'Écran Requises

Préparez des captures d'écran pour :
- iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max) - Requis
- iPhone 6.5" (iPhone 11 Pro Max, XS Max) - Requis
- iPhone 5.5" (iPhone 8 Plus) - Optionnel mais recommandé
- iPad Pro 12.9" - Si `supportsTablet: true`

Minimum 3 captures d'écran par taille requise.

### 8. Vérifications Finales

Avant de soumettre, vérifiez :
- [ ] Toutes les URLs (Privacy, Terms, Support) sont accessibles
- [ ] Les descriptions de permissions sont claires et justifiées
- [ ] Aucun placeholder ou texte de test dans l'application
- [ ] Les achats in-app sont configurés (si applicable)
- [ ] Les captures d'écran sont prêtes
- [ ] La description App Store est complète
- [ ] L'application fonctionne sans crash
- [ ] Les notifications fonctionnent correctement
- [ ] Le microphone fonctionne correctement

## 📝 Notes Importantes

1. **Privacy Policy** : Apple rejette souvent les apps sans politique de confidentialité valide. Assurez-vous qu'elle est complète et accessible.

2. **Permissions** : Les descriptions doivent expliquer POURQUOI l'app a besoin de chaque permission, pas seulement QUOI.

3. **Achats In-App** : Si vous avez un paywall, vous DEVEZ utiliser le système d'achats in-app d'Apple. Les liens vers des sites web pour payer sont interdits.

4. **Test** : Testez l'application sur un appareil réel avant de soumettre, pas seulement sur simulateur.

5. **Review Guidelines** : Lisez les [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) avant de soumettre.

## 🔗 Ressources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Expo App Store Submission](https://docs.expo.dev/submit/introduction/)

