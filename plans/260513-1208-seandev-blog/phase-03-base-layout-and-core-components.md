---
phase: 3
title: Base layout and core components
status: completed
priority: P1
effort: 3h
dependencies:
  - 2
---

# Phase 3: Base layout and core components

## Overview

Build `BaseLayout.astro` (HTML shell, head meta, theme init, font preload, sitewide nav). Build core components: `Header`, `Footer`, `ThemeToggle`, `LangSwitch`. Toggle theme + language switch hoạt động được nhưng route i18n thực thi ở Phase 4.

## Requirements

- Functional:
  - `BaseLayout` accept props: `title`, `description`, `lang`, `ogImage` (optional).
  - Head có meta OG, Twitter, canonical, RSS link tags.
  - Inline theme-init script chạy trước paint.
  - Header sticky-top (hoặc static — chốt static để tiết kiệm JS), logo "seandev" link về `/[lang]/`, nav links.
  - `ThemeToggle` button toggle `data-theme` + persist `localStorage`.
  - `LangSwitch` show 2 link `vi/en`, highlight current.
  - Footer minimal: copyright + RSS link + GitHub link.
- Non-functional:
  - ThemeToggle = tiny inline script, KHÔNG dùng React/framework component.
  - Layout zero hydration cost (Astro static).
  - Accessibility: skip-link, focus rings visible, ARIA labels cho toggles.

## Architecture

`BaseLayout.astro` props interface:
```ts
interface Props {
  title: string;
  description: string;
  lang: "vi" | "en";
  ogImage?: string;
  noIndex?: boolean;
}
```

Head order tối quan trọng:
1. charset, viewport
2. theme-init script (inline, async OK nhưng cần execute trước style)
3. `<link rel="preload">` cho critical font (Fraunces or Inter regular)
4. `<link rel="stylesheet">` tokens + global
5. meta title/desc/OG/Twitter
6. canonical + alternate (cho i18n hreflang)
7. RSS feed links

ThemeToggle = `<button>` với inline `<script>` (vanilla JS, ~300 bytes). Không cần framework.

LangSwitch logic: lấy current path, swap `/vi/` ↔ `/en/`, nếu không có translation thì fallback về `/[targetLang]/`.

## Related Code Files

- Create:
  - `src/layouts/BaseLayout.astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `src/components/ThemeToggle.astro`
  - `src/components/LangSwitch.astro`
  - `src/components/SkipLink.astro`
  - `src/lib/site-config.ts` — sitewide constants (title, description, author, base url, social)
- Modify:
  - `src/pages/index.astro` — wrap with BaseLayout để test

## Implementation Steps

1. Tạo `src/lib/site-config.ts`:
   ```ts
   export const site = {
     title: "Seandev",
     description: { vi: "...", en: "..." },
     author: "Sean",
     url: "https://seandev.example", // placeholder
     github: "https://github.com/...",
     defaultLang: "vi",
     locales: ["vi", "en"] as const,
   };
   ```
2. Viết `BaseLayout.astro`:
   - Slot main content
   - Head với meta đầy đủ (title, description, OG image fallback, Twitter card, canonical, alternate hreflang vi/en, RSS link x2)
   - Inline theme-init script (set `data-theme` từ localStorage hoặc system preference)
   - Preload critical font
   - Include Header + Footer + SkipLink + grain overlay div
3. Viết `Header.astro`:
   - Container 680px max + horizontal padding consistent
   - Logo "seandev." link `/[lang]/`
   - Nav: Posts, Tags, About
   - Right side: SearchTrigger (placeholder cho Phase 7), LangSwitch, ThemeToggle
4. Viết `Footer.astro`:
   - Copyright + year
   - RSS links (vi/en)
   - GitHub link
   - "Built with Astro" footer line (optional)
5. Viết `ThemeToggle.astro`:
   - `<button aria-label>` với icon sun/moon (inline SVG)
   - `<script>` toggle `data-theme`, update `localStorage`, dispatch event để components khác có thể react
6. Viết `LangSwitch.astro`:
   - Lấy `Astro.url.pathname`, parse current lang
   - Render 2 link với swap logic, highlight active
7. Viết `SkipLink.astro`: link `#main-content` visible khi focus
8. Update `index.astro` tạm dùng BaseLayout để smoke test.
9. Verify: keyboard nav (Tab) → skip link xuất hiện. Toggle theme persist reload. Toggle lang swap path.

## Success Criteria

- [ ] BaseLayout render với meta + canonical đầy đủ
- [ ] Theme toggle click → instant swap, persist reload
- [ ] Lang switch link đúng `/vi/` ↔ `/en/`
- [ ] Skip link visible khi focus đầu tiên qua Tab
- [ ] ARIA labels có trên toggle buttons
- [ ] Total JS shipped homepage < 2kb (chỉ theme toggle)
- [ ] Lighthouse Accessibility 100 trên homepage

## Risk Assessment

- **Risk:** Theme init script chạy sau paint → FOUC. Mitigation: đặt script TRƯỚC stylesheet `<link>`, dùng synchronous script.
- **Risk:** Lang switch break khi không có translation phía bên kia. Mitigation: Phase 4 sẽ handle bằng `translationKey` lookup; phase này chỉ swap path.
- **Risk:** Header sticky tăng layout shift. Mitigation: chốt static header (không sticky) cho Phase 1.
