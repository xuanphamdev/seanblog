# Search Command K Fix

**Date**: 2026-05-13 16:27
**Severity**: Medium
**Component**: Search modal + Pagefind indexing
**Status**: Complete

## Context

`Cmd+K` search was reported as not working. Search lived inside `SearchModal.astro` as an inline controller while the site uses Astro view transitions and persisted header/modal surfaces.

## Root Cause

- Search controller held DOM references from its first script run instead of resolving current DOM when opened.
- Trigger click only matched the button itself, not child elements like the visible `kbd`.
- Shortcut detection only used `event.key`, with no `event.code` fallback.
- Pagefind search filtered by `lang`, but generated index had `0 filters`, so results could be empty even when the modal opened.

## Fix

- Moved search behavior into `src/scripts/search-modal-controller.js`.
- Added singleton delegated controller with `Cmd/Ctrl+K`, `/`, Escape, backdrop close, trigger click, and input navigation.
- Added `data-pagefind-filter="lang:{lang}"` to the root layout so Pagefind builds language filters.
- Added visible fallback message when running dev without a generated Pagefind index.

## Verification

- `npm run check` passes: 0 errors, 0 warnings, 0 hints.
- `npm run build` passes, including Pagefind.
- Pagefind now indexes 2 filters.
- `/vi/` returns 200 from local dev server.

## Unresolved Questions

- None.
