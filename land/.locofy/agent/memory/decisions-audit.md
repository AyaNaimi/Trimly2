# Decisions Audit — GATE 1.5

Run: 2026-06-07 — Trimly landing page (React + Vite + MUI)

## Catalog Row Decision Table

| Catalog row | Trigger fired | Question asked? (tool call id) | User's answer | Action this run |
|-------------|---------------|---------------------------------|---------------|-----------------|
| FeatureCard | promotion — only used by one component (Groups.tsx), no cross-feature use | n/a — trigger did not fire | n/a | Create new shared component at src/components/FeatureCard.tsx; extract 4 inline card blocks from Groups.tsx |
| FeatureCard | slot-refactor — new component, not generalizing existing stringly-typed API | n/a — trigger did not fire | n/a | Create with minimal props: icon, label, description, className? |

## Summary

No promotion or slot-refactor questions were required in this run. The only catalog action is creating `FeatureCard` as a new shared component extracted from the 4 repeated inline column structures in `Groups.tsx`.

All other primitives (AppHeaderBar, PrimaryCTAButton, FormTextField, SearchField, SegmentedPillPicker) were not triggered — zero qualifying occurrences found in any source file.
