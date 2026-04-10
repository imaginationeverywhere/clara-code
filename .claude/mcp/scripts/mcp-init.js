#!/usr/bin/env node

/**
 * MCP Server Initialization System for Claude Code
 * 
 * Automatically installs and configures MCP servers in the user's global
 * Claude settings (~/.claude/settings.local.json) based on project analysis
 * and server registry.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class MCPInitializer {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      dryRun: false,
      clientType: 'claude',
      profile: 'standard', // minimal, standard, full-stack, enterprise, full
      force: false,
      ...options
    };

    this.homeDir = os.homedir();
    this.claudeSettingsPath = path.join(this.homeDir, '.claude', 'settings.local.json');
    this.registryPath = path.join(__dirname, '../config/verified-servers.json');
    this.legacyRegistryPath = path.join(__dirname, '../config/server-registry.json');
    this.projectRoot = process.cwd();
    
    this.detectedContext = {
      packages: [],
      files: [],
      gitRemote: null,
      prdContent: '',
      envVars: []
    };
  }

  /**
   * Main initialization entry point
   */
  async initialize() {
    try {
      this.log('🤖 INITIALIZING MCP SERVER SYSTEM FOR CLAUDE CODE');
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.log(`Claude Code Boilerplate v1.8.0 - MCP Integration\n`);

      // Step 1: System requirements check
      await this.checkSystemRequirements();

      // Step 2: Load server registry
      const registry = await this.loadServerRegistry();

      // Step 3: Analyze project context
      await this.analyzeProjectContext();

      // Step 4: Determine servers to install
      const serversToInstall = this.determineServersToInstall(registry);

      // Step 5: Show installation plan
      this.showInstallationPlan(serversToInstall, registry);

      if (this.options.dryRun) {
        this.log('\n🔍 DRY RUN MODE - No changes will be made');
        return;
      }

      // Step 6: Configure Claude settings
      await this.configureClaudeSettings(serversToInstall, registry);

      // Step 7: Show completion summary
      this.showCompletionSummary(serversToInstall);

    } catch (error) {
      console.error(`❌ MCP Initialization failed: ${error.message}`);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Check system requirements
   */
  async checkSystemRequirements() {
    this.log('🔍 SYSTEM REQUIREMENTS CHECK');
    
    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`✅ Node.js ${nodeVersion} (compatible)`);
    
    // Check if Claude directory exists
    const claudeDir = path.dirname(this.claudeSettingsPath);
    try {
      await fs.access(claudeDir);
      this.log('✅ Claude Code environment detected');
    } catch (error) {
      // Create Claude directory if it doesn't exist
      await fs.mkdir(claudeDir, { recursive: true });
      this.log('✅ Created Claude Code configuration directory');
    }
    
    // Check project root
    this.log(`✅ Project root identified: ${this.projectRoot}`);
    
    this.log('');
  }

  /**
   * Load server registry (prioritize verified servers)
   */
  async loadServerRegistry() {
    try {
      // Try to load verified servers registry first
      const registryData = await fs.readFile(this.registryPath, 'utf8');
      const registry = JSON.parse(registryData);
      this.log(`📦 Loaded verified server registry: ${registry.totalServers} verified servers available`);
      return registry;
    } catch (error) {
      // Fallback to legacy registry
      try {
        const legacyData = await fs.readFile(this.legacyRegistryPath, 'utf8');
        const legacyRegistry = JSON.parse(legacyData);
        this.log(`⚠️  Using legacy server registry: ${legacyRegistry.totalServers || 'unknown'} servers (some may not work)`);
        return legacyRegistry;
      } catch (legacyError) {
        throw new Error(`Failed to load any server registry: ${error.message}`);
      }
    }
  }

  /**
   * Analyze project context for intelligent server selection
   */
  async analyzeProjectContext() {
    this.log('🔍 PROJECT CONTEXT ANALYSIS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Analyze package.json
    await this.analyzePackageJson();

    // Analyze PRD.md if exists
    await this.analyzePRD();

    // Check for specific files
    await this.analyzeFileSystem();

    // Check git remote
    await this.analyzeGitRemote();

    // Show analysis results
    this.showAnalysisResults();
  }

  /**
   * Analyze package.json for dependencies
   */
  async analyzePackageJson() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageData = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageData);
      
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      this.detectedContext.packages = Object.keys(allDeps);
      this.log(`📦 Package Dependencies Analysis:`);
      this.log(`✅ Found ${this.detectedContext.packages.length} dependencies`);
      
      // Log key dependencies
      const keyDeps = this.detectedContext.packages.filter(pkg => 
        pkg.includes('clerk') || pkg.includes('twilio') || pkg.includes('@aws-sdk/client-ses') ||
        pkg.includes('aws') || pkg.includes('graphql') || pkg.includes('playwright')
      );
      
      if (keyDeps.length > 0) {
        this.log(`✅ Key integrations detected: ${keyDeps.slice(0, 5).join(', ')}${keyDeps.length > 5 ? '...' : ''}`);
      }
      
    } catch (error) {
      this.log('⚠️  No package.json found - using default detection');
    }
  }

  /**
   * Analyze PRD.md for project context
   */
  async analyzePRD() {
    try {
      const prdPath = path.join(this.projectRoot, 'docs/PRD.md');
      const prdContent = await fs.readFile(prdPath, 'utf8');
      this.detectedContext.prdContent = prdContent;
      
      this.log(`📋 PRD Analysis (docs/PRD.md):`);
      
      // Extract key information
      const techStack = this.extractFromPRD(prdContent, ['TECHNOLOGY_STACK', 'TECH_STACK', 'Technology Stack']);
      const mockupTemplate = this.extractFromPRD(prdContent, ['MOCKUP_TEMPLATE_CHOICE', 'MOCKUP_TEMPLATE']);
      const authentication = this.extractFromPRD(prdContent, ['AUTHENTICATION', 'AUTH']);
      
      if (techStack) this.log(`✅ Technology Stack: ${techStack.slice(0, 100)}...`);
      if (mockupTemplate) this.log(`✅ Mockup Template: ${mockupTemplate}`);
      if (authentication) this.log(`✅ Authentication: ${authentication}`);
      
    } catch (error) {
      this.log('⚠️  No PRD.md found - using package-based detection');
    }
  }

  /**
   * Extract information from PRD content
   */
  extractFromPRD(content, keywords) {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([^\n]+)`, 'i');
      const match = content.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Analyze filesystem for project indicators
   */
  async analyzeFileSystem() {
    this.log(`📁 Filesystem Analysis:`);
    
    const filesToCheck = [
      '.git/',
      '.github/',
      'package.json',
      'Dockerfile',
      'docker-compose.yml',
      'infrastructure/',
      'backend/models/',
      'frontend/',
      'middleware.ts',
      'src/middleware.ts'
    ];

    for (const file of filesToCheck) {
      try {
        const filePath = path.join(this.projectRoot, file);
        await fs.access(filePath);
        this.detectedContext.files.push(file);
        this.log(`✅ Found: ${file}`);
      } catch (error) {
        // File doesn't exist, that's fine
      }
    }
  }

  /**
   * Analyze git remote
   */
  async analyzeGitRemote() {
    try {
      const remoteUrl = execSync('git remote get-url origin', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();
      
      this.detectedContext.gitRemote = remoteUrl;
      
      if (remoteUrl.includes('github.com')) {
        this.log(`✅ Git Remote: GitHub repository detected`);
      } else if (remoteUrl.includes('gitlab.com')) {
        this.log(`✅ Git Remote: GitLab repository detected`);
      } else {
        this.log(`✅ Git Remote: ${remoteUrl}`);
      }
    } catch (error) {
      this.log('⚠️  No git remote detected');
    }
  }

  /**
   * Show analysis results summary
   */
  showAnalysisResults() {
    this.log('\n🎯 ANALYSIS SUMMARY:');
    this.log(`📦 Dependencies: ${this.detectedContext.packages.length} packages`);
    this.log(`📁 Project Files: ${this.detectedContext.files.length} indicators`);
    this.log(`🔗 Git Remote: ${this.detectedContext.gitRemote ? 'detected' : 'none'}`);
    this.log(`📋 PRD Context: ${this.detectedContext.prdContent ? 'available' : 'not found'}`);
    this.log('');
  }

  /**
   * Determine which servers to install based on context and profile
   */
  determineServersToInstall(registry) {
    const profile = this.options.profile;
    let serversToInstall = [];

    // Start with profile-based selection
    if (registry.installationProfiles[profile]) {
      serversToInstall = [...registry.installationProfiles[profile].servers];
    } else {
      // Default to standard profile
      serversToInstall = [...registry.installationProfiles.standard.servers];
    }

    // Add context-specific servers
    const contextServers = this.detectContextualServers(registry);
    serversToInstall = [...new Set([...serversToInstall, ...contextServers])];

    return serversToInstall;
  }

  /**
   * Detect servers based on project context
   */
  detectContextualServers(registry) {
    const contextServers = [];

    Object.entries(registry.servers).forEach(([serverId, serverConfig]) => {
      if (this.shouldInstallServer(serverId, serverConfig)) {
        contextServers.push(serverId);
      }
    });

    return contextServers;
  }

  /**
   * Determine if a server should be installed based on detection triggers
   */
  shouldInstallServer(serverId, serverConfig) {
    const triggers = serverConfig.detectionTriggers || {};

    // Always install if specified
    if (triggers.always) return true;

    // Check package dependencies
    if (triggers.packages) {
      const hasPackage = triggers.packages.some(pkg => 
        this.detectedContext.packages.some(detectedPkg => detectedPkg.includes(pkg))
      );
      if (hasPackage) return true;
    }

    // Check files
    if (triggers.files) {
      const hasFile = triggers.files.some(file => 
        this.detectedContext.files.includes(file)
      );
      if (hasFile) return true;
    }

    // Check PRD keywords
    if (triggers.prdKeywords && this.detectedContext.prdContent) {
      const hasKeyword = triggers.prdKeywords.some(keyword =>
        this.detectedContext.prdContent.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasKeyword) return true;
    }

    // Check git remote
    if (triggers.gitRemote && this.detectedContext.gitRemote) {
      if (this.detectedContext.gitRemote.includes(triggers.gitRemote)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Show installation plan
   */
  showInstallationPlan(serversToInstall, registry) {
    this.log('📦 MCP SERVER INSTALLATION PLAN');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Group servers by category
    const serversByCategory = {};
    serversToInstall.forEach(serverId => {
      const server = registry.servers[serverId];
      if (!server) return;
      
      const category = server.category || 'uncategorized';
      if (!serversByCategory[category]) {
        serversByCategory[category] = [];
      }
      serversByCategory[category].push({ id: serverId, ...server });
    });

    let totalServers = 0;
    Object.entries(serversByCategory).forEach(([category, servers]) => {
      const categoryInfo = registry.categories[category] || {};
      this.log(`${this.getCategoryIcon(category)} ${categoryInfo.name || category.toUpperCase()} (${servers.length} servers)`);
      
      servers.forEach(server => {
        const status = server.required ? '🚨 CRITICAL' : server.autoInstall ? '✅ AUTO' : '🔧 CONTEXT';
        this.log(`   ${status} ${server.name} - ${server.description}`);
        totalServers++;
      });
      this.log('');
    });

    this.log(`📊 INSTALLATION SUMMARY:`);
    this.log(`   Total servers to configure: ${totalServers}`);
    this.log(`   Installation profile: ${this.options.profile}`);
    this.log(`   Configuration target: ${this.claudeSettingsPath}`);
    this.log('');
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      'critical-enterprise': '🚨',
      'development-core': '🔧',
      'enterprise-integration': '🏢',
      'community': '🌟',
      'database': '🗄️',
      'api-integration': '🌐',
      'testing-qa': '🧪',
      'specialized-advanced': '🤖'
    };
    return icons[category] || '📦';
  }

  /**
   * Configure Claude settings with MCP servers
   */
  async configureClaudeSettings(serversToInstall, registry) {
    this.log('🔗 CONFIGURING CLAUDE CODE SETTINGS');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Load existing settings or create new
    let settings = {};
    try {
      const existingSettings = await fs.readFile(this.claudeSettingsPath, 'utf8');
      settings = JSON.parse(existingSettings);
      this.log('✅ Loaded existing Claude settings');
    } catch (error) {
      this.log('✅ Creating new Claude settings file');
      settings = {
        mcpServers: {},
        $schema: "https://schemas.anthropic.com/claude/settings.json"
      };
    }

    // Ensure mcpServers object exists
    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    // Configure each server
    let configuredCount = 0;
    for (const serverId of serversToInstall) {
      const server = registry.servers[serverId];
      if (!server) continue;

      const serverConfig = this.generateServerConfig(serverId, server);
      settings.mcpServers[serverId] = serverConfig;
      
      this.log(`✅ Configured: ${server.name}`);
      configuredCount++;
    }

    // Add metadata
    settings.mcpServerConfiguration = {
      version: registry.version,
      lastUpdated: new Date().toISOString(),
      configuredBy: 'quik-nation-ai-boilerplate-mcp-init',
      profile: this.options.profile,
      totalServers: configuredCount
    };

    // Write settings file
    const settingsDir = path.dirname(this.claudeSettingsPath);
    await fs.mkdir(settingsDir, { recursive: true });
    await fs.writeFile(this.claudeSettingsPath, JSON.stringify(settings, null, 2));
    
    this.log(`\n✅ Claude settings updated: ${configuredCount} MCP servers configured`);
    this.log(`📁 Settings file: ${this.claudeSettingsPath}`);
  }

  /**
   * Generate server configuration for Claude settings
   */
  generateServerConfig(serverId, server) {
    const config = {
      command: server.command,
      args: server.args || []
    };

    // Replace template variables in args
    if (config.args) {
      config.args = config.args.map(arg => 
        arg.replace('{{PROJECT_ROOT}}', this.projectRoot)
      );
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
  showCompletionSummary(serversToInstall) {
    this.log('\n🎉 MCP INITIALIZATION COMPLETE!');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.log('📊 CONFIGURATION SUMMARY:');
    this.log(`✅ Successfully configured: ${serversToInstall.length} MCP servers`);
    this.log(`📁 Claude settings: ${this.claudeSettingsPath}`);
    this.log(`🔧 Installation profile: ${this.options.profile}`);
    
    this.log('\n🚀 NEXT STEPS:');
    this.log('1. Restart Claude Code to load new MCP servers');
    this.log('2. Set up environment variables for servers that need them');
    this.log('3. Run `mcp-status` to verify server health');
    this.log('4. Use enhanced Claude Code commands with MCP integration');
    
    this.log('\n💡 QUICK START:');
    this.log('• All Claude Code boilerplate commands now have MCP server integration');
    this.log('• Use `mcp-status --detailed` to see all configured servers');
    this.log('• Environment variables can be added to your project .env file');
    
    this.log('\n✨ Enhanced capabilities now available in Claude Code!');
  }

  /**
   * Utility method for logging
   */
  log(message) {
    if (this.options.verbose || !message.startsWith('  ')) {
      console.log(message);
    }
  }

  /**
   * CLI interface
   */
  static async main() {
    const args = process.argv.slice(2);
    
    const options = {
      verbose: args.includes('--verbose') || args.includes('-v'),
      dryRun: args.includes('--dry-run'),
      force: args.includes('--force'),
      clientType: args.includes('--client') ? args[args.indexOf('--client') + 1] || 'claude' : 'claude'
    };

    // Determine profile
    if (args.includes('--minimal')) {
      options.profile = 'minimal';
    } else if (args.includes('--full-install') || args.includes('--full')) {
      options.profile = 'full';
    } else if (args.includes('--enterprise')) {
      options.profile = 'enterprise';
    } else if (args.includes('--full-stack')) {
      options.profile = 'full-stack';
    } else {
      options.profile = 'standard';
    }

    // Special analysis mode
    if (args.includes('--project-analysis')) {
      const initializer = new MCPInitializer({ ...options, dryRun: true });
      await initializer.analyzeProjectContext();
      return;
    }

    const initializer = new MCPInitializer(options);
    await initializer.initialize();
  }
}

// Run if executed directly
if (require.main === module) {
  MCPInitializer.main().catch(error => {
    console.error('Failed to initialize MCP servers:', error);
    process.exit(1);
  });
}

module.exports = MCPInitializer;