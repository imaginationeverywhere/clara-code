#!/usr/bin/env node

/**
 * MCP Server Manager - Automatic Installation and Management System
 * Part of Claude Code Boilerplate v1.6.0
 * 
 * Handles installation, activation, health monitoring, and management of MCP servers
 * based on project context and user preferences.
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class MCPServerManager {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.mcpRoot = path.join(projectRoot, '.claude', 'mcp');
    this.configPath = path.join(this.mcpRoot, 'config');
    this.logsPath = path.join(this.mcpRoot, 'logs');
    this.serversPath = path.join(this.mcpRoot, 'servers');
    
    this.registry = this.loadServerRegistry();
    this.autoConfig = this.loadAutoConfig();
    this.userConfig = this.loadUserConfig();
    this.runningServers = new Map();
    
    this.ensureDirectories();
  }

  /**
   * Load server registry configuration
   */
  loadServerRegistry() {
    try {
      const registryPath = path.join(this.configPath, 'server-registry.json');
      return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load server registry:', error.message);
      return { servers: {}, categories: {} };
    }
  }

  /**
   * Load auto-configuration settings
   */
  loadAutoConfig() {
    try {
      const autoConfigPath = path.join(this.configPath, 'auto-config.json');
      return JSON.parse(fs.readFileSync(autoConfigPath, 'utf8'));
    } catch (error) {
      console.warn('Auto-config not found, using defaults');
      return { autoInstallOnSetup: true, autoActivateOnDetection: true };
    }
  }

  /**
   * Load user configuration preferences
   */
  loadUserConfig() {
    try {
      const userConfigPath = path.join(this.configPath, 'user-config.json');
      return JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
    } catch (error) {
      return {
        disabledServers: [],
        customConfigs: {},
        preferences: {
          autoInstall: true,
          autoActivate: true,
          healthChecks: true
        }
      };
    }
  }

  /**
   * Save user configuration
   */
  saveUserConfig() {
    const userConfigPath = path.join(this.configPath, 'user-config.json');
    fs.writeFileSync(userConfigPath, JSON.stringify(this.userConfig, null, 2));
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.mcpRoot, this.configPath, this.logsPath, this.serversPath];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Auto-detect which servers should be activated based on project context
   */
  async autoDetectServers() {
    const detectedServers = [];
    
    // Analyze PRD.md if it exists
    const prdServers = await this.analyzePRD();
    detectedServers.push(...prdServers);
    
    // Analyze filesystem
    const fileSystemServers = await this.analyzeFileSystem();
    detectedServers.push(...fileSystemServers);
    
    // Analyze package.json
    const packageServers = await this.analyzePackageJson();
    detectedServers.push(...packageServers);
    
    // Remove duplicates and disabled servers
    const uniqueServers = [...new Set(detectedServers)]
      .filter(server => !this.userConfig.disabledServers.includes(server));
    
    this.log('info', `Auto-detected servers: ${uniqueServers.join(', ')}`);
    return uniqueServers;
  }

  /**
   * Analyze PRD.md for context clues
   */
  async analyzePRD() {
    const detectedServers = [];
    const prdPath = path.join(this.projectRoot, 'docs', 'PRD.md');
    
    if (!fs.existsSync(prdPath) || !this.autoConfig.activationRules.prdAnalysis.enabled) {
      return detectedServers;
    }
    
    try {
      const prdContent = fs.readFileSync(prdPath, 'utf8').toLowerCase();
      const keywords = this.autoConfig.activationRules.prdAnalysis.keywords;
      
      for (const [category, terms] of Object.entries(keywords)) {
        if (terms.some(term => prdContent.includes(term.toLowerCase()))) {
          const categoryServers = this.getServersByCategory(category);
          detectedServers.push(...categoryServers);
        }
      }
    } catch (error) {
      this.log('warn', `Failed to analyze PRD.md: ${error.message}`);
    }
    
    return detectedServers;
  }

  /**
   * Analyze filesystem for project indicators
   */
  async analyzeFileSystem() {
    const detectedServers = [];
    
    if (!this.autoConfig.activationRules.fileSystemAnalysis.enabled) {
      return detectedServers;
    }
    
    const checkFiles = this.autoConfig.activationRules.fileSystemAnalysis.checkFiles;
    
    for (const file of checkFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const servers = this.getServersByFileIndicator(file);
        detectedServers.push(...servers);
      }
    }
    
    return detectedServers;
  }

  /**
   * Analyze package.json dependencies
   */
  async analyzePackageJson() {
    const detectedServers = [];
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath) || !this.autoConfig.activationRules.packageJsonAnalysis.enabled) {
      return detectedServers;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      const dependencyCategories = this.autoConfig.activationRules.packageJsonAnalysis.dependencies;
      
      for (const [category, packages] of Object.entries(dependencyCategories)) {
        if (packages.some(pkg => allDependencies[pkg])) {
          const categoryServers = this.getServersByCategory(category);
          detectedServers.push(...categoryServers);
        }
      }
    } catch (error) {
      this.log('warn', `Failed to analyze package.json: ${error.message}`);
    }
    
    return detectedServers;
  }

  /**
   * Get servers by category
   */
  getServersByCategory(category) {
    return Object.keys(this.registry.servers).filter(serverId => {
      const server = this.registry.servers[serverId];
      return server.category === category;
    });
  }

  /**
   * Get servers by file indicator
   */
  getServersByFileIndicator(file) {
    const servers = [];
    
    for (const [serverId, server] of Object.entries(this.registry.servers)) {
      if (server.activationRules && server.activationRules.fileExists) {
        if (server.activationRules.fileExists.includes(file)) {
          servers.push(serverId);
        }
      }
    }
    
    return servers;
  }

  /**
   * Install MCP server (handles both standard npm and community claude mcp commands)
   */
  async installServer(serverId, force = false) {
    const server = this.registry.servers[serverId];
    if (!server) {
      throw new Error(`Server '${serverId}' not found in registry`);
    }

    const serverPath = path.join(this.serversPath, serverId);
    
    if (fs.existsSync(serverPath) && !force) {
      this.log('info', `Server '${serverId}' already installed`);
      return true;
    }

    this.log('info', `Installing MCP server: ${serverId}`);
    
    try {
      // Create server directory
      if (!fs.existsSync(serverPath)) {
        fs.mkdirSync(serverPath, { recursive: true });
      }

      // Handle different installation methods for community servers
      let installResult;
      
      if (server.installCommand.startsWith('claude mcp add')) {
        // Community MCP servers using claude command
        this.log('info', `Installing community MCP server with claude command: ${server.installCommand}`);
        installResult = await execAsync(server.installCommand, {
          cwd: this.projectRoot // Run from project root for claude mcp commands
        });
      } else {
        // Standard npm-based installations
        installResult = await execAsync(server.installCommand, {
          cwd: serverPath
        });
      }

      const { stdout, stderr } = installResult;

      if (stderr && !stderr.includes('npm WARN') && !stderr.includes('claude mcp')) {
        this.log('warn', `Installation warnings for ${serverId}: ${stderr}`);
      }

      // Create configuration file
      await this.createServerConfig(serverId);
      
      this.log('info', `Successfully installed MCP server: ${serverId}`);
      return true;
      
    } catch (error) {
      this.log('error', `Failed to install server ${serverId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Create server configuration file
   */
  async createServerConfig(serverId) {
    const server = this.registry.servers[serverId];
    const configPath = path.join(this.serversPath, serverId, 'config.json');
    
    const config = {
      serverId,
      name: server.name,
      description: server.description,
      version: server.version,
      category: server.category,
      enabled: true,
      autoActivate: server.autoActivate,
      security: server.security || {},
      environment: {},
      customSettings: this.userConfig.customConfigs[serverId] || {}
    };

    // Add required environment variables
    if (server.envRequired) {
      for (const envVar of server.envRequired) {
        config.environment[envVar] = process.env[envVar] || `\${${envVar}}`;
      }
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Start MCP server
   */
  async startServer(serverId) {
    const server = this.registry.servers[serverId];
    if (!server) {
      throw new Error(`Server '${serverId}' not found`);
    }

    if (this.runningServers.has(serverId)) {
      this.log('info', `Server '${serverId}' is already running`);
      return true;
    }

    this.log('info', `Starting MCP server: ${serverId}`);
    
    try {
      const serverPath = path.join(this.serversPath, serverId);
      const logPath = path.join(this.logsPath, `${serverId}.log`);
      
      // Start the server process
      const serverProcess = spawn('npx', ['-y', server.name], {
        cwd: serverPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Setup logging
      const logStream = fs.createWriteStream(logPath, { flags: 'a' });
      serverProcess.stdout.pipe(logStream);
      serverProcess.stderr.pipe(logStream);

      // Store process reference
      this.runningServers.set(serverId, {
        process: serverProcess,
        startTime: new Date(),
        restartCount: 0
      });

      // Handle process events
      serverProcess.on('exit', (code) => {
        this.runningServers.delete(serverId);
        if (code !== 0) {
          this.log('error', `Server '${serverId}' exited with code ${code}`);
        }
      });

      this.log('info', `Successfully started MCP server: ${serverId}`);
      return true;
      
    } catch (error) {
      this.log('error', `Failed to start server ${serverId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Stop MCP server
   */
  async stopServer(serverId) {
    const serverInfo = this.runningServers.get(serverId);
    if (!serverInfo) {
      this.log('info', `Server '${serverId}' is not running`);
      return true;
    }

    this.log('info', `Stopping MCP server: ${serverId}`);
    
    try {
      serverInfo.process.kill('SIGTERM');
      this.runningServers.delete(serverId);
      this.log('info', `Successfully stopped MCP server: ${serverId}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to stop server ${serverId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get status of all servers
   */
  getServerStatus() {
    const status = {
      installed: [],
      running: [],
      available: Object.keys(this.registry.servers),
      disabled: this.userConfig.disabledServers
    };

    // Check installed servers
    if (fs.existsSync(this.serversPath)) {
      status.installed = fs.readdirSync(this.serversPath)
        .filter(name => fs.statSync(path.join(this.serversPath, name)).isDirectory());
    }

    // Check running servers
    status.running = Array.from(this.runningServers.keys());

    return status;
  }

  /**
   * Enable server (remove from disabled list)
   */
  enableServer(serverId) {
    const index = this.userConfig.disabledServers.indexOf(serverId);
    if (index > -1) {
      this.userConfig.disabledServers.splice(index, 1);
      this.saveUserConfig();
      this.log('info', `Enabled MCP server: ${serverId}`);
      return true;
    }
    return false;
  }

  /**
   * Disable server (add to disabled list and stop if running)
   */
  async disableServer(serverId) {
    if (!this.userConfig.disabledServers.includes(serverId)) {
      this.userConfig.disabledServers.push(serverId);
      this.saveUserConfig();
    }

    await this.stopServer(serverId);
    this.log('info', `Disabled MCP server: ${serverId}`);
    return true;
  }

  /**
   * Health check for all running servers
   */
  async healthCheck() {
    const results = {};
    
    for (const [serverId, serverInfo] of this.runningServers.entries()) {
      try {
        const uptime = Date.now() - serverInfo.startTime.getTime();
        const isHealthy = serverInfo.process && !serverInfo.process.killed;
        
        results[serverId] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          uptime,
          restartCount: serverInfo.restartCount,
          pid: serverInfo.process.pid
        };
      } catch (error) {
        results[serverId] = {
          status: 'error',
          error: error.message
        };
      }
    }
    
    return results;
  }

  /**
   * Auto-install essential servers on first setup
   */
  async autoInstallEssentials() {
    if (!this.autoConfig.autoInstallOnSetup) {
      this.log('info', 'Auto-install disabled');
      return;
    }

    this.log('info', 'Starting auto-installation of essential MCP servers...');
    
    const essentialServers = Object.keys(this.registry.servers)
      .filter(serverId => this.registry.servers[serverId].autoInstall);

    const installPromises = essentialServers.map(serverId => 
      this.installServer(serverId).catch(error => {
        this.log('error', `Auto-install failed for ${serverId}: ${error.message}`);
        return false;
      })
    );

    const results = await Promise.all(installPromises);
    const successCount = results.filter(Boolean).length;
    
    this.log('info', `Auto-installation complete: ${successCount}/${essentialServers.length} servers installed`);
  }

  /**
   * Auto-activate detected servers
   */
  async autoActivateServers() {
    if (!this.autoConfig.autoActivateOnDetection) {
      this.log('info', 'Auto-activation disabled');
      return;
    }

    const detectedServers = await this.autoDetectServers();
    const activationPromises = detectedServers
      .filter(serverId => this.registry.servers[serverId]?.autoActivate)
      .map(serverId => this.startServer(serverId));

    await Promise.all(activationPromises);
  }

  /**
   * Initialize MCP system (run on first setup or session start)
   */
  async initialize() {
    this.log('info', 'Initializing MCP Server Manager...');
    
    // Auto-install essential servers
    await this.autoInstallEssentials();
    
    // Auto-activate detected servers
    await this.autoActivateServers();
    
    // Start health monitoring if enabled
    if (this.userConfig.preferences.healthChecks) {
      this.startHealthMonitoring();
    }
    
    this.log('info', 'MCP Server Manager initialization complete');
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    const interval = this.autoConfig.healthCheckInterval || 30;
    
    setInterval(async () => {
      const health = await this.healthCheck();
      const unhealthyServers = Object.entries(health)
        .filter(([_, status]) => status.status !== 'healthy')
        .map(([serverId]) => serverId);

      if (unhealthyServers.length > 0) {
        this.log('warn', `Unhealthy servers detected: ${unhealthyServers.join(', ')}`);
      }
    }, interval * 1000);
  }

  /**
   * Logging utility
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    
    // Also write to log file
    const logFile = path.join(this.logsPath, 'manager.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  }
}

// CLI interface
if (require.main === module) {
  const manager = new MCPServerManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  async function runCommand() {
    try {
      switch (command) {
        case 'init':
          await manager.initialize();
          break;
        case 'status':
          console.log(JSON.stringify(manager.getServerStatus(), null, 2));
          break;
        case 'install':
          await manager.installServer(args[0]);
          break;
        case 'start':
          await manager.startServer(args[0]);
          break;
        case 'stop':
          await manager.stopServer(args[0]);
          break;
        case 'enable':
          manager.enableServer(args[0]);
          break;
        case 'disable':
          await manager.disableServer(args[0]);
          break;
        case 'health':
          const health = await manager.healthCheck();
          console.log(JSON.stringify(health, null, 2));
          break;
        case 'auto-detect':
          const detected = await manager.autoDetectServers();
          console.log('Detected servers:', detected);
          break;
        default:
          console.log('Available commands: init, status, install, start, stop, enable, disable, health, auto-detect');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  runCommand();
}

module.exports = MCPServerManager;