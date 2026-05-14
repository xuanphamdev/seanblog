---
phase: 5
title: Post rendering with TOC and code blocks
status: completed
priority: P1
effort: 4h
dependencies:
  - 4
---

# Phase 5: Post rendering with TOC and code blocks

## Overview

Build `PostLayout.astro` cho single-post render. Configure Shiki dual-theme (dark/light) đồng bộ với data-theme. Build `CodeBlock` wrapper với filename label + copy button. Build `TableOfContents` (sticky desktop, collapse mobile). Bilingual post switcher dùng `translationKey`. Setup remark/rehype plugins: footnotes, slug, autolink headings.

## Requirements

- Functional:
  - Route `/[lang]/posts/[slug]` render post.
  - Hierarchy rõ ràng: title (h1), date + reading time + tags meta, divider, body prose.
  - TOC auto-generate từ h2/h3, sticky right desktop ≥1024px, collapse `<details>` mobile.
  - TOC chỉ xuất hiện nếu post >800 từ và có ≥2 heading.
  - Code blocks: filename header bar, copy button, dual-theme highlight đồng bộ data-theme.
  - Footnotes ([^1]) render đúng với back-reference.
  - Headings có anchor link (`#slug`).
  - Bilingual switcher: nếu `translationKey` match post bên ngôn ngữ kia → link; ngược lại disable hoặc fallback index.
- Non-functional:
  - JS shipped per post < 5kb (TOC scroll spy + copy button).
  - Code block dual-theme dùng CSS, không runtime JS để swap.

## Architecture

**Shiki dual-theme:** Astro Shiki config:
```js
shikiConfig: {
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false, // emit CSS vars
}
```
Setup CSS rules:
```css
[data-theme="dark"] .astro-code,
[data-theme="dark"] .astro-code span { color: var(--shiki-dark) !important; background-color: var(--shiki-dark-bg) !important; }
```

**CodeBlock wrapper:** Astro component nhận `<pre>` slot. Astro v5 hỗ trợ custom `CodeBlock` via `components` prop in `Content.render()` hoặc rehype plugin transform. Đơn giản: dùng rehype plugin custom (`rehype-pretty-wrap`) bọc mỗi `<pre>` trong `<figure class="code-block"><figcaption>{filename}</figcaption>...</figure>`, filename lấy từ ```` ```ts title="foo.ts" ```` syntax (cần `rehype-mdx-code-props` hoặc custom remark).

**TOC:** Generate từ `headings` đã expose bởi Astro `Content.render()` → `headings` array. Render `<nav>` với `<ol>`. Scroll-spy via `IntersectionObserver` (vanilla JS ~1kb).

**Translation lookup:** Helper `getTranslation(currentPost, targetLang)` query collection theo `translationKey`.

**Plugins:**
- `remark-gfm` (auto by MDX)
- `rehype-slug` — h2/h3 anchors
- `rehype-autolink-headings` — clickable anchor
- footnotes: GFM tự handle qua `remark-gfm`

## Related Code Files

- Create:
  - `src/layouts/PostLayout.astro`
  - `src/pages/[lang]/posts/[slug].astro`
  - `src/components/TableOfContents.astro`
  - `src/components/CodeBlock.astro`
  - `src/components/PostMeta.astro` — date + reading + tags row
  - `src/components/Prose.astro` — wrap article body với typography styles
  - `src/components/TranslationLink.astro`
  - `src/lib/translations.ts` — `getTranslation()` helper
  - `src/scripts/toc-scroll-spy.ts` — minimal IntersectionObserver
  - `src/scripts/copy-code.ts` — clipboard button handler
- Modify:
  - `astro.config.mjs` — Shiki config + rehype plugins
  - `src/styles/typography.css` — prose styles (article body)

## Implementation Steps

1. Cài plugins: `npm i rehype-slug rehype-autolink-headings`.
2. Update `astro.config.mjs`: markdown + mdx config với rehype plugins, Shiki dual-theme.
3. Thêm CSS rules cho Shiki dual-theme dùng `[data-theme]`.
4. Viết `src/components/Prose.astro` — class wrapper với typography rules (link underline accent, blockquote left-bar, list spacing, h2/h3 sizes serif).
5. Viết `src/lib/translations.ts` với `getTranslation(post, targetLang)`.
6. Viết `src/components/TranslationLink.astro` — link sang post tương ứng hoặc disabled state.
7. Viết `src/components/PostMeta.astro` — date (mono), reading time, tag chips.
8. Viết `src/components/TableOfContents.astro`:
   - Accept `headings: MarkdownHeading[]`
   - Filter `depth <= 3`
   - Render `<ol>` với nested cho h3
   - Inline script `toc-scroll-spy.ts` highlight current section
9. Viết `src/components/CodeBlock.astro` (nếu dùng custom rehype) OR setup remark plugin transform `<pre>` → figure wrapper với filename + copy button inline script.
10. Viết `src/layouts/PostLayout.astro`:
    - BaseLayout wrap
    - Header có Title + PostMeta + TranslationLink
    - Grid 2 col desktop: `[main 680px][toc 240px]`
    - Single col mobile, TOC inside `<details>`
11. Viết `src/pages/[lang]/posts/[slug].astro`:
    - `getStaticPaths` enumerate posts cho cả 2 lang
    - Filter drafts
    - Render `<Content components={{ pre: CodeBlock }} />` hoặc dùng rehype-transformed output
12. Sample posts thêm code block + headings + footnotes để test.
13. Visual check cả 2 theme, mobile + desktop.

## Success Criteria

- [ ] Post page render với title + meta + body
- [ ] Code block có filename label + copy button (click → clipboard)
- [ ] Shiki theme swap đồng bộ data-theme (light/dark)
- [ ] TOC xuất hiện cho post dài, sticky desktop
- [ ] Scroll-spy highlight section đang xem
- [ ] Heading có anchor link, click copy URL with hash
- [ ] Footnotes render với back-link
- [ ] TranslationLink link đúng hoặc disabled khi không có
- [ ] Reading time + word count chính xác
- [ ] Mobile: TOC collapse, content readable, font size ổn
- [ ] Lighthouse Performance ≥95 trên post page

## Risk Assessment

- **Risk:** Shiki dual-theme CSS approach phức tạp với Astro v5. Mitigation: Astro v5 hỗ trợ `defaultColor: false` native; nếu fail dùng 2 codeblocks `<div data-theme="dark">...</div>` switch.
- **Risk:** Custom rehype plugin để wrap codeblock có thể conflict với Shiki. Mitigation: dùng built-in Astro hooks hoặc lib có sẵn `astro-expressive-code` (cân nhắc trade-off bundle size).
- **Risk:** TOC scroll-spy janky trên long posts. Mitigation: IntersectionObserver `rootMargin` tuned, throttle nếu cần.
- **Risk:** TranslationLink lookup mỗi build chậm. Mitigation: prebuild map `translationKey → {vi, en}` 1 lần.
