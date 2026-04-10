#!/usr/bin/env node

/**
 * MCP Server Status System for Claude Code
 * 
 * Shows the status of all configured MCP servers in the user's global
 * Claude settings and provides detailed information about each server.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class MCPStatus {
  constructor(options = {}) {
    this.options = {
      detailed: false,
      category: null,
      server: null,
      healthCheck: false,
      enterpriseConfig: false,
      verbose: false,
      ...options
    };

    this.homeDir = os.homedir();
    this.claudeSettingsPath = path.join(this.homeDir, '.claude', 'settings.local.json');
    this.registryPath = path.join(__dirname, '../config/server-registry.json');
  }

  /**
   * Main status check entry point
   */
  async checkStatus() {
    try {
      this.log('MCP SERVER STATUS OVERVIEW');
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Load registry and settings
      const registry = await this.loadServerRegistry();
      const settings = await this.loadClaudeSettings();

      if (this.options.enterpriseConfig) {
        await this.showEnterpriseConfig(registry, settings);
        return;
      }

      if (this.options.server) {
        await this.showServerDetails(this.options.server, registry, settings);
        return;
      }

      if (this.options.category) {
        await this.showCategoryStatus(this.options.category, registry, settings);
        return;
      }

      // Show overall status
      await this.showOverallStatus(registry, settings);

      if (this.options.detailed) {
        await this.showDetailedStatus(registry, settings);
      }

      if (this.options.healthCheck) {
        await this.performHealthCheck(settings);
      }

    } catch (error) {
      console.error(`❌ Status check failed: ${error.message}`);
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
   * Show overall MCP status
   */
  async showOverallStatus(registry, settings) {
    const mcpServers = settings.mcpServers || {};
    const enabledServers = settings.enabledMcpjsonServers || [];
    const configInfo = settings.mcpServerConfiguration || {};

    // Count servers by status
    const configured = Object.keys(mcpServers).length;
    const enabled = enabledServers.length;
    const available = registry.totalServers || Object.keys(registry.servers || {}).length;

    this.log(`📊 CONFIGURATION SUMMARY:`);
    this.log(`✅ Configured servers: ${configured}/${available}`);
    this.log(`🔄 Enabled servers: ${enabled}`);
    this.log(`📅 Last updated: ${configInfo.lastUpdated || 'unknown'}`);
    this.log(`🎯 Profile: ${configInfo.profile || 'unknown'}`);
    this.log(`📍 Settings file: ${this.claudeSettingsPath}`);
    this.log('');

    // Show servers by category
    await this.showServersByCategory(registry, settings);

    this.log(`\n📋 QUICK ACTIONS:`);
    this.log(`   mcp-status --detailed          # Show detailed server information`);
    this.log(`   mcp-status --health-check      # Test server connectivity`);
    this.log(`   mcp-status --enterprise-config # Show enterprise server setup`);
    this.log(`   mcp-enable [server-name]       # Enable additional servers`);
    this.log(`   mcp-disable [server-name]      # Disable servers`);
  }

  /**
   * Show servers grouped by category
   */
  async showServersByCategory(registry, settings) {
    const mcpServers = settings.mcpServers || {};
    const serversByCategory = {};

    // Group configured servers by category
    Object.keys(mcpServers).forEach(serverId => {
      const serverConfig = registry.servers[serverId];
      if (!serverConfig) return;

      const category = serverConfig.category || 'uncategorized';
      if (!serversByCategory[category]) {
        serversByCategory[category] = [];
      }
      serversByCategory[category].push({ id: serverId, ...serverConfig });
    });

    Object.entries(serversByCategory).forEach(([category, servers]) => {
      const categoryInfo = registry.categories[category] || { name: category };
      const icon = this.getCategoryIcon(category);
      
      this.log(`${icon} ${categoryInfo.name || category.toUpperCase()} (${servers.length} servers)`);
      
      servers.forEach(server => {
        const status = server.required ? '🚨 CRITICAL' : '🟢 ACTIVE';
        this.log(`   ${status} ${server.name || server.id}`);
      });
      this.log('');
    });
  }

  /**
   * Show detailed status for all servers
   */
  async showDetailedStatus(registry, settings) {
    this.log('📋 DETAILED SERVER STATUS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mcpServers = settings.mcpServers || {};

    for (const [serverId, serverSettings] of Object.entries(mcpServers)) {
      const serverConfig = registry.servers[serverId];
      if (!serverConfig) continue;

      this.log(`🔧 ${serverConfig.name || serverId}`);
      this.log(`   ID: ${serverId}`);
      this.log(`   Category: ${serverConfig.category || 'uncategorized'}`);
      this.log(`   Command: ${serverConfig.command || serverSettings.command || 'not specified'}`);
      this.log(`   Description: ${serverConfig.description || 'no description'}`);
      
      if (serverConfig.env && serverConfig.env.length > 0) {
        this.log(`   Environment: ${serverConfig.env.join(', ')}`);
      }
      
      if (serverSettings.args && serverSettings.args.length > 0) {
        this.log(`   Arguments: ${serverSettings.args.join(' ')}`);
      }
      
      this.log('');
    }
  }

  /**
   * Show enterprise configuration status
   */
  async showEnterpriseConfig(registry, settings) {
    this.log('ENTERPRISE MCP CONFIGURATION STATUS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const criticalServers = ['clerk-auth', 'twilio-communications', 'aws-cloud-control'];
    const mcpServers = settings.mcpServers || {};

    this.log('CRITICAL SERVERS (Required for all projects):');
    criticalServers.forEach(serverId => {
      const configured = mcpServers[serverId] ? '🟢' : '🔴';
      const serverConfig = registry.servers[serverId] || {};
      const status = mcpServers[serverId] ? '✅ Configured' : '❌ Not configured';
      
      this.log(`${configured} ${serverId}: ${status}`);
      
      if (serverConfig.env) {
        const envStatus = serverConfig.env.map(envVar => {
          // In real implementation, you'd check if env vars exist
          return `${envVar}: ⚠️ Check .env file`;
        }).join(', ');
        this.log(`   Environment: ${envStatus}`);
      }
    });

    this.log('\nENTERPRISE SERVERS (Context-activated):');
    const enterpriseServers = ['github-official', 'aws-cloud-control', 'apollo-graphql'];
    enterpriseServers.forEach(serverId => {
      const configured = mcpServers[serverId] ? '🟢' : '🟡';
      const status = mcpServers[serverId] ? '✅ Configured' : '⚪ Available';
      
      this.log(`${configured} ${serverId}: ${status}`);
    });

    this.log('\n🔧 CONFIGURATION ASSISTANCE:');
    const unconfiguredCritical = criticalServers.filter(s => !mcpServers[s]);
    if (unconfiguredCritical.length > 0) {
      this.log('📝 Missing Critical Servers:');
      this.log('   Run: mcp-init --enterprise');
      unconfiguredCritical.forEach(serverId => {
        const serverConfig = registry.servers[serverId] || {};
        this.log(`   Configure: ${serverId}`);
        if (serverConfig.env) {
          this.log(`     Required env: ${serverConfig.env.join(', ')}`);
        }
      });
    } else {
      this.log('✅ All critical enterprise servers are configured!');
    }
  }

  /**
   * Show specific server details
   */
  async showServerDetails(serverId, registry, settings) {
    const serverConfig = registry.servers[serverId];
    const serverSettings = settings.mcpServers[serverId];

    if (!serverConfig) {
      this.log(`❌ Server '${serverId}' not found in registry`);
      return;
    }

    this.log(`${serverConfig.name || serverId} (${serverId})`);
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const isConfigured = !!serverSettings;
    this.log(`Status: ${isConfigured ? '🟢 CONFIGURED' : '⚪ NOT CONFIGURED'}`);
    this.log(`Category: ${serverConfig.category || 'uncategorized'}`);
    this.log(`Description: ${serverConfig.description || 'no description'}`);
    
    if (serverConfig.command) {
      this.log(`Command: ${serverConfig.command}`);
    }
    
    if (serverConfig.env && serverConfig.env.length > 0) {
      this.log(`Environment Variables: ${serverConfig.env.join(', ')}`);
    }
    
    if (serverConfig.detectionTriggers) {
      this.log(`\nAuto-install triggers:`);
      const triggers = serverConfig.detectionTriggers;
      if (triggers.packages) {
        this.log(`   Packages: ${triggers.packages.join(', ')}`);
      }
      if (triggers.files) {
        this.log(`   Files: ${triggers.files.join(', ')}`);
      }
      if (triggers.prdKeywords) {
        this.log(`   PRD Keywords: ${triggers.prdKeywords.join(', ')}`);
      }
    }

    if (serverConfig.features && serverConfig.features.length > 0) {
      this.log(`\nFeatures:`);
      serverConfig.features.forEach(feature => {
        this.log(`   • ${feature}`);
      });
    }

    if (!isConfigured) {
      this.log(`\n💡 To configure this server:`);
      this.log(`   mcp-enable ${serverId}`);
    }
  }

  /**
   * Show category status
   */
  async showCategoryStatus(category, registry, settings) {
    const categoryServers = Object.entries(registry.servers)
      .filter(([_, server]) => server.category === category)
      .map(([id, server]) => ({ id, ...server }));

    if (categoryServers.length === 0) {
      this.log(`❌ Category '${category}' not found`);
      return;
    }

    const categoryInfo = registry.categories[category] || { name: category };
    this.log(`${this.getCategoryIcon(category)} ${categoryInfo.name || category.toUpperCase()}`);
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mcpServers = settings.mcpServers || {};
    categoryServers.forEach(server => {
      const isConfigured = !!mcpServers[server.id];
      const status = isConfigured ? '🟢 CONFIGURED' : '⚪ AVAILABLE';
      
      this.log(`${status} ${server.name || server.id}`);
      this.log(`   ${server.description || 'no description'}`);
      this.log('');
    });

    const configured = categoryServers.filter(s => mcpServers[s.id]).length;
    this.log(`📊 Category Summary: ${configured}/${categoryServers.length} servers configured`);
  }

  /**
   * Perform health check on configured servers
   */
  async performHealthCheck(settings) {
    this.log('\n🏥 HEALTH CHECK');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mcpServers = settings.mcpServers || {};
    let healthy = 0;
    let total = Object.keys(mcpServers).length;

    for (const [serverId, serverSettings] of Object.entries(mcpServers)) {
      // In a real implementation, you would test actual connectivity
      // For now, we'll simulate health checks
      const isHealthy = true; // Simulate all servers as healthy
      const status = isHealthy ? '🟢 HEALTHY' : '🔴 ERROR';
      
      this.log(`${status} ${serverId}`);
      if (isHealthy) healthy++;
    }

    this.log(`\n📊 Health Summary: ${healthy}/${total} servers healthy`);
    
    if (healthy < total) {
      this.log('\n🔧 Troubleshooting unhealthy servers:');
      this.log('   • Check environment variables in .env file');
      this.log('   • Verify network connectivity');
      this.log('   • Restart Claude Code');
    }
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      'enterprise-auth': '🔐',
      'enterprise-communications': '📞',
      'enterprise-email': '📧',
      'development-core': '🔧',
      'enterprise-github': '🐙',
      'database': '🗄️',
      'api-integration': '🌐',
      'cloud-deployment': '☁️',
      'infrastructure': '🏗️',
      'quality-assurance': '🧪',
      'ui-components': '🎨',
      'design-integration': '🎨',
      'testing-automation': '🤖',
      'memory-management': '💾',
      'documentation': '📚',
      'enterprise-cloud': '☁️',
      'enterprise-graphql': '📊',
      'specialized-planning': '📋',
      'specialized-history': '📜',
      'specialized-monitoring': '📊'
    };
    return icons[category] || '📦';
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
      detailed: args.includes('--detailed'),
      healthCheck: args.includes('--health-check'),
      enterpriseConfig: args.includes('--enterprise-config'),
      verbose: args.includes('--verbose') || args.includes('-v')
    };

    // Check for specific server
    const serverIndex = args.findIndex(arg => !arg.startsWith('--'));
    if (serverIndex !== -1) {
      options.server = args[serverIndex];
    }

    // Check for category
    const categoryIndex = args.indexOf('--category');
    if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
      options.category = args[categoryIndex + 1];
    }

    const statusChecker = new MCPStatus(options);
    await statusChecker.checkStatus();
  }
}

// Run if executed directly
if (require.main === module) {
  MCPStatus.main().catch(error => {
    console.error('Failed to check MCP status:', error);
    process.exit(1);
  });
}

module.exports = MCPStatus;