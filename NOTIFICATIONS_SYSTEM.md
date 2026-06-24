# 🔔 Système de Notifications - Documentation

## Vue d'ensemble

Le système de notifications de Trimly a été amélioré pour assurer un fonctionnement robuste avec un contrôle complet de l'état d'activation et du type de notifications.

## ✅ Fonctionnalités Implémentées

### 1. **Vérification de l'état des notifications**
- Fonction `areNotificationsEnabled()` pour vérifier si les notifications sont activées
- Vérification automatique des permissions toutes les 2 secondes dans l'écran des paramètres
- Indicateur visuel de l'état (badge vert ✓ ou orange !)

### 2. **Types de notifications (4 niveaux)**

#### Niveau 0 : 🤫 Le Concierge (Silencieux)
- Aucune notification quotidienne
- Seules les notifications critiques d'abonnements sont envoyées

#### Niveau 1 : 🤠 Le Coach (Doux)
- **1 notification par jour** à 12h00
- Accompagnement positif et encourageant

#### Niveau 2 : 😤 La Rigueur (Agressif)
- **3 notifications par jour** : 12h00, 18h00, 21h00
- Suivi précis des écarts budgétaires

#### Niveau 3 : 🤬 L'Intransigeant (Implacable)
- **6 notifications par jour** : 8h00, 12h00, 15h00, 18h00, 20h00, 21h00
- Discipline absolue pour un contrôle maximal

### 3. **Notifications d'abonnements**

Pour chaque abonnement actif, 3 alertes sont planifiées :
- **2 jours avant** le prélèvement (9h00)
- **1 jour avant** le prélèvement (9h00)
- **Le jour même** du prélèvement (9h00)

Pour les périodes d'essai :
- **3 jours avant** la fin de l'essai (10h00)

### 4. **Gestion des permissions**

#### Dans l'onboarding :
- Demande automatique des permissions si `notifLevel > 0`
- Message informatif expliquant l'utilité des notifications
- Configuration sauvegardée dans le profil utilisateur

#### Dans les paramètres :
- Badge visuel indiquant l'état :
  - **✓ vert** : Notifications activées et fonctionnelles
  - **! orange** : Niveau > 0 mais permissions non accordées
- Alert avec option d'ouvrir les paramètres système si nécessaire

### 5. **Persistance des préférences**

Les préférences sont sauvegardées à deux niveaux :
- **Base de données** (Supabase) : `profiles.notif_level`
- **État local** : `state.notifLevel`

## 📁 Fichiers Modifiés

### `src/utils/notifications.js`
- ✅ Ajout de `areNotificationsEnabled()` pour vérifier l'état
- ✅ Amélioration de `scheduleDailyReminders()` avec vérification d'état
- ✅ Amélioration de `scheduleAllSubscriptionNotifications()` avec logs

### `src/screens/Settings/SettingsScreen.js`
- ✅ Import de `areNotificationsEnabled`
- ✅ État local `notificationsEnabled` avec vérification périodique
- ✅ Amélioration de `handleSetNotifLevel()` avec gestion des permissions
- ✅ Badge visuel sur la ligne des notifications
- ✅ Alertes contextuelles pour guider l'utilisateur

### `src/screens/Onboarding/OnboardingScreen.js`
- ✅ Import de `requestNotificationPermissions`
- ✅ Message informatif sur l'utilité des notifications
- ✅ Demande de permissions lors de la finalisation si `notifLevel > 0`
- ✅ Couleurs uniques par catégorie dans la section "Style analytique"

### `src/components/index.js`
- ✅ Ajout du support du `badge` dans le composant `SettingsRow`
- ✅ Badge personnalisable avec texte et couleur

### `src/data/initialData.js`
- ✅ Synchronisation des couleurs des catégories avec l'onboarding

## 🎨 Améliorations Visuelles

### Page d'Onboarding - Style Analytique
Chaque catégorie a maintenant sa propre couleur :

**Maison & Alimentation :**
- 🏠 Loyer/Prêt : `#8B5CF6` (Violet)
- 🛒 Courses : `#10B981` (Vert)
- 🍕 Restaurant : `#F59E0B` (Orange)
- ⚡ Factures : `#EF4444` (Rouge)

**Mobilité & Voyage :**
- 🚆 Transport : `#3B82F6` (Bleu)
- ⛽ Carburant : `#6366F1` (Indigo)
- ✈️ Voyage : `#14B8A6` (Cyan)

**Loisirs & Style de vie :**
- 🎬 Sorties : `#EC4899` (Rose)
- 📱 Abonnements : `#8B5CF6` (Violet)
- 👕 Shopping : `#F97316` (Orange foncé)
- 💪 Sport : `#06B6D4` (Cyan)

**Finance & Bien-être :**
- 🏥 Santé : `#EF4444` (Rouge)
- 📈 Épargne : `#10B981` (Vert)
- 🆘 Imprévus : `#F59E0B` (Orange)
- 🎁 Cadeaux : `#EC4899` (Rose)

## 🔄 Flux Utilisateur

### Premier lancement (Onboarding)
1. L'utilisateur choisit son niveau de notifications
2. Une info-box explique l'utilité des notifications
3. À la fin de l'onboarding, les permissions sont demandées si niveau > 0
4. Les notifications sont planifiées automatiquement

### Modification dans les paramètres
1. L'utilisateur voit son niveau actuel avec un badge d'état
2. En changeant le niveau vers > 0 :
   - Si permissions non accordées → Alert avec option d'activer
   - Si refusé → Proposition d'ouvrir les paramètres système
3. En changeant vers niveau 0 :
   - Toutes les notifications quotidiennes sont annulées
   - Les notifications d'abonnements restent actives

## 🔐 Gestion de la sécurité

- Les permissions sont vérifiées avant chaque planification
- Les erreurs sont loggées mais n'empêchent pas l'utilisation de l'app
- Fallback gracieux si les notifications échouent
- Support iOS et Android avec canaux spécifiques

## 📱 Canaux de notification (Android)

### `subscriptions`
- Importance : HIGH
- Vibration : [0, 250, 250, 250]
- Couleur LED : `#5B3BF5`
- Utilisé pour les alertes d'abonnements

### `reminders`
- Importance : DEFAULT
- Utilisé pour les rappels budgétaires quotidiens

## 🧪 Tests Recommandés

1. **Test des permissions**
   - Refuser puis accepter les notifications
   - Vérifier que le badge se met à jour

2. **Test des niveaux**
   - Tester chaque niveau (0, 1, 2, 3)
   - Vérifier le nombre de notifications planifiées

3. **Test de persistance**
   - Définir un niveau, fermer l'app, rouvrir
   - Vérifier que le niveau est conservé

4. **Test des abonnements**
   - Ajouter un abonnement avec date proche
   - Vérifier que les 3 notifications sont créées

## 📊 Données Techniques

### Base de données (Supabase)
```sql
profiles.notif_level: integer (0-3)
```

### État local (AppContext)
```javascript
state.notifLevel: number (0-3)
```

### AsyncStorage (fallback)
```javascript
@trimly_notif_level: string
```

## 🚀 Prochaines Améliorations Possibles

1. Personnalisation des heures de notification
2. Notifications intelligentes basées sur l'activité
3. Statistiques d'engagement avec les notifications
4. Smart silence (pause automatique la nuit)
5. Notifications push pour événements critiques

---

**Dernière mise à jour** : 24 juin 2026
**Version** : 2.0
**Statut** : ✅ Implémenté et testé
