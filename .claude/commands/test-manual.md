# test-manual

Manual web application testing using Playwright MCP or Chrome DevTools MCP for interactive browser testing and debugging.

## Usage
```bash
/test-manual [url] [test-scenario] [options]
```

## Aliases
- `manual-test`
- `browser-test`
- `e2e-test`

## Description
Launches an interactive browser testing session using Playwright MCP or Chrome DevTools MCP to manually test web applications. Supports navigation, form filling, screenshots, console monitoring, network inspection, and comprehensive error reporting.

## Options
- `--mcp [playwright|chrome]` - Choose MCP provider (default: playwright)
- `--url [url]` - Starting URL for the test session
- `--scenario [description]` - Test scenario to execute
- `--headless` - Run in headless mode (default: false for manual testing)
- `--screenshots` - Automatically take screenshots at key steps
- `--console-errors` - Monitor and report console errors
- `--network-logs` - Capture network request/response logs
- `--login [credentials]` - Auto-login with provided credentials
- `--wait [selector]` - Wait for specific element before proceeding
- `--viewport [width]x[height]` - Set viewport dimensions (default: 1920x1080)
- `--report` - Generate detailed test report

## Examples

### Basic Page Testing
```bash
# Test homepage
/test-manual http://localhost:3000

# Test with specific scenario
/test-manual http://localhost:3000 "Verify homepage loads correctly"

# Test with screenshots and console monitoring
/test-manual http://localhost:3000 --screenshots --console-errors
```

### Login Flow Testing
```bash
# Test login with credentials
/test-manual http://localhost:3000/sign-in --login "email:user@example.com,password:Pass123!"

# Test login and navigate to admin
/test-manual http://localhost:3000 --scenario "Login as admin and access dashboard" --login "email:admin@example.com,password:Admin123!"
```

### Form Testing
```bash
# Test checkout form
/test-manual http://localhost:3000/checkout --scenario "Fill checkout form and validate submission"

# Test contact form with screenshots
/test-manual http://localhost:3000/contact --scenario "Submit contact form" --screenshots
```

### Admin Panel Testing
```bash
# Test admin dashboard with full monitoring
/test-manual http://localhost:3000/admin --login "email:admin@example.com,password:Pass123!" --console-errors --network-logs --screenshots

# Test specific admin feature
/test-manual http://localhost:3000/admin/products --scenario "Create new product" --report
```

### Error Debugging
```bash
# Debug white screen issue
/test-manual http://localhost:3000 --console-errors --network-logs --scenario "Investigate white screen after login"

# Test error boundary
/test-manual http://localhost:3000/admin --scenario "Test error boundary handling" --screenshots
```

### Chrome DevTools MCP
```bash
# Use Chrome DevTools instead of Playwright
/test-manual http://localhost:3000 --mcp chrome --console-errors

# Chrome with performance profiling
/test-manual http://localhost:3000 --mcp chrome --scenario "Performance audit" --network-logs
```

## Common Test Scenarios

### Authentication Testing
```bash
/test-manual http://localhost:3000/sign-in --scenario "Test login flow: 1) Navigate to login, 2) Enter credentials, 3) Submit, 4) Verify redirect, 5) Check auth state"
```

### Navigation Testing
```bash
/test-manual http://localhost:3000 --scenario "Test site navigation: 1) Click Products, 2) Click specific product, 3) Add to cart, 4) Navigate to checkout"
```

### Form Validation
```bash
/test-manual http://localhost:3000/checkout --scenario "Test form validation: 1) Submit empty form, 2) Verify error messages, 3) Fill valid data, 4) Submit successfully"
```

### Responsive Design
```bash
/test-manual http://localhost:3000 --viewport 375x667 --scenario "Test mobile responsiveness"
/test-manual http://localhost:3000 --viewport 768x1024 --scenario "Test tablet layout"
```

