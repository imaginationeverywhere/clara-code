# still - SSH Environment Access

Named after **William Still** (1821–1902) — chairman of the Philadelphia Vigilance Committee; he held the keys to the Underground Railroad network and opened doors so others could reach safety.

## Usage
```
/still connect qc1
/still connect ec2
/still install cursor --target qc1
/still verify --all
/still run "ls ~/projects" --target qc1
/still scp local-file.txt qc1:~/destination/
```

## Arguments
- `connect <target>` — Establish SSH connection to target (qc1, ec2)
- `install <tool> --target <target>` — Install a tool on remote machine
- `verify --all` — Check connectivity to all known environments
- `run "<command>" --target <target>` — Execute command on remote machine
- `scp <source> <dest>` — Transfer files between machines

## Targets
| Alias | Host | Notes |
|-------|------|-------|
| `qc1` | ayoungboy@100.113.53.80 (Tailscale) | Mac M4 Pro. SSH key: `~/.ssh/quik-cloud`. THE permanent machine. |
| `ec2` | ec2-user@44.223.40.209 | QCS2 (t3.large). Key from SSM: `/quik-nation/build-farm/ssh-key` |

## SSH Key Rules
- **QC1:** `ssh quik-cloud` (local SSH config). Key at `~/.ssh/quik-cloud`.
- **EC2:** ALWAYS fetch key from SSM — never use stale local .pem files:
  ```bash
  aws ssm get-parameter --name "/quik-nation/build-farm/ssh-key" --with-decryption \
    --query 'Parameter.Value' --output text --region us-east-1 > /tmp/build-farm-key.pem && chmod 600 /tmp/build-farm-key.pem
  ```

## What This Command Does
Opens doors to environments. Fetches SSH keys from AWS SSM, connects to machines, installs tools, transfers files. Every other agent depends on this one for remote access.

## Related Commands
- `/dispatch-agent` — Dispatch tasks to agents on remote machines
- `/robert` — Infrastructure provisioning
