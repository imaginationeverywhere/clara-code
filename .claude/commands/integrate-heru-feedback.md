# integrate-heru-feedback — Deploy Heru Feedback SDK to Any Project

Integrate the complete Heru Feedback SDK into a target project with all 5 feedback types.

**Agent:** `ida-feedback-integrator` (Ida — Ida B. Wells)
**Skills:** `react-native-standard`, `feedback-sdk`
**Dispatch:** Via `/dispatch-cursor` to QC1

## Usage
```
/integrate-heru-feedback --project quikcarrental
/integrate-heru-feedback --project world-cup-ready --platform mobile
/integrate-heru-feedback --project quiknation-website --platform web
```

## Arguments
- `--project <name>` (required) — Project directory name on QC1
- `--platform mobile|web` (optional) — Auto-detected from project structure
- `--skip-build` — Integrate only, don't trigger EAS build
- `--dry-run` — Show what would happen without executing

## What This Command Does

1. **Reads** the `heru-feedback-integrator` agent definition from `.claude/agents/`
2. **Loads** the `feedback-sdk` skill for integration patterns
3. **Dispatches** to Cursor agent on QC1 via `/dispatch-cursor`
4. **Agent copies** SDK from boilerplate to target project
5. **Agent installs** dependencies (expo-av, expo-camera, etc.)
6. **Agent integrates** ShakeReporter/FeedbackWidget into app root
7. **Agent configures** API endpoint and SDK key
8. **n8n validation** runs all acceptance criteria checks
9. **If PASS:** Commit, push, create PR, trigger EAS build
10. **If FAIL:** Re-dispatch agent with specific failures to fix

## Gate Requirement
This command is a PREREQUISITE for all builds. No app ships without Heru Feedback.

## Validation Checks (must all pass)
- ShakeReporter/FeedbackWidget wraps app root
- All 5 feedback types have UI buttons
- FeedbackApiClient has upload methods for all media types
- Dependencies installed
- TypeScript compiles without errors
- EAS build succeeds (if not --skip-build)

## Example
```
/integrate-heru-feedback --project quikcarrental

→ Dispatches heru-feedback-integrator agent to QC1
→ Cursor agent copies SDK, installs deps, integrates
→ n8n validates: ✓ ShakeReporter ✓ Record Video ✓ Record Voice ✓ uploads ✓ types
→ Commits: "feat(mobile): integrate Heru Feedback SDK with all 5 types"
→ Pushes to feature/heru-feedback-full
→ Creates PR
→ Triggers: eas build --platform ios --profile develop
→ Posts to Slack: "QCR Heru Feedback integrated, build submitted"
```
