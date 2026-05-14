---
phase: 1
title: Audit current UI and define direction
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Audit current UI and define direction

## Overview

Audit the current homepage against the user's concern: clean but not
interesting. Decide the exact art direction before coding.

## Requirements

- Functional: identify first-viewport weaknesses, content hierarchy gaps, and
  component reuse limits.
- Non-functional: preserve Astro static output, bilingual routing, dark/light
  theme, and current content collections.

## Architecture

This phase is read-only. It reviews `src/pages/[lang]/index.astro`,
`PostCard.astro`, `TagCloud.astro`, `StatusLine.astro`, and design tokens.
Output is a short direction note in this plan or implementation notes.

## Related Code Files

- Read: `src/pages/[lang]/index.astro`
- Read: `src/components/PostCard.astro`
- Read: `src/components/TagCloud.astro`
- Read: `src/components/StatusLine.astro`
- Read: `src/lib/site-config.ts`
- Read: `src/styles/tokens.css`

## Implementation Steps

1. Capture current homepage structure and first-viewport content.
2. List what feels generic: signal panel, abstract hero, archive rhythm.
3. Choose one direction: `terminal-field-notes` or `ai-systems-lab`.
4. Define content priority: identity, latest post, topic lanes, archive.
5. Decide what not to change: framework, routes, content schemas, search.

## Success Criteria

- [ ] Direction selected with rationale.
- [ ] Scope excludes full rebuild.
- [ ] Files to modify are known.
- [ ] Risks are documented before implementation.

## Risk Assessment

Risk: over-designing a personal blog into a SaaS landing page.
Mitigation: keep content-first hierarchy and avoid marketing sections.
