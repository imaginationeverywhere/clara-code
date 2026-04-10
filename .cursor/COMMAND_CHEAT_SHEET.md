# Command Cheat Sheet — Top 40 Commands by Workflow

Quick reference for the most-used commands. Run `/commands` for the full interactive navigator.

---

## Planning
| Command | What It Does |
|---------|-------------|
| `/plan-design` | Business + technical planning (4 agents) |
| `/add-feature` | Scaffold new Auset Platform feature |
| `/spec-workflow` | Full specification-driven workflow |
| `/brainstorm-domains` | Domain name ideation |

## Building
| Command | What It Does |
|---------|-------------|
| `/backend-dev` | Backend development (6 agents: Express, GraphQL, DB, TS) |
| `/frontend-dev` | Frontend development (7 agents: Next.js, UI, state) |
| `/integrations` | Third-party services (Stripe, Clerk, Twilio, GA4) |
| `/vibe-build` | Build feature from natural language |
| `/convert-design` | Mockup/screenshot to Next.js code |

## Debugging
| Command | What It Does |
|---------|-------------|
| `/debug-fix` | Smart debugging (routes to right agent by error type) |
| `/vibe-fix` | Fix bug from natural language description |
| `/restore-functionality` | Recover lost/overwritten features |
| `/browser-debug` | Debug UI in Chrome browser |

## Testing
| Command | What It Does |
|---------|-------------|
| `/test-automation` | Full test suite (unit, E2E, cross-browser) |
| `/vibe-test` | Generate tests from description |
| `/validate-graphql` | GraphQL schema validation (like tsc --noEmit) |

## Status & Progress
| Command | What It Does |
|---------|-------------|
| `/progress` | Quick platform dashboard (2-5 sec, plan-based) |
| `/gap-analysis` | Deep analysis (code + git + plans, 15-90 sec) |
| `/project-mvp-status` | Project-level MVP tracking |
| `/project-status` | Post-MVP milestone tracking |
| `/auset-status` | Feature activation status |

## Deploying
| Command | What It Does |
|---------|-------------|
| `/deploy-ops` | Full deployment workflow (3 agents) |
| `/quick-deploy` | Fast deployment shortcut |
| `/amplify-deploy-production` | Frontend to AWS Amplify (prod) |
| `/verify-deployment-setup` | Check deployment config |

## Git & PRs
| Command | What It Does |
|---------|-------------|
| `/git-commit-docs` | Stage, document, commit |
| `/create-pr` | Create formatted pull request |
| `/merge-to-develop` | Merge PRs to develop |
| `/merge-to-main` | Merge PRs to main (production) |
| `/review-code` | Code review |

## Documentation
| Command | What It Does |
|---------|-------------|
| `/generate-docs` | Auto-generate from code |
| `/create-feature-docs` | Feature documentation |
| `/organize-docs` | Validate and clean up docs |

## Auset Platform
| Command | What It Does |
|---------|-------------|
| `/auset-activate` | Activate a dormant feature |
| `/auset-status` | Feature registry status |
| `/add-feature` | Scaffold new feature module |
| `/progress` | Progress against micro plans |
| `/gap-analysis` | Deep gap analysis against plans |

## Document/Media Generation
| Command | What It Does |
|---------|-------------|
| `/create-presentation` | PowerPoint (PPTX) |
| `/create-pdf` | PDF documents |
| `/create-spreadsheet` | Excel (XLSX) |
| `/create-video` | Remotion video |
| `/image` | AI image generation |

## Conversation & Discovery
| Command | What It Does |
|---------|-------------|
| `/research` | Deep research before building (technology, API, architecture) |
| `/brainstorm` | Creative ideation sessions (features, names, strategy) |
| `/talk` | Reason through decisions (architecture, strategy, rubber duck) |
| `/teach` | Learn something in depth using YOUR codebase as examples |
| `/explore` | Discover what's possible (codebase, APIs, idea spaces) |

**Talk first. Command second. Build third.**

## Orchestration — Claude Plans, Cursor Builds
| Command | What It Does |
|---------|-------------|
| `/dispatch-cursor` | Send tasks to Cursor Agent CLI (saves Max plan messages) |
| `/dispatch-cursor --heru <name>` | Target a specific Heru project |
| `/dispatch-cursor --all-herus` | Dispatch same task to all 53 Herus |
| `/dispatch-cursor --plan` | Read-only analysis via Cursor (no changes) |

**Opus thinks. Cursor builds. Your Max plan lasts longer.**

## Platform Sync
| Command | What It Does |
|---------|-------------|
| `/sync-herus` | Push Auset changes to all 53 Heru projects at once |
| `/sync-herus --push` | Sync files AND git push to all remotes |
| `/update-boilerplate` | Pull updates from the boilerplate |
| `/sync-cursor` | Sync .claude to .cursor |

---

## Session Startup Auto-Suggest

Your session automatically detects context and suggests relevant commands based on:
- Current git branch and recent commits
- Recently modified files and directories
- Active epic/phase from micro plans
- Time since last deployment

---

*Run `/commands` for the full interactive navigator with all 145+ commands.*
*Run `/commands <category>` to jump to a specific category.*
