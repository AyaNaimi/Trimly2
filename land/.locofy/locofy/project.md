# Trimly Landing Page — Project Inventory

**Framework:** React + Vite + TypeScript + Material UI  
**Language:** French  
**Last enhanced:** 2026-06-07

## Screens

| Screen | File | Route |
|--------|------|-------|
| Landing Page | src/pages/LandingPage.tsx | / |

## Shared Components

| Component | File | Used by |
|-----------|------|---------|
| FeatureCard | src/components/FeatureCard.tsx | FeatureCardsSection |
| FeatureCardsSection | src/components/FeatureCardsSection.tsx | LandingPage |
| CtaSection | src/components/CtaSection.tsx | LandingPage |
| FooterSection | src/components/FooterSection.tsx | LandingPage |
| LandingNavBar | src/components/LandingNavBar.tsx | LandingPage |
| HeroSection | src/components/HeroSection.tsx | LandingPage |

## Design System

- **Tokens:** src/global.css (CSS custom properties in :root)
- **Fonts:** Inter, Road Rage, Caveat Brush, Oswald, Waiting for the Sunrise, Margarine (Google Fonts)
- **Colors:** --color-brand-green, --color-brand-olive, --color-text-muted, --color-appstore-bg, --color-appstore-border + full palette in global.css
- **Font sizes:** --fs-7 through --fs-68 (all sizes tokenized)

## Notes

- All auto-generated Figma names (FigmaDesignChatGPTImageJun72026124544PMjpg, Groups, Groups1, Groups2) have been renamed to semantic names.
- Raw hex colors replaced with CSS variable tokens.
- All font sizes replaced with token references.
- FeatureCard extracted from 4 repeated inline card patterns in FeatureCardsSection.
- LandingPage kept under 300 lines via HeroSection extraction.
