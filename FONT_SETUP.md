# Configuration de la Font Canicule Display

## Téléchargement

1. Téléchargez la font "Canicule Display" depuis [deefont.com](https://www.deefont.com/canicule-font-family/)
2. Extrayez les fichiers `.ttf` ou `.otf`

## Installation dans Expo

1. Créez un dossier `assets/fonts/` dans votre projet
2. Copiez les fichiers de la font dans `assets/fonts/`
3. Mettez à jour `app.json` :

```json
{
  "expo": {
    "fonts": [
      "./assets/fonts/CaniculeDisplay-Regular.ttf",
      "./assets/fonts/CaniculeDisplay-Bold.ttf"
    ]
  }
}
```

4. Redémarrez l'app avec `npm start -- --clear`

## Utilisation

La font est déjà configurée dans `OnboardingScreen.tsx` pour le titre de la vidéo d'introduction.

Si la font n'est pas disponible, le système utilisera `sans-serif-black` comme fallback.












