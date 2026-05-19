# Seandev

Personal tech blog — bilingual (VI + EN), markdown-first. Built with Astro 5, designed Editorial Terminal style, deployed to GitHub Pages.

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro 5](https://astro.build) + Content Collections + MDX |
| Styling | Tailwind v4 + CSS custom properties (oklch palette) |
| Code highlight | [Expressive Code](https://expressive-code.com) (dual theme via `data-theme`) |
| Static search | [Pagefind](https://pagefind.app) (`Cmd+K` modal) |
| OG images | [Satori](https://github.com/vercel/satori) + resvg, per-post auto-gen |
| RSS | `@astrojs/rss`, separate feeds per locale |
| i18n | Astro native (`/vi/`, `/en/`) |
| Hosting | GitHub Pages |
| Fonts | Self-hosted Fraunces, Inter, JetBrains Mono via `@fontsource` |

## Development

```bash
nvm use            # Node 20 (per .nvmrc)
npm install
npm run dev        # http://localhost:4321
npm run build      # astro build + pagefind index
npm run build:fast # astro build only (no pagefind)
npm run preview    # preview production build
npm run check      # astro check (TypeScript)
```

## Write a new post

1. Create file at `src/content/posts/{vi|en}/YYYY-MM-DD-slug.md`
2. Frontmatter:
   ```yaml
   ---
   title: "Post title"
   date: 2026-05-13
   tags: [tag1, tag2]
   summary: "One paragraph hook for previews + OG."
   draft: false
   translationKey: optional-shared-key-for-bilingual
   ---
   ```
3. Body in Markdown / MDX.
4. `git push` → GitHub Actions auto-builds (~60s) → live.

To link a VI post to its EN translation (or vice versa), set the **same** `translationKey` on both. The TranslationLink in the post header will auto-link them.

## Publish from OpenClaw / Telegram bot

The bot can publish with one command after it drafts the article body:

```bash
cd /app/workspace/seanblog
node scripts/publish-post.mjs \
  --lang vi \
  --title "Post title" \
  --summary "One paragraph hook for previews + OG." \
  --tags "ai,agents,engineering" \
  --body-file /tmp/seanblog-post-body.md
```

The script pulls latest `main`, writes the post, runs `npm run check` and
`npm run build` with the GitHub Pages base path, commits, pushes, then prints
the public URL. The GoClaw skill prompt lives at
`openclaw/skills/seanblog-publisher/SKILL.md`.

## Project structure

```
src/
├── content.config.ts            # Zod schemas
├── content/
│   ├── posts/{vi,en}/           # markdown posts
│   └── pages/{vi,en}/           # static pages (about)
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ThemeToggle.astro
│   ├── LangSwitch.astro
│   ├── PostCard.astro           # editorial row
│   ├── PostMeta.astro
│   ├── TableOfContents.astro
│   ├── TagCloud.astro           # tag galaxy
│   ├── StatusLine.astro         # terminal "now"
│   ├── SearchModal.astro        # Cmd+K modal
│   └── TranslationLink.astro
├── pages/
│   ├── index.astro              # redirects to /vi/
│   ├── [lang]/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── posts/[slug].astro
│   │   └── tags/{index,[tag]}.astro
│   ├── og/[lang]/[slug].png.ts  # OG image generator
│   ├── rss-vi.xml.ts
│   └── rss-en.xml.ts
├── lib/
│   ├── site-config.ts           # tagline, hero copy, "now" status
│   ├── posts.ts                 # getPostsByLang, slug helpers
│   ├── tags.ts                  # tag aggregation
│   ├── translations.ts          # bilingual lookup
│   └── reading-time.ts
└── styles/
    ├── tokens.css               # oklch palette, type scale, motion
    ├── typography.css           # prose + heading anchors + section counters
    └── global.css               # reset + grain overlay + magazine grid
```

## GitHub Pages deploy

**One-time setup:**

1. Push this repo to GitHub.
2. In GitHub → repo **Settings** → **Pages** → **Build and deployment**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`. `.github/workflows/deploy-pages.yml` builds and deploys.

Production URL:

```text
https://blog.reidev.life/
```

Default GitHub Pages URL:

```text
https://xuanphamdev.github.io/seanblog/
```

**Subsequent deploys:** every `git push` to `main` auto-deploys.

**Workflow:**

```bash
# Add a new post
$EDITOR src/content/posts/vi/2026-05-15-new-thing.md
git add src/content/posts/vi/2026-05-15-new-thing.md
git commit -m "post: new thing"
git push
# wait for GitHub Actions → live
```

## Customizing "now" status

Edit `src/lib/site-config.ts` — the `now` and `hero` exports control the homepage status line and hero copy.

```ts
export const now = {
  current: {
    vi: "viết blog Seandev và build AI agents",
    en: "writing Seandev and building AI agents",
  },
};
```

## License

MIT — feel free to fork.
