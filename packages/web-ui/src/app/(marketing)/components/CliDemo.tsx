import { JetBrains_Mono } from 'next/font/google'

const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'] })

const waveformHeightsPx = [4, 8, 16, 24, 28, 20, 12, 28, 24, 16, 28, 20, 8, 24, 12, 4]

/**
 * Marketing-only terminal mockup: install flow + running Clara TUI (prompt 12-cli-terminal.md).
 */
export function CliDemo() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#7C3AED]/8 blur-[80px]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
        <InstallTerminalFrame className={jetbrains.className} />
        <RunningTuiFrame className={jetbrains.className} />
      </div>
      <div className="mt-6 text-center font-mono text-[13px] text-white/30">
        <span>$ npx install claracode@latest</span>
        <span className="text-white/20"> → </span>
        <span className="text-[#7BCDD8]">$ clara</span>
      </div>
      <p className="mt-2 text-center font-sans text-[14px] text-white/40">
        Voice-first. Terminal-native. No GUI required.
      </p>
    </div>
  )
}

function InstallTerminalFrame({ className }: { className: string }) {
  return (
    <div
      className={`w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/8 bg-[#09090F] shadow-[0_40px_80px_rgba(0,0,0,0.6)] md:w-[420px] ${className}`}
    >
      <TerminalTitleBar title="Terminal — zsh" pill="zsh" />
      <div className="p-5 font-mono text-[13px] leading-7 text-white/85">
        <p>
          <span className="text-white/35">amenray@macbook ~ % </span>
          <span className="text-white/85">npx install claracode@latest</span>
        </p>
        <p className="h-4" />
        <p>
          <span className="text-[#7C3AED]">⠹ </span>
          <span className="text-white/45">Downloading @clara/cli@1.0.0...</span>
        </p>
        <p className="text-white/30">  + @clara/core@1.0.0</p>
        <p className="text-white/30">  + @clara/voice@1.0.0</p>
        <p className="text-white/30">  + @clara/sdk@1.0.0</p>
        <p className="text-white/30">  + @clara/vault@1.0.0</p>
        <p className="h-4" />
        <p>
          <span className="text-[#10B981]">✓ </span>
          <span className="text-white/70">claracode@1.0.0 installed</span>
        </p>
        <p className="h-4" />
        <p className="text-white/20">┌─────────────────────────────────┐</p>
        <p className="text-white/20">
          │ Run <span className="text-[#7BCDD8]">clara</span> to get started │
        </p>
        <p className="text-white/20">│ Docs: claracode.ai/docs │</p>
        <p className="text-white/20">└─────────────────────────────────┘</p>
        <p className="h-4" />
        <p>
          <span className="text-white/35">amenray@macbook ~ % </span>
          <span className="text-white/85">clara</span>
        </p>
        <p>
          <span className="animate-pulse text-[#7C3AED]">█</span>
        </p>
      </div>
    </div>
  )
}

