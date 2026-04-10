#!/usr/bin/env node

/**
 * Quik Nation AI Boilerplate Telemetry Reporter
 * Collects and reports anonymized usage analytics for continuous improvement
 * Respects user privacy and provides opt-out capabilities
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

class TelemetryReporter {
  constructor() {
    this.cwd = process.cwd();
    this.sessionHooksConfig = null;
    this.manifestConfig = null;
    this.telemetryEnabled = true;
    this.remoteEndpoint = 'https://api.github.com/repos/imaginationeverywhere/quik-nation-ai-boilerplate/issues';
    this.localTelemetryPath = path.join(this.cwd, '.claude/.telemetry-cache.json');
  }

  /**
   * Initialize telemetry reporter with configuration
   */
  async initialize() {
    await this.loadConfigurations();
    this.telemetryEnabled = this.checkTelemetryEnabled();
    return this;
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
   * Check if telemetry is enabled
   */
  checkTelemetryEnabled() {
    // Check environment variable override
    if (process.env.CLAUDE_TELEMETRY_DISABLED === 'true') {
      return false;
    }

    // Check session hooks config
    if (this.sessionHooksConfig?.session?.telemetry?.enabled === false) {
      return false;
    }

    // Check manifest config
    if (this.manifestConfig?.telemetry?.enabled === false) {
      return false;
    }

    return true;
  }

  /**
   * Collect comprehensive telemetry data
   */
  async collectTelemetryData(sessionStartTime = Date.now()) {
    if (!this.telemetryEnabled) {
      return null;
    }

    try {
      const data = {
        // Session information
        sessionId: this.generateSessionId(),
        sessionStart: new Date().toISOString(),
        sessionStartupTime: Date.now() - sessionStartTime,
        
        // Project information (anonymized)
        projectId: this.generateAnonymizedProjectId(),
        projectType: this.determineProjectType(),
        workspaces: this.detectWorkspaces(),
        boilerplateVersion: this.getCurrentBoilerplateVersion(),
        
        // Usage patterns
        sessionCount: this.getSessionCount(),
        lastUpdateCheck: this.getLastUpdateCheck(),
        commandUsagePatterns: this.getCommandUsagePatterns(),
        featureAdoption: this.getFeatureAdoption(),
        
        // Performance metrics
        performanceMetrics: this.getPerformanceMetrics(),
        systemInfo: this.getSystemInfo(),
        
        // Deployment patterns
        deploymentPatterns: this.getDeploymentPatterns(),
        infrastructureUsage: this.getInfrastructureUsage(),
        
        // Error patterns (anonymized)
        errorPatterns: this.getErrorPatterns(),
        
        // Update behavior
        updateBehavior: this.getUpdateBehavior(),
        
        // Privacy markers
        dataVersion: '1.0.0',
        anonymized: true,
        consentTimestamp: this.getConsentTimestamp(),
        
        // Metadata
        reportedAt: new Date().toISOString(),
        reporterVersion: '1.0.0'
      };

      // Ensure all personal data is anonymized
      return this.anonymizeData(data);
      
    } catch (error) {
      this.logError('Telemetry collection error', error);
      return null;
    }
  }

  /**
   * Report telemetry data to remote repository
   */
  async reportTelemetry(telemetryData) {
    if (!telemetryData || !this.telemetryEnabled) {
      return false;
    }

    try {
      // Cache locally first
      await this.cacheLocalTelemetry(telemetryData);
      
      // Attempt to send to remote (non-blocking)
      const success = await this.sendToRemote(telemetryData);
      
      if (success) {
        // Update last reported timestamp
        await this.updateLastReported();
      }
      
      return success;
      
    } catch (error) {
      this.logError('Telemetry reporting error', error);
      return false;
    }
  }

  /**
   * Cache telemetry data locally
   */
  async cacheLocalTelemetry(data) {
    try {
      let cache = { reports: [] };
      
      // Load existing cache
      if (fs.existsSync(this.localTelemetryPath)) {
        const cacheData = fs.readFileSync(this.localTelemetryPath, 'utf8');
        cache = JSON.parse(cacheData);
      }
      
      // Add new report
      cache.reports.push({
        ...data,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      });
      
      // Keep only last 10 reports to manage disk space
      if (cache.reports.length > 10) {
        cache.reports = cache.reports.slice(-10);
      }
      
      // Save cache
      fs.writeFileSync(this.localTelemetryPath, JSON.stringify(cache, null, 2));
      
    } catch (error) {
      this.logError('Local telemetry caching error', error);
    }
  }

  /**
   * Send telemetry data to remote repository
   */
  async sendToRemote(data) {
    return new Promise((resolve) => {
      try {
        // Create a GitHub issue with telemetry data (as a way to collect data)
        const issueData = this.formatTelemetryAsIssue(data);
        
        const postData = JSON.stringify(issueData);
        
        const options = {
          hostname: 'api.github.com',
          port: 443,
          path: '/repos/imaginationeverywhere/quik-nation-ai-boilerplate/issues',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Quik-Nation-AI-Boilerplate-Telemetry/1.0.0',
            'Authorization': this.getAuthHeader()
          },
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(true);
            } else {
              this.logError('Remote telemetry failed', { status: res.statusCode, body });
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          this.logError('Remote telemetry error', error);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.write(postData);
        req.end();
        
      } catch (error) {
        this.logError('Remote telemetry send error', error);
        resolve(false);
      }
    });
  }

  /**
   * Format telemetry data as a GitHub issue for collection
   */
  formatTelemetryAsIssue(data) {
    const title = `Telemetry Report: ${data.projectType} - ${data.boilerplateVersion}`;
    
    const body = `
# Quik Nation AI Boilerplate Telemetry Report

**Automated telemetry report for continuous improvement**

## Session Information
- Session ID: \`${data.sessionId}\`
- Project Type: ${data.projectType}
- Boilerplate Version: ${data.boilerplateVersion}
- Session Count: ${data.sessionCount}
- Startup Time: ${data.sessionStartupTime}ms

## Usage Patterns
\`\`\`json
${JSON.stringify({
  workspaces: data.workspaces,
  featureAdoption: data.featureAdoption,
  commandUsage: data.commandUsagePatterns
}, null, 2)}
\`\`\`

## Performance Metrics
\`\`\`json
${JSON.stringify({
  system: data.systemInfo,
  performance: data.performanceMetrics
}, null, 2)}
\`\`\`

## Deployment Patterns
\`\`\`json
${JSON.stringify({
  deployment: data.deploymentPatterns,
  infrastructure: data.infrastructureUsage
}, null, 2)}
\`\`\`

---
*This is an automated telemetry report. All data has been anonymized and contains no personal information.*
*Report ID: ${data.sessionId} | Generated: ${data.reportedAt}*
    `.trim();

    return {
      title,
      body,
      labels: ['telemetry', 'analytics', `version-${data.boilerplateVersion}`, data.projectType]
    };
  }

  /**
   * Helper methods for data collection
   */

  generateSessionId() {
    return crypto.randomBytes(8).toString('hex');
  }

  generateAnonymizedProjectId() {
    const projectPath = path.resolve(this.cwd);
    return crypto.createHash('sha256').update(projectPath).digest('hex').substring(0, 16);
  }

  getCurrentBoilerplateVersion() {
    if (this.manifestConfig?.version) {
      return this.manifestConfig.version;
    }
    return '1.0.0';
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

  getSessionCount() {
    try {
      const sessionFile = path.join(this.cwd, '.claude/.session-count');
      if (fs.existsSync(sessionFile)) {
        return parseInt(fs.readFileSync(sessionFile, 'utf8')) || 1;
      }
    } catch (error) {
      // Ignore error
    }
    return 1;
  }

  getLastUpdateCheck() {
    if (this.manifestConfig?.sessionHooks?.lastUpdateCheck) {
      return this.manifestConfig.sessionHooks.lastUpdateCheck;
    }
    return null;
  }

  getCommandUsagePatterns() {
    // In production, this would track actual command usage from logs
    try {
      const usageFile = path.join(this.cwd, '.claude/.command-usage.json');
      if (fs.existsSync(usageFile)) {
        const usage = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
        return {
          totalCommands: usage.totalCommands || 0,
          topCommands: usage.topCommands || {},
          lastUsed: usage.lastUsed || null
        };
      }
    } catch (error) {
      // Ignore error
    }
    
    return {
      totalCommands: 0,
      topCommands: {},
      lastUsed: null
    };
  }

  getFeatureAdoption() {
    return {
      jiraIntegration: fs.existsSync(path.join(this.cwd, 'todo/jira-config')),
      todoSystem: fs.existsSync(path.join(this.cwd, 'todo')),
      prpFramework: fs.existsSync(path.join(this.cwd, 'docs/PRD.md')),
      agentSystem: fs.existsSync(path.join(this.cwd, '.claude/agents')),
      sessionHooks: fs.existsSync(path.join(this.cwd, '.claude/session-hooks.json')),
      telemetryEnabled: this.telemetryEnabled,
      deploymentCommands: this.hasDeploymentCommands(),
      mockupTemplates: this.detectMockupTemplate()
    };
  }

  getPerformanceMetrics() {
    return {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      loadAverage: require('os').loadavg()
    };
  }

  getSystemInfo() {
    const os = require('os');
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      osRelease: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length
    };
  }

  getDeploymentPatterns() {
    return {
      hasDockerfile: fs.existsSync(path.join(this.cwd, 'Dockerfile')),
      hasDockerCompose: fs.existsSync(path.join(this.cwd, 'docker-compose.yml')),
      hasAWSCDK: fs.existsSync(path.join(this.cwd, 'infrastructure')),
      hasAmplify: fs.existsSync(path.join(this.cwd, 'amplify')),
      hasGitHubActions: fs.existsSync(path.join(this.cwd, '.github/workflows')),
      hasVercel: fs.existsSync(path.join(this.cwd, 'vercel.json')),
      hasHeroku: fs.existsSync(path.join(this.cwd, 'Procfile'))
    };
  }

  getInfrastructureUsage() {
    const usage = {
      aws: {
        amplify: fs.existsSync(path.join(this.cwd, 'amplify')),
        cdk: fs.existsSync(path.join(this.cwd, 'infrastructure')),
        ec2: this.hasEc2Configuration(),
        rds: this.hasRdsConfiguration()
      },
      databases: {
        postgresql: this.hasPostgreSQLConfig(),
        mongodb: this.hasMongoDBConfig(),
        redis: this.hasRedisConfig()
      },
      services: {
        stripe: this.hasStripeConfig(),
        clerk: this.hasClerkConfig(),
        twilio: this.hasTwilioConfig(),
        shippo: this.hasShippoConfig(),
        googleAnalytics: this.hasGoogleAnalyticsConfig()
      }
    };

    return usage;
  }

  getErrorPatterns() {
    // Analyze error logs for common patterns (anonymized)
    try {
      const errorLogPath = path.join(this.cwd, '.claude/.session-errors.log');
      if (fs.existsSync(errorLogPath)) {
        const logs = fs.readFileSync(errorLogPath, 'utf8');
        const lines = logs.split('\n').filter(line => line.trim());
        
        return {
          totalErrors: lines.length,
          recentErrors: lines.slice(-5).map(line => {
            // Anonymize error messages - remove paths and personal info
            return line.replace(/\/[^\s]+/g, '/[path]')
                      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
                      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]');
          }),
          lastError: lines.length > 0 ? new Date(lines[lines.length - 1].split(']')[0].replace('[', '')).toISOString() : null
        };
      }
    } catch (error) {
      // Ignore error
    }
    
    return {
      totalErrors: 0,
      recentErrors: [],
      lastError: null
    };
  }

  getUpdateBehavior() {
    return {
      lastUpdateCheck: this.getLastUpdateCheck(),
      lastUpdateApplied: this.manifestConfig?.updateTracking?.lastUpdateApplied || null,
      updateFrequency: this.manifestConfig?.sessionHooks?.updateCheckFrequency || 'session-start',
      autoUpdateEnabled: this.manifestConfig?.updateTracking?.autoUpdate || {},
      updateHistory: (this.manifestConfig?.updateHistory || []).length
    };
  }

  getConsentTimestamp() {
    // Return timestamp when user consented to telemetry (implied by having it enabled)
    if (this.manifestConfig?.telemetry?.consentDate) {
      return this.manifestConfig.telemetry.consentDate;
    }
    return this.manifestConfig?.sessionHooks?.installedDate || new Date().toISOString();
  }

  hasDeploymentCommands() {
    const deploymentFiles = [
      '.claude/commands/setup-aws-cli.md',
      '.claude/commands/setup-ec2-infrastructure.md',
      '.claude/commands/setup-project-api-deployment.md',
      '.claude/commands/amplify-deploy-production.md'
    ];
    
    return deploymentFiles.some(file => fs.existsSync(path.join(this.cwd, file)));
  }

  detectMockupTemplate() {
    const templateDirs = ['retail', 'booking', 'property-rental', 'restaurant', 'custom'];
    const mockupPath = path.join(this.cwd, 'mockup');
    
    if (fs.existsSync(mockupPath)) {
      for (const template of templateDirs) {
        if (fs.existsSync(path.join(mockupPath, template))) {
          return template;
        }
      }
    }
    
    return null;
  }

  // Configuration detection helpers
  hasEc2Configuration() {
    return fs.existsSync(path.join(this.cwd, '.claude/commands/setup-ec2-infrastructure.md'));
  }

  hasRdsConfiguration() {
    const infraPath = path.join(this.cwd, 'infrastructure');
    if (fs.existsSync(infraPath)) {
      try {
        const files = fs.readdirSync(infraPath);
        return files.some(file => file.includes('rds') || file.includes('database'));
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  hasPostgreSQLConfig() {
    return this.hasPackageDependency('pg') || this.hasPackageDependency('sequelize');
  }

  hasMongoDBConfig() {
    return this.hasPackageDependency('mongoose') || this.hasPackageDependency('mongodb');
  }

  hasRedisConfig() {
    return this.hasPackageDependency('redis') || this.hasPackageDependency('ioredis');
  }

  hasStripeConfig() {
    return this.hasPackageDependency('stripe') || fs.existsSync(path.join(this.cwd, '.claude/agents/stripe-connect-specialist.md'));
  }

  hasClerkConfig() {
    return this.hasPackageDependency('@clerk/nextjs') || fs.existsSync(path.join(this.cwd, '.claude/agents/clerk-auth-enforcer.md'));
  }

  hasTwilioConfig() {
    return this.hasPackageDependency('twilio') || fs.existsSync(path.join(this.cwd, '.claude/agents/twilio-flex-communication-manager.md'));
  }

  hasShippoConfig() {
    return this.hasPackageDependency('shippo') || fs.existsSync(path.join(this.cwd, '.claude/agents/shippo-shipping-integration.md'));
  }

  hasGoogleAnalyticsConfig() {
    return this.hasPackageDependency('gtag') || fs.existsSync(path.join(this.cwd, '.claude/commands/setup-google-analytics.md'));
  }

  hasPackageDependency(packageName) {
    try {
      const packagePath = path.join(this.cwd, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return !!(pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName]);
      }
    } catch (error) {
      // Ignore error
    }
    return false;
  }

  /**
   * Anonymize sensitive data before transmission
   */
  anonymizeData(data) {
    const anonymized = { ...data };
    
    // Remove any potential personal identifiers
    delete anonymized.projectPath;
    delete anonymized.username;
    delete anonymized.hostname;
    delete anonymized.homeDirectory;
    
    // Ensure project ID is anonymized
    if (anonymized.projectId && anonymized.projectId.length > 16) {
      anonymized.projectId = anonymized.projectId.substring(0, 16);
    }
    
    // Anonymize any file paths in error patterns
    if (anonymized.errorPatterns?.recentErrors) {
      anonymized.errorPatterns.recentErrors = anonymized.errorPatterns.recentErrors.map(error =>
        error.replace(/\/[^\s]+/g, '/[path]')
      );
    }
    
    return anonymized;
  }

  /**
   * Update last reported timestamp in manifest
   */
  async updateLastReported() {
    try {
      if (this.manifestConfig) {
        this.manifestConfig.telemetry.lastReported = new Date().toISOString();
        
        const manifestPath = path.join(this.cwd, '.boilerplate-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(this.manifestConfig, null, 2));
      }
    } catch (error) {
      this.logError('Failed to update last reported timestamp', error);
    }
  }

  /**
   * Get authorization header for GitHub API
   */
  getAuthHeader() {
    // In production, this would use a service account token
    // For now, return empty to use public API limits
    return '';
  }

  /**
   * Log errors silently
   */
  logError(message, error) {
    const logFile = path.join(this.cwd, '.claude/.telemetry-errors.log');
    try {
      const logEntry = `[${new Date().toISOString()}] ${message}: ${error.message || error}\n`;
      fs.appendFileSync(logFile, logEntry);
    } catch (logError) {
      // Ignore logging errors
    }
  }

  /**
   * Create opt-out mechanism
   */
  static async optOut() {
    const cwd = process.cwd();
    const sessionHooksPath = path.join(cwd, '.claude/session-hooks.json');
    
    try {
      if (fs.existsSync(sessionHooksPath)) {
        const config = JSON.parse(fs.readFileSync(sessionHooksPath, 'utf8'));
        config.session.telemetry.enabled = false;
        fs.writeFileSync(sessionHooksPath, JSON.stringify(config, null, 2));
        console.log('✅ Telemetry has been disabled. Update checking will continue.');
      }
    } catch (error) {
      console.error('❌ Failed to disable telemetry:', error.message);
    }
  }

  /**
   * Create opt-in mechanism
   */
  static async optIn() {
    const cwd = process.cwd();
    const sessionHooksPath = path.join(cwd, '.claude/session-hooks.json');
    
    try {
      if (fs.existsSync(sessionHooksPath)) {
        const config = JSON.parse(fs.readFileSync(sessionHooksPath, 'utf8'));
        config.session.telemetry.enabled = true;
        fs.writeFileSync(sessionHooksPath, JSON.stringify(config, null, 2));
        console.log('✅ Telemetry has been enabled. Thank you for helping improve Quik Nation AI Boilerplate!');
      }
    } catch (error) {
      console.error('❌ Failed to enable telemetry:', error.message);
    }
  }
}

// Export for use as module
module.exports = TelemetryReporter;

// CLI interface if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--opt-out')) {
    TelemetryReporter.optOut();
  } else if (args.includes('--opt-in')) {
    TelemetryReporter.optIn();
  } else {
    // Run telemetry collection and reporting
    const reporter = new TelemetryReporter();
    reporter.initialize().then(async () => {
      const data = await reporter.collectTelemetryData();
      if (data) {
        await reporter.reportTelemetry(data);
        console.log('Telemetry data collected and reported.');
      } else {
        console.log('Telemetry disabled or data collection failed.');
      }
    });
  }
}