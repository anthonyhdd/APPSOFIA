# 🔍 Guide de Débogage - Reconnaissance Vocale

## ✅ Modifications Effectuées

### 1. Permissions ajoutées dans `app.json`
- ✅ iOS: `NSMicrophoneUsageDescription` ajoutée
- ✅ Android: `RECORD_AUDIO` permission ajoutée

### 2. Logs de débogage ajoutés
Tous les logs sont maintenant visibles dans la console avec des emojis pour faciliter le suivi :
- 🎤 Permission microphone
- 🎙️ Enregistrement
- 🌐 Transcription API
- ✅ Succès
- ❌ Erreurs

### 3. Vérification de la clé API
- ✅ La clé API est vérifiée au démarrage
- ✅ Message d'erreur clair si la clé n'est pas configurée

## 🚀 Étapes pour Tester

### 1. Redémarrer complètement l'app

**IMPORTANT** : Après avoir modifié `app.json`, vous devez reconstruire l'app :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez avec cache reset
npm start -- --clear
```

**Pour iOS** (si vous utilisez un build natif) :
```bash
# Vous devrez peut-être reconstruire
npx expo prebuild --clean
npm run ios
```

### 2. Vérifier les logs dans la console

Ouvrez la console de développement et cherchez ces messages :

**Au démarrage de l'app :**
```
🔑 API Key loaded: YES (length: XXX)
```

**Quand l'onboarding démarre :**
```
📱 Onboarding: Requesting microphone permission...
🎤 Requesting microphone permission...
🎤 Permission status: granted (ou denied)
```

**Quand vous appuyez sur le micro :**
```
🎤 Starting to listen...
🔧 Configuring audio mode...
🎙️ Creating recording...
✅ Recording started successfully
```

**Quand vous arrêtez l'enregistrement :**
```
🛑 Stopping recording...
⏹️ Stopping and unloading recording...
📁 Audio file saved at: file://...
🔄 Transcribing audio...
📡 Sending request to OpenAI API...
📥 Response status: 200
✅ Transcription successful: hello
```

## 🐛 Problèmes Courants

### Problème 1: Permission non demandée

**Symptômes :**
- Pas de popup de permission
- Logs montrent "Permission status: denied" ou rien

**Solutions :**
1. Vérifiez que vous avez redémarré l'app après avoir modifié `app.json`
2. Sur iOS, allez dans Réglages > Confidentialité > Microphone et activez pour votre app
3. Sur Android, allez dans Paramètres > Apps > Votre App > Permissions

### Problème 2: Clé API non chargée

**Symptômes :**
- Log montre "🔑 API Key loaded: NO"
- Erreur "Clé API OpenAI non configurée"

**Solutions :**
1. Vérifiez que le fichier `.env` existe à la racine
2. Vérifiez que la variable commence par `EXPO_PUBLIC_`
3. **Redémarrez complètement le serveur Expo** (très important !)
4. Les variables d'environnement ne sont chargées qu'au démarrage

### Problème 3: Erreur API (401, 403, etc.)

**Symptômes :**
- Log montre "❌ API Error: 401" ou autre code d'erreur

**Solutions :**
1. Vérifiez que votre clé API est valide sur https://platform.openai.com/api-keys
2. Vérifiez votre quota sur https://platform.openai.com/usage
3. Vérifiez que la clé n'a pas été révoquée

### Problème 4: Aucun son enregistré

**Symptômes :**
- L'enregistrement démarre mais rien n'est transcrit
- Erreur "Aucune parole détectée"

**Solutions :**
1. Parlez clairement et près du microphone
2. Vérifiez que le volume du microphone n'est pas à zéro
3. Testez avec un autre appareil si possible
4. Vérifiez les paramètres de confidentialité de l'appareil

## 📋 Checklist de Débogage

- [ ] J'ai redémarré le serveur Expo avec `--clear`
- [ ] J'ai vérifié que `.env` existe et contient `EXPO_PUBLIC_OPENAI_API_KEY`
- [ ] J'ai vérifié les logs dans la console
- [ ] La permission microphone est activée dans les paramètres de l'appareil
- [ ] J'ai testé sur un appareil physique (pas seulement simulateur)
- [ ] Ma connexion internet fonctionne
- [ ] Ma clé API OpenAI est valide et a du crédit

## 🔧 Commandes Utiles

```bash
# Vérifier que la clé API est dans .env
cat .env | grep EXPO_PUBLIC_OPENAI_API_KEY

# Redémarrer avec cache clear
npm start -- --clear

# Voir les logs en temps réel
# (Dans le terminal où Expo tourne, ou dans les DevTools)
```

## 📱 Tester sur Appareil Physique

**Important** : Les permissions et l'enregistrement audio fonctionnent mieux sur un appareil physique que sur un simulateur.

Pour tester sur votre téléphone :
1. Installez Expo Go
2. Scannez le QR code
3. Les permissions seront demandées directement sur l'appareil

## 💡 Prochaines Étapes

Si les logs montrent que tout fonctionne mais que vous ne voyez pas les résultats :
1. Vérifiez l'écran d'onboarding - les messages de validation devraient apparaître
2. Vérifiez que vous êtes bien à l'écran 2 (question vocale)
3. Regardez les logs pour voir si la transcription réussit

Si vous voyez des erreurs spécifiques dans les logs, partagez-les et je pourrai vous aider davantage !












