#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AMPLIFY PRE-FLIGHT — Run before first deploy
# Catches the 13 common failures BEFORE pushing
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
WARN=0

check_pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS+1)); }
check_fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL+1)); }
check_warn() { echo -e "  ${YELLOW}⚠${NC} $1"; WARN=$((WARN+1)); }

echo ""
echo -e "${BOLD}AMPLIFY PRE-FLIGHT CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect frontend directory
FRONTEND_DIR=""
if [ -d "frontend" ]; then
    FRONTEND_DIR="frontend"
elif [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
    FRONTEND_DIR="."
else
    echo -e "${RED}ERROR: No frontend directory or next.config found${NC}"
    echo "Run this from the project root (with frontend/ dir) or from the Next.js app directory"
    exit 1
fi

echo -e "${BOLD}1. AMPLIFY.YML${NC}"
if [ -f "amplify.yml" ]; then
    check_pass "amplify.yml exists at project root"

    # Check baseDirectory
    if grep -q "baseDirectory" amplify.yml; then
        BASE_DIR=$(grep "baseDirectory" amplify.yml | head -1 | sed 's/.*baseDirectory: //' | tr -d ' "'"'"'')
        if [ -d "$BASE_DIR" ] || [ "$BASE_DIR" = "frontend/.next" ] || [ "$BASE_DIR" = ".next" ]; then
            check_pass "baseDirectory: $BASE_DIR"
        else
            check_warn "baseDirectory '$BASE_DIR' — verify this matches your build output"
        fi
    else
        check_fail "No baseDirectory in amplify.yml"
    fi

    # Check build commands
    if grep -q "npm run build\|pnpm build\|yarn build" amplify.yml; then
        check_pass "Build command found"
    else
        check_warn "No standard build command found in amplify.yml"
    fi

    # Check for Node version
    if grep -q "nvm\|NODE_VERSION\|node:" amplify.yml; then
        check_pass "Node version specified"
    else
        check_warn "No Node version specified — Amplify defaults to Node 18 (you probably need 20)"
    fi

    # Check for pnpm support
    if [ -f "pnpm-lock.yaml" ] || [ -f "$FRONTEND_DIR/pnpm-lock.yaml" ]; then
        if grep -q "pnpm" amplify.yml; then
            check_pass "pnpm detected and configured in amplify.yml"
        else
            check_fail "pnpm-lock.yaml found but amplify.yml doesn't install pnpm — add 'npm i -g pnpm' to preBuild"
        fi
    fi
else
    check_fail "amplify.yml NOT FOUND — Amplify needs this file"
    echo "    Create amplify.yml at project root. Example:"
    echo "    version: 1"
    echo "    frontend:"
    echo "      phases:"
    echo "        preBuild:"
    echo "          commands:"
    echo "            - nvm use 20"
    echo "            - cd frontend && npm ci"
    echo "        build:"
    echo "          commands:"
    echo "            - npm run build"
    echo "      artifacts:"
    echo "        baseDirectory: frontend/.next"
    echo "        files: '**/*'"
fi

echo ""
echo -e "${BOLD}2. NEXT.JS CONFIG${NC}"
NEXT_CONFIG=""
for f in "$FRONTEND_DIR/next.config.js" "$FRONTEND_DIR/next.config.mjs" "$FRONTEND_DIR/next.config.ts"; do
    if [ -f "$f" ]; then NEXT_CONFIG="$f"; break; fi
done

if [ -n "$NEXT_CONFIG" ]; then
    check_pass "Next config found: $NEXT_CONFIG"

    # Check for output standalone (problematic on Amplify)
    if grep -q "output.*standalone" "$NEXT_CONFIG"; then
        check_warn "output: 'standalone' detected — Amplify SSR works with default output, not standalone"
    else
        check_pass "No standalone output (good for Amplify)"
    fi

    # Check image optimization
    if grep -q "unoptimized" "$NEXT_CONFIG"; then
        check_pass "Image optimization configured"
    elif grep -q "images" "$NEXT_CONFIG"; then
        check_pass "Image config found"
    else
        check_warn "No image config — add images: { unoptimized: true } or configure a custom loader for Amplify"
    fi
else
    check_fail "No next.config.js/mjs/ts found in $FRONTEND_DIR"
fi

echo ""
echo -e "${BOLD}3. PACKAGE.JSON${NC}"
PKG="$FRONTEND_DIR/package.json"
if [ -f "$PKG" ]; then
    check_pass "package.json found"

    # Check Next.js version
    NEXT_VER=$(grep '"next"' "$PKG" | head -1 | sed 's/.*: *"//' | tr -d '",^ ')
    if [ -n "$NEXT_VER" ]; then
        if echo "$NEXT_VER" | grep -q "^16\|^17"; then
            check_fail "Next.js $NEXT_VER — Amplify does NOT support Next.js 16+ yet. Use 15.5.9"
        elif echo "$NEXT_VER" | grep -q "^15"; then
            check_pass "Next.js $NEXT_VER (Amplify compatible)"
        elif echo "$NEXT_VER" | grep -q "^14"; then
            check_pass "Next.js $NEXT_VER (Amplify compatible)"
        else
            check_warn "Next.js version: $NEXT_VER — verify Amplify compatibility"
        fi
    fi

    # Check for caret versions on critical deps
    if grep -q '"next": "\^' "$PKG"; then
        check_warn "Next.js version has ^ prefix — pin it exactly (e.g., \"15.5.9\" not \"^15.5.9\")"
    fi

    # Check for build script
    if grep -q '"build"' "$PKG"; then
        check_pass "Build script exists"
    else
        check_fail "No build script in package.json"
    fi

    # Check for type-check script
    if grep -q '"type-check"\|"typecheck"\|"tsc"' "$PKG"; then
        check_pass "Type check script exists"
    else
        check_warn "No type-check script — add \"type-check\": \"tsc --noEmit\" to catch TS errors before deploy"
    fi
else
    check_fail "No package.json in $FRONTEND_DIR"
fi

echo ""
echo -e "${BOLD}4. ENVIRONMENT VARIABLES${NC}"
# Check for .env files
ENV_COUNT=0
for env_file in "$FRONTEND_DIR/.env" "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env.production" ".env" ".env.local" ".env.production"; do
    if [ -f "$env_file" ]; then
        ((ENV_COUNT++))
    fi
done

if [ $ENV_COUNT -gt 0 ]; then
    check_pass "$ENV_COUNT env file(s) found locally"
else
    check_warn "No .env files found — make sure env vars are set in Amplify Console"
fi

# Check for NEXT_PUBLIC vars in code that might be missing
if [ -d "$FRONTEND_DIR/src" ] || [ -d "$FRONTEND_DIR/app" ]; then
    NEXT_PUBLIC_VARS=$(grep -r "NEXT_PUBLIC_" "$FRONTEND_DIR/src" "$FRONTEND_DIR/app" 2>/dev/null | grep -oP 'NEXT_PUBLIC_\w+' | sort -u)
    if [ -n "$NEXT_PUBLIC_VARS" ]; then
        MISSING=0
        while IFS= read -r var; do
            # Check if defined in any env file or amplify.yml
            FOUND=false
            for env_file in "$FRONTEND_DIR/.env" "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env.production" ".env" ".env.local" ".env.production"; do
                if [ -f "$env_file" ] && grep -q "$var" "$env_file"; then
                    FOUND=true
                    break
                fi
            done
            if [ "$FOUND" = false ]; then
                check_warn "Code uses $var but not found in any .env file — set in Amplify Console"
                ((MISSING++))
            fi
        done <<< "$NEXT_PUBLIC_VARS"
        if [ $MISSING -eq 0 ]; then
            check_pass "All NEXT_PUBLIC_* vars defined"
        fi
    fi
fi

echo ""
echo -e "${BOLD}5. BUILD TEST${NC}"
echo "  Running npm run build in $FRONTEND_DIR..."
cd "$FRONTEND_DIR"

# TypeScript check first
if [ -f "tsconfig.json" ]; then
    echo "  Running tsc --noEmit..."
    if npx tsc --noEmit 2>/dev/null; then
        check_pass "TypeScript compiles clean"
    else
        check_fail "TypeScript errors — fix before deploying"
        echo "    Run: cd $FRONTEND_DIR && npx tsc --noEmit"
    fi
fi

# Actual build
if npm run build > /tmp/amplify-preflight-build.log 2>&1; then
    check_pass "Build succeeded"

    # Verify output exists
    if [ -d ".next" ]; then
        check_pass ".next directory created"
        SIZE=$(du -sh .next 2>/dev/null | cut -f1)
        echo -e "    Build size: $SIZE"
    else
        check_fail ".next directory not found after build"
    fi
else
    check_fail "Build FAILED — see /tmp/amplify-preflight-build.log"
    echo "    Last 10 lines:"
    tail -10 /tmp/amplify-preflight-build.log | sed 's/^/    /'
fi

cd - > /dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}RESULTS${NC}"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${YELLOW}Warnings: $WARN${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}${BOLD}PRE-FLIGHT PASSED${NC} — Safe to deploy to Amplify"
    exit 0
else
    echo -e "${RED}${BOLD}PRE-FLIGHT FAILED${NC} — Fix $FAIL issue(s) before deploying"
    exit 1
fi
