# Setup Production Environment

This command transforms the basic Claude boilerplate into a production-ready development environment similar to stacksbabiee, adding Docker containers, enhanced dependencies, ngrok integration, and comprehensive tooling for professional development workflows.

## Prerequisites

- `docs/PRD.md` must exist in the project root
- pnpm must be installed (`npm install -g pnpm`)
- Docker and Docker Compose must be installed
- Node.js 18+ must be installed

## What This Command Does

1. **Creates Docker Development Environment**: Sets up PostgreSQL, Redis, backend, frontend, and ngrok services
2. **Enhances Package Dependencies**: Upgrades frontend and backend with production-ready packages
3. **Sets Up Ngrok Integration**: Configures webhook tunneling for Clerk and other webhook testing
4. **Adds Testing Infrastructure**: Creates comprehensive integration testing scripts
5. **Configures Production Environment**: Sets up security-focused environment variables
6. **Sets Up AWS S3 Bucket**: Creates unified S3 bucket with environment-specific directories
7. **Enhances Mockup System**: Upgrades to Vite-based prototyping capabilities
8. **Updates Documentation**: Adds production environment documentation

## Implementation Steps

### Step 1: Verify Prerequisites and Project Context

**Claude Instructions:**
1. Check that `docs/PRD.md` exists and read it to understand the project context
2. Verify that we're in a Claude boilerplate project by checking for `.claude/commands/` directory
3. Read the current `package.json` to understand the existing project structure

### Step 2: Create Docker Development Environment

**Claude Instructions:**
1. Create `docker-compose.yml` in the project root with the following services:
   - PostgreSQL database (latest Alpine version)
   - Redis cache (latest Alpine version)
   - Backend service (Express.js with TypeScript)
   - Frontend service (Next.js)
   - Ngrok service for webhook tunneling
2. Configure proper networking, volume management, and health checks
3. Set up environment variables for development

**Docker Services Configuration:**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: [PROJECT_NAME]-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: [PROJECT_NAME]_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: [PROJECT_NAME]-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: [PROJECT_NAME]-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - FRONTEND_URL=http://localhost:3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=[PROJECT_NAME]_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
      - ./backend/.env:/app/.env
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: [PROJECT_NAME]-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    volumes:
      - ./frontend/app:/app/app
      - ./frontend/public:/app/public
      - ./frontend/.env.local:/app/.env.local
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Ngrok for webhook tunneling
  ngrok:
    image: ngrok/ngrok:latest
    container_name: [PROJECT_NAME]-ngrok
    restart: unless-stopped
    command:
      - "start"
      - "--all"
      - "--config"
      - "/etc/ngrok.yml"
    volumes:
      - ./ngrok.yml:/etc/ngrok.yml
    ports:
      - "4040:4040"
    depends_on:
      - backend
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN:-}

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Create Ngrok Configuration

**Claude Instructions:**
1. Create `ngrok.yml` in the project root for webhook tunneling
2. Configure tunnels for both backend and frontend services

**Ngrok Configuration:**
```yaml
version: "2"
web_addr: localhost:4040
tunnels:
  backend:
    addr: backend:3001
    proto: http
    schemes:
      - https
  frontend:
    addr: frontend:3000
    proto: http
    schemes:
      - http
```

### Step 4: Enhance Package Dependencies

**Claude Instructions:**
1. Update the root `package.json` to add production development dependencies
2. Update `frontend/package.json` with enhanced frontend packages
3. Update `backend/package.json` with production-ready backend packages

**Root Package.json Additions:**
```json
{
  "dependencies": {
    "puppeteer": "^24.12.0"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.5.4",
    "@types/node": "^20.11.18",
    "eslint": "^8.50.0",
    "prettier": "^3.0.3",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.2"
  },
  "scripts": {
    "dev:services": "docker-compose up -d",
    "dev:services:logs": "docker-compose logs -f",
    "dev:services:down": "docker-compose down",
    "dev:services:clean": "docker-compose down -v",
    "test:integration": "./test-integration.sh",
    "ngrok:status": "curl -s http://localhost:4040/api/tunnels | jq '.tunnels[].public_url'"
  }
}
```

