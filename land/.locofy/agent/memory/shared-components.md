# Shared Component Catalog

Run: 2026-06-07 — Trimly landing page (React + Vite + MUI)

## Inventory

| Shared component | Status | Used by screens | Public API | File |
|------------------|--------|-----------------|------------|------|
| FeatureCard | new | LandingPage (Groups.tsx × 4 inline blocks) | icon: string, label: string, description: string, className?: string | src/components/FeatureCard.tsx + FeatureCard.module.css |

## Primitives NOT extracted (with justification)

| Primitive | Reason skipped |
|-----------|---------------|
| AppHeaderBar | No 3-slot header bar on any screen. Nav is a flat list of text links (no leading/center/trailing slot pattern). Appears once only. |
| PrimaryCTAButton | Only 1 contained-variant button across all files (App Store button in Groups1). No duplication. |
| FormTextField | Zero TextField occurrences across all files. |
| SearchField | Zero search-field occurrences across all files. |
| SegmentedPillPicker | Zero pill-toggle HStacks across all files. |
| NavLink | 4 nav text items in main page but inline simple `div` elements — not a structural primitive with shared decoration chain. Will be addressed via naming/cleanup only. |

## Notes

- `FeatureCard` appears 4× within `Groups.tsx` as four inline column blocks (DÉTECTE, ANALYSE, ALERTE, ECONOMISE). Each shares: icon `<img>`, bold uppercase label `<div>`, and description `<div>`. Two-occurrence rule fires (4 occurrences). Must be extracted.
- Promotion check: `FeatureCard` is used only within one component file (`Groups.tsx`) → no cross-feature promotion question needed.
- Slot-refactor check: `FeatureCard` is new, not generalizing an existing stringly-typed component → no trigger.
