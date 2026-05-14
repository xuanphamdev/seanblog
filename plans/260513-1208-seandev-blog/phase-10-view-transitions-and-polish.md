---
phase: 10
title: View transitions and polish
status: completed
priority: P2
effort: 3h
dependencies:
  - 5
  - 7
  - 9
---

# Phase 10: View transitions and polish

## Overview

Enable Astro View Transitions cho navigation mượt giữa pages. Re-attach interactive scripts on `astro:page-load`. Performance pass: font preload audit, image lazy-load, prefetch hints, Lighthouse audit. Accessibility pass.

## Requirements

- Functional:
  - Navigation post → post fade + subtle slide transition.
  - Header / Footer persistent (transition:name).
  - Theme toggle state preserved across nav.
  - Search modal, TOC scroll-spy, copy-code listeners re-attach sau nav.
  - `prefers-reduced-motion: reduce` → disable transitions.
- Non-functional:
  - LCP < 1.5s on 4G post page.
  - CLS < 0.05.
  - Lighthouse Performance ≥95 home + post.
  - Lighthouse Accessibility 100.
  - Total JS shipped homepage < 10kb gzip.

## Architecture

**View Transitions:** add `<ClientRouter />` (or `<ViewTransitions />` legacy) trong BaseLayout `<head>`. Mark persistent elements với `transition:persist="header"`, `transition:persist="theme-toggle-state"`.

**Re-attach pattern:** instead of `DOMContentLoaded`, listen `astro:page-load`. Wrap script bodies in function exported and called on both events.

**Reduced motion:** `astro-view-transitions` respects `prefers-reduced-motion` automatically (instant nav fallback).

**Performance audit:**
- Font preload: chỉ critical weight, audit Network panel.
- Image: dùng `<Image>` component từ `astro:assets`, lazy load below-fold.
- `<link rel="prefetch">` cho post links visible in viewport (Astro has built-in `prefetch` option).
- Disable Pagefind preload (only on Cmd+K).
- Audit `astro build` output size.

## Related Code Files

- Create:
  - `src/scripts/init-page.ts` — central re-attach function for `astro:page-load`
- Modify:
  - `src/layouts/BaseLayout.astro` — add `<ClientRouter />`, mark persist
  - `src/components/Header.astro` — `transition:persist`
  - `src/components/Footer.astro` — `transition:persist`
  - `src/components/SearchTrigger.astro` — use `astro:page-load` listener
  - `src/components/TableOfContents.astro` — re-init scroll-spy
  - `src/scripts/copy-code.ts` — re-attach on page-load
  - `astro.config.mjs` — enable prefetch (`prefetch: { defaultStrategy: 'viewport' }`)

## Implementation Steps

1. Add `<ClientRouter />` import trong BaseLayout.
2. Mark `<Header>` + `<Footer>` + `<SearchModal>` với `transition:persist`.
3. Refactor interactive scripts thành `init()` functions, call on `DOMContentLoaded` AND `astro:page-load`.
4. Test: navigate post → post, verify header không re-mount, modal listeners còn work, TOC scroll-spy re-attach.
5. Enable prefetch trong `astro.config.mjs`.
6. Audit performance:
   - Run `npm run build && npm run preview`.
   - Lighthouse home + post (dark + light).
   - Network: check font preload chỉ 1 weight critical.
   - Verify total JS < 10kb gzip.
7. Audit accessibility:
   - Tab nav through entire post page.
   - Screen reader test landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`).
   - Color contrast pass cả 2 mode.
   - Heading hierarchy correct.
8. Fix any issues found.
9. Optional polish: subtle hover micro-animations cho PostCard, tag chips, link underline reveal.

## Success Criteria

- [ ] View transitions mượt giữa pages
- [ ] Header / Footer / Modal không re-mount
- [ ] All interactive scripts work sau nav
- [ ] `prefers-reduced-motion` disable transitions
- [ ] Lighthouse Performance ≥95 home + post (dark + light)
- [ ] Lighthouse Accessibility 100
- [ ] LCP < 1.5s on 4G simulation
- [ ] CLS < 0.05
- [ ] Total JS gzip homepage < 10kb
- [ ] No console errors trong production build

## Risk Assessment

- **Risk:** View Transitions break theme toggle (re-init flicker). Mitigation: persist theme via `transition:persist` + read from `localStorage` on page-load.
- **Risk:** Search modal state leak across pages. Mitigation: reset modal state on `astro:before-swap`.
- **Risk:** Lighthouse fail vì grain texture cost. Mitigation: optimize grain.png (tiny PNG ~3kb), `image-rendering: pixelated` để browser cache tile.
- **Risk:** Prefetch tăng bandwidth mobile. Mitigation: `prefetch: viewport` strategy chỉ prefetch links visible, không aggressive.
