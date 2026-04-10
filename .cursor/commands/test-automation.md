# Test-Automation - Comprehensive Testing and Quality Assurance

Orchestrated multi-agent command for comprehensive test automation across unit, integration, end-to-end, and cross-browser testing. This command coordinates specialized agents to handle test strategy, execution, browser automation, and cloud device testing with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate five specialized testing agents:

1. **testing-automation-agent**: Test strategy, unit/integration tests, coverage analysis, test generation
2. **playwright-test-executor**: Automated test execution monitoring, reporting, proactive test running
3. **chrome-mcp-agent**: Chrome DevTools Protocol, performance profiling, accessibility audits
4. **playwright-mcp-agent**: Cross-browser testing (Chromium, Firefox, WebKit), visual regression
5. **browserstack-mcp-agent**: Real device cloud testing, legacy browser validation, mobile testing

The orchestrator intelligently coordinates these agents to provide comprehensive testing capabilities from test planning through execution and reporting.

## When to Use This Command

Use `/test-automation` when you need to:
- Generate comprehensive test suites for new features
- Execute end-to-end tests across multiple browsers
- Validate cross-browser compatibility on real devices
- Run performance profiling and Core Web Vitals analysis
- Conduct accessibility audits (WCAG 2.1 AA compliance)
- Perform visual regression testing
- Test on mobile devices (iOS/Android)
- Validate legacy browser support
- Analyze test coverage and generate missing tests
- Monitor and execute tests proactively during development

## Command Usage

### Complete Testing Suite
```bash
/test-automation "Run comprehensive test suite for authentication feature"
# Orchestrator activates ALL testing agents in coordinated sequence:
# 1. testing-automation-agent: Generate/validate test strategy
# 2. playwright-test-executor: Run E2E tests locally
# 3. chrome-mcp-agent: Performance and accessibility audits
# 4. playwright-mcp-agent: Cross-browser validation
# 5. browserstack-mcp-agent: Real device testing
```

### Unit and Integration Tests
```bash
/test-automation --unit "Run unit tests for GraphQL resolvers"
# testing-automation-agent executes:
# - Unit test suite with Jest
# - Coverage analysis
# - Missing test detection

/test-automation --integration "Run API integration tests"
# testing-automation-agent executes:
# - Integration test suite
# - Database integration tests
# - External service mock validation
```

### End-to-End Testing
```bash
/test-automation --e2e "Run E2E tests for checkout flow"
# Orchestrator coordinates:
# - playwright-test-executor: Local E2E test execution
# - playwright-mcp-agent: Cross-browser E2E tests
# - testing-automation-agent: Test result analysis
```

### Cross-Browser Testing
```bash
/test-automation --cross-browser "Test on Chromium, Firefox, WebKit"
# playwright-mcp-agent executes tests across browsers:
# - Chromium (Chrome/Edge)
# - Firefox
# - WebKit (Safari)
# - Mobile browsers (emulated)
```

### Real Device Testing
```bash
/test-automation --real-devices "iPhone 15,Galaxy S24,Pixel 8"
# browserstack-mcp-agent executes on actual devices:
# - Real iOS devices
# - Real Android devices
# - Actual hardware and OS versions
```

### Performance Testing
```bash
/test-automation --performance "Profile checkout page performance"
# chrome-mcp-agent executes:
# - Core Web Vitals measurement
# - Lighthouse performance audit
# - CPU and memory profiling
# - Network performance analysis
```

### Accessibility Testing
```bash
/test-automation --accessibility "Audit accessibility compliance"
# chrome-mcp-agent executes:
# - Lighthouse accessibility audit
# - WCAG 2.1 AA compliance validation
# - Screen reader compatibility testing
# - Keyboard navigation validation
```

### Visual Regression Testing
```bash
/test-automation --visual-regression --baseline=main
# playwright-mcp-agent executes:
# - Screenshot capture across viewports
# - Pixel-perfect comparison with baseline
# - Highlight visual differences
# - Generate diff reports
```

### Test Generation
```bash
/test-automation --generate "Generate tests for user profile component"
# testing-automation-agent:
# - Analyzes component implementation
# - Generates unit tests
# - Creates integration tests
# - Provides E2E test templates
```

## Testing Workflows

### 1. Test-Driven Development (TDD)
TDD workflow with comprehensive test generation:
- **Write Tests First**: Generate test scaffolding
- **Implement Feature**: Code to pass tests
- **Refactor**: Improve implementation
- **Validate**: Run complete test suite
- **Coverage**: Ensure 80%+ coverage

### 2. Behavior-Driven Development (BDD)
BDD workflow with Gherkin scenarios:
- **Define Behavior**: Write Given-When-Then scenarios
- **Generate Tests**: Convert scenarios to executable tests
- **Implement**: Code to fulfill behavior
- **Execute**: Run behavioral tests
- **Document**: Living documentation from tests

