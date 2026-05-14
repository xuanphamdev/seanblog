---
phase: 11
title: Cloudflare deploy
status: completed
priority: P1
effort: 2h
dependencies:
  - 10
---

# Phase 11: Cloudflare deploy

## Overview

Push repo lên GitHub, connect Cloudflare Pages, configure build, custom domain (nếu đã có), set production env, verify SSL + redirects + 404 + RSS + OG + search trên production. Document workflow viết-push-live.

## Requirements

- Functional:
  - GitHub repo public hoặc private (user chọn).
  - Cloudflare Pages project connected to repo, auto-deploy `main` branch.
  - Build command: `npm run build` (đã include `astro build && pagefind`).
  - Build output dir: `dist`.
  - Production URL accessible HTTPS.
  - Custom domain wired (placeholder cho khi user mua).
  - `_redirects` rules active (`/` → `/vi/`).
  - 404 fallback to `/404.html`.
  - All features verified live: RSS, OG, Search, View transitions.
- Non-functional:
  - Build < 90s trên Cloudflare runner.
  - Deploy preview cho mỗi PR (default Cloudflare behavior).
  - SSL cert auto issued.
  - Cache headers reasonable (Cloudflare defaults OK cho Phase 1).

## Architecture

**Build setup:**
- Cloudflare Pages → Connect to GitHub repo
- Build command: `npm run build`
- Build output: `dist`
- Node version: 20 (env var `NODE_VERSION=20`)

**Domain:**
- Phase 1: dùng `*.pages.dev` subdomain (free)
- Khi mua domain → add custom domain trong CF dashboard, DNS CNAME to `*.pages.dev`

**Redirects file (`public/_redirects`):**
```
/  /vi/  302
```

**Optional Cloudflare Function** cho `Accept-Language` detection (defer — Phase 2 enhancement).

## Related Code Files

- Create:
  - `.github/workflows/build-check.yml` — optional: CI build check on PR (chạy `astro check` + `astro build` trước khi Cloudflare build)
  - `.nvmrc` — `20`
  - `wrangler.toml` — minimal (optional, chỉ cần nếu dùng CF Functions)
- Modify:
  - `README.md` — deploy + workflow section
  - `package.json` — verify scripts: `dev`, `build`, `preview`, `astro check`

## Implementation Steps

1. Cleanup repo: ensure `.gitignore` exclude `node_modules`, `dist`, `.astro`, `.DS_Store`, `pagefind` (build artifact).
2. Final `npm run build` local → verify `dist/` complete.
3. Push to GitHub:
   - Create repo (`seandev-blog` hoặc tên user chọn)
   - `git remote add origin ...`
   - `git push -u origin main`
4. Cloudflare Pages setup:
   - Dashboard → Pages → Create project → Connect to Git
   - Select repo, branch `main`
   - Build command: `npm run build`
   - Output: `dist`
   - Env vars: `NODE_VERSION=20`
   - Save and deploy
5. Wait first deploy, get `*.pages.dev` URL.
6. Production smoke test:
   - Home `/` → redirect `/vi/`
   - `/vi/` and `/en/` render
   - Click một post → view transition smooth
   - Theme toggle persist
   - Search Cmd+K work
   - RSS `/rss-vi.xml`, `/rss-en.xml` valid
   - OG image: view source post page, fetch og:image URL → PNG renders
   - 404: visit `/nonexistent` → 404 page
   - Tag pages work
7. Optional CI check (.github/workflows): on PR, run `astro check && npm run build` để bắt lỗi sớm.
8. Document workflow trong README:
   ```
   # Viết bài mới
   1. Tạo file: src/content/posts/{vi,en}/YYYY-MM-DD-slug.md
   2. Frontmatter: title, date, tags, summary, draft, translationKey
   3. git add . && git commit -m "post: {slug}"
   4. git push → Cloudflare auto-build (~60s) → live
   ```
9. Custom domain (khi sẵn sàng): CF dashboard → add domain → update DNS.

## Success Criteria

- [ ] Repo trên GitHub
- [ ] Cloudflare Pages project deploy thành công
- [ ] `*.pages.dev` URL accessible HTTPS
- [ ] Home redirect `/` → `/vi/`
- [ ] All Phase 1 features verified live
- [ ] Build time < 90s
- [ ] Lighthouse production scores match local
- [ ] README có workflow guide rõ ràng
- [ ] Push commit mới → auto-deploy trong < 2 phút

## Risk Assessment

- **Risk:** Cloudflare build fail vì native deps (Sharp, resvg-js). Mitigation: Cloudflare Pages support Node native modules; nếu lỗi → cache install hoặc switch sang Edge-compatible alts.
- **Risk:** Build timeout (default 20 min) nếu posts quá nhiều. Mitigation: Phase 1 không vấn đề; nếu scale lớn sau này tối ưu OG cache.
- **Risk:** SSL provisioning delay khi add custom domain. Mitigation: Cloudflare thường issue < 5 phút; nếu lâu hơn check DNS propagation.
- **Risk:** `_redirects` syntax sai làm loop. Mitigation: test kĩ trên preview deploy trước khi merge main.
- **Risk:** Secrets leak (nếu thêm env vars). Mitigation: Phase 1 không có secrets; document policy trong README.

## Workflow Verification

Sau deploy thành công, demonstrate end-to-end:
1. Viết post mới `src/content/posts/vi/test-post.md`
2. `git add . && git commit -m "post: test" && git push`
3. Watch Cloudflare build log
4. Visit live URL, post xuất hiện
