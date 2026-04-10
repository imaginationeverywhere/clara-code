# Community MCP Servers Status Example

This shows how `mcp-status` displays when community MCP servers like shadcn/ui, Context7, Playwright, and memory servers are integrated.

## Enhanced MCP Status Output

```bash
mcp-status --detailed
```

```
MCP SERVER STATUS OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVELOPMENT CORE (3/3 servers)
🟢 filesystem     - Secure filesystem operations
🟢 git            - Git repository management  
🟢 memory         - Cross-session context storage

UI COMPONENTS & DESIGN SYSTEMS (1/1 servers)
🟢 shadcn-ui      - shadcn/ui components integration
   └─ Features: Component browsing, natural language installation
   └─ Status: 847 components available, React integration active
   └─ Last used: 12 minutes ago (Button component installed)

DESIGN INTEGRATION (2/2 servers)
🟢 figma-context  - Figma design context and Dev Mode integration
   └─ Connected: 3 Figma files, 12 components synced
   └─ Last sync: 8 minutes ago
🟢 framelink-figma - Advanced Figma integration
   └─ Active frames: 5, Design tokens: 23 synced

TESTING & BROWSER AUTOMATION (1/1 servers)
🟢 playwright-automation - Browser automation and testing
   └─ Browsers: Chrome, Firefox, Safari available
   └─ Tests run: 15 (last 24h), Success rate: 93%
   └─ Active sessions: 2 browser instances

MEMORY & CONTEXT MANAGEMENT (1/1 servers)  
🟢 memory-persistent - Cross-session memory and context storage
   └─ Stored contexts: 1,247 items, 89MB cache
   └─ Pattern recognition: 156 development patterns learned
   └─ Session continuity: 99.2% context preservation

DOCUMENTATION & CONTEXT (1/1 servers)
🟢 context7       - Up-to-date documentation and library context
   └─ Documentation sources: 45 libraries indexed
   └─ Last update: 2 hours ago
   └─ Query cache: 234 recent lookups

DATABASE INTEGRATION (1/2 servers)
🟢 database       - PostgreSQL integration
🟡 sqlite         - SQLite database server (available for install)

API INTEGRATION (2/2 servers)  
🟢 http           - HTTP requests and API testing
🟢 graphql        - GraphQL server integration

CLOUD & DEPLOYMENT (1/3 servers)
🟡 aws            - AWS cloud management (needs credentials)
⚪ azure          - Azure cloud integration (available)
⚪ docker         - Container operations (available)

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Running: 11 servers
📦 Installed: 13 servers  
🔄 Available: 18 servers
🚫 Disabled: 0 servers

🌟 Community Servers Active: 6/6
📊 Enhanced Capabilities:
   • shadcn/ui: Component library access
   • Figma: Design-to-code workflow  
   • Playwright: Browser automation
   • Memory: Cross-session context
   • Context7: Real-time documentation

Auto-detection: ENABLED (including community servers)
Health monitoring: ENABLED
Last health check: 30 seconds ago
```

## Community Server Details

```bash
mcp-status shadcn-ui --detailed
```

```
SHADCN/UI MCP SERVER (ui-components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: 🟢 Running (4h 12m uptime)
Package: mcp-server-shadcn-ui (community)
Connection: https://www.shadcn.io/api/mcp
Installation: claude mcp add shadcn https://www.shadcn.io/api/mcp

🎨 COMPONENT REGISTRY ACCESS:
Available Components: 847 total
├── Form Components: 23 (Button, Input, Form, etc.)
├── Layout Components: 18 (Card, Sheet, Dialog, etc.) 
├── Data Display: 15 (Table, Badge, Avatar, etc.)
├── Navigation: 12 (Tabs, Breadcrumb, Pagination, etc.)
└── Feedback: 9 (Alert, Toast, Progress, etc.)

📊 USAGE STATISTICS:
Components Installed: 12 via natural language
Last Installation: "add a login form" → Form + Button + Input
Success Rate: 100% (all installations successful)
Integration: React + TypeScript + Tailwind CSS

🔧 RECENT ACTIVITY:
[16:23] Installed Button component with variants
[16:20] Searched for "authentication form components"
[16:18] Listed available form components
[16:15] Connected to shadcn/ui registry

🚀 CAPABILITIES:
✅ Natural language component installation
✅ Component documentation access
✅ Variant and styling information
✅ Dependency management (Radix UI, Lucide React)
✅ TypeScript definitions included

📝 INTEGRATION STATUS:
✅ components.json detected and configured
✅ Tailwind CSS integration active
✅ src/components/ui/ directory managed
✅ Package.json dependencies synchronized
```

## Playwright Automation Status

```bash
mcp-status playwright-automation --detailed
```

