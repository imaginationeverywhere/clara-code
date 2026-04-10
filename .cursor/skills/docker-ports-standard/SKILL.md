---
name: docker-ports-standard
description: Implement cross-project Docker port management with centralized registry, collision detection, automatic allocation, and docker-compose integration. Use when setting up new projects, resolving port conflicts, or managing multi-project development environments.
---

# Docker Ports Standard

Production-grade Docker port management patterns for Quik Nation boilerplate projects with centralized registry, multi-directory scanning, automatic port allocation, and conflict prevention.

## Skill Metadata

- **Name:** docker-ports-standard
- **Version:** 1.0.0
- **Category:** Infrastructure & DevOps
- **Source:** Quik Nation Multi-Project Environment
- **Related Skills:** docker-containerization-standard, aws-deployment-standard

## When to Use This Skill

Use this skill when:
- Setting up Docker ports for a new boilerplate project
- Resolving port conflicts between projects
- Scanning existing projects to update the port registry
- Allocating ports during project bootstrap
- Managing multi-frontend architectures (multiple Next.js apps)
- Coordinating development environment ports

## Core Patterns

### 1. Port Registry Schema

```json
{
  "$schema": "docker-port-registry-v1",
  "version": "1.0.0",
  "lastUpdated": "ISO-8601 timestamp",
  "description": "Centralized Docker port registry",

  "scanDirectories": [
    "/Volumes/X10-Pro/Native-Projects/clients",
    "/Volumes/X10-Pro/Native-Projects/Quik-Nation",
    "/Volumes/X10-Pro/Native-Projects/apps",
    "/Volumes/X10-Pro/Native-Projects/shared-ngrok"
  ],

  "portRanges": {
    "frontend": { "start": 3000, "end": 3099 },
    "backend": { "start": 3100, "end": 3199 },
    "postgres": { "start": 5432, "end": 5450 },
    "redis": { "start": 6379, "end": 6399 },
    "debug": { "start": 9229, "end": 9250 },
    "mailhog": { "start": 1025, "end": 1030 },
    "mailhogWeb": { "start": 8025, "end": 8030 },
    "pgadmin": { "start": 5050, "end": 5060 },
    "redisCommander": { "start": 8081, "end": 8090 },
    "ngrok": { "start": 4040, "end": 4050 }
  },

  "projects": {
    "project-name": {
      "directory": "/absolute/path/to/project",
      "status": "active|inactive|archived",
      "ports": {
        "frontend": 3000,
        "backend": 3001,
        "postgres": 5432,
        "redis": 6379
      }
    }
  },

  "allocatedPorts": {
    "frontend": [3000, 3001, 3002],
    "backend": [3100, 3101],
    "postgres": [5432, 5433],
    "redis": [6379, 6380]
  },

  "nextAvailable": {
    "frontend": 3003,
    "backend": 3102,
    "postgres": 5434,
    "redis": 6381
  }
}
```

### 2. Docker Compose Port Patterns

#### Standard Project (Frontend + Backend)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "${FRONTEND_PORT:-3030}:3000"  # External:Internal
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT:-3029}
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "${BACKEND_PORT:-3029}:3001"   # External:Internal
      - "${DEBUG_PORT:-9231}:9229"      # Debug port
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://user:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    ports:
      - "${POSTGRES_PORT:-5437}:5432"  # External:Internal
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6384}:6379"     # External:Internal
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Multi-Frontend Project (Multiple Next.js Apps)

```yaml
# docker-compose.yml for multi-frontend architecture
version: '3.8'

services:
  frontend-main:
    build:
      context: ./frontend-main
    ports:
      - "${FRONTEND_MAIN_PORT:-3006}:3000"
    environment:
      - NEXT_PUBLIC_APP_TYPE=main

  frontend-admin:
    build:
      context: ./frontend-admin
    ports:
      - "${FRONTEND_ADMIN_PORT:-3010}:3000"
    environment:
      - NEXT_PUBLIC_APP_TYPE=admin

  frontend-investors:
    build:
      context: ./frontend-investors
    ports:
      - "${FRONTEND_INVESTORS_PORT:-3008}:3000"
    environment:
      - NEXT_PUBLIC_APP_TYPE=investors

  frontend-stripe:
    build:
      context: ./frontend-stripe
    ports:
      - "${FRONTEND_STRIPE_PORT:-3020}:3000"
    environment:
      - NEXT_PUBLIC_APP_TYPE=stripe

  backend:
    build:
      context: ./backend
    ports:
      - "${BACKEND_PORT:-3005}:3001"
      - "${DEBUG_PORT:-9230}:9229"
```

