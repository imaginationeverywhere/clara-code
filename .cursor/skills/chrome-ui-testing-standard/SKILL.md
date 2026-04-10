---
name: chrome-ui-testing-standard
description: Browser-based UI testing, debugging, and performance analysis using Claude-in-Chrome MCP tools. Compare across local, develop, and production environments, capture screenshots, analyze network requests, and fix issues in real-time.
---

# Chrome UI Testing Standard

Production-grade patterns for browser-based debugging, UI comparison, and performance analysis across all 3 boilerplate environments using Claude-in-Chrome MCP tools.

## Skill Metadata

- **Name:** chrome-ui-testing-standard
- **Version:** 1.0.0
- **Category:** Testing & Debugging
- **Source:** Quik Nation Boilerplate
- **Related Skills:** testing-automation-standard, nextjs-architecture-guide

## When to Use This Skill

Use this skill when:
- Comparing UI across local, develop, and production environments
- Debugging slow page loads or performance issues
- Capturing screenshots for documentation or regression testing
- Analyzing network requests and console errors
- Verifying fixes before deployment
- Conducting visual regression testing

## Core Patterns

### 1. Environment Configuration Schema

```json
{
  "$schema": "chrome-debug-config-v1",
  "project": "project-name",
  "environments": {
    "local": {
      "baseUrl": "http://localhost:3962",
      "envFile": "frontend/.env.local",
      "description": "Local development server",
      "healthCheck": "/api/health"
    },
    "develop": {
      "baseUrl": "https://develop.d1234567890.amplifyapp.com",
      "envFile": "frontend/.env.develop",
      "description": "AWS Amplify develop branch",
      "healthCheck": "/api/health"
    },
    "production": {
      "baseUrl": "https://site962.com",
      "envFile": "frontend/.env.production",
      "description": "AWS Amplify production (main)",
      "healthCheck": "/api/health"
    }
  },
  "testPages": [
    { "path": "/", "name": "Homepage" },
    { "path": "/events", "name": "Events List" },
    { "path": "/events/[slug]", "name": "Event Detail" },
    { "path": "/dashboard", "name": "Dashboard", "auth": true },
    { "path": "/admin", "name": "Admin Panel", "auth": true, "role": "admin" },
    { "path": "/pos", "name": "Point of Sale", "auth": true }
  ],
  "thresholds": {
    "performance": {
      "ttfb": 200,
      "fcp": 1800,
      "lcp": 2500,
      "cls": 0.1,
      "tti": 3800
    },
    "network": {
      "maxRequests": 50,
      "maxBundleSize": 500000,
      "maxImageSize": 100000,
      "maxApiLatency": 500
    }
  },
  "ignorePatterns": {
    "console": ["favicon", "hot-update"],
    "network": ["analytics", "sentry", "clerk"]
  }
}
```

### 2. Multi-Environment Comparison Pattern

```typescript
interface EnvironmentComparison {
  timestamp: string;
  page: string;
  environments: {
    local: EnvironmentResult;
    develop: EnvironmentResult;
    production: EnvironmentResult;
  };
  issues: Issue[];
  recommendations: Recommendation[];
}

interface EnvironmentResult {
  url: string;
  status: 'success' | 'error' | 'timeout';
  performance: PerformanceMetrics;
  network: NetworkAnalysis;
  console: ConsoleAnalysis;
  screenshot: string; // base64 or path
}

interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  tti: number;
  domContentLoaded: number;
  fullLoad: number;
}

// Comparison workflow
async function compareEnvironments(
  page: string,
  environments: string[] = ['local', 'develop', 'production']
): Promise<EnvironmentComparison> {
  const results: Record<string, EnvironmentResult> = {};

  for (const env of environments) {
    const config = getEnvironmentConfig(env);
    const url = `${config.baseUrl}${page}`;

    // Navigate and wait for load
    await navigate(url);
    await waitForPageLoad();

    // Collect metrics
    results[env] = {
      url,
      status: 'success',
      performance: await measurePerformance(),
      network: await analyzeNetwork(),
      console: await analyzeConsole(),
      screenshot: await captureScreenshot()
    };
  }

  return {
    timestamp: new Date().toISOString(),
    page,
    environments: results,
    issues: detectIssues(results),
    recommendations: generateRecommendations(results)
  };
}
```

### 3. Performance Measurement Pattern

