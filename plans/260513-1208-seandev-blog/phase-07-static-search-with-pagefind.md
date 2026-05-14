---
phase: 7
title: Static search with Pagefind
status: completed
priority: P2
effort: 3h
dependencies:
  - 5
---

# Phase 7: Static search with Pagefind

## Overview

Integrate Pagefind static search. Build index at build time. Cmd+K modal trigger. Results live-update as user types. Scope search per language (separate indices hoặc filter via `data-pagefind-filter`).

## Requirements

- Functional:
  - Cmd+K (or `/`) opens modal anywhere.
  - Input focused on open, Esc closes.
  - Results show as user types (debounced ~150ms).
  - Each result: title, snippet with highlight, link, lang badge.
  - Result scoped to current lang by default; toggle "all languages".
  - Keyboard nav: ↑↓ select, Enter open.
  - Mobile: trigger button visible in Header, full-screen modal.
- Non-functional:
  - Modal JS loaded lazily (chỉ khi mở).
  - Pagefind index < 200kb cho ~50 posts.
  - Modal lib zero dependency (vanilla JS).

## Architecture

**Pagefind setup:**
- Add `pagefind` as dev dep.
- Post-build hook: `npx pagefind --site dist` generates `dist/pagefind/`.
- Add to Astro config build step hoặc `package.json` script: `astro build && pagefind`.

**Index scoping:** add `data-pagefind-filter="lang:vi"` (or `en`) to post body wrapper, plus `data-pagefind-meta="lang:vi"`. Pagefind UI supports filter via `filters: { lang: "vi" }` ở query.

**Modal:** Build vanilla JS modal. Astro island `<SearchModal client:idle>`.
Actually thay vì client:idle, dùng inline script global listener cho Cmd+K → dynamic import Pagefind:
```ts
const pagefind = await import("/pagefind/pagefind.js");
```
Inject result HTML into modal.

**Trigger button:** Header có button `<button id="search-trigger">⌘K</button>`.

## Related Code Files

- Create:
  - `src/components/SearchModal.astro` — modal UI markup + styles (initially hidden)
  - `src/scripts/search.ts` — lazy load Pagefind, handle input, render results, keyboard nav
  - `src/components/SearchTrigger.astro` — button trong Header
- Modify:
  - `package.json` — add pagefind dev dep + build script
  - `astro.config.mjs` — integration hook nếu cần
  - `src/components/Header.astro` — wire SearchTrigger
  - `src/layouts/BaseLayout.astro` — include SearchModal once globally
  - `src/layouts/PostLayout.astro` — add `data-pagefind-body` to article wrapper, `data-pagefind-filter="lang:..."`

## Implementation Steps

1. Install: `npm i -D pagefind`.
2. Update `package.json` script: `"build": "astro build && pagefind --site dist"`.
3. Add `data-pagefind-body` + `data-pagefind-filter="lang:{lang}"` + `data-pagefind-meta="lang:{lang}"` vào `PostLayout` article wrapper.
4. Viết `src/components/SearchTrigger.astro`:
   - Button + kbd hint "⌘K"
   - Inline `<script>` add `keydown` listener cho `Cmd+K` / `Ctrl+K` / `/`
5. Viết `src/components/SearchModal.astro`:
   - Modal markup: backdrop + dialog + input + results container
   - Styles: backdrop blur, dialog centered, max-width 600px
   - Hidden by default
6. Viết `src/scripts/search.ts`:
   - On first open: dynamic import Pagefind
   - Debounced search → render results
   - Filter by current lang (read from `<html lang>`)
   - Keyboard nav ↑↓/Enter/Esc
   - Highlight matches
7. Wire SearchTrigger trong Header.
8. Include SearchModal once trong BaseLayout (avoid duplicate).
9. Test: build + preview, open modal, search VI keyword, search EN keyword, kbd nav, Esc.

## Success Criteria

- [ ] Cmd+K / Ctrl+K / `/` open modal anywhere
- [ ] Esc close modal
- [ ] Results render with title + snippet + lang filter
- [ ] ↑↓ navigate, Enter open
- [ ] Mobile: search button visible, full-screen modal
- [ ] Pagefind index size acceptable (<200kb cho 50 posts)
- [ ] JS for search lazy-loaded (verify Network tab: chỉ load khi mở)
- [ ] Search hoạt động trên Cloudflare deploy production

## Risk Assessment

- **Risk:** Pagefind build hook không chạy nếu Cloudflare build chỉ chạy `astro build`. Mitigation: update build script trong package.json, Cloudflare gọi `npm run build`.
- **Risk:** VI diacritics có thể không match nếu user nhập không dấu. Mitigation: Pagefind v1.1+ hỗ trợ unicode normalization; document hành vi.
- **Risk:** Modal JS conflict với View Transitions (Phase 10). Mitigation: re-attach listeners on `astro:page-load`.
- **Risk:** Build slow trên 100+ posts. Mitigation: Pagefind fast, < 5s for 100 posts typical.
