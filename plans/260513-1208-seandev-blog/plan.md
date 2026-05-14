---
title: Seandev blog implementation
description: >-
  Personal bilingual tech blog with Editorial Terminal design. Astro 5 + MDX,
  Cloudflare Pages, markdown-first workflow.
status: completed
priority: P2
branch: ''
tags:
  - astro
  - blog
  - bilingual
  - cloudflare
blockedBy: []
blocks: []
created: '2026-05-13T05:15:19.394Z'
createdBy: 'ck:plan'
source: skill
---

# Seandev blog implementation

## Overview

Personal tech blog "Seandev". Greenfield project. Stack: Astro 5 + Content Collections + MDX, Tailwind v4, Shiki, Pagefind, Astro native i18n (VI+EN), Satori for OG, Cloudflare Pages.

Design: "Editorial Terminal" — Fraunces serif headlines + Inter body + JetBrains Mono code; dark default + light toggle; muted cyan accent; grain texture; View Transitions.

Markdown-first workflow: write local → `git push` → Cloudflare auto-deploy. No CMS, no comments (Phase 1).

Reference: [brainstorm report](../reports/brainstorm-260513-1208-seandev-blog.md)

## Success Metrics

- Lighthouse Performance 95+, Accessibility 100, SEO 100 on home + post
- LCP < 1.5s on 4G, CLS < 0.05
- Total JS shipped homepage < 10kb
- Build < 60s for 50 posts
- Dark/light toggle no flash
- VI dấu renders correctly on all 3 fonts

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scaffold and content schema](./phase-01-scaffold-and-content-schema.md) | Completed |
| 2 | [Design system and tokens](./phase-02-design-system-and-tokens.md) | Completed |
| 3 | [Base layout and core components](./phase-03-base-layout-and-core-components.md) | Completed |
| 4 | [i18n routing and index pages](./phase-04-i18n-routing-and-index-pages.md) | Completed |
| 5 | [Post rendering with TOC and code blocks](./phase-05-post-rendering-with-toc-and-code-blocks.md) | Completed |
| 6 | [Tag system](./phase-06-tag-system.md) | Completed |
| 7 | [Static search with Pagefind](./phase-07-static-search-with-pagefind.md) | Completed |
| 8 | [Feeds and OG image generation](./phase-08-feeds-and-og-image-generation.md) | Completed |
| 9 | [About and 404 pages](./phase-09-about-and-404-pages.md) | Completed |
| 10 | [View transitions and polish](./phase-10-view-transitions-and-polish.md) | Completed |
| 11 | [Cloudflare deploy](./phase-11-cloudflare-deploy.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
