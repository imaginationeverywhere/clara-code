# Clara Code — `/pickup-prompt` template library

Canonical prompt templates for **setup (8-step)**, **page**, **component**, and **architecture** builds. Each file is loaded when the matching `--flag` is passed to `/pickup-prompt`; the template is **prepended** to the queued prompt (same pattern as `.claude/standards/*.md`).

## Usage

```text
/pickup-prompt --source-control --frontend --backend --clerk --aws-deploy
/pickup-prompt --privacy-policy --frontend --clerk
/pickup-prompt 05-feature.md --hero-section --frontend
```

Stack or standards flags can be combined; **setup** and **prompt-type** flags define *what* to build, standards flags define *how* it must comply.

## Setup templates (8-step)

| Flag / alias | Template |
|--------------|----------|
| `--source-control`, `--github`, `--gitlab`, `--bitbucket`, `--azure-devops` | `setup/source-control.md` |
| `--frontend`, `--nextjs` | `setup/frontend-nextjs.md` |
| `--vite` | `setup/frontend-vite.md` |
| `--angular` | `setup/frontend-angular.md` |
| `--backend` | `setup/backend-node-express.md` |
| `--clerk` | `setup/clerk.md` + `.claude/standards/clerk-auth.md` |
| `--react-native`, `--expo` | `setup/react-native.md` |
| `--electron` | `setup/electron.md` |
| `--aws-deploy` | `setup/aws-deploy.md` |
| `--gcp` | `setup/gcp.md` |
| `--azure` | `setup/azure.md` |
| `--cloudflare` | `setup/cloudflare.md` |
| `--migrate-amplify-to-cf` | `setup/migrate-amplify-to-cf.md` + command doc `migrate-amplify-to-cf.md` |
| `--bedrock` | `setup/bedrock.md` + command doc `setup-bedrock.md` |

## Page / component / architecture templates

| Flag | Template |
|------|-----------|
| `--privacy-policy` | `privacy-policy.md` |
| `--tos` | `tos.md` |
| `--about-us` | `about-us.md` |
| `--contact-us` | `contact-us.md` |
| `--nav-bar` | `nav-bar.md` |
| `--hero-section` | `hero-section.md` |
| `--footer` | `footer.md` |
| `--feedback-widget` | `feedback-widget.md` |
| `--user-journey` | `user-journey.md` |
| `--rbac` | `rbac.md` |

## Rules

- Every template assumes **tenant isolation** where data is persisted (`tenant_id` on business tables).
- Hermes/runtime implementation details stay server-side; templates stay **IP-safe** for Voice Coders and Herus.
- Rollout: sync commands to Herus with `/sync-herus --commands` after boilerplate changes; sync **prompt docs** with `/sync-herus --standards`.
