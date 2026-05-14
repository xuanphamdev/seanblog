---
phase: 9
title: About and 404 pages
status: completed
priority: P3
effort: 1.5h
dependencies:
  - 3
---

# Phase 9: About and 404 pages

## Overview

About page bilingual (`/vi/about/`, `/en/about/`) viết bằng markdown content collection riêng để dễ edit như post. 404 page với personality (terminal aesthetic), suggest popular posts + search.

## Requirements

- Functional:
  - About content sourceable từ markdown trong `src/content/pages/{vi,en}/about.md`.
  - `/vi/about/` và `/en/about/` render với BaseLayout.
  - 404 (`/404.astro`) show terminal-style "command not found", suggest links, search button.
  - 404 work khi Cloudflare 404 fallback hit.
- Non-functional:
  - About text từ tiếng Vi và Anh viết riêng (không auto-translate).
  - 404 light JS (chỉ link), responsive.

## Architecture

**About:** content collection mới `pages` (parallel `posts`). Schema simpler (chỉ `title`). About markdown body render qua `Content.render()`.

**404:** Astro `src/pages/404.astro` — không trong `[lang]/` vì Cloudflare 404 trỏ đến root `/404.html`. Page bilingual nội bộ: phát hiện `document.documentElement.lang` hoặc default text song ngữ short.

## Related Code Files

- Create:
  - `src/content/pages/vi/about.md`
  - `src/content/pages/en/about.md`
  - `src/pages/[lang]/about.astro`
  - `src/pages/404.astro`
- Modify:
  - `src/content/config.ts` — add `pages` collection schema

## Implementation Steps

1. Update `src/content/config.ts` thêm `pages` collection với schema `{ title }`.
2. Tạo `about.md` cho vi và en (content placeholder bạn viết).
3. Viết `src/pages/[lang]/about.astro`:
   - `getStaticPaths` enumerate 2 lang
   - Load entry `pages/{lang}/about`
   - Render BaseLayout + Prose + content
4. Viết `src/pages/404.astro`:
   - Terminal-style monospace block:
     ```
     ~/seandev $ cat /404
     cat: /404: No such file or directory
     ```
   - Heading "Lost?" / "Lạc đường?"
   - Suggestion: link Home VI, Home EN, Tags, Search trigger
   - Soft accent color, grain texture present
5. Update Header nav include About link.
6. Test: `/vi/about/`, `/en/about/`, navigate non-existent URL.

## Success Criteria

- [ ] `/vi/about/` và `/en/about/` render từ markdown
- [ ] About link xuất hiện trong Header nav
- [ ] 404 page show terminal aesthetic
- [ ] 404 link work (home, tags, search trigger)
- [ ] 404 active trên Cloudflare deploy (verify Phase 11)

## Risk Assessment

- **Risk:** Content collection `pages` conflict với existing `posts`. Mitigation: keep schemas separate, isolated.
- **Risk:** 404 không trigger trên SPA-like nav (View Transitions). Mitigation: SSG output sinh `404.html`, Cloudflare serve khi route miss.
