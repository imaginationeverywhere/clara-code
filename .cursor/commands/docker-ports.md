# docker-ports

Manage Docker port allocation across all Quik Nation boilerplate projects with centralized registry, conflict detection, and automatic port assignment.

## Usage
```
docker-ports [action] [options]
```

## Aliases
- `ports`
- `port-manager`

## Actions

| Action | Description |
|--------|-------------|
| `scan` | Scan all docker-compose files and update registry |
| `check` | Check for port conflicts across all projects |
| `allocate <project>` | Allocate ports for a new project |
| `registry` | Display the centralized port registry |
| `status` | Show port usage for current project |
| `reserve <port> <project>` | Reserve a specific port for a project |
| `release <port>` | Release a reserved port |

## Options

| Option | Description |
|--------|-------------|
| `--all-dirs` | Scan all configured directories |
| `--project <name>` | Target specific project |
| `--service <type>` | Allocate for specific service (frontend, backend, postgres, redis) |
| `--json` | Output in JSON format |
| `--update-compose` | Update docker-compose.yml with new ports |

## Centralized Registry

The command uses a centralized registry at:
```
.claude/config/docker-port-registry.json
```

### Monitored Directories
- `/Volumes/X10-Pro/Native-Projects/clients`
- `/Volumes/X10-Pro/Native-Projects/Quik-Nation`
- `/Volumes/X10-Pro/Native-Projects/apps`
- `/Volumes/X10-Pro/Native-Projects/shared-ngrok`

### Port Ranges by Service Type
```
Service Type        | Port Range    | Description
--------------------|---------------|----------------------------------
frontend            | 3000-3098     | Next.js/React frontend apps (EVEN numbers)
backend             | 3001-3099     | Express/Node.js APIs (ODD numbers)
standalone          | 4000-4099     | Utility/conversion apps
postgres            | 5432-5450     | PostgreSQL databases
redis               | 6379-6399     | Redis cache instances
debug               | 9229-9250     | Node.js debug ports
mailhog             | 1025-1030     | MailHog SMTP
mailhogWeb          | 8025-8030     | MailHog web UI
pgadmin             | 5050-5060     | pgAdmin web UI
redisCommander      | 8081-8090     | Redis Commander
ngrok               | 4040-4050     | ngrok web UI
```

### Port Convention for Boilerplate Projects
**IMPORTANT:** All boilerplate projects follow this naming convention:
- **Frontend ports = EVEN numbers** (3000, 3002, 3004, 3026, 3028, etc.)
- **Backend ports = ODD numbers** (3001, 3003, 3005, 3025, 3027, etc.)

Example allocation pattern:
```
Project A: Frontend 3026, Backend 3025
Project B: Frontend 3028, Backend 3027
Project C: Frontend 3030, Backend 3029
```

## Examples

```bash
# Scan all projects and update registry
docker-ports scan --all-dirs

# Check for conflicts
docker-ports check

# Allocate ports for new project
docker-ports allocate my-new-project

# View current registry
docker-ports registry

# Reserve specific port
docker-ports reserve 3045 my-project

# Show ports for current project
docker-ports status
```

## Workflow: New Project Setup

1. **Scan existing allocations**
   ```
   docker-ports scan --all-dirs
   ```

2. **Allocate ports for new project**
   ```
   docker-ports allocate my-new-project
   ```

3. **Update docker-compose.yml**
   ```
   docker-ports allocate my-new-project --update-compose
   ```

4. **Verify no conflicts**
   ```
   docker-ports check
   ```

## Current Port Allocations (14 Projects)

| Project | Frontend | Backend | Postgres | Redis | Other |
|---------|----------|---------|----------|-------|-------|
| dreamihaircare | 3000 | 3001 | 5433 | 6380 | 5050, 8025, 8081 |
| ppsv-charities | 3028 | 3027 | - | - | - |
| pink-collar-contractors | 3030 | 3029 | 5434 | 6381 | - |
| empresss-eats | 3026 | 3025 | 5432 | 6379 | 9229 |
| quiknation | 3006,3008,3010,3020 | 3005 | 5434 | 6381 | 5050, 8081, 9230 |
| quikcarrental | 3024 | 3023 | - | - | - |
| quiksession | 3004 | 3003 | - | - | - |
| thegcode | - | 3011,3013 | - | - | - |
| site962 | 3962 | - | - | - | - |
| myvoyages | - | 8083 | - | - | - |
| stacksbabiee | 3032 | 3031 | 5435 | 6382 | - |
| quikaction | 3034 | 3033 | 5436 | 6383 | - |
| quiknation-convert-to-next-js | 4006 | 4005 | 5438 | 6390 | 4007, 8026, 9090 |
| shared-ngrok | - | - | - | - | 4040 |

## Next Available Ports
- **Frontend**: 3036 (even)
- **Backend**: 3035 (odd)
- **Standalone (4xxx)**: 4008
- **Postgres**: 5439
- **Redis**: 6384
- **Debug**: 9231

## Implementation

Uses the `docker-port-allocator` agent with the `docker-ports-standard` skill to:

1. Parse all docker-compose.yml files in monitored directories
2. Extract port mappings (host:container format)
3. Update centralized JSON registry
4. Detect and report port conflicts
5. Calculate next available ports per service type
6. Generate docker-compose port configurations
7. Integrate with deployment commands

## Agent Integration

Invokes: `docker-port-allocator`
Skill: `docker-ports-standard`

## Files Modified
- `.claude/config/docker-port-registry.json` - Central port registry
- `docker-compose.yml` - Updated when using `--update-compose`

## Requirements
- Docker installed
- Access to monitored directories
- Write access to `.claude/config/docker-port-registry.json`
