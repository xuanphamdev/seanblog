---
title: Seandev homepage UI UX direction pass
description: >-
  Focused UI/UX direction pass for Seandev homepage. Keep Astro/content
  architecture, replace generic Swiss bento feeling with a stronger technical
  field-notes or AI systems lab identity.
status: completed
priority: P2
branch: ''
tags:
  - astro
  - homepage
  - ui-ux
  - design-direction
blockedBy: []
blocks: []
created: '2026-05-13T08:45:25.321Z'
createdBy: 'ck:plan'
source: skill
---

# Seandev homepage UI UX direction pass

## Overview

Do not rebuild the project. The stack and content model are sound. This plan
improves the homepage first viewport, latest-post framing, supporting
components, and visual QA so the site feels more specific to Sean's technical
writing.

Target direction: "Terminal Field Notes" or "AI Systems Lab". The page should
quickly answer: what Sean writes, what to read now, and which topic lanes exist.

## Success Criteria

- Homepage first viewport feels distinct, not template-like.
- Latest post is visible and compelling before archive browsing.
- Dark/light themes remain readable and consistent.
- Mobile at 375px has no horizontal scroll or clipped text.
- `npm run check` and `npm run build:fast` pass.
- No framework rewrite, no new heavy client JS, no CMS or route changes.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Audit current UI and define direction](./phase-01-audit-current-ui-and-define-direction.md) | Completed |
| 2 | [Redesign homepage concept](./phase-02-redesign-homepage-concept.md) | Completed |
| 3 | [Polish supporting components](./phase-03-polish-supporting-components.md) | Completed |
| 4 | [Responsive accessibility and theme QA](./phase-04-responsive-accessibility-and-theme-qa.md) | Completed |
| 5 | [Documentation and handoff](./phase-05-documentation-and-handoff.md) | Completed |

## Dependencies

- Baseline completed plan: `../260513-1208-seandev-blog/plan.md`
- Main files likely touched:
  - `src/pages/[lang]/index.astro`
  - `src/components/PostCard.astro`
  - `src/components/TagCloud.astro`
  - `src/components/StatusLine.astro`
  - `src/lib/site-config.ts`
  - `src/styles/tokens.css`
