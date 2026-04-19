# Deployment Documentation

Documentation related to AWS Amplify, App Runner, EC2, GitHub Actions, OIDC, and mobile deployment.

## Contents

| File | Description |
|------|-------------|
| [AMPLIFY-DEPLOYMENT.md](./AMPLIFY-DEPLOYMENT.md) | AWS Amplify frontend deployment |
| [APP_RUNNER_DOCKER_DEPLOYMENT.md](./APP_RUNNER_DOCKER_DEPLOYMENT.md) | App Runner with Docker/ECR |
| [AWS-OIDC-GITHUB-ACTIONS.md](./AWS-OIDC-GITHUB-ACTIONS.md) | OIDC for GitHub Actions on AWS |
| [DYNAMIC-IP-DEPLOYMENT.md](./DYNAMIC-IP-DEPLOYMENT.md) | Deployments with dynamic IPs |
| [EC2-PM2-DEPLOYMENT-DEBUGGING.md](./EC2-PM2-DEPLOYMENT-DEBUGGING.md) | EC2, PM2, and debugging |
| [GITHUB-ACTIONS-SELF-HOSTED-RUNNERS.md](./GITHUB-ACTIONS-SELF-HOSTED-RUNNERS.md) | Self-hosted GitHub Actions runners |
| [GITHUB-WORKFLOWS-UPDATE-2026-02-10.md](./GITHUB-WORKFLOWS-UPDATE-2026-02-10.md) | GitHub workflows changelog notes |
| [MOBILE-DEPLOYMENT-EXPO.md](./MOBILE-DEPLOYMENT-EXPO.md) | Mobile deployment with Expo |
| [MOBILE-DEPLOYMENT-REACT-NATIVE-CLI.md](./MOBILE-DEPLOYMENT-REACT-NATIVE-CLI.md) | React Native CLI deployment |
| [MULTI-APP-EC2-DEPLOYMENT-SUMMARY.md](./MULTI-APP-EC2-DEPLOYMENT-SUMMARY.md) | Multi-app EC2 deployment summary |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Production go-live checklist |
| [QUIKNATION_DEPLOYMENT_GUIDE.md](./QUIKNATION_DEPLOYMENT_GUIDE.md) | Quik Nation deployment guide |
| [ECS Fargate platform](../../infrastructure/ecs-fargate-platform/README.md) | ECS Fargate migration checklist (shared ALB, host-based routing) |

**Heru CI/CD (copy into each repo):** root `heru-cicd/`, `.github/workflow-templates/`, and `scripts/setup-heru-cicd.sh`. OIDC role template: `scripts/aws/create-remaining-github-oidc-roles.sh`. See `.claude/CLAUDE.md` (Heru CI/CD templates).

Subdirectories: `develop-staging/` (environment-specific notes).
