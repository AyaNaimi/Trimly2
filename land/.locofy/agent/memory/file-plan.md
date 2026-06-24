# File Plan — GATE 2

Run: 2026-06-07 — Trimly landing page (React + Vite + MUI)

## Files to Create

| File | Action | Est. Lines | Extracted Components | Notes |
|------|--------|-----------|---------------------|-------|
| src/components/FeatureCard.tsx | create | ~35 | — | Extracted from Groups.tsx (4× repeated icon+label+desc pattern) |
| src/components/FeatureCard.module.css | create | ~40 | — | Shared styles for feature card columns |
| src/components/LandingNavBar.tsx | create | ~45 | — | Extracted from LandingPage: Trimly logo + nav links + Télécharger button row |
| src/components/LandingNavBar.module.css | create | ~30 | — | Styles for nav bar |
| .locofy/locofy/project.md | create | ~30 | — | Project inventory for future runs |

## Files to Rename + Modify

| File (old name) | New name | Action | Est. Lines | Notes |
|-----------------|----------|--------|-----------|-------|
| src/pages/FigmaDesignChatGPTImageJun72026124544PMjpg.tsx | src/pages/LandingPage.tsx | rename + modify | ~270 | Fix naming; replace inline nav with LandingNavBar; replace raw colors with CSS vars; fix font size tokens; add aria/alt text; bring under 300 lines |
| src/pages/FigmaDesignChatGPTImageJun72026124544PMjpg.module.css | src/pages/LandingPage.module.css | rename | ~808 | CSS only — rename reference in LandingPage.tsx |
| src/components/Groups.tsx | src/components/FeatureCardsSection.tsx | rename + modify | ~55 | Replace 4 inline card blocks with FeatureCard component; rename component export |
| src/components/Groups.module.css | src/components/FeatureCardsSection.module.css | rename | ~235 | Rename reference in FeatureCardsSection.tsx |
| src/components/Groups1.tsx | src/components/CtaSection.tsx | rename + modify | ~145 | Fix raw colors (#020302→CSS var, #868686→CSS var); fix naming; add aria labels |
| src/components/Groups1.module.css | src/components/CtaSection.module.css | rename | ~399 | Rename reference in CtaSection.tsx |
| src/components/Groups2.tsx | src/components/FooterSection.tsx | rename + modify | ~60 | Fix naming; rename import reference |
| src/components/Groups2.module.css | src/components/FooterSection.module.css | rename | ~145 | Rename reference in FooterSection.tsx |
| src/App.tsx | src/App.tsx | modify | ~56 | Update import to LandingPage; add page title "Trimly — Reprenez le contrôle de vos finances" |
| src/global.css | src/global.css | modify | ~185 | Add missing font-size tokens for values not yet in :root (e.g. --fs-21, --fs-22, --fs-25, --fs-43, --fs-55, --fs-61, --fs-65, --fs-67, --fs-68); add --color-appstore-bg and --color-appstore-border tokens |

## Enhancement Issues Inventory

### Critical (blocks probes)
- `LandingPage.tsx` is 353 lines — exceeds 300-line limit → extract `LandingNavBar`
- Raw hex colors in sx props: `#607d0c`, `#7a7a7a`, `#5f7d0d`, `#020302`, `#868686` → replace with existing CSS vars
- Raw font sizes in sx props: `"12"`, `"11"`, `"43px"`, `"25px"`, `"61px"`, `"68px"`, `"55px"`, `"21px"`, `"22px"`, `"67px"`, `"65px"` → replace with CSS var tokens or add new tokens

### Naming
- All 4 component files have generic Locofy names (Groups, Groups1, Groups2, FigmaDesignChatGPTImageJun72026124544PMjpg) → rename to semantic names

### Accessibility
- All `<img>` tags have empty `alt=""` → add descriptive alt text
- `<button>` in Groups1 (Google Play) has no aria-label → add one
- Interactive buttons have no onClick handlers → add placeholder handlers with console.log

### Shared component
- `FeatureCard` must be created and `FeatureCardsSection.tsx` (was Groups.tsx) must use it instead of 4 inline blocks

### Route / App
- App.tsx page title is empty for `/` → set to "Trimly — Reprenez le contrôle de vos finances"
- App.tsx meta description is empty → add description

## Dependency check
- All dependencies present in package.json (react, react-router-dom, @mui/material, @emotion/react, @emotion/styled, typescript, vite)
- No missing build config changes required
- Font imports in global.css are correct (Google Fonts: Inter, Road Rage, Caveat Brush, Oswald, Waiting for the Sunrise, Margarine)

## Post-write verification plan
- Run Artifact Completeness Probe (bash) from enhancement-rules.md
- Run Per-Screen Completeness Checklist
- Check no raw hex colors remain in .tsx files
- Check no over-300-line .tsx files remain
- Verify FeatureCard is imported in FeatureCardsSection and no inline card blocks remain
