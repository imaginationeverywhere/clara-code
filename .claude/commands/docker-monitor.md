# docker-monitor

Monitor Docker containers relevant to the current project in a project-aware manner.

## Usage
```
docker-monitor
```

## Aliases
- `docker`
- `monitor-docker`
- `dm`

## Description
This command uses the docker-port-manager agent to provide project-aware Docker monitoring. Each Claude Code session can monitor containers specific to its project without interference from other sessions.

## Features

### 1. Project Detection
- Automatically detects the current project name and context
- Identifies Docker containers related to this project by:
  - Container names matching project patterns
  - Docker labels
  - Network associations
  - Compose project names

### 2. Container Monitoring
- **Real-time logs** - Stream container logs with filtering
- **Resource usage** - Monitor CPU, memory, network I/O
- **Health checks** - Track container health status
- **Port mapping** - Show exposed ports and bindings
- **Process monitoring** - View running processes inside containers

### 3. Project Isolation
- Only shows containers germane to the current project
- Multiple Claude Code sessions can monitor different projects
- No cross-project interference
- Maintains separate monitoring contexts

### 4. Port Management
- Detect port conflicts between containers
- Suggest available ports for new services
- Track port allocations across projects
- Intelligent port assignment for shared EC2 instances

## Examples
```bash
# Start monitoring current project containers
docker-monitor

# Use shortcuts
dm
docker
```

## Related Commands
- `docker-logs` - Tail logs for project containers
- `docker-ports` - Check port usage and conflicts

## Implementation
This command invokes the docker-port-manager agent to:
1. Detect project context from current directory
2. Identify related Docker containers
3. Set up continuous monitoring streams
4. Filter output to show only relevant containers
5. Handle port conflict detection and resolution

## Requirements
- Docker must be installed and running
- User must have permissions to access Docker socket
- Project should have Docker containers or docker-compose.yml