---
phase: 2
title: Redesign homepage concept
status: completed
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 2: Redesign homepage concept

## Overview

Replace the current generic hero/signal panel with a homepage concept that
feels like Sean's technical workspace.

## Requirements

- Functional: show identity, latest post, topic lanes, and archive path.
- Functional: latest post must be visible before archive list.
- Non-functional: no extra client framework, no image dependency required, no
  layout shift, no hidden content on mobile.

## Architecture

Primary implementation stays in `src/pages/[lang]/index.astro`. Use existing
data from `getPostsByLang`, `getAllTags`, `postUrl`, and `readingTime`.
Prefer semantic `section`, `article`, `aside`, `dl`, and regular anchors.

## Related Code Files

- Modify: `src/pages/[lang]/index.astro`
- Modify if copy needs stronger framing: `src/lib/site-config.ts`

## Implementation Steps

1. Reframe hero as `Terminal Field Notes` or `AI Systems Lab`.
2. Make the right column a useful latest-post module, not decorative squares.
3. Add topic lanes for `Rust`, `AI agents`, `systems`, and `notes` using real
   tag links when present.
4. Keep archive stream below the first viewport.
5. Preserve both VI and EN labels.
6. Keep button targets at least 44px high and visible focus states.
7. Avoid cards-inside-cards and decorative gradient blobs.

## Success Criteria

- [ ] First viewport shows latest post or a concrete reading path.
- [ ] Homepage has a unique visual signature.
- [ ] VI and EN pages render equivalent structures.
- [ ] No new dependencies.
- [ ] Homepage file remains near or under 200 lines, or is modularized.

## Risk Assessment

Risk: making the homepage too dense for mobile.
Mitigation: mobile-first stack: hero, latest note, topics, archive.