### 3. Port Allocation Algorithm

```typescript
interface PortRange {
  start: number;
  end: number;
}

interface PortRegistry {
  portRanges: Record<string, PortRange>;
  allocatedPorts: Record<string, number[]>;
  nextAvailable: Record<string, number>;
}

function allocatePort(
  registry: PortRegistry,
  serviceType: string
): number {
  const range = registry.portRanges[serviceType];
  const allocated = registry.allocatedPorts[serviceType] || [];

  // Find next available port in range
  for (let port = range.start; port <= range.end; port++) {
    if (!allocated.includes(port)) {
      // Update registry
      registry.allocatedPorts[serviceType] = [...allocated, port];
      registry.nextAvailable[serviceType] = port + 1;
      return port;
    }
  }

  throw new Error(`No available ports in ${serviceType} range`);
}

function allocateProjectPorts(
  registry: PortRegistry,
  projectName: string,
  services: string[] = ['frontend', 'backend', 'postgres', 'redis']
): Record<string, number> {
  const allocation: Record<string, number> = {};

  for (const service of services) {
    allocation[service] = allocatePort(registry, service);
  }

  return allocation;
}
```

### 4. Conflict Detection

```typescript
interface PortConflict {
  port: number;
  projects: string[];
  serviceType: string;
}

function detectConflicts(
  registry: PortRegistry
): PortConflict[] {
  const conflicts: PortConflict[] = [];
  const portUsage: Map<number, { project: string; service: string }[]> = new Map();

  // Build port usage map
  for (const [projectName, project] of Object.entries(registry.projects)) {
    for (const [service, port] of Object.entries(project.ports)) {
      if (!portUsage.has(port)) {
        portUsage.set(port, []);
      }
      portUsage.get(port)!.push({ project: projectName, service });
    }
  }

  // Find conflicts
  for (const [port, users] of portUsage) {
    if (users.length > 1) {
      conflicts.push({
        port,
        projects: users.map(u => u.project),
        serviceType: users[0].service
      });
    }
  }

  return conflicts;
}
```

### 5. Docker Compose Scanner

```typescript
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

interface ServicePorts {
  service: string;
  hostPort: number;
  containerPort: number;
}

function parseDockerCompose(filePath: string): ServicePorts[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const compose = yaml.parse(content);
  const ports: ServicePorts[] = [];

  for (const [serviceName, service] of Object.entries(compose.services || {})) {
    const servicePorts = (service as any).ports || [];

    for (const portMapping of servicePorts) {
      // Handle format "3000:3000" or "${PORT:-3000}:3000"
      const [hostPart, containerPart] = portMapping.toString().split(':');

      // Extract numeric port from possible env var syntax
      const hostPort = extractPort(hostPart);
      const containerPort = parseInt(containerPart, 10);

      if (hostPort && containerPort) {
        ports.push({
          service: serviceName,
          hostPort,
          containerPort
        });
      }
    }
  }

  return ports;
}

function extractPort(portString: string): number | null {
  // Handle "${VAR:-default}" syntax
  const envVarMatch = portString.match(/\$\{[^:]+:-(\d+)\}/);
  if (envVarMatch) {
    return parseInt(envVarMatch[1], 10);
  }

  // Handle plain number
  const port = parseInt(portString, 10);
  return isNaN(port) ? null : port;
}

function scanDirectory(baseDir: string): Map<string, ServicePorts[]> {
  const results = new Map<string, ServicePorts[]>();

  // Find all docker-compose.yml files
  const composeFiles = findFiles(baseDir, 'docker-compose.yml');

  for (const file of composeFiles) {
    const projectDir = path.dirname(file);
    const projectName = path.basename(projectDir);

    try {
      const ports = parseDockerCompose(file);
      results.set(projectName, ports);
    } catch (error) {
      console.warn(`Failed to parse ${file}: ${error}`);
    }
  }

  return results;
}
```

### 6. Environment Variable Template

