---
phase: 1
title: Scaffold and content schema
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Scaffold and content schema

## Overview

Initialize Astro 5 project with MDX, Tailwind v4, integrations. Define type-safe content collections schema for posts (VI + EN). Add sample posts để Phase tiếp theo có data thật để render.

## Requirements

- Functional:
  - Astro 5 project khởi tạo thành công, `npm run dev` chạy được.
  - MDX integration hoạt động.
  - Tailwind v4 wired up.
  - Content collections schema validate frontmatter VI + EN posts.
  - 2 sample posts (1 VI, 1 EN) để có content render.
- Non-functional:
  - Node 20+ compatible.
  - Strict TypeScript.
  - `.gitignore` chuẩn (node_modules, dist, .astro, .DS_Store).

## Architecture

Sử dụng `npm create astro@latest` với minimal template + TypeScript strict. Integrations: `@astrojs/mdx`, `@astrojs/sitemap`, `@tailwindcss/vite` (Tailwind v4 dùng Vite plugin chứ không phải PostCSS).

Content collection `posts` định nghĩa schema chung dùng Zod, file source split theo `src/content/posts/vi/` và `src/content/posts/en/`. Trường `lang` derive từ path, không cần khai báo trong frontmatter.

```
schema = z.object({
  title: z.string(),
  date: z.date(),
  tags: z.array(z.string()).default([]),
  summary: z.string(),
  draft: z.boolean().default(false),
  translationKey: z.string().optional(),
})
```

## Related Code Files

- Create:
  - `package.json` — dependencies + scripts
  - `astro.config.mjs` — integrations, MDX, sitemap, Tailwind Vite plugin
  - `tsconfig.json` — strict TS
  - `src/content/config.ts` — Zod schema
  - `src/content/posts/vi/2026-05-13-hello-seandev.md` — sample VI post
  - `src/content/posts/en/2026-05-13-hello-seandev.md` — sample EN post
  - `src/pages/index.astro` — placeholder root
  - `.gitignore`
  - `README.md` — short usage guide
- Modify: (none, greenfield)
- Delete: (none)

## Implementation Steps

1. `npm create astro@latest .` — chọn minimal, TypeScript strict, no git init (project chưa có git).
2. Cài integrations: `npx astro add mdx sitemap` (auto cập nhật `astro.config.mjs`).
3. Cài Tailwind v4: `npm install tailwindcss @tailwindcss/vite`, wire `@tailwindcss/vite` vào `vite.plugins` trong `astro.config.mjs`.
4. Tạo `src/content/config.ts` với Zod schema cho collection `posts`. Khai báo loader đọc cả 2 thư mục `vi/` và `en/`.
5. Tạo 2 sample posts (`vi/`, `en/`) với frontmatter đầy đủ + body markdown ngắn để test render sau.
6. Tạo `src/pages/index.astro` tạm thời chỉ list slug + title từ collection (sẽ thay ở Phase 4).
7. Setup `.gitignore` + `README.md` ngắn gọn.
8. Init git: `git init`, first commit.
9. Verify: `npm run dev` mở localhost không error; `npm run build` thành công.

## Success Criteria

- [ ] `npm run dev` chạy không error
- [ ] `npm run build` produces `dist/` không error
- [ ] Sample posts được Zod validate (sai frontmatter sẽ throw)
- [ ] TypeScript strict mode bật, không có `any` implicit
- [ ] Git repo initialized với first commit
- [ ] README có hướng dẫn `dev/build/preview` cơ bản

## Risk Assessment

- **Risk:** Tailwind v4 syntax khác v3 (CSS-first config, `@theme` block). Mitigation: theo official docs v4, không copy snippet v3.
- **Risk:** Astro content collections API thay đổi giữa v4 và v5. Mitigation: dùng `defineCollection` + `loader` API mới của v5.
- **Risk:** MDX + Tailwind v4 conflict trong build. Mitigation: smoke test build sớm với 1 sample MDX post.
