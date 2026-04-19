# Design Implementation Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --design`

Covers: Magic Patterns → production conversion for all four surfaces.
Surface variants: `--design web` · `--design desktop` · `--design cli` · `--design mobile`
Default (no variant): applies web rules.

---

## STEP 0 — Always do this first (all surfaces)

### 1. Read the Heru design system

```bash
# Check in this order:
cat docs/design-system.md       # Heru-specific system (source of truth)
cat tailwind.config.ts          # Design tokens already in code
ls mockups/                     # Magic Patterns exports by surface
```

If `docs/design-system.md` does not exist, create it before writing any component code (see template at end of this document).

### 2. Identify the Magic Patterns source

Magic Patterns exports are Vite/React projects. Location convention:

```
mockups/
├── site/      # Marketing site / web UI
├── app/       # Web app / dashboard
├── desktop/   # VS Code extension or Electron app UI
├── cli/       # TUI / terminal UI designs
└── mobile/    # React Native screens
```

Read the mockup source before implementing. The mockup is the spec — do not guess what it looks like.

```bash
cat mockups/<surface>/src/App.tsx          # Entry component
ls mockups/<surface>/src/components/       # Component list
cat mockups/<surface>/tailwind.config.js   # Design tokens from Magic Patterns
```

### 3. Extract design tokens into the project's Tailwind config

Never use hardcoded hex values in components. Extract from the mockup first:

```typescript
// tailwind.config.ts — extend with tokens from the mockup
theme: {
  extend: {
    colors: {
      // Copy from mockups/<surface>/tailwind.config.js
      brand: {
        bg: "#09090F",       // Clara example
        purple: "#7C3AED",
        teal: "#7BCDD8",
        green: "#10B981",
      },
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
  },
}
```

---

## WEB — `--design` or `--design web`

Target: Next.js App Router + Tailwind CSS + ShadCN UI

### Converting from Magic Patterns Vite/React

```typescript
// 1. Remove React imports (auto in Next.js)
// Before:  import React from 'react';
// After:   (delete)

// 2. Convert router
// Before:  import { Link } from 'react-router-dom'; <Link to="/x">
// After:   import Link from 'next/link';            <Link href="/x">

// 3. Convert images
// Before:  <img src="/hero.png" alt="..." />
// After:   import Image from 'next/image';
//          <Image src="/hero.png" alt="..." width={800} height={600} />

// 4. Mark interactive components
// Any component using useState, useEffect, onClick, onChange → add at top:
'use client';
```

### Component rules

```typescript
// ✅ Server component by default — async, no hooks
export default async function ProductsPage() {
  const data = await fetchData();
  return <ProductList items={data} />;
}

// ✅ Client component only when needed
'use client';
export function SearchBar() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// ❌ Never 'use client' on a page component unless truly required
// ❌ Never hardcode colors: className="bg-[#09090F]" → className="bg-brand-bg"
```

### All 4 states required for every interactive component

```typescript
// Every button, card, input MUST have all states designed and implemented:
// default | hover | active/pressed | disabled/error/empty
<button className="
  bg-brand-purple text-white          // default
  hover:bg-brand-purple/90            // hover
  active:scale-95                      // active
  disabled:opacity-50 disabled:cursor-not-allowed  // disabled
">
```

### Responsive — mobile-first always

```typescript
// ✅ Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// ❌ Desktop-first (requires overriding at small sizes)
<div className="grid grid-cols-3 sm:grid-cols-1">
```

---

## DESKTOP — `--design desktop`

Target: VS Code extension (webview) · Electron (renderer) · Tauri (webview)

### VS Code Webview — use VS Code CSS variables, NOT brand colors

```css
/* ✅ VS Code color tokens — auto-adapts to all themes (light, dark, high-contrast) */
.panel {
  background-color: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  border: 1px solid var(--vscode-panel-border);
}

button.primary {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}
button.primary:hover {
  background-color: var(--vscode-button-hoverBackground);
}

/* ❌ NEVER hardcode hex in VS Code webviews */
.panel { background: #09090F; color: white; } /* breaks light theme */
```

### VS Code Webview security (mandatory)

```typescript
// Every webview MUST set a Content Security Policy
const panel = vscode.window.createWebviewPanel("claraPanel", "Clara", vscode.ViewColumn.One, {
  enableScripts: true,
  localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
});

// CSP in HTML — never use unsafe-inline in production
panel.webview.html = `
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    script-src ${panel.webview.cspSource};
    style-src ${panel.webview.cspSource} 'unsafe-inline';
    img-src ${panel.webview.cspSource} https:;
  ">
`;
```

### Electron renderer — use VS Code-inspired tokens or dark system design

```typescript
// tailwind.config.ts for Electron
colors: {
  // System-aware: respect prefers-color-scheme
  surface: "var(--color-surface)",
  "on-surface": "var(--color-on-surface)",
  primary: "var(--color-primary)",
}
// Set CSS variables in :root / .dark based on system theme
```

### Typography for desktop — monospace for ALL code/terminal content

```css
/* Code, paths, commands, output, file names → JetBrains Mono */
.code, .path, .terminal-output, .file-name {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  line-height: 1.6;
}

/* UI chrome → Inter or system font */
.panel-title, .label, .button {
  font-family: -apple-system, "Segoe UI", Inter, sans-serif;
}
```

