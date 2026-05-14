---
phase: 2
title: Design system and tokens
status: completed
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 2: Design system and tokens

## Overview

Lập design tokens (color, typography, spacing, motion) bằng CSS custom properties với `oklch()`. Self-host fonts. Tạo `tokens.css`, `typography.css`, `global.css`. Setup dark mode bằng `data-theme` attribute + system-aware fallback + no-flash init.

## Requirements

- Functional:
  - Tokens dark/light cùng tên biến, override qua `[data-theme="dark"]` / `[data-theme="light"]`.
  - System preference detection on first load.
  - Persist theme choice via `localStorage`.
  - Inline init script trong `<head>` chạy trước paint → không FOUC theme.
  - Fonts self-hosted (woff2), preload critical weight only.
  - Grain texture overlay subtle.
- Non-functional:
  - Total CSS gzipped < 30kb cho homepage.
  - Font load không block render (`font-display: swap`).
  - WCAG AA contrast cho cả 2 mode.

## Architecture

**Token layers:**
1. `tokens.css` — primitive (color scale, spacing scale, type scale, motion durations/easings).
2. `typography.css` — `@font-face` declarations + prose styles (cho post body).
3. `global.css` — resets + base element styles + grain overlay.

**Theme switching:**
- `<html data-theme="dark">` mặc định.
- Inline script trong `BaseLayout`: đọc `localStorage.theme || matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light'` → set `data-theme` trước khi `<body>` render.

**Token palette (dark default):**

```css
:root {
  /* primitives */
  --bg: oklch(14% 0.01 80);
  --bg-elevated: oklch(18% 0.01 80);
  --fg: oklch(92% 0.01 80);
  --fg-muted: oklch(65% 0.01 80);
  --border: oklch(28% 0.01 80);
  --accent: oklch(72% 0.14 200);
  --accent-soft: oklch(72% 0.14 200 / 0.15);
  /* type */
  --font-serif: "Fraunces", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  /* motion */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
[data-theme="light"] {
  --bg: oklch(98% 0.01 80);
  --bg-elevated: oklch(96% 0.01 80);
  --fg: oklch(20% 0.01 80);
  --fg-muted: oklch(45% 0.01 80);
  --border: oklch(88% 0.01 80);
  --accent: oklch(55% 0.14 220);
  --accent-soft: oklch(55% 0.14 220 / 0.1);
}
```

**Fonts:** Fraunces (variable, 1 file `.woff2`), Inter (variable), JetBrains Mono (regular + bold).

## Related Code Files

- Create:
  - `src/styles/tokens.css`
  - `src/styles/typography.css`
  - `src/styles/global.css`
  - `public/fonts/Fraunces.var.woff2`
  - `public/fonts/Inter.var.woff2`
  - `public/fonts/JetBrainsMono-Regular.woff2`
  - `public/fonts/JetBrainsMono-Bold.woff2`
  - `public/grain.png` — 200x200 subtle grain tile
- Modify:
  - `astro.config.mjs` — Tailwind v4 `@theme` import from tokens nếu cần bridge
  - `src/pages/index.astro` — import global.css tạm để verify

## Implementation Steps

1. Download fonts: Fraunces variable, Inter variable, JetBrains Mono Regular + Bold (Google Fonts → woff2 subset latin + latin-ext, vietnamese subset).
2. Lưu vào `public/fonts/`.
3. Viết `tokens.css` với CSS custom properties (snippet trên).
4. Viết `typography.css`: `@font-face` declarations với `font-display: swap`, `unicode-range` cho vietnamese subset.
5. Viết `global.css`: reset cơ bản (box-sizing, margin), base element styles, grain overlay via `body::before { background-image: url(/grain.png); opacity: 0.03; mix-blend-mode: overlay; ... }`.
6. Bridge Tailwind v4 với tokens: trong `global.css` thêm `@theme inline { --color-bg: var(--bg); ... }` để utility classes `bg-bg`, `text-fg` v.v. work.
7. Thêm inline theme-init script vào layout (sẽ làm chính thức ở Phase 3, ở đây test trên `index.astro` tạm).
8. Test contrast cả 2 theme bằng DevTools accessibility panel.
9. Test font render với text VI có dấu đầy đủ.

## Success Criteria

- [ ] Toggle `data-theme` trong DevTools → cả 2 mode render đúng
- [ ] Reload page với dark mode preference → no white flash
- [ ] VI dấu render đẹp cả 3 font (Fraunces, Inter, JBM)
- [ ] Contrast pass WCAG AA cả dark + light
- [ ] Total fonts < 250kb (subset đúng)
- [ ] Grain overlay nhìn thấy subtle, không phân tâm

## Risk Assessment

- **Risk:** Fraunces VI subset có thể thiếu glyph (đ, ư, ơ). Mitigation: verify trên Google Fonts subset selector hoặc dùng `glyphhanger` để check.
- **Risk:** `oklch()` chưa support old browsers. Mitigation: target modern only (Astro builds for evergreen), acceptable trade-off.
- **Risk:** Tailwind v4 `@theme` syntax edge cases. Mitigation: theo official Tailwind v4 docs, không dùng arbitrary values nặng.
- **Risk:** Grain texture tăng paint cost mobile. Mitigation: dùng tile nhỏ 200x200, `will-change: auto`, không animate.
