# Template: Nav Bar

## Role

**Primary:** Frontend (App Router layout components)

## Goal

Implement a **responsive, accessible** navigation bar with **RBAC-aware** visibility (e.g. guest vs member vs admin). Align with design tokens; no hardcoded hex.

## Requirements

- Keyboard navigation, focus ring, `aria-current` for active route
- Mobile: dialog/disclosure pattern for menu
- Slots: logo, primary links, secondary actions, **ProfileWidget** on authenticated layouts (see Clerk standard when `--clerk` stacked)
- Feature flags / role claims from Clerk `publicMetadata` — never trust client-only checks for authorization

## Acceptance

- [ ] Works at `sm`–`2xl` breakpoints
- [ ] Admin links only when `role === 'admin'` (server-verified for actual admin routes)
