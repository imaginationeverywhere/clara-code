# Template: Source control (Step 1)

## Role

**Primary:** DevOps / repo hygiene · **Secondary:** Compliance hooks

## Goal

Establish **Git hosting**, default branch rules, branch protection, and (where applicable) **CODEOWNERS** + required reviews so every Heru matches the Clara Code baseline.

## Default stack

- **GitHub** — org/repo layout, `main`/`develop`, protected `main`, PR required.

## Provider variants

Mention the provider in the task body: **GitHub** (default), **GitLab**, **Bitbucket**, or **Azure DevOps**. CI entry points differ; keep secrets in SSM, never in repo.

## Constraints

- Root of repo is the Heru root (no nested `.claude` sync confusion).
- Document clone URL + which PAT/SSH key pattern the team uses.

## Acceptance

- [ ] Remote origin documented
- [ ] Branch protection on default release branch
- [ ] `.gitignore` appropriate for Node/Next/Expo
