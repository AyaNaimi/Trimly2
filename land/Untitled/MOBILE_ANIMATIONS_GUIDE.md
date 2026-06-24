# Guide des Animations Mobile - Landing Page Trimly

## 📱 Vue d'ensemble

Ce guide explique comment les animations de la landing page s'adaptent automatiquement entre desktop et mobile pour offrir une expérience optimale sur tous les appareils.

## 🎯 Principe de Base

### Desktop (hover-based)
- Les animations se déclenchent au **survol** (hover)
- Effets magnétiques sur les boutons
- Transitions douces et interactives

### Mobile (scroll-based)
- Les animations se déclenchent au **scroll**
- Les effets "hover" s'activent automatiquement quand l'élément devient visible
- Performances optimisées pour mobile

## 🔧 Implémentation

### 1. Hook `useScrollReveal`

```typescript
import { useScrollReveal } from "../hooks/useScrollReveal";

const mySection = useScrollReveal({
  threshold: 0.15,           // Desktop: 15% visible
  mobileThreshold: 0.05,     // Mobile: 5% visible (plus sensible)
  rootMargin: "0px 0px -60px 0px",
  once: true                 // Animation ne se joue qu'une fois
});

// Utilisation
<section
  ref={mySection.ref}
  className={mySection.isVisible ? "visible" : ""}
>
  {/* Contenu */}
</section>
```

### 2. Classes CSS d'Animation

#### Révélation Standard
```css
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s, transform 0.8s;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### Révélation avec Scale
```css
.reveal-scale {
  opacity: 0;
  transform: scale(0.85);
}

.reveal-scale.visible {
  opacity: 1;
  transform: scale(1);
}
```

#### Délais Progressifs
```css
.delay-1 { transition-delay: 0.1s; }
.delay-2 { transition-delay: 0.25s; }
.delay-3 { transition-delay: 0.4s; }
```

## 📲 Adaptations Mobile Automatiques

### Détection Mobile
Le système détecte automatiquement les appareils mobiles via :
- Largeur d'écran (≤768px)
- User agent
- Support tactile

### Optimisations Appliquées

1. **Seuils d'intersection plus bas**
   - Desktop: 15% visible
   - Mobile: 5% visible
   - → Les animations se déclenchent plus tôt sur mobile

2. **Transitions plus rapides**
   - Desktop: 0.8s
   - Mobile: 0.5s
   - → Animations plus vives sur mobile

3. **Effets hover simulés**
   ```css
   @media (max-width: 768px) {
     .pourQuiCard.visible {
       /* Applique automatiquement l'effet hover */
       background: rgba(255, 255, 255, 0.08);
       border-color: rgba(195, 241, 28, 0.3);
       box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
     }
   }
   ```

4. **Animations complexes désactivées**
   - Floating animations simplifiées
   - Effets magnétiques désactivés
   - → Meilleures performances

## 🎨 Exemples d'Utilisation

### Cartes "Pour Qui"

```tsx
const pourQuiSec = useScrollReveal({ threshold: 0.08 });

<section ref={pourQuiSec.ref}>
  <div className={`pourQuiCard reveal-scale ${pourQuiSec.isVisible ? 'visible delay-1' : ''}`}>
    {/* Sur desktop: hover pour voir l'effet */}
    {/* Sur mobile: effet visible automatiquement au scroll */}
  </div>
</section>
```

### Stickers Animés

```tsx
<div className={`globeSticker ${howItSec.isVisible ? 'visible' : ''}`}>
  {/* Desktop: Float animation + hover scale */}
  {/* Mobile: Reveal animation au scroll */}
</div>
```

### Steps Accordion

```tsx
{accordionData.map((item, index) => (
  <div
    className={`stepItem reveal ${howItRight.isVisible ? `visible delay-${index + 1}` : ''}`}
  >
    {/* Animation progressive avec délai */}
  </div>
))}
```

## 🚀 Bonnes Pratiques

### DO ✅
- Utiliser `useScrollReveal` pour toutes les sections principales
- Ajouter des classes `reveal`, `reveal-scale`, etc.
- Utiliser les délais (`delay-1`, `delay-2`) pour les listes
- Tester sur de vrais appareils mobiles

### DON'T ❌
- Ne pas multiplier les animations lourdes
- Éviter les animations trop longues (>1s)
- Ne pas forcer le hover sur mobile
- Ne pas oublier `prefers-reduced-motion`

## 🔍 Debug

### Tester les animations mobile sur desktop

1. **Chrome DevTools**
   - F12 → Toggle Device Toolbar
   - Sélectionner un appareil mobile
   - Rafraîchir la page

2. **Forcer le mode mobile**
   ```javascript
   // Dans la console
   localStorage.setItem('forceMobile', 'true');
   location.reload();
   ```

3. **Vérifier les classes**
   - Inspecter l'élément
   - Vérifier que `.visible` s'ajoute au scroll
   - Vérifier les media queries appliquées

## 📊 Performance

### Métriques Cibles
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Animation frame rate: 60fps

### Optimisations Appliquées
- `will-change` sur les éléments animés
- Utilisation de `transform` et `opacity` uniquement
- Debounce sur les events scroll/resize
- Désactivation des animations complexes sur mobile
- Support `prefers-reduced-motion`

## 🎯 Accessibilité

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Les utilisateurs ayant activé "Réduire les animations" dans leur système auront des animations instantanées.

## 📝 Checklist d'Intégration

- [ ] Importer `useScrollReveal` dans le composant
- [ ] Créer une ref pour chaque section à animer
- [ ] Ajouter les classes CSS (`reveal`, `reveal-scale`, etc.)
- [ ] Conditionner l'ajout de `.visible` sur `isVisible`
- [ ] Tester sur desktop (hover fonctionne)
- [ ] Tester sur mobile (scroll reveal fonctionne)
- [ ] Vérifier les délais progressifs
- [ ] Tester avec `prefers-reduced-motion`

## 🐛 Problèmes Courants

### L'animation ne se déclenche pas sur mobile
- Vérifier que le `threshold` mobile est assez bas (0.05)
- Vérifier que la classe `.visible` est bien ajoutée
- Vérifier les media queries CSS

### L'effet hover reste sur mobile
- Utiliser `@media (hover: hover)` pour cibler uniquement desktop
- Ajouter des animations scroll-based pour mobile
- Vérifier que les styles mobile surchargent bien desktop

### Les animations sont saccadées
- Utiliser uniquement `transform` et `opacity`
- Ajouter `will-change` avec parcimonie
- Réduire la durée des transitions
- Désactiver les animations complexes sur mobile

## 🔗 Ressources

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web Animations Performance](https://web.dev/animations/)
