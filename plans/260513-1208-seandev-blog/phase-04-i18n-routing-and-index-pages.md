---
phase: 4
title: i18n routing and index pages
status: completed
priority: P1
effort: 3h
dependencies:
  - 3
---

# Phase 4: i18n routing and index pages

## Overview

Setup Astro native i18n routing với 2 locales (vi, en). Default `vi` không prefix-redirect (theo brainstorm: VI là default). Build index page `/[lang]/` list posts của lang đó, sort desc theo date, exclude drafts. Root `/` redirect dựa trên `Accept-Language` → fallback VI.

## Requirements

- Functional:
  - `/` → redirect `/vi/` (default) hoặc detect `Accept-Language` rồi đi `/en/`.
  - `/vi/` và `/en/` render post list.
  - Mỗi PostCard hiển thị: title, date, summary, tags (max 3), reading time.
  - Drafts không xuất hiện.
  - Sort theo date desc.
  - LangSwitch ở Header swap path đúng (đã làm Phase 3, phase này verify với real routes).
- Non-functional:
  - Type-safe lang param (`"vi" | "en"`).
  - `getStaticPaths` returns rõ ràng.

## Architecture

`astro.config.mjs` thêm:
```js
i18n: {
  defaultLocale: "vi",
  locales: ["vi", "en"],
  routing: { prefixDefaultLocale: true } // /vi/ explicit, KHÔNG strip prefix
}
```

Lý do `prefixDefaultLocale: true`: bilingual structure consistent, dễ swap, không có edge case "root vs /vi/ duplicate content".

Root `/` → redirect logic ở `src/pages/index.astro` server-side render redirect via `Astro.redirect()` dựa trên `Astro.request.headers.get('accept-language')`. Static build → dùng meta refresh fallback hoặc Cloudflare _redirects file (gọn hơn).

Quyết: dùng `public/_redirects` file (Cloudflare Pages native syntax) cho redirect `/` → `/vi/` mặc định. Accept-Language detection sẽ là enhancement Phase 11 (Cloudflare Function nếu muốn).

PostCard component nhận `entry: CollectionEntry<"posts">` props.

Reading time calc: `src/lib/reading-time.ts` đếm chữ trong `entry.body`, chia 200 wpm (VI/EN gần tương đương).

## Related Code Files

- Create:
  - `src/pages/[lang]/index.astro` — post list per language
  - `src/components/PostCard.astro`
  - `src/lib/reading-time.ts`
  - `src/lib/posts.ts` — `getPostsByLang(lang)` helper (filter, sort, exclude drafts)
  - `public/_redirects` — Cloudflare redirects (`/ /vi/ 302`)
- Modify:
  - `astro.config.mjs` — i18n config
  - `src/pages/index.astro` — DELETE (replaced bởi `_redirects`) hoặc giữ làm fallback meta-refresh
  - `src/components/LangSwitch.astro` — handle `prefixDefaultLocale: true` correctly

## Implementation Steps

1. Update `astro.config.mjs` với block i18n.
2. Viết `src/lib/posts.ts`:
   ```ts
   export async function getPostsByLang(lang: "vi" | "en") {
     const all = await getCollection("posts");
     return all
       .filter(p => p.id.startsWith(`${lang}/`) && !p.data.draft)
       .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
   }
   ```
3. Viết `src/lib/reading-time.ts` — word count + duration formatter (with i18n unit: "phút đọc" / "min read").
4. Viết `src/components/PostCard.astro` — typography hierarchy: title (serif large), date (mono small muted), summary (sans body), tags (mono micro).
5. Viết `src/pages/[lang]/index.astro`:
   - `getStaticPaths` returns `[{params: {lang: "vi"}}, {params: {lang: "en"}}]`
   - Query posts via `getPostsByLang`
   - Render BaseLayout + list of PostCard
   - Page title localized
6. Tạo `public/_redirects` với `/ /vi/ 302`.
7. Xóa hoặc replace `src/pages/index.astro` thành meta-refresh fallback (dev mode không có _redirects).
8. Test: `/vi/` show VI posts, `/en/` show EN posts, lang switch swap.

## Success Criteria

- [ ] `/vi/` và `/en/` render post list đúng lang
- [ ] Sort desc theo date
- [ ] Drafts không hiển thị (verify bằng cách set 1 post `draft: true`)
- [ ] PostCard layout đẹp, hierarchy rõ ràng
- [ ] Reading time hiển thị đúng đơn vị theo lang
- [ ] LangSwitch chuyển từ `/vi/` ↔ `/en/` work
- [ ] `_redirects` file work trên Cloudflare (verify ở Phase 11)
- [ ] Build sinh ra 2 index HTML files

## Risk Assessment

- **Risk:** `prefixDefaultLocale: true` + redirect `/` có thể tạo redirect loop. Mitigation: redirect rules rõ ràng, test.
- **Risk:** Filter `p.id.startsWith("vi/")` brittle nếu Astro v5 thay đổi ID format. Mitigation: dùng `p.collection` + custom field, hoặc decode từ `p.filePath` qua collection loader.
- **Risk:** Reading time cho mixed VI+EN content sai. Mitigation: chấp nhận 200 wpm chung cho Phase 1.
