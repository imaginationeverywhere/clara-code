# docker-logs

Tail Docker logs for containers related to the current project.

## Usage
```
docker-logs [container-name] [options]
```

## Aliases
- `logs`
- `docker-tail`

## Description
Stream real-time logs from Docker containers associated with the current project. Automatically filters to show only project-relevant containers.

## Options
- `--follow` or `-f` - Follow log output (default: true)
- `--tail [n]` - Number of lines to show from the end (default: 100)
- `--since [time]` - Show logs since timestamp (e.g., "2m", "1h")
- `--filter [pattern]` - Filter logs by pattern
- `--all` - Show logs from all project containers

## Examples
```bash
# Tail logs from all project containers
docker-logs

# Follow specific container logs
docker-logs frontend-app

# Show last 50 lines
docker-logs --tail 50

# Show logs from last 5 minutes
docker-logs --since 5m

# Filter for errors
docker-logs --filter "ERROR"
```

## Implementation
Uses the docker-port-manager agent to:
1. Identify project-specific containers
2. Stream logs with docker logs command
3. Apply filters and formatting
4. Handle multiple container log aggregation

## Requirements
- Docker must be running
- Containers must be active or recently stopped
- Proper permissions to access Docker logs