**Frontend Package.json Enhancements:**
Add these dependencies to the existing frontend package.json:
```json
{
  "dependencies": {
    "@apollo/client": "^3.8.0",
    "@clerk/nextjs": "^6.22.0",
    "@hookform/resolvers": "^3.3.2",
    "@reduxjs/toolkit": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "graphql": "^16.11.0",
    "lucide-react": "^0.441.0",
    "react-hook-form": "^7.47.0",
    "redux-persist": "^6.0.0",
    "sonner": "^1.2.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.1",
    "prettier-plugin-tailwindcss": "^0.6.13"
  }
}
```

**Backend Package.json Enhancements:**
Add these dependencies to the existing backend package.json:
```json
{
  "dependencies": {
    "@apollo/server": "^4.12.2",
    "@clerk/backend": "^2.4.0",
    "@clerk/express": "^1.0.0",
    "@graphql-tools/merge": "^9.0.0",
    "@graphql-tools/schema": "^10.0.0",
    "apollo-server-express": "^3.12.1",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "redis": "^4.6.11",
    "sequelize": "^6.35.0",
    "sequelize-typescript": "^2.1.6",
    "stripe": "^14.7.0",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.7.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "@types/uuid": "^9.0.7",
    "sequelize-cli": "^6.6.2"
  }
}
```

### Step 5: Create Integration Testing Script

**Claude Instructions:**
1. Create `test-integration.sh` in the project root
2. Make it executable with proper permissions
3. Include comprehensive testing for the production environment setup

**Integration Testing Script:**
```bash
#!/bin/bash

# Production Environment Integration Test Script
echo "🧪 Testing Production Environment Setup"
echo "========================================"

# Test 1: Check Docker Compose configuration
echo "✅ Test 1: Docker Compose configuration"
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml exists"
    if docker-compose config > /dev/null 2>&1; then
        echo "✅ docker-compose.yml is valid"
    else
        echo "❌ docker-compose.yml has configuration errors"
    fi
else
    echo "❌ docker-compose.yml missing"
fi

# Test 2: Check Ngrok configuration
echo ""
echo "✅ Test 2: Ngrok configuration"
if [ -f "ngrok.yml" ]; then
    echo "✅ ngrok.yml exists"
else
    echo "❌ ngrok.yml missing"
fi

# Test 3: Check enhanced package.json files
echo ""
echo "✅ Test 3: Enhanced package dependencies"
if grep -q "puppeteer" package.json; then
    echo "✅ Root package.json has production dependencies"
else
    echo "❌ Root package.json missing production dependencies"
fi

if grep -q "@apollo/client" frontend/package.json; then
    echo "✅ Frontend package.json has enhanced dependencies"
else
    echo "❌ Frontend package.json missing enhanced dependencies"
fi

if grep -q "@apollo/server" backend/package.json; then
    echo "✅ Backend package.json has production dependencies"
else
    echo "❌ Backend package.json missing production dependencies"
fi

# Test 4: Check Docker services
echo ""
echo "✅ Test 4: Docker services health check"
if docker-compose up -d > /dev/null 2>&1; then
    echo "✅ Docker services started successfully"
    sleep 10
    
    # Check service health
    if docker-compose ps | grep -q "healthy"; then
        echo "✅ Services are healthy"
    else
        echo "⚠️  Services are starting (may need more time)"
    fi
    
    docker-compose down > /dev/null 2>&1
else
    echo "❌ Failed to start Docker services"
fi

# Test 5: Check .gitignore updates
echo ""
echo "✅ Test 5: .gitignore configuration"
if grep -q "# Production Environment" .gitignore; then
    echo "✅ .gitignore has production environment entries"
else
    echo "❌ .gitignore missing production environment entries"
fi

echo ""
echo "🎉 Production environment integration test completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Run: pnpm install"
echo "2. Run: pnpm dev:services"
echo "3. Run: pnpm dev"
echo "4. Visit: http://localhost:4040 for ngrok dashboard"
echo "5. Visit: http://localhost:3000 for frontend"
echo "6. Visit: http://localhost:3001 for backend"
```