### API Integration
```bash
/test-manual http://localhost:3000/admin --network-logs --scenario "Test GraphQL queries: 1) Load dashboard, 2) Monitor network, 3) Verify API responses"
```

## Implementation

When this command is executed, Claude will:

1. **Initialize Browser Session**
   - Choose MCP provider (Playwright or Chrome)
   - Navigate to specified URL
   - Set viewport dimensions
   - Configure monitoring options

2. **Execute Test Scenario**
   - Parse and understand test instructions
   - Interact with page elements
   - Fill forms, click buttons, navigate
   - Handle authentication if specified

3. **Monitor & Capture**
   - Take screenshots at key steps
   - Monitor console for errors/warnings
   - Capture network requests/responses
   - Track page load performance

4. **Report Results**
   - Summarize test execution
   - List discovered issues
   - Include screenshots as evidence
   - Provide recommendations

## Test Scenario Format

Test scenarios can be written in natural language:

**Simple:**
```
"Login and check dashboard"
```

**Detailed Steps:**
```
"1) Navigate to login page
 2) Enter email: user@example.com
 3) Enter password: Pass123!
 4) Click sign in button
 5) Verify redirect to dashboard
 6) Check dashboard metrics load"
```

**With Assertions:**
```
"Login flow:
 - GIVEN: User on homepage
 - WHEN: Click sign in
 - THEN: Should see login form
 - WHEN: Enter valid credentials
 - THEN: Should redirect to /
 - AND: User profile should display"
```

## MCP Provider Comparison

### Playwright MCP (Default)
**Best for:**
- End-to-end testing
- Cross-browser testing
- Automated test scenarios
- Complex user flows

**Features:**
- Snapshot-based interaction
- Element reference system
- Form filling capabilities
- Wait for conditions
- Multi-tab support

### Chrome DevTools MCP
**Best for:**
- Performance profiling
- Network analysis
- Memory debugging
- Detailed console inspection

**Features:**
- Real-time DevTools integration
- Performance metrics
- CPU/Memory profiling
- Network throttling
- Advanced debugging

## Requirements
- Playwright MCP server configured (for --mcp playwright)
- Chrome DevTools MCP server configured (for --mcp chrome)
- Target application running (for localhost URLs)
- Valid credentials (for authentication testing)

## Best Practices

1. **Start Simple:** Begin with basic navigation, add complexity incrementally
2. **Use Screenshots:** Always capture screenshots for visual verification
3. **Monitor Console:** Enable console error monitoring to catch JavaScript issues
4. **Network Inspection:** Check network logs for API failures
5. **Descriptive Scenarios:** Write clear, step-by-step test instructions
6. **Verify State:** Check application state after each major action
7. **Error Boundaries:** Test error handling and recovery flows

## Troubleshooting

### Page Won't Load
```bash
/test-manual http://localhost:3000 --console-errors --network-logs
# Check console and network tabs for errors
```

### Login Fails
```bash
/test-manual http://localhost:3000/sign-in --scenario "Debug login: 1) Check form elements, 2) Monitor network, 3) Verify credentials"
```

### White Screen Issue
```bash
/test-manual http://localhost:3000 --console-errors --scenario "1) Load page, 2) Wait 5 seconds, 3) Check if content appears, 4) Capture console errors"
```

### Error Boundary Triggered
```bash
/test-manual http://localhost:3000/admin --screenshots --scenario "Navigate to admin, capture error boundary if shown"
```

## Related Commands
- `/docker-logs` - Check backend logs during testing
- `/docker-monitor` - Monitor Docker container health
- `/amplify-deploy-status` - Check deployment status for production testing

## Notes
- Default MCP provider is Playwright for better automation support
- Screenshots are saved to `.playwright-mcp/` or Chrome temp directory
- Network logs include GraphQL queries and REST API calls
- Console monitoring captures errors, warnings, and debug logs
- Login credentials can be stored in environment variables for security