function RunningTuiFrame({ className }: { className: string }) {
  return (
    <div
      className={`relative w-full max-w-[580px] flex-1 overflow-hidden rounded-2xl border border-white/8 bg-[#09090F] shadow-[0_40px_80px_rgba(0,0,0,0.6)] ${className}`}
    >
      <TerminalTitleBar title="Terminal — clara" pill="clara" />
      <div className="flex h-9 items-center justify-between border-b border-white/8 bg-[#0A0E14] px-4">
        <div className="flex items-center gap-1.5 font-mono text-[13px]">
          <span className="font-semibold text-[#7BCDD8]">Clara</span>
          <span className="text-white/35">Code</span>
        </div>
        <span className="font-mono text-[11px] text-white/20">v1.0.0</span>
        <div className="flex items-center gap-4 font-mono">
          <span className="text-[12px] text-white/35">amenray2k</span>
          <span className="text-white/20">·</span>
          <span className="rounded-md border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-1.5 py-0.5 text-[11px] text-[#7C3AED]">
            Pro
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[11px] text-white/25">claude-sonnet-4-6</span>
        </div>
      </div>
      <div className="relative min-h-[280px] bg-[#09090F] p-5 pb-14 font-mono text-[13px] leading-7">
        <div className="mb-1 flex h-8 items-end gap-[3px]">
          {waveformHeightsPx.map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-sm bg-[#7C3AED]"
              style={{ height: `${h}px` }}
            />
          ))}
          <span className="ml-1 inline text-[12px] text-[#7C3AED]">Listening...</span>
        </div>
        <p className="h-4" />
        <p>
          <span className="text-[#7C3AED]">▶ </span>
          <span className="text-[#10B981]">&apos;Create a loading skeleton for the dashboard&apos;</span>
        </p>
        <p className="h-4" />
        <p>
          <span className="animate-pulse text-[#7C3AED]">●</span>
          <span className="text-white/40"> Analyzing project structure...</span>
        </p>
        <p className="text-white/30">  src/</p>
        <p className="text-white/30">    components/</p>
        <p>
          <span className="text-[#10B981]">    ✓ </span>
          <span className="text-white/50">dashboard/</span>
          <span className="text-white/20"> ← writing here</span>
        </p>
        <p className="h-4" />
        <CodeBox />
        <p className="h-4" />
        <p>
          <span className="text-[#10B981]">✓ </span>
          <span className="text-white/70">DashboardSkeleton.tsx</span>
          <span className="text-white/40"> created in </span>
          <span className="text-[#10B981]">./src/components/</span>
        </p>
        <p className="h-4" />
        <p className="text-white/50">
          Apply to project? <span className="text-[#10B981]">[Y]es</span>
          <span className="text-white/20"> / </span>
          <span className="text-white/30">[n]o</span>
          <span className="text-white/20"> / </span>
          <span className="text-white/30">[e]dit</span>
        </p>
        <div className="absolute bottom-0 left-0 right-0 flex h-8 items-center gap-6 border-t border-white/6 bg-[#050509] px-4">
          <span className="rounded-md bg-[#7C3AED]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED]">
            VOICE
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[11px] text-white/30">[Space] Voice</span>
          <span className="text-[11px] text-white/30">[/] Command</span>
          <span className="text-[11px] text-white/30">[?] Help</span>
          <span className="text-[11px] text-white/30">[q] Quit</span>
          <span className="ml-auto text-[11px] text-white/20">claracode.ai/docs</span>
        </div>
      </div>
    </div>
  )
}

function CodeBox() {
  return (
    <div>
      <p className="text-white/20">┌─ DashboardSkeleton.tsx ─────────────────────┐</p>
      <p className="text-white/20">
        │ <span className="text-[#7C3AED]">import</span>
        <span className="text-white/45">{` { `}</span>
        <span className="text-[#4F8EF7]">Skeleton</span>
        <span className="text-white/45">{` } `}</span>
        <span className="text-[#7C3AED]">from</span>
        <span className="text-[#10B981]">{` './ui/skeleton'`}</span>
        <span className="text-white/20"> │</span>
      </p>
      <p className="text-white/20">│ │</p>
      <p className="text-white/20">
        │ <span className="text-[#7C3AED]">export default </span>
        <span className="text-[#7C3AED]">function </span>
        <span className="text-white/85">DashboardSkeleton</span>
        <span className="text-[#A8DDE5]">() </span>
        <span className="text-white/45">{'{'}</span>
        <span className="text-white/20"> │</span>
      </p>
      <p className="text-white/20">
        │ <span className="text-[#7C3AED]">return </span>
        <span className="text-white/45">(</span>
        <span className="text-white/20"> │</span>
      </p>
      <p className="text-white/20">
        │ <span className="text-[#7BCDD8]">div </span>
        <span className="text-[#FBBF24]">className</span>
        <span className="text-white/85">=</span>
        <span className="text-[#10B981]">&apos;space-y-4&apos;</span>
        <span className="text-white/20"> │</span>
      </p>
      <p className="text-white/20">
        │ <span className="text-[#7BCDD8]">Skeleton </span>
        <span className="text-[#FBBF24]">className</span>
        <span className="text-white/85">=</span>
        <span className="text-[#10B981]">&apos;h-8 w-48&apos;</span>
        <span className="text-white/20"> │</span>
      </p>
      <p className="text-white/20">└────────────────────────────────────────────┘</p>
    </div>
  )
}

function TerminalTitleBar({ title, pill }: { title: string; pill: string }) {
  return (
    <div className="flex h-10 items-center gap-2 border-b border-white/6 bg-[#13141A] px-4">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#28C840]" />
      <span className="flex-1 text-center font-mono text-[12px] text-white/35">{title}</span>
      <span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-[10px] text-white/30">{pill}</span>
    </div>
  )
}