---

## CLI — `--design cli`

Target: Ink (React for CLIs) + chalk · clara-code TUI + voice bar

### Ink component structure

```tsx
// All TUI components use Ink — NOT browser React
import { Box, Text, useInput, useApp } from "ink";
import chalk from "chalk";

export function VoiceBar({ isListening }: { isListening: boolean }) {
  return (
    <Box borderStyle="round" borderColor={isListening ? "cyan" : "gray"} paddingX={1}>
      <Text color={isListening ? "cyan" : "gray"}>
        {isListening ? "◉ Listening..." : "○ Press Space to speak"}
      </Text>
    </Box>
  );
}
```

### Terminal color palette (chalk)

```typescript
// ✅ Use semantic names matched to the Heru's design system
const colors = {
  primary:   chalk.hex("#7C3AED"),  // brand-purple
  teal:      chalk.hex("#7BCDD8"),  // brand-teal
  success:   chalk.hex("#10B981"),  // brand-green
  error:     chalk.red,
  warning:   chalk.yellow,
  dim:       chalk.gray,
  bold:      chalk.bold,
  code:      chalk.bgHex("#1e1e2e").hex("#cdd6f4"),
};

// Use consistently:
console.log(colors.primary("Clara Voice") + " " + colors.dim("ready"));
```

### Box-drawing layout (full-screen TUI)

```tsx
// Clara TUI layout: waveform top, chat middle, input bar bottom
<Box flexDirection="column" height={process.stdout.rows}>
  {/* Voice waveform — top 20% */}
  <Box height="20%" borderStyle="single" borderColor="cyan">
    <WaveformDisplay />
  </Box>

  {/* Conversation — middle, flexible */}
  <Box flexGrow={1} flexDirection="column" paddingX={2} overflowY="hidden">
    <ConversationHistory />
  </Box>

  {/* Input bar — bottom fixed */}
  <Box height={3} borderStyle="round" borderColor="gray" paddingX={1}>
    <InputBar />
  </Box>
</Box>
```

### 16-color fallback required

Design must work in terminals with only 16 colors (basic SSH sessions):

```typescript
// ✅ Test with FORCE_COLOR=0 — design must still be functional (not just pretty)
// Use chalk.bold() and chalk.underline() for hierarchy when color isn't available
// Never use color as the ONLY indicator of state
```

---

## MOBILE — `--design mobile`

Target: React Native + Expo + NativeWind (Tailwind for RN)

### Converting from Magic Patterns (web) to React Native

```typescript
// 1. No HTML elements
// Before:  <div>, <p>, <span>, <img>, <button>
// After:   <View>, <Text>, <Text>, <Image>, <TouchableOpacity>

// 2. No CSS classes — use StyleSheet or NativeWind
// Before:  <div className="flex flex-col gap-4 p-4 bg-gray-900">
// After:   <View className="flex flex-col gap-4 p-4 bg-gray-900">  // NativeWind
//   OR
//          <View style={styles.container}>   // StyleSheet

// 3. No CSS box model — flexbox only (column by default in RN)
// Before:  display: flex; flex-direction: column;
// After:   flex: 1 (RN is column flex by default)
```

### Platform-specific design tokens

```typescript
import { Platform } from "react-native";

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 44 : 24,  // iOS status bar
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    fontSize: 17,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
  },
});
```

### Safe areas — always

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Every screen root
export function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      {/* content */}
    </SafeAreaView>
  );
}
```

### Touch targets — 44pt minimum (iOS HIG)

```typescript
// ✅ iOS Human Interface Guidelines minimum
<TouchableOpacity style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}>
  <Text>Tap me</Text>
</TouchableOpacity>
```

---

## Heru-specific tech doc — REQUIRED

Each Heru MUST have `docs/design-system.md`. If it does not exist, create it using this template:

```markdown
# [Heru Name] Design System

## Surfaces
- [ ] Web (marketing site)
- [ ] Web (app / dashboard)
- [ ] Desktop (VS Code extension / Electron)
- [ ] CLI / TUI
- [ ] Mobile (iOS / Android)

## Colors
| Token | Hex | Usage |
|-------|-----|-------|
| brand-bg | #09090F | Primary background |
| brand-primary | #7C3AED | Primary action, highlights |
| brand-accent | #7BCDD8 | Secondary, teal accent |
| brand-success | #10B981 | Success, positive states |

## Typography
| Role | Font | Size | Weight |
|------|------|------|--------|
| Headings | Inter | 24–48px | 700 |
| Body | Inter | 14–16px | 400 |
| Code/Terminal | JetBrains Mono | 12–14px | 400 |

## Magic Patterns Exports
| Surface | Path | Last updated |
|---------|------|-------------|
| Web site | mockups/site/ | — |
| Web app | mockups/app/ | — |

## Component Library
- Base: ShadCN UI (web) / NativeWind (mobile)
- Icons: Lucide React
- Custom components: src/components/ui/

## Design Decisions
<!-- Document Heru-specific choices, deviations from platform defaults -->
```
