# 🚀 Guide Rapide - Animations Mobile

## TL;DR (Too Long; Didn't Read)

Les animations de la landing page s'adaptent automatiquement entre desktop et mobile. Aucune configuration nécessaire ! 

## 🎯 Ce qui a changé

### Desktop (Souris)
```
Hover → Animations 3D
Scroll → Parallaxe classique
Click → Ripple effects
```

### Mobile (Tactile)
```
Touch → Animations 3D au toucher
Scroll → Animations position-based
Gyro → Mouvement parallaxe (optionnel)
Swipe → Navigation fluide
```

## 🧪 Test Rapide

1. **Ouvrir `test-mobile.html` sur votre téléphone**
2. **Vérifier les 4 tests:**
   - ✅ Détection d'appareil
   - ✅ Interaction tactile
   - ✅ Gyroscope (cliquer "Activer")
   - ✅ Performance
3. **Si tout est ✅ → Retour sur `index.html`**

## 📱 Fonctionnalités clés

### 1. Feature Cards
**Mobile:** Touchez une carte → Elle s'incline selon votre doigt  
**Scroll:** Les cartes s'animent selon leur position à l'écran

### 2. Pricing Cards
**Mobile:** Touchez le bouton → Effet ripple à l'endroit exact du toucher  
**Touch:** La carte s'incline légèrement au contact

### 3. Floating Cards
**Mobile:** Bougez votre doigt → Les cartes suivent  
**Gyro:** Inclinez votre téléphone → Les cartes réagissent  
**Scroll:** Animation automatique fluide

### 4. Testimonials
**Mobile:** Swipez horizontalement → Navigation fluide  
**Note:** Le scroll vertical fonctionne normalement

### 5. Parallaxe
**Mobile:** Scroll → Mouvement subtil optimisé pour batterie  
**Gyro:** Inclinez → Mouvement horizontal des orbes

## 🔧 Débogage

### La détection ne fonctionne pas?

```javascript
// Ouvrir la console (inspect element)
console.log('Is Mobile:', 'ontouchstart' in window);
console.log('Touch Points:', navigator.maxTouchPoints);
```

**Devrait afficher:**
- Mobile: `true` et `> 0`
- Desktop: `false` et `0`

### Les animations ne s'activent pas?

**Vérifier:**
1. ✅ Le JavaScript est activé
2. ✅ La page est complètement chargée
3. ✅ Pas d'erreurs dans la console
4. ✅ `script.js` est bien chargé

### Le gyroscope ne fonctionne pas?

**iOS 13+:**
1. Aller sur `test-mobile.html`
2. Cliquer "Activer le gyroscope"
3. Accepter la permission
4. Le cercle bleu devrait bouger

**Android:**
- Devrait fonctionner automatiquement
- Si pas de mouvement → L'appareil n'a pas de gyroscope

**Nécessite:**
- ✅ HTTPS (pas localhost HTTP)
- ✅ Permission utilisateur (iOS)
- ✅ Capteur gyroscope physique

## 🎨 Personnalisation

### Désactiver le gyroscope partout:

Dans `script.js`, ligne ~475, commenter:
```javascript
// if (window.DeviceOrientationEvent) {
//     window.addEventListener('deviceorientation', ...);
// }
```

### Ajuster la sensibilité tactile:

Dans `initFeatureCards()`, ligne ~551:
```javascript
// Changer ces valeurs (actuellement /15)
const rotateX = (y - centerY) / 20;  // Plus grand = moins sensible
const rotateY = (centerX - x) / 20;
```

### Modifier la vitesse du parallaxe:

Dans `initParallax()`, ligne ~663:
```javascript
const speed = 0.3 + (index * 0.1);  // Réduire pour plus lent
```

## 📊 Performance

### Vérifier les FPS:

```javascript
// Dans la console
let fps = 0;
setInterval(() => {
    console.log('FPS:', fps);
    fps = 0;
}, 1000);

function loop() {
    fps++;
    requestAnimationFrame(loop);
}
loop();
```

**Attendu:** ~60 FPS sur la plupart des appareils

### Si les performances sont mauvaises:

1. **Désactiver le gyroscope** (voir ci-dessus)
2. **Réduire le nombre d'animations:**

```javascript
// Commenter dans script.js ligne ~730
// initFloatingCards();  // Désactiver si trop lourd
```

3. **Mode performance:**

Ajouter au début de `script.js`:
```javascript
const PERFORMANCE_MODE = true;  // Animations réduites

if (PERFORMANCE_MODE) {
    // Skip certaines animations
}
```

## 🌐 Compatibilité navigateurs

| Feature | iOS Safari | Android Chrome | Desktop |
|---------|-----------|----------------|---------|
| Touch | ✅ 10+ | ✅ 70+ | N/A |
| Gyroscope | ✅ 12.2+ * | ✅ 70+ | N/A |
| RAF | ✅ 10+ | ✅ 70+ | ✅ All |
| Will-change | ✅ 11+ | ✅ 70+ | ✅ All |

\* Nécessite autorisation utilisateur sur iOS 13+

## ⚡ Optimisations appliquées

✅ **RequestAnimationFrame** → Sync avec écran  
✅ **Throttling** → Limite événements scroll  
✅ **Will-change** → Optimisation GPU  
✅ **Passive events** → Scroll plus fluide  
✅ **Touch-action** → Pas de délai 300ms  

## 🎓 Pour en savoir plus

- **Documentation complète:** `MOBILE_ANIMATIONS.md`
- **Changelog détaillé:** `CHANGELOG_MOBILE.md`
- **Page de test:** `test-mobile.html`

## 🆘 Problèmes courants

### 1. "Les animations hover fonctionnent encore sur mobile"

**Solution:** Nettoyer le cache du navigateur
```
Chrome mobile: Menu → Paramètres → Confidentialité → Effacer données
Safari iOS: Réglages → Safari → Effacer historique et données
```

### 2. "Le ripple n'apparaît pas"

**Cause:** Position CSS `relative` manquante  
**Fix:** Le bouton parent doit avoir `position: relative`

### 3. "Scroll saccadé sur le slider"

**Fix:** Ajouter dans CSS:
```css
.testimonials-slider {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}
```

### 4. "Double animation au clic sur mobile"

**Cause:** Les événements `touchstart` ET `click` se déclenchent  
**Fix:** Déjà géré avec `preventDefault()` dans le code

### 5. "Permission gyroscope refusée sur iOS"

**Solution:**
1. Safari → Réglages du site
2. Mouvement et orientation → Autoriser
3. Recharger la page

## 📞 Support

**Bugs ou questions?**
- Ouvrir un issue sur GitHub
- Email: support@trimly.app
- Doc: [https://docs.trimly.app](https://docs.trimly.app)

## ✅ Checklist de déploiement

Avant de déployer en production:

- [ ] Testé sur iPhone (Safari)
- [ ] Testé sur Android (Chrome)
- [ ] Testé sur desktop (Chrome/Firefox/Safari)
- [ ] Performance: FPS > 50
- [ ] Aucune erreur console
- [ ] Gyroscope fonctionne (optionnel)
- [ ] Toutes les animations fluides
- [ ] Pas de scroll bloqué
- [ ] Boutons réactifs (< 100ms)

---

**🎉 C'est tout! Les animations devraient fonctionner parfaitement sur mobile et desktop.**

**Besoin d'aide?** Consultez `MOBILE_ANIMATIONS.md` pour plus de détails.