```javascript
// Execute via mcp__claude-in-chrome__javascript_tool
async function measurePerformance() {
  const script = `
    (() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const layoutShift = performance.getEntriesByType('layout-shift');

      // Calculate CLS
      let cls = 0;
      layoutShift.forEach(entry => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });

      return {
        // Core Web Vitals
        ttfb: navigation?.responseStart || (timing.responseStart - timing.requestStart),
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: lcpEntries[lcpEntries.length - 1]?.startTime || 0,
        cls: cls,

        // Additional metrics
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,

        // Resource counts
        resourceCount: performance.getEntriesByType('resource').length,
        totalTransferSize: performance.getEntriesByType('resource')
          .reduce((sum, r) => sum + (r.transferSize || 0), 0)
      };
    })();
  `;

  return await executeJavaScript(script);
}
```

### 4. Network Analysis Pattern

```typescript
interface NetworkAnalysis {
  totalRequests: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  slowRequests: SlowRequest[];
  largeResources: LargeResource[];
  renderBlocking: string[];
  apiCalls: ApiCall[];
}

async function analyzeNetwork(): Promise<NetworkAnalysis> {
  // Read network requests from Chrome
  const requests = await readNetworkRequests();

  return {
    totalRequests: requests.length,
    totalSize: requests.reduce((sum, r) => sum + r.size, 0),

    byType: groupByType(requests),

    slowRequests: requests
      .filter(r => r.duration > 500)
      .map(r => ({
        url: r.url,
        duration: r.duration,
        type: r.type
      })),

    largeResources: requests
      .filter(r => r.size > 100000)
      .map(r => ({
        url: r.url,
        size: r.size,
        type: r.type
      })),

    renderBlocking: requests
      .filter(r => r.renderBlocking)
      .map(r => r.url),

    apiCalls: requests
      .filter(r => r.url.includes('/api/') || r.url.includes('/graphql'))
      .map(r => ({
        url: r.url,
        method: r.method,
        duration: r.duration,
        status: r.status
      }))
  };
}
```

### 5. Console Error Detection Pattern

```typescript
interface ConsoleAnalysis {
  errors: ConsoleMessage[];
  warnings: ConsoleMessage[];
  hydrationErrors: ConsoleMessage[];
  networkErrors: ConsoleMessage[];
}

async function analyzeConsole(): Promise<ConsoleAnalysis> {
  const messages = await readConsoleMessages({
    pattern: 'error|warning|hydration|failed'
  });

  return {
    errors: messages.filter(m => m.type === 'error'),
    warnings: messages.filter(m => m.type === 'warning'),
    hydrationErrors: messages.filter(m =>
      m.text.includes('Hydration') ||
      m.text.includes('did not match')
    ),
    networkErrors: messages.filter(m =>
      m.text.includes('Failed to fetch') ||
      m.text.includes('NetworkError')
    )
  };
}
```

### 6. Screenshot Comparison Pattern

```typescript
interface ScreenshotComparison {
  local: string;
  develop: string;
  production: string;
  diffs: {
    localVsDevelop: DiffResult;
    developVsProduction: DiffResult;
    localVsProduction: DiffResult;
  };
}

async function captureAndCompare(
  page: string
): Promise<ScreenshotComparison> {
  const screenshots: Record<string, string> = {};

  for (const env of ['local', 'develop', 'production']) {
    const config = getEnvironmentConfig(env);
    await navigate(`${config.baseUrl}${page}`);
    await waitForPageLoad();

    // Capture full page screenshot
    const result = await computer({
      action: 'screenshot',
      tabId: currentTabId
    });

    screenshots[env] = result.imageId;
  }

  return {
    local: screenshots.local,
    develop: screenshots.develop,
    production: screenshots.production,
    diffs: await generateDiffs(screenshots)
  };
}
```

### 7. Interactive Debug Session Pattern

```typescript
async function startDebugSession(
  env: string,
  page: string,
  options: DebugOptions
): Promise<void> {
  const config = getEnvironmentConfig(env);
  const url = `${config.baseUrl}${page}`;

  // Navigate and set up monitoring
  await navigate(url);

  // Start continuous monitoring
  const monitoring = {
    console: startConsoleMonitor(),
    network: startNetworkMonitor(),
    errors: startErrorMonitor()
  };

  // Initial analysis
  const initialState = {
    performance: await measurePerformance(),
    network: await analyzeNetwork(),
    console: await analyzeConsole()
  };

  console.log('Debug session started');
  console.log('Initial metrics:', initialState);

  // Enter interactive loop
  while (true) {
    const userAction = await waitForUserInput();

    if (userAction === 'fix') {
      // Identify issues and suggest fixes
      const issues = await detectIssues();
      const fixes = await suggestFixes(issues);
      await presentFixes(fixes);
    } else if (userAction === 'verify') {
      // Re-measure after changes
      const newState = await measurePerformance();
      await compareStates(initialState, newState);
    } else if (userAction === 'screenshot') {
      await captureScreenshot();
    } else if (userAction === 'done') {
      break;
    }
  }

  // Cleanup
  await stopMonitoring(monitoring);
}
```

