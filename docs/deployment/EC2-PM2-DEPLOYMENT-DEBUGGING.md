# EC2 PM2 Deployment Debugging Guide

A comprehensive troubleshooting guide for GitHub Actions deployments to shared EC2 instances with PM2 process management. Based on real-world debugging of QuikCarRental backend deployment failures (Feb 2026).

## Table of Contents

- [Quick Diagnosis Flowchart](#quick-diagnosis-flowchart)
- [Common Failure Patterns](#common-failure-patterns)
- [Root Cause 1: Missing Production Dependencies (pnpm)](#root-cause-1-missing-production-dependencies-pnpm)
- [Root Cause 2: PM2 Cluster vs Fork Mode](#root-cause-2-pm2-cluster-vs-fork-mode)
- [Root Cause 3: Redis Connection Crashes](#root-cause-3-redis-connection-crashes)
- [Root Cause 4: Health Check Timeout](#root-cause-4-health-check-timeout)
- [Root Cause 5: Disk Space Exhaustion](#root-cause-5-disk-space-exhaustion)
- [Deployment Diagnostics Template](#deployment-diagnostics-template)
- [PM2 Log Forensics](#pm2-log-forensics)
- [SSH Investigation Checklist](#ssh-investigation-checklist)
- [Prevention Checklist](#prevention-checklist)

---

## Quick Diagnosis Flowchart

```
Deployment failed
  |
  +-- PM2 shows "online" then immediately "stopped"?
  |     |
  |     +-- Check PM2 internal log (~/.pm2/pm2.log)
  |     |     |
  |     |     +-- "exited with code [0] via signal [SIGINT]" in <2s
  |     |     |     |
  |     |     |     +-- In cluster mode? -> Switch to fork mode
  |     |     |     +-- In fork mode? -> Run `node dist/index.js` directly
  |     |     |           |
  |     |     |           +-- "Cannot find module X" -> Missing dependency
  |     |     |           +-- Other error -> Fix the error
  |     |     |
  |     |     +-- "exited with code [1]" -> Application crash
  |     |           +-- Check error log files
  |     |           +-- Run `node dist/index.js` to see stack trace
  |     |
  |     +-- No log entries at all? -> PM2 couldn't start the process
  |           +-- Check file permissions
  |           +-- Verify dist/index.js exists
  |
  +-- Health check timeout (app running but /health fails)?
  |     +-- Check app startup time with: time curl localhost:PORT/health
  |     +-- Increase health check timeout
  |     +-- Check database connection speed
  |
  +-- PM2 start command itself fails?
        +-- Check ecosystem.config.js syntax
        +-- Verify cwd path exists
        +-- Check node_modules installed
```

---

## Common Failure Patterns

### Pattern 1: Silent Crash (No Output)

**Symptoms:**
- PM2 shows process started then stopped
- Application log files are empty (0 bytes)
- PM2 restarts the process N times then gives up
- Rollback to old code works fine

**Cause:** The process crashes during module loading before any application code executes. Node.js `require()` fails and the process exits before any logging can happen.

**Diagnosis:**
```bash
# Run the application directly (not through PM2)
cd /path/to/project/backend
node dist/index.js
# This will show the actual error (e.g., "Cannot find module 'X'")
```

### Pattern 2: Instant SIGINT Exit (Cluster Mode)

**Symptoms in `~/.pm2/pm2.log`:**
```
App [myapp:0] starting in -cluster mode-
App [myapp:0] online
App name:myapp id:0 disconnected
App [myapp:0] exited with code [0] via signal [SIGINT]
```
Process is alive for only ~1 second.

**Cause:** PM2 cluster mode uses Node.js `cluster` module. When the worker process can't load modules or crashes during initialization, the IPC channel breaks, PM2 sends SIGINT, and the process exits cleanly (code 0). This masks the real error.

**Fix:** Switch to `exec_mode: 'fork'` (see Root Cause 2).

### Pattern 3: Health Check Passes Locally, Fails on EC2

**Cause:** EC2 instances (especially t2.micro) are significantly slower than dev machines. Database connections to remote services (Neon, RDS) add latency. Module loading is slower on 1 vCPU.

**Fix:** Increase health check timeout with polling (see Root Cause 4).

---

## Root Cause 1: Missing Production Dependencies (pnpm)

### The Problem

pnpm uses **strict module resolution** unlike npm. A package can only `require()` modules that are declared in its own `package.json`. Transitive dependencies are NOT accessible.

During development, `pnpm install` installs all dependencies (including devDependencies). A package like `@graphql-tools/schema` might be accessible because it's a transitive dependency of `@graphql-tools/merge`. But when `pnpm install --prod` runs on EC2, only production dependencies are installed, and pnpm's strict resolution means the transitive dependency is no longer accessible.

### How to Detect

```bash
# On EC2, run the app directly to see the actual error
cd backend
node dist/index.js
# Output: Error: Cannot find module '@graphql-tools/schema'
```

### How to Find Missing Dependencies

**Method 1: Scan compiled output for external requires**
```bash
# Extract all external requires from dist/
grep -r --include="*.js" -ohE 'require\("[^.][^"]+"\)' dist/ \
  | sed 's/require("//;s/")//' \
  | sort -u
```

Then verify each one exists in `package.json` dependencies (not devDependencies).

**Method 2: Automated check script**
```bash
#!/bin/bash
# check-prod-deps.sh - Run in backend/ directory
echo "Checking for missing production dependencies..."

grep -r --include="*.js" -ohE 'require\("[^.][^"]+"\)' dist/ \
  | sed 's/require("//;s/")//' \
  | sort -u \
  | while read mod; do
    # Extract package name (handle scoped packages like @scope/name)
    if echo "$mod" | grep -q "^@"; then
      pkg=$(echo "$mod" | cut -d/ -f1-2)
    else
      pkg=$(echo "$mod" | cut -d/ -f1)
    fi

    # Skip Node.js builtins
    case "$pkg" in
      path|fs|http|https|url|crypto|stream|util|events|net|os|\
      child_process|cluster|buffer|querystring|zlib|tls|perf_hooks|\
      worker_threads|assert|readline|dns|dgram|string_decoder|\
      punycode|v8|vm|tty|module|constants|timers|domain)
        continue;;
    esac

    # Check if in package.json dependencies
    if ! node -e "
      const p=require('./package.json');
      process.exit(p.dependencies && p.dependencies['$pkg'] ? 0 : 1)
    " 2>/dev/null; then
      echo "  MISSING: $pkg (imported as: $mod)"
    fi
  done

echo "Done."
```

### How to Fix

```bash
# Add the missing package as a production dependency
pnpm add @graphql-tools/schema --filter backend

# Or manually add to package.json dependencies and run:
pnpm install --filter backend
```

### Prevention

Add a CI step to validate production dependencies before deployment:

```yaml
- name: Validate production dependencies
  run: |
    cd backend
    # Simulate production install in a temp directory
    cp package.json /tmp/dep-check/
    cp ../pnpm-lock.yaml /tmp/dep-check/
    cd /tmp/dep-check
    pnpm install --prod --frozen-lockfile

    # Check all requires resolve
    cd $GITHUB_WORKSPACE/backend
    node -e "
      const fs = require('fs');
      const files = require('child_process')
        .execSync('find dist -name \"*.js\"', {encoding:'utf8'})
        .trim().split('\n');
      // ... validate requires
    "
```

---

## Root Cause 2: PM2 Cluster vs Fork Mode

### The Problem

PM2 has two execution modes:

| Feature | `cluster` mode | `fork` mode |
|---------|---------------|-------------|
| Uses Node.js `cluster` | Yes | No |
| IPC channel to master | Yes | No |
| Load balancing | Yes (multiple instances) | No |
| Error visibility | Poor (masked by IPC) | Good (direct stderr) |
| Overhead | Higher (master + worker) | Lower (single process) |
| Recommended for | Multiple instances | Single instance |

**When `instances: 1` and `exec_mode: 'cluster'`**, the cluster mode provides zero benefit but adds:
1. An extra master process consuming memory
2. IPC channel complexity that can mask errors
3. Silent SIGINT exits when workers crash during initialization

### How to Detect

Check `~/.pm2/pm2.log` for this pattern:
```
App [myapp:0] starting in -cluster mode-
App [myapp:0] online
App name:myapp id:0 disconnected
App [myapp:0] exited with code [0] via signal [SIGINT]
```

The key indicator is:
- **"cluster mode"** in the starting line
- **"disconnected"** immediately after "online"
- **Exit code [0]** via **SIGINT** (not a crash - the error is hidden)

### How to Fix

In `ecosystem.config.js`:

```javascript
// BEFORE (problematic with 1 instance)
module.exports = {
  apps: [{
    name: 'myapp',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',  // Unnecessary overhead
  }]
};

// AFTER (correct for single instance)
module.exports = {
  apps: [{
    name: 'myapp',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',     // Direct process, better error visibility
    node_args: '--max-old-space-size=384',  // Limit heap for t2.micro
  }]
};
```

### When to Use Cluster Mode

Only use `exec_mode: 'cluster'` when:
- `instances` is greater than 1 (or set to `'max'`)
- You need PM2's built-in load balancing
- The server has multiple CPU cores available

---

## Root Cause 3: Redis Connection Crashes

### The Problem

`new Redis()` from `ioredis` immediately attempts to connect. If the connection fails and no `error` event handler is registered, Node.js emits an unhandled error event which crashes the process.

```typescript
// DANGEROUS: Crashes if Redis is unavailable
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// This is often at module level, meaning it executes during require()
// If Redis is down, the process crashes before any error handling can kick in
```

### How to Detect

Check application error logs for:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

Or if the process crashes silently (no error logs), Redis module-level connections are a prime suspect.

### How to Fix

**Pattern: Lazy-initialized Redis with error suppression**

```typescript
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,           // Don't connect immediately
      maxRetriesPerRequest: 3,     // Limit retries per command
      retryStrategy(times) {
        if (times > 5) return null; // Stop retrying after 5 attempts
        return Math.min(times * 2000, 30000); // Exponential backoff
      },
    });

    // CRITICAL: Handle errors to prevent unhandled error crashes
    redis.on('error', (err) => {
      console.error('[ServiceName] Redis error:', err.message);
    });

    // Connect asynchronously, catch connection errors
    redis.connect().catch((err) => {
      console.error('[ServiceName] Redis connect error:', err.message);
    });
  }
  return redis;
}
```

### Files to Check

Search for all Redis instantiations:
```bash
grep -rn "new Redis(" backend/src/ --include="*.ts"
```

Every instance of `new Redis()` should have:
1. `lazyConnect: true`
2. An `error` event handler
3. A retry strategy with a max retry limit

### Prevention

Add an ESLint custom rule or grep check in CI:
```bash
# Check for unsafe Redis instantiation
if grep -rn "new Redis(" backend/src/ --include="*.ts" | grep -v "lazyConnect"; then
  echo "WARNING: Found Redis instantiation without lazyConnect: true"
fi
```

---

## Root Cause 4: Health Check Timeout

### The Problem

EC2 instances (especially t2.micro: 1 vCPU, 1GB RAM) are significantly slower than development machines. Application startup involves:
1. Loading all Node.js modules (~2-5s on t2.micro)
2. Connecting to remote database (Neon: ~3-5s with SSL)
3. Running Sequelize model initialization (~1-2s)
4. Starting Apollo Server/GraphQL (~1-2s)
5. Initializing background services (~1-2s)

Total: **10-20 seconds** on t2.micro vs 3-5 seconds on a dev machine.

### How to Fix

Replace a fixed `sleep` with polling:

```bash
# BEFORE: Fixed wait (too rigid)
sleep 15
if curl -sf http://localhost:3023/health; then
  echo "OK"
fi

# AFTER: Polling with progressive timeout
HEALTH_OK=false
for i in $(seq 1 9); do
  sleep 5
  if curl -sf http://localhost:3023/health > /dev/null 2>&1; then
    HEALTH_OK=true
    echo "Health check passed after $((i * 5)) seconds"
    break
  fi
  echo "  ... attempt $i/9 ($(( i * 5 ))s elapsed)"
done

if ! $HEALTH_OK; then
  echo "Health check failed after 45 seconds"
  # Collect diagnostics (see template below)
fi
```

---

## Root Cause 5: Disk Space Exhaustion

### The Problem

Shared EC2 instances accumulate:
- Old deployment backups (`dist.backup.*` directories)
- npm/pnpm cache (can be 2+ GB)
- PM2 log files
- Deployment archives (`.tar.gz` files)

On a 20GB root volume, this can push utilization past 90%, causing deployments to fail silently during `tar -xzf` or `pnpm install`.

### How to Detect

```bash
# Check disk utilization
df -h /
# Warning zone: >85% | Danger zone: >90%

# Find largest directories
du -sh /home/ec2-user/projects/*/backend/dist.backup.* 2>/dev/null | sort -rh | head -10
du -sh ~/.npm ~/.pnpm-store 2>/dev/null
```

### How to Fix

```bash
# Clean npm/pnpm cache
npm cache clean --force
pnpm store prune

# Remove old deployment backups (keep only latest)
find /home/ec2-user/projects -name "dist.backup.*" -type d | sort | head -n -1 | xargs rm -rf

# Flush PM2 logs
pm2 flush

# Remove old deployment archives
find /tmp -name "deployment*.tar.gz" -mtime +1 -delete
```

### Prevention

Add cleanup to the deployment script:
```bash
# In deployment script, before extracting new code:
echo "Cleaning old backups..."
cd "$PROJECT_DIR"
ls -dt backend/dist.backup.* 2>/dev/null | tail -n +3 | xargs rm -rf 2>/dev/null || true
```

---

## Deployment Diagnostics Template

Add this to your GitHub Actions deployment workflow. When the health check fails, it collects comprehensive diagnostics before rolling back:

```yaml
# In your deployment SSH script, after health check failure:
echo "--- PM2 Status ---"
pm2 list 2>/dev/null || true

echo "--- PM2 App Logs (last 30 lines) ---"
pm2 logs "$PM2_APP_NAME" --lines 30 --nostream 2>/dev/null || echo "No PM2 logs"

echo "--- PM2 Internal Log (last 30 lines) ---"
tail -30 ~/.pm2/pm2.log 2>/dev/null || true

echo "--- Application Log Files ---"
ls -la /home/ec2-user/logs/$PM2_APP_NAME-* 2>/dev/null || true
tail -20 /home/ec2-user/logs/$PM2_APP_NAME-error*.log 2>/dev/null || echo "No error logs"
tail -20 /home/ec2-user/logs/$PM2_APP_NAME-out*.log 2>/dev/null || echo "No output logs"

echo "--- Memory Status ---"
free -m 2>/dev/null || true

echo "--- Disk Status ---"
df -h / 2>/dev/null || true

echo "--- Direct Node.js Test (5s timeout) ---"
pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
cd backend
timeout 5 node --max-old-space-size=384 dist/index.js 2>&1 || echo "Node exited with code: $?"
cd ..

echo "--- End Diagnostics ---"
```

**Why this matters:** The "Direct Node.js Test" step is the most valuable. Running `node dist/index.js` directly (not through PM2) captures the actual error output that PM2 cluster mode would otherwise hide.

---

## PM2 Log Forensics

### Key Log Locations

| Log | Path | Contents |
|-----|------|----------|
| PM2 Internal | `~/.pm2/pm2.log` | Process lifecycle events (start, stop, restart, crash) |
| App Stdout | Configured in ecosystem.config.js `out_file` | Application console.log output |
| App Stderr | Configured in ecosystem.config.js `error_file` | Application console.error output |
| PM2 Process List | `~/.pm2/dump.pm2` | Saved process state for auto-restart |

### Understanding PM2 Instance IDs

PM2 assigns incrementing instance IDs. When a process is stopped/deleted and a new one is started, it gets a new ID. Log files include the ID:

```
quikcarrental-out-2.log    # Output from instance ID 2
quikcarrental-out-3.log    # Output from instance ID 3 (after restart)
quikcarrental-error-2.log  # Errors from instance ID 2
```

If the new deployment creates instance ID 4 but crashes, check `*-4.log` files, not `*-3.log`.

### Reading PM2 Internal Log

```bash
# Show last 50 lines of PM2 internal log
tail -50 ~/.pm2/pm2.log

# Filter for specific app
grep "quikcarrental" ~/.pm2/pm2.log | tail -30

# Show restart patterns
grep -E "(online|disconnected|exited|restart)" ~/.pm2/pm2.log | tail -20
```

### Common PM2 Log Patterns

**Healthy start:**
```
PM2 log: App [myapp:0] starting in -fork mode-
PM2 log: App [myapp:0] online
```

**Crash loop (cluster mode, hidden error):**
```
PM2 log: App [myapp:0] starting in -cluster mode-
PM2 log: App [myapp:0] online
PM2 log: App name:myapp id:0 disconnected
PM2 log: App [myapp:0] exited with code [0] via signal [SIGINT]
```

**Crash loop (fork mode, visible error):**
```
PM2 log: App [myapp:0] starting in -fork mode-
PM2 log: App [myapp:0] online
PM2 log: App [myapp:0] exited with code [1] via signal [SIGTERM]
```

**Memory limit restart:**
```
PM2 log: App [myapp:0] online
PM2 log: App [myapp:0] memory limit exceeded (420MB > 400MB)
PM2 log: App [myapp:0] exited with code [0] via signal [SIGTERM]
```

---

## SSH Investigation Checklist

When the GitHub Actions logs aren't enough, SSH into the EC2 instance:

```bash
ssh -i /path/to/key.pem ec2-user@<EC2_IP>
```

### 1. System Health
```bash
# Memory
free -m
# Disk
df -h /
# CPU load
uptime
# Running processes
ps aux --sort=-%mem | head -10
```

### 2. PM2 Status
```bash
pm2 list
pm2 describe <app-name>
pm2 logs <app-name> --lines 50
```

### 3. Application Files
```bash
# Check if dist exists and has content
ls -la /home/ec2-user/projects/<project>/backend/dist/
ls -la /home/ec2-user/projects/<project>/backend/dist/index.js

# Check if node_modules has critical packages
ls /home/ec2-user/projects/<project>/backend/node_modules/@graphql-tools/schema/ 2>/dev/null
ls /home/ec2-user/projects/<project>/backend/node_modules/ioredis/ 2>/dev/null
```

### 4. Direct Node Test (Most Valuable)
```bash
cd /home/ec2-user/projects/<project>/backend
# Stop PM2 first to free the port
pm2 stop <app-name>
# Run directly to see errors
node dist/index.js
# After seeing the error, restart the old code
pm2 start <app-name>
```

### 5. OOM Killer Check
```bash
# Check if kernel killed any processes
dmesg -T | grep -i "oom\|out of memory\|killed process"
```

### 6. Node.js Version
```bash
node --version
# Ensure it matches what CI uses
```

---

## Prevention Checklist

### For Every New Dependency

- [ ] Added to `dependencies` (not `devDependencies`) if used at runtime
- [ ] Lockfile (`pnpm-lock.yaml`) updated and committed
- [ ] Tested with `pnpm install --prod` locally

### For Every Deployment Workflow Change

- [ ] Health check uses polling, not fixed sleep
- [ ] Diagnostics template included for failure cases
- [ ] Rollback mechanism tested
- [ ] `pm2 update` NOT called before deployment (it restarts the daemon)

### For PM2 Configuration

- [ ] `exec_mode: 'fork'` when `instances: 1`
- [ ] `node_args: '--max-old-space-size=384'` on t2.micro
- [ ] `max_memory_restart` set appropriately
- [ ] `restart_delay` set (e.g., 5000ms) to prevent rapid restart loops

### For Redis/External Services

- [ ] All Redis connections use `lazyConnect: true`
- [ ] All Redis connections have `error` event handlers
- [ ] Retry strategies have max limits (don't retry forever)
- [ ] Server starts and serves health check even when Redis is down

### For EC2 Maintenance

- [ ] Disk usage checked (should be < 80%)
- [ ] Old deployment backups cleaned (keep only 2-3)
- [ ] PM2 logs rotated (use `pm2-logrotate` module)
- [ ] npm/pnpm cache pruned periodically

---

## Quick Reference: Ecosystem Config for t2.micro

```javascript
module.exports = {
  apps: [{
    name: 'myapp-backend',
    script: './dist/index.js',
    cwd: '/home/ec2-user/projects/myapp/backend',
    interpreter: 'node',
    node_args: '--max-old-space-size=384',  // Cap heap for 1GB RAM instance
    instances: 1,
    exec_mode: 'fork',                      // NOT cluster for single instance
    watch: false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 3023,
    },
    error_file: '/home/ec2-user/logs/myapp-error.log',
    out_file: '/home/ec2-user/logs/myapp-out.log',
    time: true,                              // Timestamp log entries
    restart_delay: 5000,                     // 5s between restarts
    max_restarts: 5,                         // Stop after 5 failures
  }]
};
```

---

## Timeline: Real Debugging Session (Feb 2026)

This guide was written from a real debugging session. Here's the timeline:

1. **New feature deployed** (v1.12.0 - vehicle tracking, 256 files changed)
2. **Deployment failed** - health check timed out after 15s, rollback succeeded
3. **First hypothesis: Redis crashes** - Fixed module-level `new Redis()` calls in 5 files to use lazy initialization. Still failed.
4. **Second hypothesis: Health check too short** - Increased from 15s to 45s polling. Still failed.
5. **SSH investigation** - PM2 internal log revealed process starts then immediately exits with SIGINT (code 0) in cluster mode. Zero application output.
6. **Third hypothesis: PM2 cluster mode** - Switched to fork mode. Still failed, BUT...
7. **Diagnostics captured the real error** - Added "Direct Node.js Test" to the deployment script. It revealed: `Error: Cannot find module '@graphql-tools/schema'`
8. **Root cause found** - `@graphql-tools/schema` was imported in `index.ts` but not in `package.json` dependencies. pnpm's strict resolution meant it wasn't available with `--prod` install.
9. **Fix applied** - Added the package to dependencies, pushed, deployment succeeded.

**Key lesson:** The real error was always a missing dependency. But PM2 cluster mode, missing diagnostics, and the red herring of Redis connections made it take 5 deployment attempts to diagnose. Adding the "Direct Node.js Test" diagnostic immediately revealed the actual error.

---

*Document Version: 1.0.0 | Last Updated: Feb 2026 | Author: QuikCarRental Engineering*
