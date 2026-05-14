---
phase: 4
title: Responsive accessibility and theme QA
status: completed
priority: P1
effort: 2h
dependencies:
  - 2
  - 3
---

# Phase 4: Responsive accessibility and theme QA

## Overview

Verify the redesigned homepage behaves well across viewport sizes, keyboard
navigation, reduced motion, and dark/light themes.

## Requirements

- Functional: all primary routes and controls remain reachable.
- Non-functional: no horizontal scroll, no clipped text, no theme contrast
  regression, no build/type failures.

## Architecture

Use project-native commands first, then browser/manual checks when possible.
The page remains static Astro with tiny inline scripts only from existing
sitewide components.

## Related Code Files

- Verify: `src/pages/[lang]/index.astro`
- Verify: `src/components/Header.astro`
- Verify: `src/components/ThemeToggle.astro`
- Verify: `src/components/BackToTop.astro`

## Implementation Steps

1. Run `npm run check`.
2. Run `npm run build:fast`.
3. Open `/vi/` and `/en/` locally.
4. Check 375px, 768px, 1024px, and 1440px widths.
5. Toggle dark/light and confirm contrast/readability.
6. Keyboard tab through hero CTAs, nav, latest post, archive items.
7. Check reduced-motion behavior for any added transitions.

## Success Criteria

- [ ] `npm run check` passes.
- [ ] `npm run build:fast` passes.
- [ ] No horizontal scroll at 375px.
- [ ] All interactive targets are keyboard reachable.
- [ ] Dark/light variants both feel designed.

## Risk Assessment

Risk: visual check skipped because build passes.
Mitigation: require browser smoke check and record viewport notes.
