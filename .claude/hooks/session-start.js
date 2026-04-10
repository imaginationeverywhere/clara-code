#!/usr/bin/env node

/**
 * Claude Code SessionStart Hook
 * Triggers boilerplate-update-manager agent to check for updates
 */

const fs = require('fs');
const path = require('path');

// Quick check if this is a boilerplate project
function isBoilerplateProject() {
  const indicators = [
    '.boilerplate-manifest.json',
    '.claude/commands/update-boilerplate.md',
    '.claude/session-hooks.json'
  ];
  
  const cwd = process.cwd();
  return indicators.some(file => 
    fs.existsSync(path.join(cwd, file))
  );
}

if (isBoilerplateProject()) {
  // Signal Claude Code to invoke the agent
  // The agent will handle all the update checking logic
  console.log('INVOKE_AGENT:boilerplate-update-manager');
  console.log('CONTEXT:session-startup');
  console.log('ACTION:check-updates');
  console.log('REPOSITORY:git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git');
}

process.exit(0);