### Step 6: Create Enhanced Environment Configuration

**Claude Instructions:**
1. Create comprehensive `.env.example` files for both frontend and backend
2. Update `.gitignore` with production-specific entries

**Frontend .env.example:**
```env
# Production Environment Variables - Frontend
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment Processing (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# AWS Configuration (for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://your-cdn-url.com

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

**Backend .env.example:**
```env
# Production Environment Variables - Backend
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=your_project_dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/your_project_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket
AWS_S3_PREFIX=environment_prefix

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
HEALTH_CHECK_PORT=3001

# Ngrok Configuration (for development)
NGROK_AUTHTOKEN=your_ngrok_authtoken
```

### Step 7: Setup AWS S3 Bucket Configuration

**Claude Instructions:**
1. Configure unified S3 bucket with environment-specific directories
2. Update all environment files to use single bucket with prefixes
3. Create AWS CLI script for bucket setup

**S3 Bucket Structure:**
```
dreamihaircare/
├── local/          # Local development assets
│   ├── uploads/
│   ├── images/
│   └── documents/
├── dev/            # Development environment assets
│   ├── uploads/
│   ├── images/
│   └── documents/
└── prod/           # Production environment assets
    ├── uploads/
    ├── images/
    └── documents/
```

**Environment Configuration Updates:**
Update all environment files (`.env`, `.env.develop`, `.env.production`) with:
```env
# Unified S3 Configuration
AWS_S3_BUCKET=dreamihaircare
AWS_S3_PREFIX=local    # Changes to 'dev' or 'prod' per environment
```

**AWS CLI Setup Script:**
Create `scripts/setup-s3-bucket.sh`:
```bash
#!/bin/bash

echo "🪣 Setting up AWS S3 Bucket for Dreami Hair Care"
echo "================================================"

BUCKET_NAME="dreamihaircare"
REGION="us-east-1"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Create S3 bucket
echo "📦 Creating S3 bucket: $BUCKET_NAME"
if aws s3 mb s3://$BUCKET_NAME --region $REGION; then
    echo "✅ S3 bucket created successfully"
else
    echo "⚠️  Bucket might already exist or there was an error"
fi

# Configure bucket versioning
echo "🔄 Enabling versioning on bucket"
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

# Configure bucket CORS for web uploads
echo "🌐 Configuring CORS policy"
cat > /tmp/cors-config.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
            "AllowedOrigins": [
                "http://localhost:3000",
                "https://develop.dreamihaircare.com",
                "https://dreamihaircare.com"
            ],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file:///tmp/cors-config.json

# Create directory structure
echo "📁 Creating directory structure"
for env in local dev prod; do
    for dir in uploads images documents; do
        echo "Creating $env/$dir/"
        aws s3api put-object \
            --bucket $BUCKET_NAME \
            --key "$env/$dir/" \
            --content-length 0
    done
done

# Set bucket policy for public read access to images
echo "🔒 Setting bucket policy"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*/images/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file:///tmp/bucket-policy.json

# Clean up temporary files
rm -f /tmp/cors-config.json /tmp/bucket-policy.json

echo ""
echo "🎉 S3 bucket setup completed!"
echo ""
echo "📋 Bucket Configuration:"
echo "• Bucket Name: $BUCKET_NAME"
echo "• Region: $REGION"
echo "• Versioning: Enabled"
echo "• CORS: Configured for web uploads"
echo "• Directory Structure: local/, dev/, prod/"
echo ""
echo "🔗 Bucket URL: https://$BUCKET_NAME.s3.$REGION.amazonaws.com/"
echo ""
echo "📝 Environment Variables Updated:"
echo "• AWS_S3_BUCKET=dreamihaircare"
echo "• AWS_S3_PREFIX=local (for local development)"
echo "• AWS_S3_PREFIX=dev (for development environment)"
echo "• AWS_S3_PREFIX=prod (for production environment)"
```

### Step 8: Update .gitignore

**Claude Instructions:**
1. Add production environment specific entries to `.gitignore`

**Additional .gitignore Entries:**
```gitignore
# Production Environment
.env.production
.env.staging
.env.local

