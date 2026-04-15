# Clara Code — Prompt library (discoverability)

This directory documents every **flag-backed** prompt type exposed by `/queue-prompt` and `/pickup-prompt`. Source templates live in `.claude/commands/prompts/` (and `setup/` for 8-step scaffolds).

**Sync:** These files are pushed to all Herus with `/sync-herus --standards`.

## Quick reference

| Param / alias | Category | Purpose | Doc |
|---------------|----------|---------|-----|
| `--source-control` | Setup | Repos, branch protection | [setup/source-control.md](setup/source-control.md) |
| `--github` | Setup | GitHub (alias) | [setup/source-control.md](setup/source-control.md) |
| `--gitlab` | Setup | GitLab | [setup/source-control.md](setup/source-control.md) |
| `--bitbucket` | Setup | Bitbucket | [setup/source-control.md](setup/source-control.md) |
| `--azure-devops` | Setup | Azure DevOps Git | [setup/source-control.md](setup/source-control.md) |
| `--frontend`, `--nextjs` | Setup | Next.js shell | [setup/frontend-nextjs.md](setup/frontend-nextjs.md) |
| `--vite` | Setup | Vite + React | [setup/frontend-vite.md](setup/frontend-vite.md) |
| `--angular` | Setup | Angular SPA | [setup/frontend-angular.md](setup/frontend-angular.md) |
| `--backend` | Setup | Express + Apollo + Sequelize | [setup/backend-node-express.md](setup/backend-node-express.md) |
| `--clerk` | Setup | Clerk auth | [setup/clerk.md](setup/clerk.md) |
| `--feedback-widget` | Setup + UI | Feedback SDK | [setup/feedback-widget.md](setup/feedback-widget.md) |
| `--react-native`, `--expo` | Setup | Expo / RN | [setup/react-native.md](setup/react-native.md) |
| `--electron` | Setup | Desktop | [setup/electron.md](setup/electron.md) |
| `--aws-deploy` | Setup | AWS deploy | [setup/aws-deploy.md](setup/aws-deploy.md) |
| `--gcp` | Setup | GCP deploy | [setup/gcp.md](setup/gcp.md) |
| `--azure` | Setup | Azure hosting | [setup/azure.md](setup/azure.md) |
| `--cloudflare` | Setup | CF Pages/Workers | [setup/cloudflare.md](setup/cloudflare.md) |
| `--privacy-policy` | Page | Legal page | [pages/privacy-policy.md](pages/privacy-policy.md) |
| `--tos` | Page | Legal page | [pages/tos.md](pages/tos.md) |
| `--about-us` | Page | Marketing | [pages/about-us.md](pages/about-us.md) |
| `--contact-us` | Page | Lead capture | [pages/contact-us.md](pages/contact-us.md) |
| `--nav-bar` | Component | Shell | [components/nav-bar.md](components/nav-bar.md) |
| `--hero-section` | Component | Marketing | [components/hero-section.md](components/hero-section.md) |
| `--footer` | Component | Shell | [components/footer.md](components/footer.md) |
| `--user-journey` | Architecture | Flows | [architecture/user-journey.md](architecture/user-journey.md) |
| `--rbac` | Architecture | Roles | [architecture/rbac.md](architecture/rbac.md) |

Standards flags (`--stripe`, `--graphql`, `--security`, …) are documented in `.claude/commands/pickup-prompt.md` and `.claude/standards/`.

## Common workflows

**Full SaaS scaffold (8-step):**

```text
/queue-prompt --source-control --frontend --backend --clerk --aws-deploy "Greenfield Heru — follow CORE-TECH-STACK"
```

**Marketing shell + legal:**

```text
/queue-prompt --nav-bar --footer --privacy-policy --tos --frontend --design web
```

**Mobile + push later:**

```text
/queue-prompt --react-native --clerk --mobile --push
```

## Related

- `.claude/commands/pickup-prompt.md` — execute queue
- `.claude/commands/queue-prompt.md` — add to queue (symmetric flags)
- `docs/standards/CORE-TECH-STACK.md` — stack baseline
