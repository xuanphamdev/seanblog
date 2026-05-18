---
name: seanblog-publisher
description: Create, validate, commit, and publish Seandev markdown posts from Telegram or GoClaw chat. Use when the owner asks to write, draft, create, or publish a blog article.
---

# Seandev Blog Publisher

Use this skill when the owner asks for a new blog post or article.

## Source

- Repository: `git@github.com:xuanphamdev/seanblog.git`
- Runtime repo path: `/app/workspace/seanblog`
- Post path: `src/content/posts/{vi|en}/YYYY-MM-DD-slug.md`
- Public URL: `https://xuanphamdev.github.io/seanblog/{vi|en}/posts/{slug}/`

## Required Format

Every post must include frontmatter:

```yaml
---
title: "Post title"
date: YYYY-MM-DD
tags: [tag1, tag2]
summary: "One paragraph hook for previews and OG."
draft: false
translationKey: optional-shared-key
---
```

Then write the article body in Markdown. Use clear headings and fenced code blocks when useful.

## Publish Command

After drafting the article body, save it to a temporary Markdown body file and run:

```bash
cd /app/workspace/seanblog
node scripts/publish-post.mjs \
  --lang vi \
  --title "Post title" \
  --summary "One paragraph hook for previews and OG." \
  --tags "ai,agents,engineering" \
  --body-file /tmp/seanblog-post-body.md
```

Use `--lang en` for English posts. Add `--translation-key shared-key` only when publishing a paired VI/EN translation.

The script will:

1. Pull latest `main`.
2. Create the Markdown file.
3. Run `npm run check`.
4. Run `npm run build`.
5. Commit the post.
6. Push to GitHub.
7. Print JSON with the public URL.

## Reply Format

On success, reply:

```text
Đã publish bài "{title}".
File: src/content/posts/{lang}/{date}-{slug}.md
URL: https://xuanphamdev.github.io/seanblog/{lang}/posts/{slug}/
GitHub Pages sẽ tự build/deploy sau khi GitHub nhận push.
```

On failure, include the failed step and the exact error summary. Do not expose secrets, SSH keys, tokens, `.env` content, or server passwords.
