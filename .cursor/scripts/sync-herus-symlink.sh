#!/bin/bash
# sync-herus-symlink.sh — Replace copied command/agent dirs with symlinks to boilerplate
# Run once. After this, all Herus read from the boilerplate source directly. Zero copy.

SRC="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
LINKED=0
SKIPPED=0
ERRORS=0
LOG=""

# Discover all Heru projects
HERUS=(
$(find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules | grep -v ".git/" | grep -v quik-nation-ai-boilerplate \
  | sed 's|/.claude$||' | sort)
)

echo "╔══════════════════════════════════════════╗"
echo "║  SYMLINK SETUP — ${#HERUS[@]} Herus found       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

for PROJECT in "${HERUS[@]}"; do
  NAME=$(basename "$PROJECT")
  
  # --- .claude/commands ---
  if [ -L "$PROJECT/.claude/commands" ]; then
    # Already a symlink — skip
    LOG+="  $NAME/.claude/commands ... ALREADY LINKED\n"
  else
    # Remove existing directory (it's all copied files anyway)
    rm -rf "$PROJECT/.claude/commands" 2>/dev/null
    ln -sf "$SRC/.claude/commands" "$PROJECT/.claude/commands"
    if [ $? -eq 0 ]; then
      LOG+="  $NAME/.claude/commands ... LINKED ✓\n"
    else
      LOG+="  $NAME/.claude/commands ... ERROR\n"
      ERRORS=$((ERRORS + 1))
    fi
  fi
  
  # --- .claude/agents ---
  if [ -L "$PROJECT/.claude/agents" ]; then
    LOG+="  $NAME/.claude/agents ... ALREADY LINKED\n"
  else
    rm -rf "$PROJECT/.claude/agents" 2>/dev/null
    ln -sf "$SRC/.claude/agents" "$PROJECT/.claude/agents"
    if [ $? -eq 0 ]; then
      LOG+="  $NAME/.claude/agents ... LINKED ✓\n"
    else
      LOG+="  $NAME/.claude/agents ... ERROR\n"
      ERRORS=$((ERRORS + 1))
    fi
  fi
  
  # --- .claude/plans/micro ---
  if [ -d "$SRC/.claude/plans/micro" ]; then
    mkdir -p "$PROJECT/.claude/plans" 2>/dev/null
    if [ -L "$PROJECT/.claude/plans/micro" ]; then
      LOG+="  $NAME/.claude/plans/micro ... ALREADY LINKED\n"
    else
      rm -rf "$PROJECT/.claude/plans/micro" 2>/dev/null
      ln -sf "$SRC/.claude/plans/micro" "$PROJECT/.claude/plans/micro"
    fi
  fi
  
  # --- .cursor mirrors ---
  if [ -d "$PROJECT/.cursor" ] || [ -L "$PROJECT/.cursor/commands" ]; then
    mkdir -p "$PROJECT/.cursor" 2>/dev/null
    
    if [ ! -L "$PROJECT/.cursor/commands" ]; then
      rm -rf "$PROJECT/.cursor/commands" 2>/dev/null
      ln -sf "$SRC/.claude/commands" "$PROJECT/.cursor/commands"
      LOG+="  $NAME/.cursor/commands ... LINKED ✓\n"
    fi
    
    if [ ! -L "$PROJECT/.cursor/agents" ]; then
      rm -rf "$PROJECT/.cursor/agents" 2>/dev/null
      ln -sf "$SRC/.claude/agents" "$PROJECT/.cursor/agents"
      LOG+="  $NAME/.cursor/agents ... LINKED ✓\n"
    fi
    
    if [ -d "$SRC/.claude/plans/micro" ]; then
      mkdir -p "$PROJECT/.cursor/plans" 2>/dev/null
      if [ ! -L "$PROJECT/.cursor/plans/micro" ]; then
        rm -rf "$PROJECT/.cursor/plans/micro" 2>/dev/null
        ln -sf "$SRC/.claude/plans/micro" "$PROJECT/.cursor/plans/micro"
      fi
    fi
  fi
  
  LINKED=$((LINKED + 1))
done

echo -e "$LOG"
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  DONE: $LINKED Herus symlinked            ║"
echo "║  Errors: $ERRORS                           ║"
echo "║                                          ║"
echo "║  All Herus now read LIVE from boilerplate║"
echo "║  Update once → all Herus see it instantly║"
echo "╚══════════════════════════════════════════╝"
