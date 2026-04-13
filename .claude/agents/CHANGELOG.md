# .claude/agents Changelog

## [Unreleased] - 2026-04-12

### Added
- **Clara Code / cultural roster (partial list)** — New agent definitions including `aaron-douglas`, `alonzo-herndon`, `annie-easley`, `annie-malone`, `barbara-proctor`, `biddy-mason`, `carruthers`, `claude-barnett`, `claudia`, `david-blackwell`, `dick-gregory`, `don-cornelius`, `ethel-payne`, `eunice-johnson`, `gil-scott-heron`, `james-armistead-lafayette`, `jerry-lawson`, `john-hope`, `matthew-henson`, `melvin-van-peebles`, `miles`, `moss-kendrix`, `motley`, `romare-bearden`, `roy-clay`, `skip-ellis`, `solomon-fuller`, `vince-cullers`, `wendell-scott` (files under `.claude/agents/`; many mirrored under `.cursor/agents/`).

### Previous — 2026-04-06

### Changed
- **All 115 agent personas updated** — Agent `.md` files refreshed with latest platform context, team assignments, and voice capabilities. Agents can now be loaded independently via `claude --agent=<file>` for dedicated per-agent sessions.

### Previous

- **Orchestration & Platform Agents (mirrored from .claude)** - cursor-orchestrator, dialogue-facilitator, platform-sync-manager, progress-tracker; cloudflare-ai-gateway and mvp-playground-generator in .claude only. See `.claude/agents/CHANGELOG.md` for full details.

- **domain-brainstormer.md** - Domain brainstorming agent
  - AI-powered domain name generation and validation
  - Business model analysis and domain selection guidance
  - Integration with domain registration workflows
  - Location: `.claude/agents/domain-brainstormer.md`

- **stripe-subscriptions-specialist.md** - Stripe subscriptions specialist agent
  - Subscription billing patterns and implementation guidance
  - Recurring payment workflows and subscription lifecycle management
  - Proration, upgrades, downgrades, and cancellation handling
  - Location: `.claude/agents/stripe-subscriptions-specialist.md`

### Changed
- **boilerplate-update-manager.md** - Enhanced boilerplate update management
  - Improved update detection and conflict resolution
  - Enhanced manifest tracking and version management
  - Better integration with update workflows
  - Location: `.claude/agents/boilerplate-update-manager.md`

- **stripe-connect-specialist.md** - Enhanced Stripe Connect patterns
  - Additional marketplace payment patterns
  - Improved multi-tenant payment workflows
  - Better integration with subscription billing
  - Location: `.claude/agents/stripe-connect-specialist.md`

- **Agent Documentation** - Updated agent documentation across all agents
  - Enhanced descriptions and usage patterns
  - Improved coordination workflows
  - Better integration examples

## [1.14.0] - 2025-10-17

### Added
- **chrome-mcp-agent.md** - Chrome DevTools Protocol integration for browser automation, performance profiling, and accessibility audits
- **playwright-mcp-agent.md** - Cross-browser testing agent supporting Chromium, Firefox, and WebKit with visual regression testing
- **browserstack-mcp-agent.md** - Real device cloud testing agent with 3000+ browser/device combinations

### Changed
- **jira-integration-manager.md** → **project-management-bridge.md** - Renamed and expanded to support multiple project management systems (JIRA, Linear, Asana, GitHub Projects)
  - Updated agent name in frontmatter
  - Expanded description to include all supported PM systems
  - Added multi-platform integration examples
  - Maintained backward compatibility with JIRA workflows

### Agent Count
- Total agents: 42 (40 existing + 2 new)
- Browser testing agents: 3 new
- Multi-PM support: 1 enhanced

## [1.13.1] - 2025-10-15

### Changed
- Updated agent metadata and descriptions for improved clarity

## [1.13.0] - 2025-10-14

### Changed
- Documentation improvements and agent description updates
