# Configuration des Achats In-App

## ⚠️ IMPORTANT : Avant la soumission App Store

Si votre application contient un **Paywall** (écran de paiement), vous **DEVEZ** utiliser le système d'achats in-app d'Apple. Les liens vers des sites web externes pour payer sont **INTERDITS** et entraîneront un rejet.

## État Actuel

Le `PaywallScreen.tsx` contient actuellement un **TODO** pour gérer les sélections d'abonnement :
```typescript
// TODO: Handle subscription selection
```

## Solution Recommandée : expo-in-app-purchases

### 1. Installation

```bash
npx expo install expo-in-app-purchases
```

### 2. Configuration dans App Store Connect

1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
2. Allez dans votre app → **Features** → **In-App Purchases**
3. Créez vos produits d'abonnement :
   - **Product ID** : `com.blisscoach.sofia.monthly` (exemple)
   - **Type** : Auto-Renewable Subscription
   - **Reference Name** : "Sofia Monthly Subscription"
   - **Subscription Duration** : 1 Month
   - **Price** : Définissez le prix

4. Répétez pour chaque type d'abonnement (monthly, annual, etc.)

### 3. Implémentation dans PaywallScreen.tsx

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// Dans le composant
const handleSubscriptionSelection = async (productId: string) => {
  try {
    // Vérifier la disponibilité des achats
    const isAvailable = await InAppPurchases.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'In-app purchases are not available');
      return;
    }

    // Récupérer les produits disponibles
    const { results } = await InAppPurchases.getProductsAsync([productId]);
    
    if (results.length > 0) {
      const product = results[0];
      
      // Acheter le produit
      await InAppPurchases.purchaseItemAsync(productId);
      
      // Écouter les événements d'achat
      InAppPurchases.setPurchaseListener(({ response, errorCode }) => {
        if (response) {
          // Achat réussi
          console.log('Purchase successful:', response);
          // Naviguer vers l'écran d'accueil ou activer les fonctionnalités premium
        } else if (errorCode) {
          // Erreur
          console.error('Purchase error:', errorCode);
        }
      });
    }
  } catch (error) {
    console.error('Error purchasing:', error);
    Alert.alert('Error', 'Failed to process purchase');
  }
};
```

### 4. Vérification des Abonnements Actifs

```typescript
// Vérifier les abonnements actifs
const checkActiveSubscriptions = async () => {
  try {
    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    // Filtrer les abonnements actifs
    const activeSubscriptions = results.filter(
      purchase => purchase.productId.startsWith('com.blisscoach.sofia.')
    );
    return activeSubscriptions.length > 0;
  } catch (error) {
    console.error('Error checking subscriptions:', error);
    return false;
  }
};
```

### 5. Configuration dans app.json

Ajoutez la configuration pour les achats in-app :

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "SKAdNetworkItems": []
      }
    }
  }
}
```

## Alternative : react-native-iap

Si vous préférez `react-native-iap` :

```bash
npm install react-native-iap
```

**Note** : `react-native-iap` nécessite une configuration native supplémentaire.

## Checklist Avant Soumission

- [ ] Produits créés dans App Store Connect
- [ ] Product IDs configurés dans le code
- [ ] Gestion des erreurs d'achat implémentée
- [ ] Vérification des abonnements actifs implémentée
- [ ] Gestion de la restauration des achats (pour les utilisateurs existants)
- [ ] Test des achats en mode Sandbox
- [ ] Terms of Service inclut les conditions d'annulation/remboursement

## Ressources

- [Expo In-App Purchases Documentation](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [App Store Review Guidelines - In-App Purchases](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)