```
PLAYWRIGHT AUTOMATION SERVER (testing-automation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: 🟢 Running (2h 45m uptime)
Package: @microsoft/playwright-mcp
Installation: claude mcp add playwright mcp-server-playwright
Process ID: 15432

🎭 BROWSER AUTOMATION:
Available Browsers:
├── Chromium: v119.0.6045.105 ✅ Ready
├── Firefox: v118.0.1 ✅ Ready  
├── WebKit: v17.0 ✅ Ready
└── Chrome: v119.0.6045.105 ✅ Ready

🧪 TEST EXECUTION:
Tests Run Today: 23 total
├── E2E Tests: 15 (87% success rate)
├── Visual Tests: 5 (100% success rate)
├── API Tests: 3 (100% success rate)
└── Component Tests: 0

📊 AUTOMATION CAPABILITIES:
✅ Page interaction and navigation
✅ Form filling and submission
✅ Visual regression testing
✅ Cross-browser compatibility testing
✅ Mobile device emulation
✅ Network interception and mocking

🔧 RECENT ACTIVITY:
[15:45] Ran login flow E2E test (Chrome) - ✅ PASSED
[15:42] Visual comparison: checkout page - ✅ PASSED
[15:38] Form validation test (Firefox) - ✅ PASSED
[15:35] Mobile responsiveness test - ✅ PASSED

⚙️  CONFIGURATION:
Headless Mode: Enabled for CI/CD
Screenshots: Enabled on failure
Video Recording: Enabled for failed tests
Trace Collection: Enabled for debugging

🔗 INTEGRATION:
✅ Claude Code can control visible browser windows
✅ Test results integration with process-todos
✅ Automatic screenshot generation for failures
✅ Integration with git-commit-docs-command for test reports
```

## Memory Persistent Server Status

```bash
mcp-status memory-persistent --detailed
```

```
MEMORY PERSISTENT SERVER (memory-management)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: 🟢 Running (8h 34m uptime)
Package: claude-project-memory-mcp
Installation: npx -y claude-project-memory-mcp
Auto-activate: ✅ Always enabled

🧠 MEMORY STORAGE:
Total Stored Items: 1,247 contexts
Memory Usage: 89.2MB (optimized storage)
Index Size: 12.3MB (fast retrieval)
Compression Ratio: 67% (efficient storage)

📚 CONTEXT CATEGORIES:
├── Implementation Patterns: 456 items
│   └── React components, API patterns, database schemas
├── Development Decisions: 234 items  
│   └── Architecture choices, technology selections
├── Code Solutions: 198 items
│   └── Bug fixes, optimizations, refactoring patterns
├── Project Knowledge: 167 items
│   └── Business logic, requirements, team decisions
├── Error Resolutions: 134 items
│   └── Common issues, debugging solutions
└── Workflow Patterns: 58 items
    └── Git workflows, deployment processes, team practices

🎯 PATTERN RECOGNITION:
Active Patterns: 156 recognized development patterns
Learning Rate: 12 new patterns this week
Pattern Accuracy: 94.3% successful recommendations
Reuse Rate: 78% of solutions from existing patterns

🔧 RECENT MEMORY ACTIVITY:
[17:12] Stored: New authentication flow implementation
[17:08] Retrieved: Similar user dashboard patterns (3 matches)
[17:05] Indexed: Database migration pattern for PostgreSQL
[17:01] Suggested: Reuse checkout flow from e-commerce pattern

⚡ PERFORMANCE:
Context Retrieval: 23ms average
Pattern Matching: 156ms average  
Storage Operations: 45ms average
Session Continuity: 99.2% successful context restoration

🔗 INTEGRATION:
✅ Cross-session context preservation
✅ Pattern suggestions in process-todos
✅ Implementation history in spec-workflow
✅ Code reuse recommendations in create-plan-todo
```

## Enhanced Auto-Detection

```bash
mcp-status --project-analysis
```

```
🔍 PROJECT ANALYSIS WITH COMMUNITY SERVER DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMPREHENSIVE PROJECT ANALYSIS:
Technology Stack: Next.js + Express + PostgreSQL + shadcn/ui
Design Tools: Figma integration detected
Testing Framework: Playwright configured
UI Library: shadcn/ui components in use

🎯 COMMUNITY SERVER RECOMMENDATIONS:

ESSENTIAL COMMUNITY SERVERS (Auto-activate):
✅ shadcn-ui - shadcn/ui components detected in package.json
   └─ Trigger: components.json + @radix-ui dependencies found
✅ context7 - Real-time documentation access (always beneficial)
✅ memory-persistent - Cross-session context storage (always beneficial)

HIGH PRIORITY COMMUNITY SERVERS (Strong indicators):
🔥 figma-context - Figma references in PRD.md + design/ directory
   └─ Trigger: "Figma" mentioned 8 times in documentation
🔥 playwright-automation - playwright.config.ts detected
   └─ Trigger: @playwright/test in devDependencies + tests/ directory

MEDIUM PRIORITY (Some indicators):
🔧 framelink-figma - Advanced Figma integration (design system focus)
   └─ Trigger: Design system keywords in PRD.md

📊 DETECTION RESULTS:
Total community servers available: 6
Recommended for auto-installation: 5
Currently active: 6/6 (all recommended servers active)
Configuration needed: 1 (figma-context needs FIGMA_ACCESS_TOKEN)

🚀 ENHANCED CAPABILITIES WITH COMMUNITY SERVERS:
• Component Development: shadcn/ui components with natural language
• Design Integration: Figma-to-code workflow with design tokens
• Browser Testing: Automated E2E testing with visual regression
• Context Preservation: Cross-session memory and pattern recognition
• Documentation Access: Real-time library and API documentation

💡 NEXT STEPS:
1. Configure Figma access token for full design integration
2. All other community servers are fully operational
3. Enhanced development workflow ready with community MCP servers
```

This demonstrates how the community MCP servers integrate seamlessly with the existing system while providing powerful additional capabilities for modern web development workflows.