### 3. Continuous Testing
Automated testing during development:
- **Watch Mode**: Tests run on file changes
- **Pre-commit**: Tests run before commits
- **CI/CD Integration**: Tests in pipeline
- **Production Monitoring**: Synthetic tests in prod

### 4. Cross-Platform Validation
Comprehensive platform coverage:
- **Local Testing**: Playwright local execution
- **Browser Matrix**: Cross-browser with Playwright MCP
- **Real Devices**: BrowserStack cloud testing
- **Performance**: Chrome DevTools profiling

## Test Strategy and Coverage

### Unit Testing
```bash
/test-automation --unit --coverage
# testing-automation-agent ensures:
# - 80%+ code coverage minimum
# - All public APIs tested
# - Edge cases covered
# - Mocking external dependencies
# - Fast execution (<5s for full suite)
```

### Integration Testing
```bash
/test-automation --integration --database
# testing-automation-agent validates:
# - Database operations
# - External API integration
# - Authentication flows
# - File upload/download
# - Webhook processing
```

### End-to-End Testing
```bash
/test-automation --e2e --critical-paths
# playwright-test-executor runs:
# - User registration and login
# - Purchase and checkout flows
# - Account management
# - Key business workflows
# - Error handling scenarios
```

### Performance Testing
```bash
/test-automation --performance --metrics
# chrome-mcp-agent measures:
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms
# - Cumulative Layout Shift (CLS) < 0.1
# - Time to Interactive (TTI)
# - Total Blocking Time (TBT)
```

### Accessibility Testing
```bash
/test-automation --accessibility --wcag-aa
# chrome-mcp-agent validates:
# - WCAG 2.1 AA compliance
# - Screen reader compatibility
# - Keyboard navigation
# - Color contrast ratios
# - ARIA attribute correctness
```

## Browser and Device Testing

### Local Browser Testing
```bash
/test-automation --playwright --browsers=all
# playwright-mcp-agent tests on:
# - Chromium (latest)
# - Firefox (latest)
# - WebKit (latest)
# - Mobile Chrome (emulated)
# - Mobile Safari (emulated)
```

### Cloud Device Testing
```bash
/test-automation --browserstack --matrix
# browserstack-mcp-agent tests on:
# - Real iOS devices (iPhone 15, 14, 13, etc.)
# - Real Android devices (Galaxy, Pixel, etc.)
# - Desktop browsers (Chrome, Firefox, Safari, Edge, IE11)
# - Various OS versions (Windows, macOS, iOS, Android)
```

### Legacy Browser Support
```bash
/test-automation --browserstack --legacy
# Tests on legacy browsers:
# - Internet Explorer 11
# - Safari 12
# - Chrome 70
# - Firefox 60
```

### Mobile Testing
```bash
/test-automation --mobile --orientations
# Tests mobile-specific features:
# - Portrait and landscape orientations
# - Touch gestures
# - Mobile viewport sizes
# - Device-specific features (camera, GPS)
```

## Integration with Development Workflow

### With Frontend-Dev
```bash
# After frontend implementation
/frontend-dev "Complete product listing page"
# Then test:
/test-automation --e2e "Test product listing functionality"
```

### With Backend-Dev
```bash
# After backend implementation
/backend-dev "Implement order GraphQL API"
# Then test:
/test-automation --integration "Test order API endpoints"
```

### With Process-Todos
```bash
# During development
/process-todos --task=AUTH-123
# Automated testing runs proactively:
# playwright-test-executor monitors code changes
# Runs relevant tests automatically
```

### With Debug-Fix
```bash
# After fixing bugs
/debug-fix "Fix checkout validation error"
# Then validate fix:
/test-automation --regression "Validate bug fix doesn't break other features"
```

### With Deploy-Ops
```bash
# Before deployment
/test-automation --pre-deploy
# Then deploy if tests pass:
/deploy-ops --backend --production
```

## Advanced Testing Features

### Parallel Test Execution
```bash
/test-automation --parallel --workers=4
# Runs tests in parallel across:
# - Multiple CPU cores
# - Multiple browsers simultaneously
# - Distributed across cloud devices
```

### Test Retries and Flake Detection
```bash
/test-automation --retry=2 --detect-flakes
# Handles flaky tests:
# - Automatic retry on failure
# - Flake detection and reporting
# - Quarantine unstable tests
# - Root cause analysis
```

### Test Data Management
```bash
/test-automation --seed-data
# Manages test data:
# - Database seeding
# - Fixture management
# - Test data isolation
# - Cleanup after tests
```

### Visual Testing
```bash
/test-automation --visual --update-baseline
# Visual regression testing:
# - Capture screenshots
# - Compare with baseline
# - Highlight differences
# - Update baseline if intentional changes
```

