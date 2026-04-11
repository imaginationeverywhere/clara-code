import React from 'react';
export function TerminalMockup() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 relative">
      {/* PURPLE GLOW BEHIND WINDOW 2 */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7C3AED]/8 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* TWO WINDOWS */}
      <div className="flex gap-4 items-start relative z-10">
        {/* WINDOW 1 — INSTALL SEQUENCE */}
        <div className="w-[420px] flex-shrink-0 bg-[#09090F] rounded-2xl overflow-hidden border border-white/8 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          {/* TITLE BAR */}
          <div className="h-10 bg-[#13141A] border-b border-white/6 flex items-center px-4 gap-2 relative">
            <div className="flex gap-1.5 absolute left-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 text-center font-mono text-[12px] text-white/35">
              Terminal — zsh
            </div>
            <div className="absolute right-4 bg-white/6 rounded-full px-2 py-0.5 text-[10px] font-mono text-white/30">
              zsh
            </div>
          </div>

          {/* TERMINAL BODY */}
          <div className="p-5 font-mono text-[13px] leading-7 whitespace-pre">
            <div>
              <span className="text-white/35">amenray@macbook ~ % </span>
              <span className="text-white/85">
                npx install claracode@latest
              </span>
            </div>
            <div>{'\n'}</div>
            <div>
              <span className="text-[#7C3AED]">⠹ </span>
              <span className="text-white/45">
                Downloading @clara/cli@1.0.0...
              </span>
            </div>
            <div className="text-white/30"> + @clara/core@1.0.0</div>
            <div className="text-white/30"> + @clara/voice@1.0.0</div>
            <div className="text-white/30"> + @clara/sdk@1.0.0</div>
            <div className="text-white/30"> + @clara/vault@1.0.0</div>
            <div>{'\n'}</div>
            <div>
              <span className="text-[#10B981]">✓ </span>
              <span className="text-white/70">claracode@1.0.0 installed</span>
            </div>
            <div>{'\n'}</div>
            <div>
              <span className="text-white/20">
                ┌─────────────────────────────────┐
              </span>
            </div>
            <div>
              <span className="text-white/20">│ Run </span>
              <span className="text-[#7BCDD8]">clara</span>
              <span className="text-white/20"> to get started │</span>
            </div>
            <div>
              <span className="text-white/20">│ Docs: claracode.ai/docs │</span>
            </div>
            <div>
              <span className="text-white/20">
                └─────────────────────────────────┘
              </span>
            </div>
            <div>{'\n'}</div>
            <div>
              <span className="text-white/35">amenray@macbook ~ % </span>
              <span className="text-white/85">clara</span>
            </div>
            <div>
              <span className="text-[#7C3AED] animate-pulse">█</span>
            </div>
          </div>
        </div>

        {/* WINDOW 2 — RUNNING TUI */}
        <div className="flex-1 bg-[#09090F] rounded-2xl overflow-hidden border border-white/8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative">
          {/* TITLE BAR */}
          <div className="h-10 bg-[#13141A] border-b border-white/6 flex items-center px-4 gap-2 relative">
            <div className="flex gap-1.5 absolute left-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 text-center font-mono text-[12px] text-white/35">
              Terminal — clara
            </div>
            <div className="absolute right-4 bg-white/6 rounded-full px-2 py-0.5 text-[10px] font-mono text-white/30">
              clara
            </div>
          </div>

          {/* TUI BODY */}
          <div className="p-0 bg-[#09090F] overflow-hidden relative">
            {/* TUI TOP BAR */}
            <div className="h-9 bg-[#0A0E14] border-b border-white/8 flex items-center justify-between px-4">
              <div className="flex items-center">
                <span className="text-[#7BCDD8] font-mono text-[13px] font-semibold">
                  Clara
                </span>
                <span className="text-white/35 font-mono text-[13px]">
                  {' '}
                  Code
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/20">v1.0.0</div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono text-white/35">
                  amenray2k
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[11px] font-mono text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-md px-1.5 py-0.5">
                  Pro
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[11px] font-mono text-white/25">
                  claude-sonnet-4-6
                </span>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="p-5 pb-12 font-mono text-[13px] leading-7 whitespace-pre">
              {/* Section 1 — Waveform */}
              <div className="flex items-end h-8 mb-1">
                <div className="flex items-end gap-[3px] h-full">
                  {[
                  4, 8, 16, 24, 28, 20, 12, 28, 24, 16, 28, 20, 8, 24, 12, 4].
                  map((h, i) =>
                  <div
                    key={i}
                    className="w-1 rounded-sm bg-[#7C3AED]"
                    style={{
                      height: `${h}px`
                    }} />

                  )}
                </div>
                <span className="text-[#7C3AED] text-[12px] ml-2 leading-none mb-1">
                  Listening...
                </span>
              </div>
              <div>{'\n'}</div>

              {/* Section 2 — Transcript */}
              <div>
                <span className="text-[#7C3AED]">▶ </span>
                <span className="text-[#10B981]">
                  'Create a loading skeleton for the dashboard'
                </span>
              </div>
              <div>{'\n'}</div>

              {/* Section 3 — Thinking */}
              <div>
                <span className="text-[#7C3AED] animate-pulse"> ●</span>
                <span className="text-white/40">
                  {' '}
                  Analyzing project structure...
                </span>
              </div>
              <div className="text-white/30"> src/</div>
              <div className="text-white/30"> components/</div>
              <div>
                <span className="text-[#10B981]"> ✓ </span>
                <span className="text-white/50">dashboard/</span>
                <span className="text-white/20"> ← writing here</span>
              </div>
              <div>{'\n'}</div>

              {/* Section 4 — Generated code */}
              <div>
                <span className="text-white/20">
                  ┌─ DashboardSkeleton.tsx ─────────────────────┐
                </span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7C3AED]">import </span>
                <span className="text-white/45">{'{ '}</span>
                <span className="text-[#4F8EF7]">Skeleton</span>
                <span className="text-white/45">{' } '}</span>
                <span className="text-[#7C3AED]">from </span>
                <span className="text-[#10B981]">'./ui/skeleton'</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7C3AED]">export default function </span>
                <span className="text-[#A8DDE5]">DashboardSkeleton</span>
                <span className="text-white/45">() {'{'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7C3AED]">return </span>
                <span className="text-white/45">(</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7BCDD8]">{'<div '}</span>
                <span className="text-[#FBBF24]">className</span>
                <span className="text-white/85">=</span>
                <span className="text-[#10B981]">'space-y-4'</span>
                <span className="text-[#7BCDD8]">{'>'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7BCDD8]">{'<Skeleton '}</span>
                <span className="text-[#FBBF24]">className</span>
                <span className="text-white/85">=</span>
                <span className="text-[#10B981]">'h-8 w-48'</span>
                <span className="text-[#7BCDD8]">{' />'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7BCDD8]">{'<Skeleton '}</span>
                <span className="text-[#FBBF24]">className</span>
                <span className="text-white/85">=</span>
                <span className="text-[#10B981]">'h-32 w-full'</span>
                <span className="text-[#7BCDD8]">{' />'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-[#7BCDD8]">{'</div>'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-white/45">)</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">│ </span>
                <span className="text-white/45">{'}'}</span>
                <span className="text-white/20"> │</span>
              </div>
              <div>
                <span className="text-white/20">
                  └────────────────────────────────────────────┘
                </span>
              </div>
              <div>{'\n'}</div>

              {/* Section 5 — Success */}
              <div>
                <span className="text-[#10B981]">✓ </span>
                <span className="text-white/70">DashboardSkeleton.tsx</span>
                <span className="text-white/40"> created in </span>
                <span className="text-[#10B981]">./src/components/</span>
              </div>
              <div>{'\n'}</div>
              <div>
                <span className="text-white/50"> Apply to project? </span>
                <span className="text-[#10B981]">[Y]es</span>
                <span className="text-white/20"> / </span>
                <span className="text-white/30">[n]o</span>
                <span className="text-white/20"> / </span>
                <span className="text-white/30">[e]dit</span>
              </div>
            </div>

            {/* BOTTOM STATUS BAR */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#050509] border-t border-white/6 flex items-center px-4 gap-4">
              <div className="bg-[#7C3AED]/15 text-[#7C3AED] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md">
                VOICE
              </div>
              <div className="text-[11px] font-mono text-white/30">
                [Space] Voice
              </div>
              <div className="text-[11px] font-mono text-white/30">
                [/] Command
              </div>
              <div className="text-[11px] font-mono text-white/30">
                [?] Help
              </div>
              <div className="text-[11px] font-mono text-white/30">
                [q] Quit
              </div>
              <div className="text-[11px] font-mono text-white/20 ml-auto">
                claracode.ai/docs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LABEL BELOW WINDOWS */}
      <div className="text-center mt-6 font-sans relative z-10">
        <div>
          <span className="font-mono text-[13px] text-white/30">
            $ npx install claracode@latest
          </span>
          <span className="text-white/20"> → </span>
          <span className="font-mono text-[13px] text-[#7BCDD8]">$ clara</span>
        </div>
        <div className="mt-2 text-[14px] text-white/40 font-mono">
          Voice-first. Terminal-native. No GUI required.
        </div>
      </div>
    </div>);

}