---
name: docker-containerization-standard
description: Implement Docker containerization with multi-stage builds, BuildKit, and security hardening. Use when creating Dockerfiles, optimizing builds, or containerizing applications. Triggers on requests for Docker setup, container builds, Dockerfile creation, or Docker optimization.
---

# Docker Containerization Standard

Production-grade Docker containerization patterns from DreamiHairCare implementation with multi-stage builds, BuildKit optimization, security hardening, and development/production targets.

## Skill Metadata

- **Name:** docker-containerization-standard
- **Version:** 1.0.0
- **Category:** Infrastructure & DevOps
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** aws-deployment-standard, ci-cd-pipeline-standard

## When to Use This Skill

Use this skill when:
- Creating Docker images for Node.js/Express backends
- Implementing multi-stage builds for size optimization
- Setting up development containers with hot reload
- Creating production-optimized container images
- Implementing Docker security best practices
- Setting up docker-compose for local development

## Core Patterns

### 1. Multi-Stage Backend Dockerfile

```dockerfile
# backend/Dockerfile - Multi-stage build for Node.js backend

# ==============================================================================
# BASE STAGE - Common Node.js setup
# ==============================================================================
FROM node:20-alpine AS base
WORKDIR /app

# Install only essential dependencies
RUN apk add --no-cache libc6-compat

# ==============================================================================
# DEPENDENCIES STAGE - Install production dependencies
# ==============================================================================
FROM base AS deps

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# ==============================================================================
# BUILDER STAGE - Build TypeScript application
# ==============================================================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm for build
RUN npm install -g pnpm

# Build TypeScript to JavaScript
RUN pnpm build

# ==============================================================================
# PRODUCTION STAGE - Minimal production image
# ==============================================================================
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

# Copy only necessary files from builder
COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown nodeapp:nodejs /app/logs

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3001

# Set port via environment variable
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/index.js"]

# ==============================================================================
# DEVELOPMENT STAGE - Hot reload development environment
# ==============================================================================
FROM base AS development
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl python3 make g++

# Configure npm for better reliability
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set cache /root/.npm --global && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set maxsockets 15 && \
    npm config set progress false

# Copy package files
COPY package.json package-lock.json* ./

# Install with BuildKit cache mount for faster subsequent builds
# This persists npm cache between builds, reducing install time from 12min to 2-5min
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules/.cache \
    if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps --prefer-offline --no-audit --ignore-scripts --loglevel=error || \
      (npm cache clean --force && npm ci --legacy-peer-deps --prefer-offline --no-audit --ignore-scripts --loglevel=error); \
    else \
      npm install --legacy-peer-deps --prefer-offline --no-audit --ignore-scripts --loglevel=error || \
      (npm cache clean --force && npm install --legacy-peer-deps --prefer-offline --no-audit --ignore-scripts --loglevel=error); \
    fi

# Copy source code (changes most frequently)
COPY . .

# Expose port
EXPOSE 3001

# Start with hot reload
CMD ["npm", "run", "dev"]
```

### 2. Frontend Dockerfile (Next.js)

```dockerfile
# frontend/Dockerfile - Multi-stage build for Next.js frontend

# ==============================================================================
# BASE STAGE
# ==============================================================================
FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache libc6-compat

# ==============================================================================
# DEPENDENCIES STAGE
# ==============================================================================
FROM base AS deps

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ==============================================================================
# BUILDER STAGE
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment-specific builds
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

RUN npm install -g pnpm && pnpm build

# ==============================================================================
# PRODUCTION STAGE
# ==============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]

# ==============================================================================
# DEVELOPMENT STAGE
# ==============================================================================
FROM base AS development
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

### 3. Docker Compose for Development

```yaml
# docker-compose.yml - Local development environment
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ${PROJECT_NAME:-project}-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-project_dev}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Redis Cache (optional)
  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME:-project}-redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      target: development
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-project}-backend
    env_file:
      - ./backend/.env.local
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-project_dev}
      REDIS_URL: redis://redis:6379
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    volumes:
      - ./backend/src:/app/src:cached
      - ./backend/package.json:/app/package.json:cached
      - backend_node_modules:/app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    command: npm run dev

  # Frontend App
  frontend:
    build:
      context: ./frontend
      target: development
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-project}-frontend
    env_file:
      - ./frontend/.env.local
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:${BACKEND_PORT:-3001}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    volumes:
      - ./frontend/src:/app/src:cached
      - ./frontend/public:/app/public:cached
      - ./frontend/package.json:/app/package.json:cached
      - frontend_node_modules:/app/node_modules
    depends_on:
      - backend
    networks:
      - app-network
    command: pnpm dev

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  backend_node_modules:
  frontend_node_modules:
```

### 4. Docker Compose for Production

```yaml
# docker-compose.production.yml - Production deployment
version: '3.8'