### 8. Issue Detection & Fix Suggestion Pattern

```typescript
interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  environment: string;
  evidence: any;
  suggestedFix: Fix;
}

interface Fix {
  description: string;
  file?: string;
  line?: number;
  code?: string;
  automated: boolean;
}

function detectIssues(comparison: EnvironmentComparison): Issue[] {
  const issues: Issue[] = [];

  // Performance issues
  for (const [env, result] of Object.entries(comparison.environments)) {
    const perf = result.performance;

    if (perf.ttfb > 500) {
      issues.push({
        id: `ttfb-${env}`,
        severity: perf.ttfb > 1000 ? 'critical' : 'high',
        category: 'performance',
        description: `Slow Time to First Byte (${perf.ttfb}ms) on ${env}`,
        environment: env,
        evidence: { ttfb: perf.ttfb },
        suggestedFix: {
          description: 'Optimize server response time',
          automated: false
        }
      });
    }

    if (perf.lcp > 2500) {
      issues.push({
        id: `lcp-${env}`,
        severity: perf.lcp > 4000 ? 'critical' : 'high',
        category: 'performance',
        description: `Poor Largest Contentful Paint (${perf.lcp}ms) on ${env}`,
        environment: env,
        evidence: { lcp: perf.lcp },
        suggestedFix: {
          description: 'Optimize largest content element loading',
          automated: false
        }
      });
    }
  }

  // Network issues
  for (const [env, result] of Object.entries(comparison.environments)) {
    for (const slow of result.network.slowRequests) {
      if (slow.url.includes('/api/') || slow.url.includes('/graphql')) {
        issues.push({
          id: `slow-api-${env}`,
          severity: 'high',
          category: 'api',
          description: `Slow API call (${slow.duration}ms): ${slow.url}`,
          environment: env,
          evidence: slow,
          suggestedFix: {
            description: 'Add DataLoader, caching, or optimize query',
            automated: false
          }
        });
      }
    }

    for (const large of result.network.largeResources) {
      if (large.type === 'image') {
        issues.push({
          id: `large-image-${env}`,
          severity: 'medium',
          category: 'assets',
          description: `Large image (${(large.size / 1024).toFixed(0)}KB): ${large.url}`,
          environment: env,
          evidence: large,
          suggestedFix: {
            description: 'Use Next.js Image component with WebP format',
            automated: true,
            code: `<Image src="${large.url}" alt="" width={800} height={600} />`
          }
        });
      }
    }
  }

  // Console errors
  for (const [env, result] of Object.entries(comparison.environments)) {
    for (const error of result.console.errors) {
      issues.push({
        id: `console-error-${env}`,
        severity: 'high',
        category: 'runtime',
        description: `Console error on ${env}: ${error.text.substring(0, 100)}`,
        environment: env,
        evidence: error,
        suggestedFix: {
          description: 'Fix the error in source code',
          automated: false
        }
      });
    }
  }

  return issues;
}
```

### 9. Report Generation Pattern

```typescript
async function generateReport(
  comparison: EnvironmentComparison
): Promise<string> {
  const report = `
# Environment Comparison Report

**Generated:** ${comparison.timestamp}
**Page:** ${comparison.page}

## Summary

| Metric | Local | Develop | Production | Status |
|--------|-------|---------|------------|--------|
| TTFB | ${format(comparison.environments.local.performance.ttfb)} | ${format(comparison.environments.develop.performance.ttfb)} | ${format(comparison.environments.production.performance.ttfb)} | ${getStatus('ttfb', comparison)} |
| FCP | ${format(comparison.environments.local.performance.fcp)} | ${format(comparison.environments.develop.performance.fcp)} | ${format(comparison.environments.production.performance.fcp)} | ${getStatus('fcp', comparison)} |
| LCP | ${format(comparison.environments.local.performance.lcp)} | ${format(comparison.environments.develop.performance.lcp)} | ${format(comparison.environments.production.performance.lcp)} | ${getStatus('lcp', comparison)} |
| CLS | ${comparison.environments.local.performance.cls.toFixed(3)} | ${comparison.environments.develop.performance.cls.toFixed(3)} | ${comparison.environments.production.performance.cls.toFixed(3)} | ${getStatus('cls', comparison)} |
| Requests | ${comparison.environments.local.network.totalRequests} | ${comparison.environments.develop.network.totalRequests} | ${comparison.environments.production.network.totalRequests} | ${getStatus('requests', comparison)} |
| Size | ${formatSize(comparison.environments.local.network.totalSize)} | ${formatSize(comparison.environments.develop.network.totalSize)} | ${formatSize(comparison.environments.production.network.totalSize)} | ${getStatus('size', comparison)} |
| Errors | ${comparison.environments.local.console.errors.length} | ${comparison.environments.develop.console.errors.length} | ${comparison.environments.production.console.errors.length} | ${getStatus('errors', comparison)} |

