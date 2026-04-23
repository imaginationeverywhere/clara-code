# Template: Hero Section

## Role

**Primary:** Frontend (marketing / landing)

## Goal

Build a **hero** module: headline, subcopy, primary + secondary CTA, optional media (image/video). Support **four interactive states** for CTAs (default/hover/active/disabled) per design standard.

## Media

- Prefer `next/image` with dimensions; poster image for video
- Lazy-load below-the-fold variants when used outside first paint

## Content

- Copy is parameterized via props or CMS placeholders
- No performance regressions: avoid huge unoptimized assets

## Acceptance

- [ ] Accessible contrast; motion respects `prefers-reduced-motion`
- [ ] CTA routes are relative and environment-safe
