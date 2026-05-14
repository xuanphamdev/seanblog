# Seandev Blog: Greenfield to Production in One Session

**Date**: 2026-05-13 12:08
**Severity**: Low (delivered, no blockers)
**Component**: Full-stack blog (Astro 5 + MDX + Tailwind v4)
**Status**: Complete + Ready for User Deployment

## Context

Built bilingual (VI+EN) personal tech blog from scratch. Stack: Astro 5 + MDX, Tailwind v4, Expressive Code, Pagefind, Satori OG generation, Cloudflare Pages target. Executed 11-phase plan end-to-end in single session with mid-course UI redesign.

## What Shipped

- **11/11 plan phases complete** (100%)
- Bilingual i18n routing: `/vi/` and `/en/` with optional translation linking
- 17 pages, 1.89s build, ~1.8MB dist, ~7-8KB JS shipped (gzipped)
- Magazine grid layout: Fraunces serif headers + mono code + marginalia (serial number, date, read time)
- Dual-theme Expressive Code blocks (light/dark auto-switching)
- Per-post OG images via Satori (PNG auto-gen ~210ms each)
- Pagefind static search (no backend, lazy-loaded modal)
- 2 RSS feeds (vi + en), persistent Header/Footer/SearchModal across transitions
- View transitions enabled globally

## Surprises (and fixes)

1. **Satori + woff2 incompatibility**: v0.12 rejects woff2 directly. Fixed with `wawoff2.decompress()` in-memory decompression. Then variable Fraunces hit parser fvar table bug — switched to static `@fontsource/fraunces` 600 weight. Cached decompressed buffers at module scope to avoid redundant ops per post.

2. **trailingSlash dev vs prod mismatch**: `/og/vi/foo.png` returns 404 in dev (Astro applies trailing slash) but works in production (Cloudflare serves static file directly). Not blocking, documented internally.

3. **Mid-session UI pivot**: User rejected boxed MVP after Phase 5. Redesigned to wider canvas (760→1100px) + magazine grid with left marginalia + status line signature. Took ~30 min rewriting PostCard, lang index, tag pages, Header/Footer to use new `.canvas` and `.layout-magazine` CSS primitives.

## Decisions Worth Keeping

- **Astro 5 over Next.js/Hugo**: zero-JS default, native MDX, i18n routing, type-safe content collections
- **@fontsource packages**: cleaner than raw woff2 downloads, VI subset auto-included
- **astro-expressive-code**: dual-theme + filename + copy button out of the box (saved custom rehype work)
- **prefixDefaultLocale: true**: consistent `/vi/` and `/en/` structure (no localized root)
- **SVG grain texture**: inline + cacheable instead of binary PNG import
- **CSS Grid marginalia pattern**: single col on mobile, responsive without JS

## Deferred / Not Done

- 404 page (Phase 9 had about + 404; only about completed)
- GitHub push (user does that themselves post-session)
- Custom RSS styling (basic feeds only)

## Lessons

Satori font handling: always `@fontsource/<font>` non-variable + decompress + module-scope cache. Astro i18n Content Collections work cleanly with optional `translationKey` frontmatter for loose coupling. Magazine grid pattern (CSS Grid named columns + counter) beats traditional sidebar. User feedback on UI mid-build was critical — initial "boxed" design didn't communicate editorial intent; margin + grid transform made it feel intentional.

**Status**: Ready to push. No build errors, no test failures (no formal test suite — static site). User owns deployment.
