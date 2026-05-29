# Trimly Landing Page

A modern, multilingual landing page for the Trimly expense tracking mobile app with dark/light mode support, smooth animations, and scroll effects.

## Features

### 🌍 Multilingual Support
- English (EN)
- French (FR)
- Spanish (ES)
- Arabic (AR) with RTL support
- Easy to add more languages

### 🎨 Theme Support
- Light mode
- Dark mode
- Smooth transitions between themes
- Persistent theme selection (localStorage)

### ✨ Animations & Effects
- **Scroll Reveal**: Elements fade in as you scroll
- **Parallax Effect**: Background elements move at different speeds
- **Floating Cards**: Interactive cards with hover effects
- **Counter Animations**: Numbers count up when visible
- **Lottie Animation**: Cat playing animation from your JSON file
- **Smooth Scroll**: Smooth navigation between sections
- **Micro-interactions**: Button hovers, card tilts, ripple effects
- **Gradient Orbs**: Animated background gradients
- **Scroll Progress Bar**: Visual indicator of page scroll progress

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly interactions

### 🎯 Sections
1. **Hero Section**: Eye-catching introduction with CTA buttons
2. **Features**: 6 key features with icons and descriptions
3. **How It Works**: 3-step process visualization
4. **Pricing**: 3 pricing tiers (Free, Pro, Family)
5. **Testimonials**: User reviews and ratings
6. **CTA Section**: Final call-to-action
7. **Footer**: Links and social media

## Installation

1. **Copy the landing-page folder** to your web server or local development environment

2. **Copy the cat animation file**:
   ```bash
   cp assets/cat-playing.json landing-page/assets/
   ```

3. **Add app screenshots** (optional):
   - Place your app screenshots in `landing-page/assets/`
   - Update the image path in `index.html` (line with `app-screenshot.png`)

## File Structure

```
landing-page/
├── index.html          # Main HTML file
├── styles.css          # All styles and animations
├── script.js           # JavaScript functionality
├── translations.js     # Language translations
├── README.md          # This file
└── assets/
    ├── cat-playing.json    # Lottie animation
    └── app-screenshot.png  # App screenshot (add your own)
```

## Usage

### Local Development

Simply open `index.html` in a modern web browser:

```bash
cd landing-page
# Open with default browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

Or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Production Deployment

1. **Upload to web hosting**:
   - Upload all files to your web server
   - Ensure proper file permissions

2. **CDN Optimization** (optional):
   - Host images on a CDN
   - Minify CSS and JavaScript
   - Enable gzip compression

3. **Domain Configuration**:
   - Point your domain to the landing page
   - Set up SSL certificate (HTTPS)

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more colors */
}
```

### Content

1. **Text Content**: Edit translations in `translations.js`
2. **Images**: Replace images in `assets/` folder
3. **Links**: Update href attributes in `index.html`

### Adding New Languages

1. Add translation object in `translations.js`:

```javascript
const translations = {
    // ... existing languages
    de: {
        appName: "Trimly",
        nav: {
            features: "Funktionen",
            // ... more translations
        }
    }
};
```

2. Add language option in HTML:

```html
<button data-lang="de">Deutsch</button>
```

### Animations

Adjust animation timing in `styles.css`:

```css
:root {
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading for images
- Debounced scroll events
- Optimized animations (GPU-accelerated)
- Minimal dependencies (only Lottie for animation)

## Dependencies

- **Font Awesome 6.4.0**: Icons (CDN)
- **Lottie Web 5.12.2**: Animation player (CDN)
- **Google Fonts**: Inter font (optional, can be self-hosted)

## Accessibility

- Semantic HTML5
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast support

## SEO Optimization

Add to `<head>` section:

```html
<!-- Meta tags -->
<meta name="description" content="Track your expenses effortlessly with Trimly">
<meta name="keywords" content="expense tracker, budget app, finance management">

<!-- Open Graph -->
<meta property="og:title" content="Trimly - Smart Expense Tracker">
<meta property="og:description" content="Take control of your finances">
<meta property="og:image" content="assets/og-image.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Trimly - Smart Expense Tracker">
```

## Analytics Integration

Add Google Analytics or other tracking:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Optional Enhancements

Uncomment in `script.js` for additional effects:

```javascript
// Custom cursor effect (desktop only)
initCursorEffect();

// Particle background
initParticles();

// Loading animation
initLoadingAnimation();
```

## Troubleshooting

### Lottie animation not showing
- Ensure `cat-playing.json` is in `assets/` folder
- Check browser console for errors
- Verify Lottie CDN is loaded

### Translations not working
- Check `translations.js` is loaded before `script.js`
- Verify language code matches in dropdown and translations object
- Clear browser cache

### Styles not applying
- Check CSS file path in HTML
- Verify no CSS syntax errors
- Clear browser cache

## License

This landing page template is created for the Trimly app. Customize as needed for your project.

## Support

For issues or questions:
- Check browser console for errors
- Verify all files are properly linked
- Test in different browsers

## Credits

- Icons: Font Awesome
- Animation: Lottie by Airbnb
- Design: Custom for Trimly app

---

**Made with ❤️ for Trimly**