services:
  backend:
    image: ${REGISTRY}/${PROJECT_NAME}-backend:${VERSION:-latest}
    container_name: ${PROJECT_NAME}-backend-prod
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

  frontend:
    image: ${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION:-latest}
    container_name: ${PROJECT_NAME}-frontend-prod
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.1'
          memory: 128M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 5. Dockerignore Files

```gitignore
# .dockerignore - Backend
node_modules
npm-debug.log
.git
.gitignore
.env*
!.env.example
dist
coverage
.nyc_output
*.log
*.test.ts
*.test.js
*.spec.ts
*.spec.js
__tests__
__mocks__
.vscode
.idea
*.md
!README.md
Dockerfile*
docker-compose*
.dockerignore
.eslintrc*
.prettierrc*
jest.config.*
tsconfig.*.json
```

```gitignore
# .dockerignore - Frontend
node_modules
.git
.gitignore
.env*
!.env.example
.next
out
coverage
*.log
*.test.tsx
*.test.ts
*.spec.tsx
*.spec.ts
__tests__
__mocks__
.vscode
.idea
*.md
!README.md
Dockerfile*
docker-compose*
.dockerignore
.eslintrc*
.prettierrc*
jest.config.*
next.config.*.js
```

### 6. App Runner Dockerfile (AWS)

```dockerfile
# Dockerfile.apprunner - Optimized for AWS App Runner

FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apprunner

# Copy built app
COPY --from=builder --chown=apprunner:nodejs /app/dist ./dist
COPY --from=builder --chown=apprunner:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apprunner:nodejs /app/package.json ./package.json

USER apprunner

# App Runner uses port 8080 by default
EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/index.js"]
```

### 7. Build Scripts

```bash
#!/bin/bash
# scripts/docker-build.sh - Build Docker images

set -e

PROJECT_NAME="${PROJECT_NAME:-project}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
REGISTRY="${REGISTRY:-}"

echo "🐳 Building Docker images..."
echo "  Project: $PROJECT_NAME"
echo "  Version: $VERSION"

# Build backend
echo ""
echo "📦 Building backend..."
docker build \
  --target runner \
  --tag "${REGISTRY:+$REGISTRY/}${PROJECT_NAME}-backend:${VERSION}" \
  --tag "${REGISTRY:+$REGISTRY/}${PROJECT_NAME}-backend:latest" \
  --file backend/Dockerfile \
  ./backend

# Build frontend
echo ""
echo "📦 Building frontend..."
docker build \
  --target runner \
  --tag "${REGISTRY:+$REGISTRY/}${PROJECT_NAME}-frontend:${VERSION}" \
  --tag "${REGISTRY:+$REGISTRY/}${PROJECT_NAME}-frontend:latest" \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}" \
  --file frontend/Dockerfile \
  ./frontend

echo ""
echo "✅ Docker images built successfully!"
echo ""
echo "Images:"
docker images | grep "$PROJECT_NAME"
```

```bash
#!/bin/bash
# scripts/docker-push.sh - Push images to registry

set -e

PROJECT_NAME="${PROJECT_NAME:-project}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
REGISTRY="${REGISTRY:?REGISTRY environment variable required}"

echo "🚀 Pushing Docker images to $REGISTRY..."

# Login to registry (AWS ECR example)
aws ecr get-login-password --region ${AWS_REGION:-us-east-1} | \
  docker login --username AWS --password-stdin "$REGISTRY"

# Push backend
docker push "${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
docker push "${REGISTRY}/${PROJECT_NAME}-backend:latest"

# Push frontend
docker push "${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
docker push "${REGISTRY}/${PROJECT_NAME}-frontend:latest"

echo "✅ Images pushed successfully!"
```

## Security Best Practices

### Container Security Checklist

```yaml
# Security hardening patterns
security:
  # 1. Use non-root user
  user: "1001:1001"

  # 2. Read-only root filesystem
  read_only: true
  tmpfs:
    - /tmp
    - /var/run

  # 3. Drop all capabilities
  cap_drop:
    - ALL

  # 4. No new privileges
  security_opt:
    - no-new-privileges:true

  # 5. Resource limits
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

## Implementation Checklist

### Dockerfiles
- [ ] Multi-stage build for production optimization
- [ ] Non-root user for security
- [ ] Health checks defined
- [ ] Proper .dockerignore files
- [ ] BuildKit cache mounts for dev builds
- [ ] Appropriate base images (alpine for size)

### Docker Compose
- [ ] Development compose with hot reload
- [ ] Production compose with resource limits
- [ ] Health checks for all services
- [ ] Named volumes for data persistence
- [ ] Network isolation

### Security
- [ ] Non-root user in containers
- [ ] Read-only filesystem where possible
- [ ] Dropped capabilities
- [ ] Resource limits defined
- [ ] No secrets in images

### CI/CD Integration
- [ ] Multi-platform builds (amd64/arm64)
- [ ] Image scanning for vulnerabilities
- [ ] Registry push automation
- [ ] Version tagging strategy

## Related Commands

- `/implement-aws-deployment` - AWS deployment with Docker
- `/implement-ci-cd` - CI/CD pipeline with Docker builds

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare patterns |