## Issues Detected

${comparison.issues.map(issue => `
### ${issue.severity.toUpperCase()}: ${issue.description}

- **Environment:** ${issue.environment}
- **Category:** ${issue.category}
- **Suggested Fix:** ${issue.suggestedFix.description}
${issue.suggestedFix.file ? `- **File:** ${issue.suggestedFix.file}:${issue.suggestedFix.line}` : ''}
${issue.suggestedFix.code ? `\n\`\`\`typescript\n${issue.suggestedFix.code}\n\`\`\`` : ''}
`).join('\n')}

## Recommendations

${comparison.recommendations.map((rec, i) => `${i + 1}. ${rec.description}`).join('\n')}

## Screenshots

| Local | Develop | Production |
|-------|---------|------------|
| ![Local](${comparison.environments.local.screenshot}) | ![Develop](${comparison.environments.develop.screenshot}) | ![Production](${comparison.environments.production.screenshot}) |
`;

  return report;
}
```

### 10. GIF Recording Pattern

```typescript
async function recordDebugSession(
  env: string,
  page: string,
  actions: string[]
): Promise<string> {
  const config = getEnvironmentConfig(env);

  // Start recording
  await gifCreator({ action: 'start_recording', tabId: currentTabId });

  // Navigate and capture initial state
  await navigate(`${config.baseUrl}${page}`);
  await computer({ action: 'screenshot', tabId: currentTabId });

  // Perform actions
  for (const action of actions) {
    await performAction(action);
    await computer({ action: 'screenshot', tabId: currentTabId });
    await computer({ action: 'wait', duration: 1, tabId: currentTabId });
  }

  // Stop and export
  await computer({ action: 'screenshot', tabId: currentTabId });
  await gifCreator({ action: 'stop_recording', tabId: currentTabId });

  const result = await gifCreator({
    action: 'export',
    tabId: currentTabId,
    download: true,
    filename: `debug-${env}-${Date.now()}.gif`
  });

  return result.filename;
}
```

## Directory Structure

```
.browser-debug/
├── config/
│   └── browser-debug.json         # Environment configuration
├── reports/
│   └── [timestamp]-report.md      # Generated reports
├── screenshots/
│   ├── local/
│   ├── develop/
│   └── production/
├── network/
│   └── [timestamp]-analysis.json  # Network HAR data
├── diffs/
│   └── [env1]-vs-[env2].png       # Visual diffs
└── recordings/
    └── [timestamp].gif            # Debug session recordings
```

## Best Practices

1. **Use Agent Browser by default** - Falls back to Chrome MCP if unavailable
2. **Always start with tab context** (Chrome MCP) or session init (Agent Browser)
2. **Wait for page load** - Use `wait` action before measurements
3. **Filter noise** - Use patterns to filter analytics/monitoring requests
4. **Capture baselines** - Take screenshots before making changes
5. **Record complex sessions** - Use GIF recording for documentation
6. **Generate reports** - Always create artifacts for tracking
7. **Compare incrementally** - Test local → develop → production

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Tab not found` | Stale tab ID | Refresh with `tabs_context_mcp` |
| `Navigation timeout` | Server not responding | Check server health |
| `Screenshot failed` | Page not loaded | Increase wait time |
| `Network read empty` | Requests cleared | Read before navigation |
| `JavaScript error` | Invalid script | Validate script syntax |

## Integration Points

### With Deployment Workflow
```
1. Developer makes changes locally
2. browser-debug compare local+prod /affected-page
3. If issues found, fix and verify
4. Push to develop branch
5. browser-debug compare dev+prod /affected-page
6. Merge to main
7. browser-debug sync-check
```

### With CI/CD
```yaml
# GitHub Actions integration
- name: Visual Regression Test
  run: |
    browser-debug regression dev+prod --report
    if [ -f .browser-debug/reports/*-issues.json ]; then
      exit 1
    fi
```

## Related Documentation

- **Command:** `.claude/commands/browser-debug.md` (renamed from `chrome-debug.md`)
- **Agent:** `.claude/agents/chrome-ui-debugger.md` (updated to `browser-debugger`)
- **Testing:** `.claude/skills/testing-automation-standard/SKILL.md`
