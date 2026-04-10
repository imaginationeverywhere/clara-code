#!/usr/bin/env node

/**
 * Quik Nation AI Boilerplate Session Detector
 * Automatically detects session startup and triggers update checking
 * Integrates with boilerplate-update-manager agent
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class SessionDetector {
  constructor() {
    this.cwd = process.cwd();
    this.sessionHooksConfig = null;
    this.manifestConfig = null;
    this.isBoilerplateProject = false;
    this.remoteRepository = 'git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git';
  }

  /**
   * Main execution entry point
   */
  async execute() {
    try {
      // Quick project detection
      this.isBoilerplateProject = this.detectBoilerplateProject();
      
      if (!this.isBoilerplateProject) {
        // Silent exit - not a boilerplate project
        return;
      }

      // Load configurations
      await this.loadConfigurations();
      
      // Check if session hooks are enabled
      if (!this.isSessionHooksEnabled()) {
        // Silent exit - hooks disabled
        return;
      }

      // Execute session startup workflow
      await this.executeSessionStartup();
      
    } catch (error) {
      // Graceful failure - log error but don't block session
      this.logError('Session startup error', error);
    }
  }

  /**
   * Detect if current directory is a Quik Nation AI Boilerplate project
   */
  detectBoilerplateProject() {
    const indicators = [
      '.boilerplate-manifest.json',
      '.claude/commands/update-boilerplate.md',
      '.claude/session-hooks.json',
      'CLAUDE.md'
    ];

    // Check for multiple indicators to avoid false positives
    const foundIndicators = indicators.filter(indicator => 
      fs.existsSync(path.join(this.cwd, indicator))
    );

    // Require at least 2 indicators for positive identification
    return foundIndicators.length >= 2;
  }

  /**
   * Load session hooks and manifest configurations
   */
  async loadConfigurations() {
    // Load session hooks configuration
    const sessionHooksPath = path.join(this.cwd, '.claude/session-hooks.json');
    if (fs.existsSync(sessionHooksPath)) {
      try {
        const config = fs.readFileSync(sessionHooksPath, 'utf8');
        this.sessionHooksConfig = JSON.parse(config);
      } catch (error) {
        this.logError('Failed to parse session hooks config', error);
      }
    }

    // Load boilerplate manifest
    const manifestPath = path.join(this.cwd, '.boilerplate-manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const config = fs.readFileSync(manifestPath, 'utf8');
        this.manifestConfig = JSON.parse(config);
      } catch (error) {
        this.logError('Failed to parse boilerplate manifest', error);
      }
    }
  }

  /**
   * Check if session hooks are enabled
   */
  isSessionHooksEnabled() {
    // Default to enabled if no configuration exists
    if (!this.sessionHooksConfig) {
      return true;
    }

    return this.sessionHooksConfig.session?.startup?.enabled !== false;
  }

  /**
   * Execute the main session startup workflow
   */
  async executeSessionStartup() {
    const startTime = Date.now();
    
    try {
      // Collect telemetry data
      const telemetryData = await this.collectTelemetryData();
      
      // Check for updates (parallel with telemetry)
      const updateStatus = await this.checkForUpdates();
      
      // Display session startup information
      this.displaySessionStartup(updateStatus, telemetryData);
      
      // Report telemetry to remote repository (async, non-blocking)
      this.reportTelemetry(telemetryData, startTime);
      
    } catch (error) {
      this.logError('Session startup workflow error', error);
    }
  }

  /**
   * Collect comprehensive telemetry data
   */
  async collectTelemetryData() {
    const telemetryEnabled = this.sessionHooksConfig?.session?.telemetry?.enabled !== false;
    
    if (!telemetryEnabled) {
      return null;
    }

    try {
      const data = {
        sessionStart: new Date().toISOString(),
        projectType: this.determineProjectType(),
        workspaces: this.detectWorkspaces(),
        boilerplateVersion: this.getCurrentBoilerplateVersion(),
        sessionCount: this.incrementSessionCount(),
        lastUpdateCheck: this.getLastUpdateCheck(),
        commandUsagePatterns: this.getCommandUsagePatterns(),
        performanceMetrics: this.getPerformanceMetrics(),
        deploymentPatterns: this.getDeploymentPatterns(),
        featureAdoption: this.getFeatureAdoption(),
        // Anonymize all personal data
        anonymizedProjectId: this.generateAnonymizedProjectId()
      };

      return data;
    } catch (error) {
      this.logError('Telemetry collection error', error);
      return null;
    }
  }

  /**
   * Check for available updates from remote repository
   */
  async checkForUpdates() {
    try {
      const timeout = this.sessionHooksConfig?.session?.updateChecking?.timeout || 5000;
      
      // Quick version check with timeout
      const currentVersion = this.getCurrentBoilerplateVersion();
      const latestVersion = await this.fetchLatestVersion(timeout);
      
      if (!latestVersion) {
        return { available: false, error: 'Unable to check for updates' };
      }

      const hasUpdates = this.compareVersions(currentVersion, latestVersion) < 0;
      
      return {
        available: hasUpdates,
        currentVersion,
        latestVersion,
        updateCount: hasUpdates ? this.getUpdateCount(currentVersion, latestVersion) : 0
      };
      
    } catch (error) {
      this.logError('Update check error', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Display session startup information to user
   */
  displaySessionStartup(updateStatus, telemetryData) {
    const projectName = this.getProjectName();
    const currentVersion = updateStatus.currentVersion || 'unknown';
    
    // Check if user prefers silent mode
    const silentMode = this.sessionHooksConfig?.session?.startup?.silentMode;
    if (silentMode) {
      return;
    }

    console.log('\n🚀 Quik Nation AI Boilerplate Session Started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📋 Project: ${projectName} (v${currentVersion})`);
    
    if (updateStatus.available) {
      console.log(`🔄 Update Status: ${updateStatus.updateCount} updates available (v${updateStatus.latestVersion})`);
      console.log('📊 Session:', this.getSessionInfo());
      console.log('\n⚡ Quick Actions:');
      console.log('  • update-boilerplate --check (view available updates)');
      console.log('  • update-boilerplate --commands-only (safe update)');
      console.log('  • update-boilerplate (full interactive update)');
    } else if (updateStatus.error) {
      console.log('🔄 Update Status: Unable to check for updates');
    } else {
      console.log('🔄 Update Status: Up to date');
    }
    
    console.log('\n🎯 Ready for development!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Report telemetry data to remote repository (async, non-blocking)
   */
  async reportTelemetry(telemetryData, startTime) {
    if (!telemetryData) {
      return;
    }

    try {
      // Add performance timing
      telemetryData.sessionStartupTime = Date.now() - startTime;
      
      // Ensure all data is properly anonymized
      const anonymizedData = this.anonymizeData(telemetryData);
      
      // Send to remote repository (async, don't wait for response)
      setImmediate(() => {
        this.sendTelemetryData(anonymizedData);
      });
      
    } catch (error) {
      this.logError('Telemetry reporting error', error);
    }
  }

  /**
   * Helper Methods
   */

  getCurrentBoilerplateVersion() {
    if (this.manifestConfig?.version) {
      return this.manifestConfig.version;
    }
    
    // Try to detect version from git tags or package.json
    try {
      const packagePath = path.join(this.cwd, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      // Ignore error, use default
    }
    
    return '1.0.0';
  }

  async fetchLatestVersion(timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, timeout);

      try {
        // Simple HTTP request to GitHub API
        const { exec } = require('child_process');
        exec('curl -s https://api.github.com/repos/imaginationeverywhere/quik-nation-ai-boilerplate/releases/latest', 
          { timeout: timeout }, 
          (error, stdout) => {
            clearTimeout(timer);
            
            if (error) {
              resolve(null);
              return;
            }
            
            try {
              const data = JSON.parse(stdout);
              resolve(data.tag_name?.replace('v', '') || null);
            } catch (parseError) {
              resolve(null);
            }
          }
        );
      } catch (error) {
        clearTimeout(timer);
        resolve(null);
      }
    });
  }

  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }
    
    return 0;
  }

  getUpdateCount(currentVersion, latestVersion) {
    // Simplified update count calculation
    const current = currentVersion.split('.').map(Number);
    const latest = latestVersion.split('.').map(Number);
    
    let count = 0;
    if (latest[0] > current[0]) count += 10; // Major version
    if (latest[1] > current[1]) count += 3;  // Minor version  
    if (latest[2] > current[2]) count += 1;  // Patch version
    
    return Math.max(count, 1);
  }

  determineProjectType() {
    if (fs.existsSync(path.join(this.cwd, 'frontend')) && 
        fs.existsSync(path.join(this.cwd, 'backend'))) {
      return 'full-monorepo';
    } else if (fs.existsSync(path.join(this.cwd, 'frontend'))) {
      return 'frontend-only';
    } else if (fs.existsSync(path.join(this.cwd, 'backend'))) {
      return 'backend-only';
    }
    return 'unknown';
  }

  detectWorkspaces() {
    const workspaces = [];
    
    if (fs.existsSync(path.join(this.cwd, 'frontend'))) {
      workspaces.push('frontend');
    }
    if (fs.existsSync(path.join(this.cwd, 'backend'))) {
      workspaces.push('backend');
    }
    if (fs.existsSync(path.join(this.cwd, 'mobile'))) {
      workspaces.push('mobile');
    }
    
    return workspaces;
  }

  getProjectName() {
    try {
      const packagePath = path.join(this.cwd, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.name || path.basename(this.cwd);
      }
    } catch (error) {
      // Ignore error
    }
    
    return path.basename(this.cwd);
  }

  incrementSessionCount() {
    try {
      const sessionFile = path.join(this.cwd, '.claude/.session-count');
      let count = 1;
      
      if (fs.existsSync(sessionFile)) {
        count = parseInt(fs.readFileSync(sessionFile, 'utf8')) + 1;
      }
      
      fs.writeFileSync(sessionFile, count.toString());
      return count;
    } catch (error) {
      return 1;
    }
  }

  getLastUpdateCheck() {
    if (this.manifestConfig?.sessionHooks?.lastUpdateCheck) {
      return this.manifestConfig.sessionHooks.lastUpdateCheck;
    }
    return null;
  }

  getCommandUsagePatterns() {
    // Simplified command usage tracking
    // In production, this would track actual command usage
    return {
      processToods: 0,
      updateBoilerplate: 0,
      syncJira: 0,
      deploymentCommands: 0
    };
  }

  getPerformanceMetrics() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage()
    };
  }

  getDeploymentPatterns() {
    // Detect deployment configuration
    const patterns = {
      hasDockerfile: fs.existsSync(path.join(this.cwd, 'Dockerfile')),
      hasAWSCDK: fs.existsSync(path.join(this.cwd, 'infrastructure')),
      hasAmplify: fs.existsSync(path.join(this.cwd, 'amplify')),
      hasGitHubActions: fs.existsSync(path.join(this.cwd, '.github/workflows'))
    };
    
    return patterns;
  }

  getFeatureAdoption() {
    return {
      jiraIntegration: fs.existsSync(path.join(this.cwd, 'todo/jira-config')),
      todoSystem: fs.existsSync(path.join(this.cwd, 'todo')),
      prpFramework: fs.existsSync(path.join(this.cwd, 'docs/PRD.md')),
      agentSystem: fs.existsSync(path.join(this.cwd, '.claude/agents'))
    };
  }

  getSessionInfo() {
    const count = this.incrementSessionCount();
    const lastCheck = this.getLastUpdateCheck();
    
    let info = `${count}${this.getOrdinalSuffix(count)} this month`;
    
    if (lastCheck) {
      const daysSince = Math.floor((Date.now() - new Date(lastCheck).getTime()) / (24 * 60 * 60 * 1000));
      info += ` | Last update: ${daysSince} days ago`;
    }
    
    return info;
  }

  getOrdinalSuffix(count) {
    const j = count % 10;
    const k = count % 100;
    if (j == 1 && k != 11) return 'st';
    if (j == 2 && k != 12) return 'nd';
    if (j == 3 && k != 13) return 'rd';
    return 'th';
  }

  generateAnonymizedProjectId() {
    // Generate a consistent but anonymous project identifier
    const crypto = require('crypto');
    const projectPath = path.resolve(this.cwd);
    return crypto.createHash('sha256').update(projectPath).digest('hex').substring(0, 16);
  }

  anonymizeData(data) {
    // Ensure all personal information is removed
    const anonymized = { ...data };
    
    // Remove any potential personal identifiers
    delete anonymized.projectPath;
    delete anonymized.username;
    delete anonymized.hostname;
    
    return anonymized;
  }

  async sendTelemetryData(data) {
    // In production, this would send data to the remote repository
    // For now, we just log that it would be sent
    this.logDebug('Telemetry data collected (would be sent to remote repository)', {
      dataSize: JSON.stringify(data).length,
      timestamp: data.sessionStart
    });
  }

  logError(message, error) {
    // Silent error logging - don't disrupt user session
    const logFile = path.join(this.cwd, '.claude/.session-errors.log');
    try {
      const logEntry = `[${new Date().toISOString()}] ${message}: ${error.message}\n`;
      fs.appendFileSync(logFile, logEntry);
    } catch (logError) {
      // Ignore logging errors
    }
  }

  logDebug(message, data) {
    if (process.env.CLAUDE_SESSION_DEBUG) {
      console.log(`[Session Debug] ${message}`, data);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const detector = new SessionDetector();
  detector.execute();
}

module.exports = SessionDetector;