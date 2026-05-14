---
phase: 3
title: Polish supporting components
status: completed
priority: P2
effort: 2h
dependencies:
  - 2
---

# Phase 3: Polish supporting components

## Overview

Bring supporting components into the same visual language after the homepage
concept is chosen.

## Requirements

- Functional: post archive, tags, and status line should reinforce the chosen
  direction.
- Non-functional: component changes must stay reusable across pages and should
  not break post/tag pages.

## Architecture

Small component-level edits only. Keep props stable. Do not introduce global
state or hydration.

## Related Code Files

- Modify: `src/components/PostCard.astro`
- Modify: `src/components/TagCloud.astro`
- Modify: `src/components/StatusLine.astro`
- Modify if needed: `src/styles/tokens.css`

## Implementation Steps

1. Adjust `PostCard` metadata rhythm so archive feels intentional.
2. Improve hover/focus states without relying on hover-only discoverability.
3. Make `TagCloud` less random if it conflicts with the new direction.
4. Tune `StatusLine` copy/spacing if it competes with the hero.
5. Confirm component line counts stay reasonable.

## Success Criteria

- [ ] Supporting components match homepage direction.
- [ ] Existing post and tag pages keep working.
- [ ] No console logs/debug statements introduced.
- [ ] No component grows beyond local size guidelines without reason.

## Risk Assessment

Risk: polishing components creates inconsistency on non-home pages.
Mitigation: test `/vi/`, `/en/`, tag index, and one post page.
