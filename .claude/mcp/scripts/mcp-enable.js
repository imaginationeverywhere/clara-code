#!/usr/bin/env node

/**
 * MCP Server Enable System for Claude Code
 * 
 * Enables specific MCP servers or server categories in the user's global
 * Claude settings with intelligent configuration and validation.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class MCPEnable {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      category: null,
      dryRun: false,
      autoDetect: false,
      force: false,
      ...options
    };

    this.homeDir = os.homedir();
    this.claudeSettingsPath = path.join(this.homeDir, '.claude', 'settings.local.json');
    this.registryPath = path.join(__dirname, '../config/server-registry.json');
    this.projectRoot = process.cwd();
  }

  /**
   * Main enable entry point
   */
  async enableServers(serverIds = []) {
    try {
      this.log('🔧 ENABLING MCP SERVERS');
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Load registry and settings
      const registry = await this.loadServerRegistry();
      const settings = await this.loadClaudeSettings();

      let serversToEnable = [];

      if (this.options.category) {
        serversToEnable = this.getServersByCategory(this.options.category, registry);
      } else if (this.options.autoDetect) {
        serversToEnable = await this.detectRelevantServers(registry);
      } else if (serverIds.length > 0) {
        serversToEnable = serverIds;
      } else {
        this.log('❌ No servers specified. Use server names, --category, or --auto-detect');
        this.showUsageHelp();
        return;
      }

      if (serversToEnable.length === 0) {
        this.log('⚠️  No servers found to enable');
        return;
      }

      // Show enablement plan
      this.showEnablementPlan(serversToEnable, registry, settings);

      if (this.options.dryRun) {
        this.log('\n🔍 DRY RUN MODE - No changes will be made');
        return;
      }

      // Enable servers
      const results = await this.performEnablement(serversToEnable, registry, settings);
      
      // Show completion summary
      this.showCompletionSummary(results);

    } catch (error) {
      console.error(`❌ Server enablement failed: ${error.message}`);
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
   * Get servers by category
   */
  getServersByCategory(category, registry) {
    const categoryConfig = registry.categories[category];
    if (!categoryConfig) {
      this.log(`❌ Category '${category}' not found`);
      this.log('\nAvailable categories:');
      Object.keys(registry.categories).forEach(cat => {
        this.log(`   • ${cat}`);
      });
      return [];
    }

    return Object.entries(registry.servers)
      .filter(([_, server]) => server.category === category)
      .map(([id, _]) => id);
  }

  /**
   * Auto-detect relevant servers based on project context
   */
  async detectRelevantServers(registry) {
    this.log('🔍 Auto-detecting relevant servers for current project...\n');
    
    const relevantServers = [];

    // Simple detection logic based on files and packages
    try {
      // Check for package.json dependencies
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageData = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageData);
      const packages = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
      ];

      // Check each server's detection triggers
      Object.entries(registry.servers).forEach(([serverId, server]) => {
        if (this.shouldEnableServer(serverId, server, packages)) {
          relevantServers.push(serverId);
          this.log(`✅ Detected: ${serverId} (${server.name})`);
        }
      });

    } catch (error) {
      this.log('⚠️  Could not analyze project for auto-detection');
    }

    return relevantServers;
  }

  /**
   * Check if server should be enabled based on triggers
   */
  shouldEnableServer(serverId, server, packages) {
    const triggers = server.detectionTriggers || {};

    // Always enable if specified
    if (triggers.always) return true;

    // Check package triggers
    if (triggers.packages) {
      const hasPackage = triggers.packages.some(pkg => 
        packages.some(detectedPkg => detectedPkg.includes(pkg))
      );
      if (hasPackage) return true;
    }

    // Check if it's a critical server
    if (server.required || server.autoInstall) return true;

    return false;
  }

  /**
   * Show enablement plan
   */
  showEnablementPlan(serversToEnable, registry, settings) {
    this.log('📦 SERVER ENABLEMENT PLAN');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mcpServers = settings.mcpServers || {};

    serversToEnable.forEach(serverId => {
      const server = registry.servers[serverId];
      if (!server) {
        this.log(`❌ ${serverId}: Server not found in registry`);
        return;
      }

      const isAlreadyConfigured = !!mcpServers[serverId];
      const status = isAlreadyConfigured ? 
        (this.options.force ? '🔄 RECONFIGURE' : '⚠️  ALREADY CONFIGURED') : 
        '✅ ENABLE';
      
      this.log(`${status} ${server.name || serverId}`);
      this.log(`   Category: ${server.category || 'uncategorized'}`);
      this.log(`   Command: ${server.command || 'not specified'}`);
      
      if (server.env && server.env.length > 0) {
        this.log(`   Environment needed: ${server.env.join(', ')}`);
      }
      
      this.log('');
    });

    this.log(`📊 Enablement Summary: ${serversToEnable.length} servers to process`);
  }

  /**
   * Perform server enablement
   */
  async performEnablement(serversToEnable, registry, settings) {
    this.log('\n⚙️  CONFIGURING SERVERS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    if (!settings.enabledMcpjsonServers) {
      settings.enabledMcpjsonServers = [];
    }

    let enabled = 0;
    let skipped = 0;

    for (const serverId of serversToEnable) {
      const server = registry.servers[serverId];
      if (!server) {
        this.log(`❌ Skipping ${serverId}: Not found in registry`);
        skipped++;
        continue;
      }

      const isAlreadyConfigured = !!settings.mcpServers[serverId];
      
      if (isAlreadyConfigured && !this.options.force) {
        this.log(`⚠️  Skipping ${serverId}: Already configured (use --force to reconfigure)`);
        skipped++;
        continue;
      }

      // Configure server
      const serverConfig = this.generateServerConfig(serverId, server);
      settings.mcpServers[serverId] = serverConfig;
      
      // Add to enabled list if not already there
      if (!settings.enabledMcpjsonServers.includes(serverId)) {
        settings.enabledMcpjsonServers.push(serverId);
      }

      this.log(`✅ Configured: ${server.name || serverId}`);
      enabled++;
    }

    // Update metadata
    settings.mcpServerConfiguration = {
      ...settings.mcpServerConfiguration || {},
      lastUpdated: new Date().toISOString(),
      lastEnabledServers: enabled,
      totalServers: Object.keys(settings.mcpServers).length
    };

    // Write settings file
    await fs.writeFile(this.claudeSettingsPath, JSON.stringify(settings, null, 2));

    return { enabled, skipped };
  }

  /**
   * Generate server configuration
   */
  generateServerConfig(serverId, server) {
    const config = {
      command: server.command
    };

    // Add arguments if specified
    if (server.args && server.args.length > 0) {
      config.args = server.args.map(arg => 
        arg.replace('{{PROJECT_ROOT}}', this.projectRoot)
      );
    } else {
      config.args = [];
    }

    // Add environment variables if specified
    if (server.env && server.env.length > 0) {
      config.env = {};
      server.env.forEach(envVar => {
        config.env[envVar] = `\${${envVar}}`;
      });
    }

    return config;
  }

  /**
   * Show completion summary
   */
  showCompletionSummary(results) {
    this.log('\n🎉 SERVER ENABLEMENT COMPLETE!');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.log('📊 ENABLEMENT SUMMARY:');
    this.log(`✅ Successfully enabled: ${results.enabled} servers`);
    this.log(`⏩ Skipped (already configured): ${results.skipped} servers`);
    this.log(`📁 Settings file: ${this.claudeSettingsPath}`);

    if (results.enabled > 0) {
      this.log('\n🚀 NEXT STEPS:');
      this.log('1. Restart Claude Code to activate new servers');
      this.log('2. Add required environment variables to your .env file');
      this.log('3. Run `mcp-status --health-check` to verify connectivity');
      
      this.log('\n💡 USAGE:');
      this.log('• Enhanced Claude Code commands now available');
      this.log('• Use `mcp-status --detailed` to see all enabled servers');
    }
  }

  /**
   * Show usage help
   */
  showUsageHelp() {
    this.log('\n📋 USAGE EXAMPLES:');
    this.log('   mcp-enable clerk-auth twilio-communications  # Enable specific servers');
    this.log('   mcp-enable --category enterprise-auth       # Enable category');
    this.log('   mcp-enable --auto-detect                    # Auto-detect and enable');
    this.log('   mcp-enable --category community --dry-run   # Preview category enablement');
    this.log('\n📂 AVAILABLE CATEGORIES:');
    this.log('   enterprise-auth, enterprise-communications, enterprise-email');
    this.log('   development-core, database, api-integration, testing-qa');
    this.log('   community, specialized-advanced, enterprise-integration');
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
      autoDetect: args.includes('--auto-detect'),
      force: args.includes('--force')
    };

    // Check for category
    const categoryIndex = args.indexOf('--category');
    if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
      options.category = args[categoryIndex + 1];
    }

    // Get server IDs (non-flag arguments)
    const serverIds = args.filter(arg => !arg.startsWith('--') && arg !== options.category);

    const enabler = new MCPEnable(options);
    await enabler.enableServers(serverIds);
  }
}

// Run if executed directly
if (require.main === module) {
  MCPEnable.main().catch(error => {
    console.error('Failed to enable MCP servers:', error);
    process.exit(1);
  });
}

module.exports = MCPEnable;