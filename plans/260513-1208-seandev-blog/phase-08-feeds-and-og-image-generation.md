---
phase: 8
title: Feeds and OG image generation
status: completed
priority: P2
effort: 3h
dependencies:
  - 5
---

# Phase 8: Feeds and OG image generation

## Overview

RSS feed per language (`/rss-vi.xml`, `/rss-en.xml`). Sitemap (already from `@astrojs/sitemap`). OG image auto-generation per post bằng Satori + resvg → 1200x630 PNG. Fallback site-level OG.

## Requirements

- Functional:
  - `/rss-vi.xml` valid RSS 2.0 với top N posts mới nhất (N=20).
  - `/rss-en.xml` same cho EN.
  - Each item: title, link, description, pubDate, GUID, optional category (tags).
  - Sitemap include all pages (index + posts + tags + about).
  - OG image generated cho mỗi post tại build, file name `og-{lang}-{slug}.png`.
  - OG template: blog title "Seandev" + post title + author + accent stripe + theme dark.
  - Site-level OG fallback `og-default.png` (1 lần build).
- Non-functional:
  - RSS validate (use W3C validator hoặc local lint).
  - OG PNG < 100kb each.
  - Generation parallel để tiết kiệm build time.

## Architecture

**RSS:** `@astrojs/rss` package. 2 endpoint files trong `src/pages/`: `rss-vi.xml.ts`, `rss-en.xml.ts`.

**OG image:** dùng `satori` + `@resvg/resvg-js` (Node-side PNG render).
- Endpoint `src/pages/og/[lang]/[slug].png.ts` build-time `getStaticPaths` → generate PNG per post.
- Template: JSX-ish (Satori uses CSS subset, flexbox).
- Font load: read Fraunces.ttf as buffer.

**Site-level OG:** static `public/og-default.png` design 1 lần trong Figma rồi export.

## Related Code Files

- Create:
  - `src/pages/rss-vi.xml.ts`
  - `src/pages/rss-en.xml.ts`
  - `src/pages/og/[lang]/[slug].png.ts` — OG generator endpoint
  - `src/lib/og-template.tsx` — Satori JSX template
  - `public/og-default.png`
  - `public/fonts/Fraunces-Bold.ttf` — Satori cần TTF (không phải WOFF2)
- Modify:
  - `package.json` — add `@astrojs/rss`, `satori`, `@resvg/resvg-js`
  - `src/layouts/BaseLayout.astro` — set OG image meta dynamic (`/og/{lang}/{slug}.png` per post, default fallback site)
  - `src/lib/site-config.ts` — RSS metadata (title, description, link)
  - `astro.config.mjs` — `@astrojs/sitemap` config với i18n
  - `src/components/Footer.astro` — RSS links

## Implementation Steps

1. Install: `npm i @astrojs/rss satori @resvg/resvg-js`.
2. Download `Fraunces-Bold.ttf` (font for Satori) → `public/fonts/`.
3. Viết `src/pages/rss-vi.xml.ts`:
   ```ts
   import rss from "@astrojs/rss";
   import { getPostsByLang } from "../lib/posts";
   export async function GET(context) {
     const posts = await getPostsByLang("vi");
     return rss({
       title: "Seandev — VI",
       description: site.description.vi,
       site: context.site,
       items: posts.slice(0, 20).map(p => ({...})),
     });
   }
   ```
4. Same cho `rss-en.xml.ts`.
5. Viết `src/lib/og-template.tsx` — Satori-compatible JSX template:
   - Background dark `oklch(14% 0.01 80)` → equivalent hex
   - Top-left: "SEANDEV" mono small
   - Center-left: post title large serif bold
   - Bottom: "by Sean · {date}" mono
   - Right edge: cyan accent stripe
6. Viết `src/pages/og/[lang]/[slug].png.ts`:
   - `getStaticPaths` enumerate `lang × slug`
   - Build PNG via Satori → resvg → return Response with `image/png`
7. Update `BaseLayout` để dynamic OG image path: `/og/{lang}/{slug}.png` cho post, fallback site-level cho non-post pages.
8. Update Sitemap config với i18n locales.
9. Add RSS link tags trong `<head>` (BaseLayout).
10. Test feeds: `curl localhost/rss-vi.xml`, validate online.
11. Test OG: build, open `dist/og/vi/{slug}.png` visual check.
12. Social preview test (Twitter card validator hoặc local screenshot).

## Success Criteria

- [ ] `/rss-vi.xml` valid RSS 2.0
- [ ] `/rss-en.xml` valid RSS 2.0
- [ ] Sitemap include all pages with proper alternate hreflang
- [ ] OG image generated cho mỗi post, file < 100kb
- [ ] OG image render text VI có dấu đẹp
- [ ] Each post `<head>` có `<meta property="og:image">` đúng URL
- [ ] Twitter Card validator pass với sample post
- [ ] Build time tăng < 30s cho 50 posts (parallel)

## Risk Assessment

- **Risk:** Satori không support tất cả CSS, đặc biệt `oklch()`. Mitigation: convert oklch → hex/rgb trong template.
- **Risk:** `@resvg/resvg-js` native binding fail trên Cloudflare build. Mitigation: Cloudflare Pages build chạy Node, hỗ trợ native; nếu lỗi → switch sang `@vercel/og` (Edge-compatible) hoặc precompute local + commit.
- **Risk:** OG generation cho 100+ posts build chậm. Mitigation: parallel via `Promise.all`, cache key by content hash để skip unchanged posts.
- **Risk:** Fraunces TTF cho Satori thiếu glyph VI. Mitigation: subset VI hoặc fallback Inter.
