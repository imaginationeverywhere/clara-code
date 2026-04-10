# Claude Code Port Management System

## Overview
The Claude Code Port Management System provides intelligent port allocation and conflict resolution for shared EC2 backend deployments. This system ensures that multiple projects can coexist on the same EC2 instance without port conflicts.

## Features
- **Automatic Port Discovery**: Scans live ports on EC2 instance
- **Intelligent Allocation**: Automatically assigns available ports
- **Conflict Prevention**: Checks for conflicts before allocation
- **Centralized Registry**: Maintains port allocations across projects
- **Live Monitoring**: Real-time port usage analysis

## Usage

### Port Management Script
The port management script is located at `.claude/port-management.sh` and provides the following commands:

```bash
# Scan current port usage on EC2
./.claude/port-management.sh scan

# Show current port registry
./.claude/port-management.sh show

# Initialize port registry (run once)
./.claude/port-management.sh init

# Allocate ports for a project
./.claude/port-management.sh allocate <project_key> <project_name> <prod_domain> <staging_domain>

# Check for port conflicts
./.claude/port-management.sh check <prod_port> <staging_port>
```

### Integration with Setup Command
The `setup-project-api-deployment` command automatically uses the port management system to:

1. **Phase 2**: Display current port usage and registry
2. **Phase 3**: Automatically allocate ports for the new project
3. Verify no conflicts exist
4. Update the centralized port registry

### Port Registry Structure
The system maintains a JSON registry at `/home/ec2-user/.claude-port-registry.json` on the EC2 instance:

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-07-11T05:21:00.000Z",
    "ec2Instance": "[EC2_HOST_IP]",
    "portRange": { "min": 3030, "max": 3100 }
  },
  "allocations": {
    "projectkey": {
      "projectName": "Project Name",
      "productionPort": 3033,
      "stagingPort": 3034,
      "productionDomain": "api.example.com",
      "stagingDomain": "api-dev.example.com",
      "dateAllocated": "2025-07-11T05:21:00.000Z",
      "status": "active"
    }
  },
  "reservedPorts": {
    "3030": "System reserved"
  },
  "nextAvailable": {
    "production": 3035,
    "staging": 3036
  }
}
```

## Port Allocation Strategy

### Default Port Range
- **Range**: 3030-3100
- **Reserved**: 3030 (system)
- **Available**: 3031-3100

### Allocation Pattern
- **Production ports**: Even numbers (3032, 3034, 3036...)
- **Staging ports**: Odd numbers (3033, 3035, 3037...)
- **Sequential allocation**: Next available ports are assigned automatically

### Conflict Resolution
1. **Live Scan**: Checks actual port usage via `netstat`
2. **Registry Check**: Verifies against stored allocations
3. **Auto-increment**: Finds next available port if conflict exists
4. **Validation**: Confirms allocation before proceeding

## Sample Output

### Port Scan Output
```bash
=== LIVE PORT SCAN ===

🔍 Active applications on backend ports:
  Port 3033: node (PID: 12345)
  Port 3034: node (PID: 12346)

🔍 PM2 processes and their ports:
┌─────┬──────────────────────┬─────────┬─────────┬───────────┐
│ id  │ name                 │ version │ mode    │ status    │
├─────┼──────────────────────┼─────────┼─────────┼───────────┤
│ 2   │ [PROJECT_KEY]-backend │ 1.0.0   │ cluster │ online    │
└─────┴──────────────────────┴─────────┴─────────┴───────────┘

🔍 Nginx configurations and proxy ports:
  api.[PROJECT_DOMAIN] → ports: 3033
  api-dev.[PROJECT_DOMAIN] → ports: 3034

🔍 Available ports in range 3030-3050:
  Port 3035: AVAILABLE
  Port 3036: AVAILABLE
  Port 3037: AVAILABLE
```

### Registry Display
```bash
=== PORT REGISTRY ===

📋 Project Allocations:
  [PROJECT_KEY]: [PROJECT_NAME] (Prod: 3033, Staging: 3034)
  [OTHER_PROJECT]: [OTHER_PROJECT_NAME] (Prod: upstream, Staging: upstream)

🔒 Reserved Ports:
  Port 3030: System reserved
  Port 3031: Available (previously reserved)

🆆 Next Available Ports:
  Production: 3035, Staging: 3036
```

## Best Practices

### For Developers
1. **Always use the setup command**: Don't manually assign ports
2. **Check the registry first**: Run `show` command before making changes
3. **Verify allocations**: Use the `check` command to confirm no conflicts
4. **Update documentation**: Keep project documentation with allocated ports

### For System Administrators
1. **Regular monitoring**: Periodically run `scan` to check for drift
2. **Registry backup**: Backup the port registry file regularly
3. **Conflict resolution**: Address any discrepancies between live usage and registry
4. **Port range expansion**: Increase range if approaching capacity

## Troubleshooting

### Common Issues

**Port conflicts detected**
```bash
# Check what's using the conflicted port
./.claude/port-management.sh scan

# Re-run allocation to get new ports
./.claude/port-management.sh allocate myproject "My Project" api.example.com api-dev.example.com
```

**Registry out of sync**
```bash
# Re-scan live ports and compare with registry
./.claude/port-management.sh scan
./.claude/port-management.sh show

# Manually update registry if needed
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP] "vi /home/ec2-user/.claude-port-registry.json"
```

**Script permissions**
```bash
# Make script executable
chmod +x ./.claude/port-management.sh
```

### Manual Registry Updates
If you need to manually update the registry:

```bash
# Connect to EC2
ssh -i ~/.ssh/deploy_key ec2-user@[EC2_HOST_IP]

# Edit the registry file
vi /home/ec2-user/.claude-port-registry.json

# Verify JSON syntax
cat /home/ec2-user/.claude-port-registry.json | jq .
```

## Security Considerations
- **SSH Key Access**: Port management requires SSH access to EC2
- **Registry Permissions**: Only ec2-user can modify the registry
- **Audit Trail**: All allocations are timestamped
- **Conflict Prevention**: Multiple checks prevent accidental overwrites

## Future Enhancements
- **Web Interface**: GUI for port management
- **Automatic Cleanup**: Remove allocations for deleted projects
- **Monitoring Integration**: Alerts for port conflicts
- **Multi-Instance Support**: Manage ports across multiple EC2 instances