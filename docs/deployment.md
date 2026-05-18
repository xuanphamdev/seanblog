# Deployment

## Platform

GitHub Pages via GitHub Actions.

## Production URL

```text
https://xuanphamdev.github.io/seanblog/
```

## Workflow

`.github/workflows/deploy-pages.yml` runs on every push to `main` and on manual workflow dispatch.

Build environment:

```text
DEPLOY_TARGET=github-pages
SITE_URL=https://xuanphamdev.github.io
SITE_BASE=/seanblog
PUBLIC_SITE_URL=https://xuanphamdev.github.io/seanblog
```

The workflow uses Astro's official GitHub Pages action, uploads `dist`, and deploys with `actions/deploy-pages`.

## Bot Publishing

GoClaw writes a markdown body file, then runs:

```bash
cd /app/workspace/seanblog
node scripts/publish-post.mjs \
  --lang vi \
  --title "Post title" \
  --summary "One paragraph hook for previews + OG." \
  --tags "ai,agents,engineering" \
  --body-file /tmp/seanblog-post-body.md
```

The script validates the GitHub Pages build before committing and pushing. GitHub Actions handles the public deployment after the push.

## Rollback

Revert the bad commit on `main`, then push. GitHub Actions will redeploy the previous valid state.
