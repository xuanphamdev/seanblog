---
phase: 6
title: Tag system
status: completed
priority: P2
effort: 2h
dependencies:
  - 4
---

# Phase 6: Tag system

## Overview

Build tag index `/[lang]/tags/` (all tags với count) và tag detail `/[lang]/tags/[tag]/` (posts having tag). Tags scoped per-language. `Tag` chip component reusable từ PostCard + post meta.

## Requirements

- Functional:
  - `/[lang]/tags/` list all unique tags trong lang đó với post count.
  - `/[lang]/tags/[tag]/` list posts có tag đó, sort desc theo date.
  - Click tag chip ở bất kỳ đâu → đi tag detail.
  - Tag slug kebab-case từ raw tag (`Astro 5` → `astro-5`).
- Non-functional:
  - `getStaticPaths` enumerate đúng để build all tag pages.
  - Tag normalize lowercase để de-dup `Rust` vs `rust`.

## Architecture

`src/lib/tags.ts` exports:
- `getAllTags(lang)` → `Array<{ tag: string, slug: string, count: number }>` sort by count desc rồi alpha.
- `getPostsByTag(lang, tagSlug)` → posts matching.
- `slugifyTag(raw)` → kebab-case lowercase.

Tag chip: `<a class="tag-chip">#{tag}</a>` — mono font micro size, subtle border, hover accent.

Tag index layout: grid of chips với count badge.

## Related Code Files

- Create:
  - `src/pages/[lang]/tags/index.astro`
  - `src/pages/[lang]/tags/[tag].astro`
  - `src/components/Tag.astro`
  - `src/components/TagCloud.astro`
  - `src/lib/tags.ts`
- Modify:
  - `src/components/PostCard.astro` — sử dụng `Tag` component
  - `src/components/PostMeta.astro` — sử dụng `Tag` component

## Implementation Steps

1. Viết `src/lib/tags.ts` với `slugifyTag`, `getAllTags`, `getPostsByTag`.
2. Viết `src/components/Tag.astro` với props `tag`, `lang`, optional `count`.
3. Viết `src/components/TagCloud.astro` — grid wrap chips.
4. Viết `src/pages/[lang]/tags/index.astro`:
   - `getStaticPaths` enumerate 2 lang
   - Query `getAllTags(lang)`
   - Render TagCloud
5. Viết `src/pages/[lang]/tags/[tag].astro`:
   - `getStaticPaths` enumerate `lang × tagSlug`
   - Query `getPostsByTag(lang, tagSlug)`
   - Render PostCard list với header "Posts tagged #{tag}"
6. Update PostCard + PostMeta dùng Tag component.
7. Test: post có 3 tags, mỗi tag click đi đúng detail page; tags scoped per lang (không leak post EN sang VI).

## Success Criteria

- [ ] `/vi/tags/` list all VI tags với count
- [ ] `/en/tags/` list all EN tags với count
- [ ] Tag detail `/[lang]/tags/[tag]/` show đúng posts
- [ ] Click tag chip từ post → đi tag detail
- [ ] Slugify handle edge cases (space, accent, special char)
- [ ] Tags scoped per lang (VI posts không leak sang EN tag pages)

## Risk Assessment

- **Risk:** Slugify VI có dấu chưa strip → URL xấu. Mitigation: dùng lib `slugify` hoặc custom normalize NFD + remove diacritics.
- **Risk:** Tag count drift nếu drafts có tag. Mitigation: filter drafts trong `getAllTags`.
- **Risk:** Tag cú pháp inconsistent (`AI`, `ai`, `A.I.`). Mitigation: lowercase + slug match, document convention trong README.
