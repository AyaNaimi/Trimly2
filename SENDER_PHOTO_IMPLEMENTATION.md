# Implémentation de la Photo de Profil de l'Expéditeur

## Vue d'ensemble

Les abonnements détectés lors du scan d'emails affichent maintenant la **photo de profil de l'expéditeur** si elle est disponible, sinon une **icône compatible** avec le service.

## Modifications apportées

### 1. Composant ServiceLogo (`src/components/index.js`)

Le composant `ServiceLogo` a été mis à jour pour accepter un nouveau paramètre `senderPhotoUrl` :

```javascript
export function ServiceLogo({ 
  logo, 
  icon, 
  color, 
  size = 32, 
  borderRadius = null, 
  style, 
  senderPhotoUrl  // 👈 Nouveau paramètre
})
```

**Priorité d'affichage** :
1. **Photo de l'expéditeur** (`senderPhotoUrl`) - si disponible
2. **Logo du service** (`logo`) - si la photo de l'expéditeur n'est pas disponible
3. **Icône emoji** (`icon`) - en dernier recours

### 2. Service Email (`src/services/emailService.js`)

La fonction `mapDetectedSubscriptionToApp` a été mise à jour pour inclure le champ `senderPhotoUrl` :

```javascript
return {
  // ... autres champs
  senderPhotoUrl: item.senderPhotoUrl || getRawPayloadValue(item, 'senderPhotoUrl') || null,
  // ...
};
```

### 3. Utilisation dans les composants

#### SubCard (liste d'abonnements)
```javascript
<ServiceLogo
  logo={sub.logo}
  icon={sub.icon}
  color={sub.color || Colors.accent}
  size={32}
  senderPhotoUrl={sub.senderPhotoUrl}  // 👈 Ajouté
/>
```

#### SubDetailModal (détails d'un abonnement)
```javascript
<ServiceLogo
  logo={sub.logo}
  icon={sub.icon || 'S'}
  color={sub.color || Colors.accent}
  size={100}
  borderRadius={Radius.lg}
  senderPhotoUrl={sub.senderPhotoUrl}  // 👈 Ajouté
/>
```

## Récupération de la photo de profil depuis Gmail API

Pour implémenter la récupération réelle de la photo de profil, vous devez modifier la **fonction Edge de scan d'emails** (Supabase Functions ou serveur backend).

### Approche recommandée

Lorsque vous analysez les emails Gmail, vous pouvez extraire la photo de profil de l'expéditeur en utilisant :

#### Option 1 : Gmail API - People API

```javascript
// Dans votre fonction de scan d'emails backend
async function getSenderPhotoUrl(senderEmail, accessToken) {
  try {
    const response = await fetch(
      `https://people.googleapis.com/v1/people:batchGet?resourceNames=people/${encodeURIComponent(senderEmail)}&personFields=photos`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const data = await response.json();
    const photoUrl = data?.responses?.[0]?.person?.photos?.[0]?.url;
    
    return photoUrl || null;
  } catch (error) {
    console.error('Erreur récupération photo profil:', error);
    return null;
  }
}
```

#### Option 2 : Gravatar (alternative)

Si l'accès à People API n'est pas possible, utilisez Gravatar :

```javascript
import crypto from 'crypto';

function getGravatarUrl(email) {
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');
  
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
}

// Utilisation
const gravatarUrl = getGravatarUrl(senderEmail);
// Vérifier si l'URL retourne une vraie image (status 200) ou 404
```

#### Option 3 : Clearbit Logo API (pour les entreprises)

```javascript
function getClearbitLogoUrl(domain) {
  return `https://logo.clearbit.com/${domain}`;
}

// Exemple : netflix.com -> https://logo.clearbit.com/netflix.com
```

### Intégration dans le scan d'emails

Dans votre fonction Edge qui scanne les emails, enrichissez les données de l'abonnement :

```javascript
// supabase/functions/scan-emails/index.ts (exemple)
const subscriptions = await parseEmailsForSubscriptions(emails);

const enrichedSubscriptions = await Promise.all(
  subscriptions.map(async (sub) => {
    // Extraire le domaine de l'email expéditeur
    const domain = sub.sourceFrom?.match(/@(.+)/)?.[1];
    
    // Essayer d'obtenir la photo de profil
    let senderPhotoUrl = null;
    
    // 1. Essayer People API (si scope autorisé)
    if (accessToken && sub.sourceFrom) {
      senderPhotoUrl = await getSenderPhotoUrl(sub.sourceFrom, accessToken);
    }
    
    // 2. Fallback sur Clearbit pour les domaines d'entreprise
    if (!senderPhotoUrl && domain) {
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      senderPhotoUrl = clearbitUrl;
    }
    
    // 3. Fallback sur Gravatar
    if (!senderPhotoUrl && sub.sourceFrom) {
      senderPhotoUrl = getGravatarUrl(sub.sourceFrom);
    }
    
    return {
      ...sub,
      senderPhotoUrl
    };
  })
);

return enrichedSubscriptions;
```

## Permissions requises

Pour utiliser Gmail People API, ajoutez le scope suivant lors de l'authentification OAuth :

```javascript
const GOOGLE_GMAIL_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/contacts.readonly'  // 👈 Pour People API
];
```

## Gestion des erreurs

Le composant `ServiceLogo` gère automatiquement les erreurs :
- Si `senderPhotoUrl` échoue à charger → fallback sur `logo`
- Si `logo` échoue à charger → fallback sur `icon` (emoji)

## Exemple complet de flux

```
1. Utilisateur lance le scan Gmail
   ↓
2. Backend récupère les emails via Gmail API
   ↓
3. Pour chaque abonnement détecté :
   - Extraire sourceFrom (email expéditeur)
   - Tenter de récupérer la photo via People API
   - Fallback sur Clearbit ou Gravatar si nécessaire
   ↓
4. Retourner les abonnements avec senderPhotoUrl
   ↓
5. Frontend affiche :
   - Photo de l'expéditeur si senderPhotoUrl existe et se charge
   - Logo du service en fallback
   - Icône emoji en dernier recours
```

## Tests

Pour tester avec des données de développement :

```javascript
// Dans votre fonction de scan mock
const mockSubscription = {
  name: 'Netflix',
  amount: 15.99,
  cycle: 'monthly',
  sourceFrom: 'info@netflix.com',
  senderPhotoUrl: 'https://www.gravatar.com/avatar/xxx', // ou URL de test
  // ...
};
```

## Notes importantes

1. **Cache** : Considérez mettre en cache les URLs de photos pour éviter des appels API répétés
2. **Performance** : Les requêtes People API sont limitées, utilisez-les judicieusement
3. **Privacy** : Respectez la vie privée des utilisateurs - n'affichez que les photos publiques
4. **GDPR** : Assurez-vous de la conformité lors du stockage d'informations personnelles

## Améliorations futures

- [ ] Ajouter un cache local des photos de profil
- [ ] Implémenter un système de fallback plus sophistiqué
- [ ] Ajouter une option utilisateur pour désactiver les photos
- [ ] Précharger les photos lors du scan pour une meilleure UX
