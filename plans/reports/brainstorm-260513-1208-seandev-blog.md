---
type: brainstorm
date: 2026-05-13
slug: seandev-blog
status: approved
---

# Seandev — Personal Tech Blog Design

## Problem Statement

Build personal tech blog. Constraints:
- Markdown-first, viết local, push-to-deploy. No CMS, no admin UI.
- Bilingual VI + EN.
- UX/UI đẹp, không template-feel.
- Tech blog identity (code-heavy content).

## Final Decision

| Decision | Choice |
|---|---|
| SSG | Astro 5 + Content Collections |
| Content | Markdown + MDX |
| Styling | Tailwind v4 + CSS custom properties |
| Code highlight | Shiki (built-in, dual-theme) |
| Search | Pagefind (static index) |
| i18n | Astro native (`/vi/`, `/en/`) |
| Images | `@astrojs/image` + Sharp |
| OG images | Satori (auto-gen per post) |
| Hosting | Cloudflare Pages |
| Domain | seandev (placeholder until registered) |
| Comments | None (Phase 1) |
| About page | Yes |

## Design Direction: Editorial Terminal

Hybrid editorial typography + terminal accents. References: Paul Graham essays × Fly.io × Stripe Press × Linear.

**Visual system:**
- Mode: Dark default `oklch(14% 0.01 80)` warm near-black; light toggle cream `oklch(98% 0.01 80)`.
- Accent: Single muted cyan `oklch(72% 0.14 200)` — link hover, inline code, accents only.
- Typography:
  - Headlines: Fraunces (serif, VI dấu support, character)
  - Body: Inter (sans, VI-friendly, readable)
  - Mono: JetBrains Mono (code, metadata, dates)
- Texture: ~3% grain overlay.
- Motion: View Transitions API, reduce-motion respected.
- Layout: Single column 680px max, generous whitespace, no sidebar clutter.

## Approaches Evaluated

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **Astro 5** | Zero JS default, MDX, content collections w/ Zod, native i18n, fast builds | Smaller ecosystem than Next | ✅ Chosen |
| Next.js + MDX | Mature, React ecosystem | Overkill, ships JS, more complex | Rejected |
| Hugo | Fastest builds, mature themes | Go template syntax khô, custom UI khó | Rejected |
| Eleventy | Simple, flexible | Few beautiful themes, more manual | Rejected |

| Design | Verdict |
|---|---|
| Editorial / Magazine | Reading comfort tốt, thiếu tech identity |
| Minimal / Swiss | Pro, nhưng không nổi bật |
| Dark Luxury / Terminal | Tech identity mạnh, có thể quá hacker |
| **Editorial Terminal (hybrid)** | ✅ Reading comfort + tech identity |

## Features (Phase 1)

- Dark/light toggle (system-aware default, persist localStorage)
- Auto TOC cho posts >800 từ (sticky desktop, collapse mobile)
- Reading time + word count
- Tag pages `/tags/[tag]`
- RSS feed riêng per language
- Static search (Cmd+K modal, fuzzy, Pagefind)
- Code copy button + filename label, dual-theme syntax highlight
- Auto OG image generation per post (Satori)
- Footnotes support
- Bilingual switcher per post (link nếu có translation, fallback về index)
- About page
- 404 page có personality
- View transitions giữa posts (subtle fade + slide)

## Content Workflow

```
src/content/posts/
├── vi/
│   └── YYYY-MM-DD-slug.md
└── en/
    └── YYYY-MM-DD-slug.md
```

Frontmatter (Zod-validated):
```yaml
---
title: Building agents the hard way
date: 2026-05-13
tags: [agents, claude, rust]
summary: One paragraph hook for previews + OG.
draft: false
translationKey: building-agents-2026-05  # optional, links VI↔EN
---
```

Workflow: viết local → `git push` → Cloudflare auto-build (~30s) → live.

## Architecture

```
seanblog/
├── astro.config.mjs              # i18n, integrations, MDX
├── src/
│   ├── content/
│   │   ├── config.ts             # Zod schema
│   │   └── posts/{vi,en}/
│   ├── layouts/
│   │   ├── BaseLayout.astro      # html shell, head, theme init
│   │   └── PostLayout.astro      # article wrapper, TOC, meta
│   ├── components/
│   │   ├── Header.astro
│   │   ├── ThemeToggle.astro
│   │   ├── LangSwitch.astro
│   │   ├── TableOfContents.astro
│   │   ├── SearchModal.astro
│   │   ├── CodeBlock.astro       # wraps Shiki w/ copy button
│   │   ├── PostCard.astro
│   │   └── Tag.astro
│   ├── pages/
│   │   ├── index.astro           # redirect to /vi/
│   │   ├── [lang]/
│   │   │   ├── index.astro       # post list
│   │   │   ├── posts/[slug].astro
│   │   │   ├── tags/index.astro
│   │   │   ├── tags/[tag].astro
│   │   │   └── about.astro
│   │   ├── rss-vi.xml.ts
│   │   └── rss-en.xml.ts
│   ├── styles/
│   │   ├── tokens.css            # design tokens (oklch)
│   │   ├── typography.css
│   │   └── global.css
│   └── lib/
│       ├── og-image.tsx          # Satori template
│       └── reading-time.ts
├── public/
│   ├── fonts/                    # Fraunces, Inter, JBM self-hosted
│   ├── favicon.svg
│   └── grain.png                 # texture overlay
└── pagefind/                     # generated at build
```

## Trade-offs

- Bilingual = 2x viết. Mitigation: schema cho `translationKey` optional, post có thể đơn ngữ.
- Fraunces font ~80kb. Mitigation: subset to needed weights, `font-display: swap`, preload chỉ 1 weight critical.
- Pagefind index build-time. Drafts không search được — OK vì drafts không deploy.
- Satori OG gen tăng build ~5s/post. Worth it cho social share.
- Astro learning curve ~1 buổi đọc docs cho ai chưa quen.

## Risks

| Risk | Mitigation |
|---|---|
| Font loading FOUT | Self-host, preload critical weight, `font-display: swap` |
| Bilingual sync drift | Optional `translationKey`, không ép buộc dịch song song |
| Cloudflare Pages build fail | `astro check` + build trong CI before push (optional later) |
| Search index bloat | Pagefind chunks per page, lazy-loaded |
| Dark/light flash on load | Inline theme-init script trong `<head>` before paint |

## Success Criteria

- Lighthouse: Performance 95+, Accessibility 100, SEO 100 trên homepage và post.
- LCP < 1.5s trên 4G.
- CLS < 0.05.
- Total JS shipped homepage: < 10kb (chỉ theme toggle + search trigger).
- Build time < 60s cho 50 posts.
- Lighthouse mobile + desktop pass.
- Dark/light toggle không flash.
- VI dấu render đẹp ở cả 3 font.

## Next Steps

1. Detailed implementation plan (phases): scaffold → content schema → layouts → components → i18n → search/RSS → OG image → deploy.
2. Domain registration (`seandev.*` — TLD chốt sau).
3. Phase 2 candidates (sau khi launch): comments (Giscus), analytics (Plausible), webmentions, newsletter.

## Unresolved Questions

- Domain TLD cụ thể? (`.dev`, `.com`, `.blog`, etc.)
- Default landing language khi vào `/` — VI hay EN? (Mặc định mình đề xuất detect `Accept-Language`, fallback VI)
- Có cần newsletter signup không? (Phase 2 chắc chắn, Phase 1 bỏ)
