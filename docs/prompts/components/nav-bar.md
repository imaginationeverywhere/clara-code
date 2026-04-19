# Nav bar component

## What it does

Implements a **responsive, accessible** navigation bar with RBAC-aware items and mobile menu.

## Default behavior

Keyboard navigation, focus rings, tenant branding slots.

## Customization options

`--rbac`, `--clerk` (ProfileWidget on authed layouts), `--design web`.

## Example queue command

`/queue-prompt --nav-bar "Add role-based Admin link + docs link"`

## Example pickup command

`/pickup-prompt --nav-bar`

## Output location

`frontend/components/layout` or design-system package.

## Agent ownership

**Frontend**.

## Related

- [footer.md](footer.md)
- [hero-section.md](hero-section.md)
