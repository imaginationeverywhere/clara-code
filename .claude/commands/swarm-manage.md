# swarm-manage — Ephemeral Agent Swarm Infrastructure

**Agent:** Robert (Robert Smalls — commandeered a Confederate ship to freedom, 5-term Congressman)

Manage the ephemeral EC2 swarm that executes agent tasks. Provision instances, build AMIs, monitor costs, track free tier windows, and tear everything down when done.

## Usage
```
/swarm-manage --build-ami                    # Bake a new agent AMI (~5 min)
/swarm-manage --deploy-cdk                   # Deploy/update the durable CDK stack
/swarm-manage --launch fmo --agents 3        # Launch 3 agents for FMO
/swarm-manage --launch fmo --task-file tasks/prompts/PROMPT-FMO-A1.md
/swarm-manage --list                         # Show running swarm instances
/swarm-manage --terminate-all                # Emergency kill switch
/swarm-manage --reap                         # Kill overdue instances (3hr+)
/swarm-manage --cost-report                  # Monthly cost summary
/swarm-manage --free-tier-status             # Free tier hours remaining
```

## Arguments
- `--build-ami` — Bake a new agent AMI with latest tooling
- `--deploy-cdk` — Deploy or update the CDK durable stack
- `--launch <project>` — Launch ephemeral agents for a project
- `--agents <N>` — Number of parallel agents (default: 1, max: 5)
- `--task <prompt>` — Inline task prompt
- `--task-file <path>` — Path to task prompt markdown file
- `--list` — Show all running swarm instances
- `--terminate-all` — Emergency: kill all swarm instances
- `--reap` — Kill instances running longer than 3 hours
- `--cost-report` — Show cost breakdown by project
- `--free-tier-status` — Show remaining free tier hours

## What This Command Does

1. **Provisions** the CDK durable stack (VPC, IAM, ECS, EFS, SSM) or bakes the agent AMI
2. **Launches** ephemeral t3.micro instances with user-data bootstrap for a project
3. **Lists** running swarm instances, **reaps** overdue (3hr+), or **terminate-all** in emergencies
4. **Reports** cost by project and free tier status
5. **Coordinates** with Nikki (dispatch) and Elijah (AWS); instances self-terminate on completion

## Prerequisites
Before first launch:
1. CDK durable stack deployed (`--deploy-cdk`)
2. Agent AMI baked (`--build-ami`)
3. SSM parameters populated (automatic from CDK)
4. GitHub SSH key in SSM (`/quik-nation/build-farm/github-ssh-key`)

## Cost
- Per instance: $0.0104/hr (t3.micro)
- Per cycle (8 agents, 2hrs): ~$0.17
- Monthly budget: $5-15 (vs $90/month for static EC2s)

## Related Commands
- `/ship` — Full pipeline (Robert handles infrastructure)
- `/nikki` — Dispatch coordination (Nikki tells Robert what to provision)
- `/n8n-create-workflows` — Otis creates contracts before Robert provisions
