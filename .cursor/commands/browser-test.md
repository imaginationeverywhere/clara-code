# browser-test — Playwright CLI Browser Automation & Testing

**Usage:** `/browser-test "check site962.com login flow"`

Token-efficient browser automation using [Playwright CLI](https://github.com/microsoft/playwright-cli) from Microsoft. Replaces Claude in Chrome for all automated browser testing. Does NOT dump page HTML into context — works via structured commands.

## Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `$ARGUMENTS` | (required) | Natural language description of what to test |
| `--url` | (inferred) | Target URL to test against |
| `--headless` | `true` | Run without GUI (required on EC2 farms) |
| `--screenshot` | `false` | Capture screenshots at each step |

## EXECUTE

### Step 1: Ensure Playwright CLI Is Available

```bash
# Check if playwright-cli is available
if ! command -v playwright-cli &>/dev/null; then
  echo "Installing Playwright CLI..."
  npx @anthropic-ai/playwright-cli --version 2>/dev/null || npm install -g @anthropic-ai/playwright-cli
fi
playwright-cli --version
```

If `playwright-cli` is not installable globally, use `npx @anthropic-ai/playwright-cli` as a prefix for every command below.

### Step 2: Parse User Request

Read `$ARGUMENTS` and extract:
1. **Target URL** — from `--url` flag or inferred from the description (e.g., "site962.com" -> `https://site962.com`)
2. **Test objective** — what the user wants verified (login flow, page load, form submission, etc.)
3. **Headless mode** — `--headless` flag (default: true, set false for local debugging)
4. **Screenshot mode** — `--screenshot` flag (capture at each step if set)

### Step 3: Start Browser Session

```bash
# Open a new browser session (headless by default)
playwright-cli browser launch --headless

# Navigate to the target URL
playwright-cli navigate "<TARGET_URL>"

# Wait for page to be ready
playwright-cli wait --state networkidle
```

### Step 4: Execute Test Actions

Based on the parsed test objective, chain Playwright CLI commands. Common patterns:

**Page Load Verification:**
```bash
playwright-cli navigate "<URL>"
playwright-cli wait --state networkidle
playwright-cli screenshot /tmp/browser-test-load.png
playwright-cli evaluate "document.title"
```

**Login Flow:**
```bash
playwright-cli navigate "<URL>/login"
playwright-cli wait --selector "input[type=email], input[name=email], #email"
playwright-cli fill "input[type=email]" "<test-email>"
playwright-cli fill "input[type=password]" "<test-password>"
playwright-cli click "button[type=submit], button:has-text('Sign In'), button:has-text('Log In')"
playwright-cli wait --state networkidle
playwright-cli screenshot /tmp/browser-test-login-result.png
# Verify redirect to dashboard or expected page
playwright-cli evaluate "window.location.pathname"
```

**Form Submission:**
```bash
playwright-cli navigate "<URL>"
playwright-cli wait --selector "form"
playwright-cli fill "<selector>" "<value>"
playwright-cli click "<submit-selector>"
playwright-cli wait --state networkidle
playwright-cli screenshot /tmp/browser-test-form-result.png
```

**Element Verification:**
```bash
playwright-cli navigate "<URL>"
playwright-cli wait --selector "<selector>"
playwright-cli evaluate "document.querySelector('<selector>').textContent"
playwright-cli evaluate "document.querySelectorAll('<selector>').length"
```

**Multi-Page Flow:**
```bash
playwright-cli navigate "<URL>/step1"
playwright-cli click "<next-button>"
playwright-cli wait --state networkidle
playwright-cli screenshot /tmp/browser-test-step1.png
playwright-cli click "<next-button>"
playwright-cli wait --state networkidle
playwright-cli screenshot /tmp/browser-test-step2.png
```

### Step 5: Capture Results

If `--screenshot` is set, capture at every step:
```bash
playwright-cli screenshot /tmp/browser-test-$(date +%s).png --full-page
```

Generate a PDF of the final page state:
```bash
playwright-cli pdf /tmp/browser-test-report.pdf
```

Collect console errors:
```bash
playwright-cli evaluate "JSON.stringify(window.__playwright_console_errors || [])"
```

### Step 6: Close Session

```bash
playwright-cli browser close
```

### Step 7: Report

Report results in plain text:
```
Browser Test Results:
- URL: <target>
- Status: PASS / FAIL
- Steps completed: N/N
- Screenshots: /tmp/browser-test-*.png
- Errors: (list any console errors or assertion failures)
- Duration: Xs
```

## Playwright CLI Command Reference

| Command | Description |
|---------|-------------|
| `browser launch` | Launch browser (add `--headless` for headless) |
| `browser close` | Close browser session |
| `navigate <url>` | Go to URL |
| `click <selector>` | Click element |
| `fill <selector> <value>` | Type into input |
| `type <selector> <text>` | Type text character by character |
| `press <selector> <key>` | Press keyboard key |
| `select <selector> <value>` | Select dropdown option |
| `check <selector>` | Check checkbox |
| `uncheck <selector>` | Uncheck checkbox |
| `hover <selector>` | Hover over element |
| `screenshot <path>` | Save screenshot (add `--full-page`) |
| `pdf <path>` | Save page as PDF |
| `evaluate <expression>` | Run JavaScript in page context |
| `wait --selector <sel>` | Wait for element |
| `wait --state <state>` | Wait for page state (load, networkidle, domcontentloaded) |
| `wait --timeout <ms>` | Set wait timeout |

## Integration with Test Automation

This command works with the `test-automation` orchestration command:
- `/test-automation` can invoke `/browser-test` for E2E verification
- Screenshots saved to `/tmp/browser-test-*` are available to the reporting pipeline
- Results can be posted to Slack via Haiku's monitoring loop

## Headless on EC2 Build Farms

Playwright CLI works headless out of the box on EC2 farms (no X11, no GUI needed):
```bash
# On farm-1 or farm-2
playwright-cli browser launch --headless
playwright-cli navigate "https://site962.com"
playwright-cli screenshot /tmp/site962-smoke.png
playwright-cli browser close
```

## Examples

```bash
# Smoke test a site
/browser-test "verify site962.com homepage loads and has event listings"

# Test login flow
/browser-test "check login flow on quikcarrental.com" --url https://quikcarrental.com/login --screenshot

# Visual regression
/browser-test "screenshot all pages of site962.com for visual comparison" --screenshot

# Form testing
/browser-test "submit contact form on quiknation.com with test data"

# API health via browser
/browser-test "navigate to quikcarrental.com/api/health and verify 200 response"
```

## Related

- **Agent:** `.claude/agents/playwright-browser.md` — Browser automation specialist
- **Skill:** `.claude/skills/browser-testing/SKILL.md` — Playwright CLI patterns and reference
- **Legacy Agent:** `.claude/agents/playwright-test-executor.md` — Playwright (library) test executor
- **Chrome Debug:** `.claude/skills/chrome-ui-testing-standard/SKILL.md` — Chrome MCP debugging (replaced by this for automation)
