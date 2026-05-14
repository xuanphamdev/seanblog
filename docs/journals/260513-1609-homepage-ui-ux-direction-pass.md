# Homepage UI/UX Direction Pass

**Date**: 2026-05-13 16:09
**Severity**: Low
**Component**: Homepage + global blog UI
**Status**: Complete

## Context

User felt the previous frontend direction was not interesting enough. Rebuild of the whole project was not needed; the issue was mainly visual direction, hierarchy, and interaction polish.

## What Changed

- Rebuilt homepage around a "Terminal Field Notes" direction instead of a generic blog landing.
- Added stronger first viewport: status line, editorial hero, latest note panel, topic lanes, archive, and tag index.
- Fixed theme toggle behavior and added global back-to-top button earlier in this pass.
- Polished supporting components:
  - `PostCard` now behaves like a note stream with clearer action and focus states.
  - `TagCloud` now uses stable index chips with counts instead of variable font sizing.
  - `StatusLine` now uses a consistent terminal prompt.
- Fixed topic lane tag links to include canonical trailing slash.

## Verification

- `npm run check` passes: 0 errors, 0 warnings, 0 hints.
- `npm run build:fast` passes: 17 pages generated.
- Route smoke checks passed: `/`, `/vi/`, `/en/`, `/vi/tags/agents/`.
- Confirmed theme toggle and back-to-top hooks render in page output.
- Confirmed responsive/focus/reduced-motion CSS exists for the touched surfaces.

## Decisions

- Keep Astro component structure; no React/MUI patterns added.
- Avoid full project rebuild; make focused UI/UX pass.
- Keep homepage in one Astro page for now because it is under 200 lines and still cohesive.
- Keep supporting components small and reusable.

## Deferred

- No Playwright visual regression because repo has no Playwright dependency.
- No screenshots generated in this pass.
- No broader docs update needed unless this direction becomes a formal design system.

## Unresolved Questions

- None.
