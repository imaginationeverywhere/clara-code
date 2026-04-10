#!/bin/bash
# protect-ip.sh — Strip platform IP from all Heru repos, symlink from boilerplate
# One-time operation on Mo's machine. Future: replaced by Auset CLI.
# Created: April 4, 2026

BOILERPLATE="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
BOILERPLATE_CLAUDE="$BOILERPLATE/.claude"
BOILERPLATE_CURSOR="$BOILERPLATE/.cursor"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AUSET IP PROTECTION — Worktree Symlink"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find all Herus (skip the boilerplate itself)
HERUS=$(find /Volumes/X10-Pro/Native-Projects/Quik-Nation \
             /Volumes/X10-Pro/Native-Projects/clients \
             /Volumes/X10-Pro/Native-Projects/apps \
        -maxdepth 2 -name ".claude" -type d 2>/dev/null | \
        sed 's/\/.claude$//' | \
        grep -v "quik-nation-ai-boilerplate" | \
        sort -u)

TOTAL=0
STRIPPED=0
SKIPPED=0

for HERU in $HERUS; do
    TOTAL=$((TOTAL + 1))
    NAME=$(basename "$HERU")

    echo -e "${YELLOW}[$TOTAL] $NAME${NC} — $HERU"

    # Skip if .claude/commands is already a symlink (already done)
    if [ -L "$HERU/.claude/commands" ]; then
        echo -e "  ${GREEN}✓ Already symlinked${NC}"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # --- STRIP .claude/commands/ (our IP) ---
    if [ -d "$HERU/.claude/commands" ]; then
        rm -rf "$HERU/.claude/commands"
        echo "  Removed .claude/commands/"
    fi

    # --- STRIP .claude/agents/ (our IP) ---
    if [ -d "$HERU/.claude/agents" ]; then
        rm -rf "$HERU/.claude/agents"
        echo "  Removed .claude/agents/"
    fi

    # --- STRIP .cursor/commands/ (our IP mirror) ---
    if [ -d "$HERU/.cursor/commands" ]; then
        rm -rf "$HERU/.cursor/commands"
        echo "  Removed .cursor/commands/"
    fi

    # --- STRIP .claude/plans/ (our architecture docs) ---
    if [ -d "$HERU/.claude/plans" ]; then
        rm -rf "$HERU/.claude/plans"
        echo "  Removed .claude/plans/"
    fi

    # --- CREATE SYMLINKS ---
    mkdir -p "$HERU/.claude" "$HERU/.cursor"

    ln -s "$BOILERPLATE_CLAUDE/commands" "$HERU/.claude/commands" 2>/dev/null && \
        echo "  → Symlinked .claude/commands"

    ln -s "$BOILERPLATE_CLAUDE/agents" "$HERU/.claude/agents" 2>/dev/null && \
        echo "  → Symlinked .claude/agents"

    if [ -d "$BOILERPLATE_CLAUDE/plans" ]; then
        ln -s "$BOILERPLATE_CLAUDE/plans" "$HERU/.claude/plans" 2>/dev/null && \
            echo "  → Symlinked .claude/plans"
    fi

    ln -s "$BOILERPLATE_CURSOR/commands" "$HERU/.cursor/commands" 2>/dev/null && \
        echo "  → Symlinked .cursor/commands"

    # --- ADD TO .gitignore (so IP never gets committed again) ---
    GITIGNORE="$HERU/.gitignore"
    if [ -f "$GITIGNORE" ]; then
        # Only add if not already there
        grep -q ".claude/commands" "$GITIGNORE" 2>/dev/null || echo -e "\n# Auset Platform IP (symlinked, never committed)\n.claude/commands/\n.claude/agents/\n.claude/plans/\n.cursor/commands/" >> "$GITIGNORE"
    fi

    STRIPPED=$((STRIPPED + 1))
    echo -e "  ${GREEN}✓ Protected${NC}"
    echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Total Herus:    $TOTAL"
echo -e "  ${GREEN}Stripped + Symlinked: $STRIPPED${NC}"
echo -e "  Already done:   $SKIPPED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "IP protected. Prompts stay in the boilerplate."
echo "Future: Auset CLI replaces this script."
