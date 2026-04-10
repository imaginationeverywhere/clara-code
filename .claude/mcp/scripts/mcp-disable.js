#!/usr/bin/env node

/**
 * MCP Server Disable System for Claude Code
 * 
 * Disables specific MCP servers or server categories in the user's global
 * Claude settings with configuration preservation options.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class MCPDisable {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      category: null,
      dryRun: false,
      preserveConfig: true,
      temporary: false,
      duration: null,
      force: false,
      ...options
    };

    this.homeDir = os.homedir();
    this.claudeSettingsPath = path.join(this.homeDir, '.claude', 'settings.local.json');
    this.registryPath = path.join(__dirname, '../config/server-registry.json');
  }

  /**
   * Main disable entry point
   */
  async disableServers(serverIds = []) {
    try {
      this.log('🔇 DISABLING MCP SERVERS');
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Load registry and settings
      const registry = await this.loadServerRegistry();
      const settings = await this.loadClaudeSettings();

      let serversToDisable = [];

      if (this.options.category) {
        serversToDisable = this.getServersByCategory(this.options.category, registry, settings);
      } else if (serverIds.length > 0) {
        serversToDisable = serverIds;
      } else {
        this.log('❌ No servers specified. Use server names or --category');
        this.showUsageHelp();
        return;
      }

      if (serversToDisable.length === 0) {
        this.log('⚠️  No servers found to disable');
        return;
      }

      // Check for critical servers
      const criticalServers = serversToDisable.filter(id => {
        const server = registry.servers[id];
        return server && (server.required || server.critical);
      });

      if (criticalServers.length > 0 && !this.options.force) {
        this.log(`⚠️  WARNING: Attempting to disable critical servers: ${criticalServers.join(', ')}`);
        this.log('   Critical servers are essential for Claude Code boilerplate functionality');
        this.log('   Use --force to override this protection');
        return;
      }

      // Show disablement plan
      this.showDisablementPlan(serversToDisable, registry, settings);

      if (this.options.dryRun) {
        this.log('\n🔍 DRY RUN MODE - No changes will be made');
        return;
      }

      // Disable servers
      const results = await this.performDisablement(serversToDisable, registry, settings);
      
      // Show completion summary
      this.showCompletionSummary(results);

    } catch (error) {
      console.error(`❌ Server disablement failed: ${error.message}`);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Load server registry
   */
  async loadServerRegistry() {
    try {
      const registryData = await fs.readFile(this.registryPath, 'utf8');
      return JSON.parse(registryData);
    } catch (error) {
      throw new Error(`Failed to load server registry: ${error.message}`);
    }
  }

  /**
   * Load Claude settings
   */
  async loadClaudeSettings() {
    try {
      const settingsData = await fs.readFile(this.claudeSettingsPath, 'utf8');
      return JSON.parse(settingsData);
    } catch (error) {
      throw new Error(`Failed to load Claude settings. Run 'mcp-init' first.`);
    }
  }

  /**
   * Get configured servers by category
   */
  getServersByCategory(category, registry, settings) {
    const mcpServers = settings.mcpServers || {};
    
    return Object.keys(mcpServers).filter(serverId => {
      const server = registry.servers[serverId];
      return server && server.category === category;
    });
  }

  /**
   * Show disablement plan
   */
  showDisablementPlan(serversToDisable, registry, settings) {
    this.log('📦 SERVER DISABLEMENT PLAN');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mcpServers = settings.mcpServers || {};

    serversToDisable.forEach(serverId => {
      const server = registry.servers[serverId];
      const isConfigured = !!mcpServers[serverId];
      
      if (!isConfigured) {
        this.log(`⚪ ${serverId}: Not currently configured`);
        return;
      }

      const isCritical = server && (server.required || server.critical);
      const status = isCritical ? '🚨 CRITICAL (protected)' : '🔇 DISABLE';
      
      this.log(`${status} ${server?.name || serverId}`);
      this.log(`   Category: ${server?.category || 'uncategorized'}`);
      
      if (this.options.preserveConfig) {
        this.log(`   Configuration: Will be preserved for future re-enabling`);
      } else {
        this.log(`   Configuration: Will be completely removed`);
      }
      
      if (this.options.temporary && this.options.duration) {
        this.log(`   Duration: Temporarily disabled for ${this.options.duration}`);
      }
      
      this.log('');
    });

    this.log(`📊 Disablement Summary: ${serversToDisable.length} servers to process`);
  }

  /**
   * Perform server disablement
   */
  async performDisablement(serversToDisable, registry, settings) {
    this.log('\n🔇 DISABLING SERVERS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    if (!settings.enabledMcpjsonServers) {
      settings.enabledMcpjsonServers = [];
    }

    // Create backup if preserving configurations
    if (this.options.preserveConfig && !settings.disabledMcpServers) {
      settings.disabledMcpServers = {};
    }

    let disabled = 0;
    let skipped = 0;

    for (const serverId of serversToDisable) {
      const server = registry.servers[serverId];
      const isConfigured = !!settings.mcpServers[serverId];
      
      if (!isConfigured) {
        this.log(`⚪ Skipping ${serverId}: Not currently configured`);
        skipped++;
        continue;
      }

      const isCritical = server && (server.required || server.critical);
      if (isCritical && !this.options.force) {
        this.log(`🚨 Skipping ${serverId}: Critical server (use --force to override)`);
        skipped++;
        continue;
      }

      // Preserve configuration if requested
      if (this.options.preserveConfig) {
        settings.disabledMcpServers[serverId] = {
          ...settings.mcpServers[serverId],
          disabledAt: new Date().toISOString(),
          reason: 'user-disabled'
        };
      }

      // Remove from active configuration
      delete settings.mcpServers[serverId];
      
      // Remove from enabled list
      const enabledIndex = settings.enabledMcpjsonServers.indexOf(serverId);
      if (enabledIndex !== -1) {
        settings.enabledMcpjsonServers.splice(enabledIndex, 1);
      }

      this.log(`✅ Disabled: ${server?.name || serverId}`);
      disabled++;
    }

    // Update metadata
    settings.mcpServerConfiguration = {
      ...settings.mcpServerConfiguration || {},
      lastUpdated: new Date().toISOString(),
      lastDisabledServers: disabled,
      totalServers: Object.keys(settings.mcpServers).length,
      preserveConfig: this.options.preserveConfig
    };

    // Write settings file
    await fs.writeFile(this.claudeSettingsPath, JSON.stringify(settings, null, 2));

    return { disabled, skipped };
  }

  /**
   * Show completion summary
   */
  showCompletionSummary(results) {
    this.log('\n🎉 SERVER DISABLEMENT COMPLETE!');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.log('📊 DISABLEMENT SUMMARY:');
    this.log(`🔇 Successfully disabled: ${results.disabled} servers`);
    this.log(`⏩ Skipped (not configured/protected): ${results.skipped} servers`);
    this.log(`📁 Settings file: ${this.claudeSettingsPath}`);

    if (results.disabled > 0) {
      this.log('\n🚀 NEXT STEPS:');
      this.log('1. Restart Claude Code to deactivate disabled servers');
      this.log('2. Run `mcp-status` to verify current configuration');
      
      if (this.options.preserveConfig) {
        this.log('3. Use `mcp-enable [server]` to re-enable preserved servers');
      }
    }
  }

  /**
   * Show usage help
   */
  showUsageHelp() {
    this.log('\n📋 USAGE EXAMPLES:');
    this.log('   mcp-disable clerk-auth                     # Disable specific server');
    this.log('   mcp-disable --category testing-qa         # Disable category');
    this.log('   mcp-disable server1 server2 --force       # Force disable critical servers');
    this.log('   mcp-disable --category community --dry-run # Preview category disablement');
    this.log('\n🔧 OPTIONS:');
    this.log('   --preserve-config    # Keep server config for future re-enabling (default)');
    this.log('   --no-preserve       # Completely remove server configuration');
    this.log('   --temporary [time]  # Temporarily disable (future feature)');
    this.log('   --force             # Override critical server protection');
  }

  /**
   * Utility method for logging
   */
  log(message) {
    console.log(message);
  }

  /**
   * CLI interface
   */
  static async main() {
    const args = process.argv.slice(2);
    
    const options = {
      verbose: args.includes('--verbose') || args.includes('-v'),
      dryRun: args.includes('--dry-run'),
      preserveConfig: !args.includes('--no-preserve'),
      force: args.includes('--force')
    };

    // Check for category
    const categoryIndex = args.indexOf('--category');
    if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
      options.category = args[categoryIndex + 1];
    }

    // Check for temporary duration
    const temporaryIndex = args.indexOf('--temporary');
    if (temporaryIndex !== -1 && temporaryIndex + 1 < args.length) {
      options.temporary = true;
      options.duration = args[temporaryIndex + 1];
    }

    // Get server IDs (non-flag arguments)
    const serverIds = args.filter(arg => 
      !arg.startsWith('--') && 
      arg !== options.category && 
      arg !== options.duration
    );

    const disabler = new MCPDisable(options);
    await disabler.disableServers(serverIds);
  }
}

// Run if executed directly
if (require.main === module) {
  MCPDisable.main().catch(error => {
    console.error('Failed to disable MCP servers:', error);
    process.exit(1);
  });
}

module.exports = MCPDisable;