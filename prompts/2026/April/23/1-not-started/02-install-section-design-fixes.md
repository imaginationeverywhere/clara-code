# Fix Install Section — Match Magic Patterns Design

**Source:** mockups/site/src/components/InstallSection.tsx
**Target:** frontend/src/components/marketing/InstallSection.tsx

## What's Wrong

The Install section is visually correct in structure but the content is gutted — "Coming Soon" placeholders replaced working tab logic and the IDE download buttons are missing. The visual design needs to match the mockup exactly.

## Required Fixes

### 1. Restore CLI Package Manager Tabs

The mockup has three tabs — npm, pnpm, brew — with switching logic. The current implementation shows "Coming Soon". Replace with the full tab implementation:

```tsx
const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'brew'>('npm')

const commands = {
  npm: 'npm install -g claracode',
  pnpm: 'pnpm add -g claracode',
  brew: 'brew install claracode',
}
```

Tab UI (three buttons, monospace font, border-b indicator on active):
```tsx
<div className="flex gap-1 mb-3 border-b border-white/10">
  {(['npm', 'pnpm', 'brew'] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-1.5 text-xs font-mono transition-colors ${
        activeTab === tab
          ? 'text-[#7BCDD8] border-b-2 border-[#7BCDD8] -mb-px'
          : 'text-white/40 hover:text-white/60'
      }`}
    >
      {tab}
    </button>
  ))}
</div>

<div className="flex items-center justify-between bg-[#070A0F] rounded-lg px-4 py-3">
  <code className="text-sm font-mono text-white/90">{commands[activeTab]}</code>
  <CopyButton text={commands[activeTab]} />
</div>
```

Below the command block add the footnote:
```tsx
<p className="mt-2 text-xs text-white/30">Node.js 20+ required · <a href="/docs" className="text-[#7BCDD8] hover:underline">docs →</a></p>
```

### 2. Restore IDE Download Buttons

The mockup's right column has real download buttons. Replace the current "View on GitHub" stub with:

```tsx
{/* Primary macOS download */}
<a
  href="https://github.com/imaginationeverywhere/clara-code/releases/latest"
  className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors"
>
  {/* Apple icon SVG */}
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
  Download for macOS
</a>
<p className="text-center text-xs text-white/30 mt-1">Universal Binary · Apple Silicon + Intel</p>

{/* Other platforms */}
<div className="flex gap-3 mt-4">
  {[
    { label: 'Linux', ext: '.AppImage', href: 'https://github.com/imaginationeverywhere/clara-code/releases/latest' },
    { label: 'Windows', ext: '.exe', href: 'https://github.com/imaginationeverywhere/clara-code/releases/latest' },
    { label: 'Source', ext: '', href: 'https://github.com/imaginationeverywhere/clara-code' },
  ].map(({ label, ext, href }) => (
    <a
      key={label}
      href={href}
      className="flex-1 text-center text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg py-2 transition-colors"
    >
      {label}{ext && <span className="text-white/20"> {ext}</span>}
    </a>
  ))}
</div>
```

### 3. Version Badge

Replace any "Coming Soon" badge next to "Clara Code IDE" with:
```tsx
<span className="text-xs text-white/30 font-mono">v1.0.0 · Stable</span>
```

## Acceptance Criteria

- [ ] npm / pnpm / brew tabs render and switch the displayed command
- [ ] Copy button copies the active tab's command
- [ ] "Download for macOS" button links to GitHub releases
- [ ] Linux / Windows / Source secondary links present
- [ ] "v1.0.0 · Stable" badge visible next to IDE title
- [ ] No TypeScript errors
- [ ] No lint errors