```bash
# .env.ports - Port configuration for docker-compose
# Generated by docker-ports allocate command

# Frontend
FRONTEND_PORT=3040

# Backend
BACKEND_PORT=3035
DEBUG_PORT=9231

# Database
POSTGRES_PORT=5437

# Cache
REDIS_PORT=6384

# Development Tools
PGADMIN_PORT=5051
REDIS_COMMANDER_PORT=8082
MAILHOG_SMTP_PORT=1026
MAILHOG_WEB_PORT=8026
```

### 7. Integration with Bootstrap

```typescript
// During bootstrap-project command

async function bootstrapPortAllocation(
  projectName: string,
  projectDir: string,
  config: BootstrapConfig
): Promise<void> {
  // 1. Load registry
  const registryPath = path.join(
    __dirname,
    '../.claude/config/docker-port-registry.json'
  );
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  // 2. Determine required services
  const services = [];
  if (config.hasFrontend) services.push('frontend');
  if (config.hasBackend) services.push('backend');
  if (config.hasDatabase) services.push('postgres');
  if (config.hasRedis) services.push('redis');

  // 3. Allocate ports
  const allocation = allocateProjectPorts(registry, projectName, services);

  // 4. Add to registry
  registry.projects[projectName] = {
    directory: projectDir,
    status: 'active',
    ports: allocation
  };

  // 5. Save registry
  registry.lastUpdated = new Date().toISOString();
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

  // 6. Generate .env.ports
  const envContent = generateEnvPorts(allocation);
  fs.writeFileSync(path.join(projectDir, '.env.ports'), envContent);

  // 7. Update docker-compose.yml
  updateDockerCompose(projectDir, allocation);
}
```

## Port Mapping Conventions

### Service Type Detection

| Container Port | Service Type | Common Service Names |
|---------------|--------------|---------------------|
| 3000 | frontend | frontend, web, nextjs, react |
| 3001 | backend | backend, api, server, express |
| 5432 | postgres | postgres, postgresql, db, database |
| 6379 | redis | redis, cache |
| 9229 | debug | (debug port in backend) |
| 1025 | mailhog | mailhog (SMTP) |
| 8025 | mailhogWeb | mailhog (Web UI) |
| 5050 | pgadmin | pgadmin |
| 8081 | redisCommander | redis-commander |
| 4040 | ngrok | ngrok |

### Naming Conventions

```yaml
# Standard service naming
services:
  frontend:      # Next.js app
  backend:       # Express API
  postgres:      # PostgreSQL database
  redis:         # Redis cache
  pgadmin:       # Database admin UI
  redis-commander: # Redis admin UI
  mailhog:       # Email testing
  ngrok:         # Tunnel service
```

## Command Reference

### Scan All Projects
```bash
docker-ports scan --all-dirs
```

### Allocate for New Project
```bash
docker-ports allocate my-new-project
docker-ports allocate my-new-project --update-compose
```

### Check for Conflicts
```bash
docker-ports check
```

### View Registry
```bash
docker-ports registry
docker-ports registry --json
```

### Reserve Specific Port
```bash
docker-ports reserve 3050 my-project
```

### Release Port
```bash
docker-ports release 3050
```

## Best Practices

1. **Always run scan before allocating** - Ensures registry is up to date
2. **Use environment variables** - Makes ports configurable in docker-compose
3. **Document port assignments** - Keep .env.ports in project root
4. **Check conflicts before starting containers** - Prevents runtime errors
5. **Use standard port ranges** - Makes troubleshooting easier
6. **Reserve ports for planned projects** - Prevents future conflicts

## Error Handling

### Port Already Allocated
```
Error: Port 3030 is already allocated to 'pink-collar-contractors'
Suggested alternative: 3040
```

### Range Exhausted
```
Error: No available ports in frontend range (3000-3099)
Action: Expand range in registry or archive unused projects
```

### Conflict Detected
```
Warning: Port conflict detected
Port 5434 is used by:
  - quiknation (postgres)
  - pink-collar-contractors (postgres)
Resolution: Update one project to use port 5437
```

## Registry Location

```
/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/config/docker-port-registry.json
```

## Related Documentation

- **Command:** `.claude/commands/docker-ports.md`
- **Agent:** `.claude/agents/docker-port-manager.md`
- **Docker Skill:** `.claude/skills/docker-containerization-standard/SKILL.md`
- **AWS Deployment:** `.claude/skills/aws-deployment-standard/SKILL.md`