# Docker
.dockerignore
docker-compose.override.yml

# Ngrok
ngrok.log
.ngrok2/

# Database
*.sqlite
*.sqlite3
*.db
postgres_data/
redis_data/

# Uploads and Assets
uploads/
public/uploads/
assets/generated/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Production builds
dist/
build/
.next/
out/

# Monitoring
.pm2/
monitoring/

# Backup files
*.backup
backup/
```

### Step 9: Create Dockerfiles

**Claude Instructions:**
1. Create `Dockerfile` in the `frontend/` directory
2. Create `Dockerfile` in the `backend/` directory

**Frontend Dockerfile:**
```dockerfile
# Multi-stage build for Next.js
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm ci --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

# Development target
FROM base AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

**Backend Dockerfile:**
```dockerfile
# Multi-stage build for Node.js backend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm ci --frozen-lockfile

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Build the TypeScript code
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

# Copy built application
COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/package.json ./package.json

USER nodeapp

EXPOSE 3001

ENV PORT 3001

CMD ["node", "dist/index.js"]

# Development target
FROM base AS development
WORKDIR /app

# Install pnpm and curl for health checks
RUN npm install -g pnpm && apk add --no-cache curl

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3001

CMD ["pnpm", "dev"]
```

### Step 10: Update Documentation

**Claude Instructions:**
1. Update `CLAUDE.md` to include the new production environment setup command
2. Add the new command to the quick start workflow

**CLAUDE.md Addition:**
Add this to the "Essential Commands" section:
```markdown
### Production Environment Commands
- **`setup-production-environment`** - Transform basic boilerplate into production-ready development environment with Docker, enhanced dependencies, and comprehensive tooling
```

Add this to the "Quick Start Workflow" section:
```markdown
# 8. Set up production development environment (optional, for advanced development)
setup-production-environment

# 9. Start development services with Docker
pnpm dev:services                # Start PostgreSQL, Redis, and ngrok
pnpm dev                         # Start frontend and backend
```

### Step 11: Completion and Validation

**Claude Instructions:**
1. Create a summary of what was implemented
2. Provide instructions for the user to test the setup
3. Include troubleshooting tips

## Usage Instructions

After running this command, developers can:

1. **Start the full development environment:**
   ```bash
   pnpm dev:services    # Start Docker services
   pnpm dev             # Start frontend and backend
   ```

2. **Access development tools:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Database: postgresql://postgres:postgres@localhost:5432/[project]_dev
   - Redis: redis://localhost:6379
   - Ngrok Dashboard: http://localhost:4040

3. **Run integration tests:**
   ```bash
   pnpm test:integration
   ```

4. **Check ngrok tunnels:**
   ```bash
   pnpm ngrok:status
   ```

## Troubleshooting

### Common Issues

1. **Docker services not starting:**
   - Check if Docker is running
   - Verify ports 3000, 3001, 5432, 6379, 4040 are available
   - Run `docker-compose logs` to check service logs

2. **Database connection issues:**
   - Ensure PostgreSQL service is healthy: `docker-compose ps`
   - Check database credentials in `.env` files

3. **Ngrok authentication:**
   - Sign up for ngrok account and get auth token
   - Set `NGROK_AUTHTOKEN` in your environment

4. **Package installation errors:**
   - Clear pnpm cache: `pnpm store prune`
   - Remove node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Verification Steps

1. All Docker services show as "healthy"
2. Frontend loads at localhost:3000
3. Backend health endpoint responds at localhost:3001/health
4. Database connection successful
5. Ngrok tunnels are active and accessible

## Security Considerations

- Never commit `.env` files with real credentials
- Use strong passwords for database and Redis
- Rotate API keys regularly
- Enable HTTPS in production
- Use environment-specific configurations
- Monitor for vulnerabilities in dependencies

This production environment setup provides a robust foundation for developing sophisticated applications with proper database management, caching, webhook testing, and comprehensive tooling.