### API Contract Testing
```bash
/test-automation --contract --graphql
# Validates API contracts:
# - GraphQL schema validation
# - Request/response formats
# - Error response structures
# - Versioning compatibility
```

## Performance and Optimization

### Test Execution Speed
```bash
/test-automation --optimize
# Optimizes test performance:
# - Parallel execution
# - Test sharding
# - Browser reuse
# - Smart test selection
```

### Test Coverage Analysis
```bash
/test-automation --coverage --report
# Comprehensive coverage analysis:
# - Statement coverage
# - Branch coverage
# - Function coverage
# - Line coverage
# - Uncovered code identification
```

### CI/CD Integration
```bash
/test-automation --ci
# Optimized for CI/CD:
# - Headless browser mode
# - Parallel execution
# - XML/JSON reporting
# - Artifact generation
# - Fast feedback loops
```

## Monitoring and Reporting

### Test Reports
```bash
/test-automation --report
# Generates comprehensive reports:
# - HTML test reports with screenshots
# - Coverage reports with metrics
# - Performance benchmark reports
# - Accessibility compliance reports
# - Visual regression diff reports
```

### Real-Time Monitoring
```bash
/test-automation --watch
# Continuous testing:
# - Monitors file changes
# - Runs affected tests
# - Instant feedback
# - Live reload results
```

### Metrics and Analytics
```bash
/test-automation --metrics
# Testing analytics:
# - Test execution duration trends
# - Pass/fail rate over time
# - Flaky test identification
# - Coverage trends
# - Performance regression detection
```

## Proactive Testing Features

### Automatic Test Execution
The playwright-test-executor agent runs proactively:
- **Code Change Detection**: Automatically runs tests when code changes
- **Relevant Test Selection**: Only runs tests affected by changes
- **Background Execution**: Tests run without interrupting development
- **Immediate Feedback**: Notifies of failures immediately

### Pre-Commit Validation
```bash
/test-automation --pre-commit
# Runs before git commit:
# - Unit tests for changed files
# - Linting and formatting
# - Type checking
# - Quick smoke tests
```

### Pre-Deploy Validation
```bash
/test-automation --pre-deploy
# Comprehensive validation before deployment:
# - Full test suite execution
# - Cross-browser validation
# - Performance regression check
# - Security scan
# - Accessibility audit
```

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides testing requirements and coverage targets
- **Test Infrastructure**: Jest, React Testing Library, Playwright configured
- **Browser Binaries**: Playwright browsers installed
- **BrowserStack Account**: For real device cloud testing
- **CI/CD Pipeline**: For automated testing integration

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Comprehensive Coverage**: Coordinates all testing layers from unit to E2E
- **Intelligent Test Selection**: Runs only relevant tests based on changes
- **Cross-Platform Validation**: Ensures consistency across browsers and devices
- **Performance Optimization**: Parallel execution and smart caching
- **Proactive Testing**: Automatic test execution during development
- **Unified Reporting**: Consolidated test results from all agents
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Test Pyramid
```bash
# Follow test pyramid - many unit tests, fewer E2E tests
/test-automation --unit # Fast, run frequently (70%)
/test-automation --integration # Medium speed (20%)
/test-automation --e2e # Slow, run less frequently (10%)
```

### Test Isolation
```bash
# Ensure tests are independent and can run in any order
/test-automation --shuffle
# Randomizes test execution order to detect dependencies
```

### Clean Test Data
```bash
# Always clean up test data
/test-automation --cleanup-after
# Ensures each test starts with clean state
```

## Output and Deliverables

### Test Reports
- HTML test reports with embedded screenshots and videos
- Coverage reports with uncovered code highlighted
- Performance benchmark reports with Core Web Vitals
- Accessibility audit reports with WCAG compliance scores
- Visual regression diff reports with highlighted changes
- Cross-browser compatibility matrix

### Test Artifacts
- Test execution videos for debugging
- Screenshots of failures
- Trace files for time-travel debugging
- Performance profiles
- Network HAR files
- Console logs

### Metrics
- Test pass/fail rates
- Code coverage percentages
- Test execution duration
- Performance metrics (LCP, FID, CLS)
- Accessibility scores
- Flaky test identification

## Related Commands

- `/frontend-dev` - Frontend implementation with tests
- `/backend-dev` - Backend implementation with tests
- `/debug-fix` - Debug failing tests
- `/deploy-ops` - Deploy after tests pass
- `/process-todos` - Development with proactive testing

## Emergency Testing Support

For critical production validation:

```bash
/test-automation --emergency --smoke-tests
# Rapid validation:
# - Critical path smoke tests
# - Performance regression check
# - Security vulnerability scan
# - Immediate feedback on production readiness
```

## Continuous Improvement

```bash
/test-automation --analyze-failures
# Analyzes test failures to:
# - Identify patterns in failures
# - Suggest test improvements
# - Detect flaky tests
# - Recommend additional test coverage
```
