# Add to Project — Dynamic Requirements Management

**Version:** 1.0.0
**Category:** Project Management
**Stage:** Any (MVP or Post-MVP)

---

## Purpose

Add custom requirements to a Heru project that `/project-mvp-status` and `/project-status` will track. Projects evolve — clients add requirements mid-sprint (CRM integrations, mobile apps, custom features). This command captures those requirements so status commands report the full picture.

## Usage

```bash
# Add a new requirement
/add-to-project "GHL CRM integration — contacts, pipeline, calendar sync"

# Add with options
/add-to-project "Push notifications for orders" --priority P1 --category feature
/add-to-project "Mobile app — 8 screens" --priority P0 --category mobile

# List all custom requirements
/add-to-project --list

# Update status of a requirement
/add-to-project --update CR-001 --status completed

# Remove a requirement
/add-to-project --remove CR-003
```

## Arguments

- `<description>` — The requirement description (required for new)
- `--priority` — P0 (blocker), P1 (high), P2 (medium), P3 (low). Default: P1
- `--category` — integration, feature, mobile, infrastructure, design, testing. Default: feature
- `--list` — Show all custom requirements with status
- `--update <id>` — Update an existing requirement's status
- `--status` — Set status: not-started, in-progress, completed
- `--remove <id>` — Remove a requirement

## File Location

Requirements are stored in `docs/project-requirements.json` at the Heru root.

## Schema

```json
{
  "heruName": "world-cup-ready",
  "lastUpdated": "2026-04-01T20:30:00Z",
  "standardChecklist": true,
  "customRequirements": [
    {
      "id": "CR-001",
      "title": "Short title",
      "description": "Full description of the requirement",
      "priority": "P1",
      "category": "integration",
      "status": "not-started | in-progress | completed",
      "addedDate": "2026-04-01",
      "addedBy": "Mo | team-name",
      "completedDate": null,
      "promptRef": "prompts/2026/April/01/1-not-started/file.md",
      "notes": "Optional notes"
    }
  ]
}
```

## How Status Commands Use This

### /project-mvp-status
1. Runs standard 52-item Auset checklist scan
2. Reads `docs/project-requirements.json` for custom requirements
3. Reports: "Standard: 48/52 | Custom: 3/5 | Total: 51/57 (89%)"
4. Custom requirements appear in their own section with priority flags

### /project-status (post-MVP)
1. Same as above but includes roadmap tracking
2. Custom requirements that are P0/P1 appear as blockers if incomplete

## Integration with Prompts Directory

When you add a requirement, the command suggests writing a prompt for it:
```
Added CR-002: Push Notifications (P2, feature)
→ Write a prompt? Suggested path: prompts/2026/April/01/1-not-started/XX-XX-granville-push-notifications.md
```

When a prompt for a custom requirement moves to `3-completed/`, the requirement status should be updated too.

## Examples

### WCR adds GHL CRM mid-sprint
```
/add-to-project "GHL CRM integration — contacts, pipeline, calendar, conversations" --priority P1 --category integration
```
Creates CR-001. `/project-mvp-status` now shows it as a tracked requirement.

### Client asks for mobile app
```
/add-to-project "Mobile app — 8 screens (browse, cart, checkout, orders, profile, stamps, settings, feedback)" --priority P1 --category mobile
```

### View all requirements
```
/add-to-project --list

Custom Requirements for WCR:
  CR-001 ✅ GHL CRM Integration (P1, integration) — completed 2026-04-01
  CR-002 ⬜ Push Notifications (P2, feature) — not started
  CR-003 🔄 Mobile App — 8 screens (P1, mobile) — in progress
```

## Why This Matters

Projects aren't static. The Auset Standard gives us 52 baseline items every Heru must pass. But clients bring their own requirements — CRM systems, custom integrations, mobile apps, specific features. Without tracking these alongside the standard checklist, status reports are incomplete and agents don't know the full scope.

This command makes the full scope visible — to Mo, to the agents, and (via the Client Project Dashboard) to the client themselves.
