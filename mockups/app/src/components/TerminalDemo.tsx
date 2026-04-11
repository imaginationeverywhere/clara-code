import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
export function TerminalDemo({ onBack }: {onBack: () => void;}) {
  const [phase, setPhase] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setPhase(0);
    const sequence = [
    { phase: 1, delay: 1200 },
    { phase: 2, delay: 2000 },
    { phase: 3, delay: 3500 },
    { phase: 4, delay: 5000 },
    { phase: 5, delay: 6000 },
    { phase: 6, delay: 7000 },
    { phase: 7, delay: 8500 },
    { phase: 8, delay: 10000 }];

    const timeouts = sequence.map((step) =>
    setTimeout(() => setPhase(step.phase), step.delay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [key]);

  const handleReplay = () => {
    setPhase(0);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen w-screen bg-[#050509] flex flex-col items-center justify-center overflow-hidden relative font-sans">
      {/* BACKGROUND GLOW */}
      <div className="absolute w-[800px] h-[600px] bg-[#7C3AED]/6 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-[12px] font-mono text-white/30 hover:text-white/60 flex items-center gap-1.5 cursor-pointer z-20 transition-colors">
        
        <ArrowLeft size={14} />
        Back to IDE
      </button>

      {/* TERMINAL CONTAINER */}
      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-[#09090F] rounded-2xl overflow-hidden border border-white/8 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          {/* TITLE BAR */}
          <div className="h-10 bg-[#13141A] border-b border-white/6 flex items-center px-4 gap-2 relative">
            <div className="flex gap-1.5 absolute left-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 text-center font-mono text-[12px] text-white/35">
              Terminal — {phase >= 5 ? 'clara' : 'zsh'}
            </div>
          </div>

          {/* TERMINAL BODY */}
          <div className="min-h-[500px] font-mono text-[13px] leading-7 relative">
            {/* PHASES 0-4: INSTALL SEQUENCE */}
            {phase < 5 &&
            <div className="p-5 whitespace-pre">
                {/* Phase 0 & 1 */}
                <div>
                  <span className="text-white/35">amenray@macbook ~ % </span>
                  {phase >= 1 &&
                <span className="text-white/85">
                      npx install claracode@latest
                    </span>
                }
                  {phase === 0 &&
                <span className="text-[#7C3AED] animate-pulse">█</span>
                }
                </div>
                {phase >= 1 && <div>{'\n'}</div>}

                {/* Phase 2 */}
                {phase >= 2 &&
              <>
                    <div>
                      <span className="text-[#7C3AED]">⠹ </span>
                      <span className="text-white/45">
                        Downloading @clara/cli@1.0.0...
                      </span>
                    </div>
                    <div className="text-white/30 animate-[fadeIn_0.2s_ease-out_0.2s_both]">
                      {' '}
                      + @clara/core@1.0.0
                    </div>
                    <div className="text-white/30 animate-[fadeIn_0.2s_ease-out_0.4s_both]">
                      {' '}
                      + @clara/voice@1.0.0
                    </div>
                    <div className="text-white/30 animate-[fadeIn_0.2s_ease-out_0.6s_both]">
                      {' '}
                      + @clara/sdk@1.0.0
                    </div>
                    <div className="text-white/30 animate-[fadeIn_0.2s_ease-out_0.8s_both]">
                      {' '}
                      + @clara/vault@1.0.0
                    </div>
                    <div>{'\n'}</div>
                  </>
              }

                {/* Phase 3 */}
                {phase >= 3 &&
              <>
                    <div>
                      <span className="text-[#10B981]">✓ </span>
                      <span className="text-white/70">
                        claracode@1.0.0 installed
                      </span>
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
                      <span className="text-white/20">
                        │ Docs: claracode.ai/docs │
                      </span>
                    </div>
                    <div>
                      <span className="text-white/20">
                        └─────────────────────────────────┘
                      </span>
                    </div>
                    <div>{'\n'}</div>
                  </>
              }

                {/* Phase 4 */}
                {phase >= 3 &&
              <div>
                    <span className="text-white/35">amenray@macbook ~ % </span>
                    {phase >= 4 && <span className="text-white/85">clara</span>}
                    {phase === 3 &&
                <span className="text-[#7C3AED] animate-pulse">█</span>
                }
                    {phase === 4 &&
                <span className="text-[#7C3AED] animate-pulse">█</span>
                }
                  </div>
              }
              </div>
            }

            {/* PHASES 5-8: RUNNING TUI */}
            {phase >= 5 &&
            <div className="absolute inset-0 bg-[#09090F] flex flex-col animate-[fadeIn_0.3s_ease-out]">
                {/* TUI TOP BAR */}
                <div className="h-9 bg-[#0A0E14] border-b border-white/8 flex items-center justify-between px-4 flex-shrink-0">
                  <div className="flex items-center">
                    <span className="text-[#7BCDD8] font-mono text-[13px] font-semibold">
                      Clara
                    </span>
                    <span className="text-white/35 font-mono text-[13px]">
                      {' '}
                      Code
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-white/20">
                    v1.0.0
                  </div>
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

                {/* TUI MAIN CONTENT */}
                <div className="p-5 pb-12 whitespace-pre flex-1 overflow-y-auto">
                  {/* Phase 6: Waveform */}
                  {phase >= 6 &&
                <>
                      <div className="flex items-end h-8 mb-1 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-end gap-[3px] h-full">
                          {[
                      4, 8, 16, 24, 28, 20, 12, 28, 24, 16, 28, 20, 8, 24,
                      12, 4].
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
                    </>
                }

                  {/* Phase 7: Transcript & Thinking */}
                  {phase >= 7 &&
                <div className="animate-[fadeIn_0.3s_ease-out]">
                      <div>
                        <span className="text-[#7C3AED]">▶ </span>
                        <span className="text-[#10B981]">
                          'Create a loading skeleton for the dashboard'
                        </span>
                      </div>
                      <div>{'\n'}</div>
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
                    </div>
                }

                  {/* Phase 8: Code Generation */}
                  {phase >= 8 &&
                <div className="animate-[fadeIn_0.3s_ease-out]">
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
                        <span className="text-[#7C3AED]">
                          export default function{' '}
                        </span>
                        <span className="text-[#A8DDE5]">
                          DashboardSkeleton
                        </span>
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
                      <div>
                        <span className="text-[#10B981]">✓ </span>
                        <span className="text-white/70">
                          DashboardSkeleton.tsx
                        </span>
                        <span className="text-white/40"> created in </span>
                        <span className="text-[#10B981]">
                          ./src/components/
                        </span>
                      </div>
                      <div>{'\n'}</div>
                      <div>
                        <span className="text-white/50">
                          {' '}
                          Apply to project?{' '}
                        </span>
                        <span className="text-[#10B981]">[Y]es</span>
                        <span className="text-white/20"> / </span>
                        <span className="text-white/30">[n]o</span>
                        <span className="text-white/20"> / </span>
                        <span className="text-white/30">[e]dit</span>
                      </div>
                    </div>
                }
                </div>

                {/* BOTTOM STATUS BAR (only in TUI phases) */}
                {phase >= 5 &&
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
              }
              </div>
            }
          </div>
        </div>

        {/* TAGLINE & REPLAY */}
        <div className="text-center mt-6 relative z-10">
          <div className="text-[14px] text-white/40 font-mono">
            Voice-first. Terminal-native. No GUI required.
          </div>
          {phase >= 8 &&
          <button
            onClick={handleReplay}
            className="mt-3 text-[12px] font-mono text-[#7BCDD8] hover:text-[#7BCDD8]/80 cursor-pointer underline transition-colors">
            
              Replay demo
            </button>
          }
        </div>
      </div>
    </div>);

}