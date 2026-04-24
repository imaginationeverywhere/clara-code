import React from 'react';
import { Mic, Sparkles, Code, Volume2, Keyboard } from 'lucide-react';
export function FeaturesSection() {
  // Static heights for the waveform bars
  const waveformHeights = [
  8, 12, 24, 16, 8, 28, 20, 12, 16, 24, 12, 8, 20, 16, 8, 12];

  return (
    <section className="py-28 bg-[#080C12]">
      {/* Section intro */}
      <div className="text-center mb-16 md:mb-24">
        <div className="text-[#5CE0D8] text-xs font-semibold tracking-[0.15em] uppercase mb-4">
          Features
        </div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-tight mb-4">
          A new way to build.
        </h2>
        <p className="text-[18px] text-white/55 max-w-2xl mx-auto">
          Clara Code combines advanced voice recognition with deep codebase
          understanding.
          <br className="hidden md:block" />
          <span className="text-white/80 font-medium">
            Speak naturally. Code instantly.
          </span>
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Voice-First (Col Span 7) */}
        <div className="md:col-span-7 bg-[#0D1117] rounded-3xl border border-white/[0.08] p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CE0D8] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#5CE0D8]/15 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5 text-[#5CE0D8]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Voice-First</h3>
            <p className="text-sm text-white/55 mb-8 max-w-sm">
              Built from the ground up for voice. Clara understands context,
              intent, and complex programming concepts.
            </p>

            {/* Bottom mock UI */}
            <div className="mt-6 rounded-xl bg-[#070A0F] border border-white/5 p-4 relative z-10">
              <div className="flex items-center justify-center gap-1 h-8">
                {waveformHeights.map((h, i) =>
                <div
                  key={i}
                  className="w-1 bg-[#5CE0D8] rounded-full"
                  style={{
                    height: `${h}px`,
                    opacity: i % 2 === 0 ? 0.8 : 0.4
                  }} />

                )}
              </div>
              <div className="text-[#10B981] text-xs font-mono mt-4 text-center">
                ▶ 'Create a React component for the user profile card with
                avatar, name, and bio'
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Context-Aware (Col Span 5) */}
        <div className="md:col-span-5 bg-[#0D1117] rounded-3xl border border-white/[0.08] p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#5CE0D8] opacity-[0.06] blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/15 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-[#4F8EF7]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Context-Aware</h3>
            <p className="text-sm text-white/55 mb-8">
              Clara Code reads your project structure before answering. No
              copy-pasting files into a chat window.
            </p>

            {/* Mini file tree */}
            <div className="mt-5 font-mono text-xs space-y-1.5 bg-[#070A0F] border border-white/5 rounded-xl p-4">
              <div className="text-white/60">📁 src/</div>
              <div className="text-[#10B981] pl-4">
                📄 components/UserCard.tsx
              </div>
              <div className="text-white/40 pl-4">📄 lib/auth.ts</div>
              <div className="text-white/40 pl-4">📄 app/page.tsx</div>
            </div>
          </div>
        </div>

        {/* Card 3: Open Source (Col Span 5) */}
        <div className="md:col-span-5 bg-[#0D1117] rounded-3xl border border-white/[0.08] p-8 md:p-10 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center mb-4">
            <Code className="w-5 h-5 text-[#4F8EF7]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">MIT Licensed</h3>
          <p className="text-sm text-white/55 mb-8 flex-grow">
            Fork it. Self-host it. Build on top of it. The harness is open; the
            intelligence scales with your subscription.
          </p>

          {/* GitHub stars badge */}
          <div className="mt-5 inline-flex w-fit rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/50 items-center gap-1.5">
            ⭐ 2.4k stars on GitHub
          </div>
        </div>

        {/* Card 4: Voice/Text Toggle (Col Span 12) */}
        <div className="md:col-span-12 bg-[#0D1117] rounded-3xl border border-white/[0.08] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="relative z-10 max-w-md">
            <div className="w-10 h-10 rounded-xl bg-[#5CE0D8]/10 flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5 text-[#5CE0D8]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Seamless Modality
            </h3>
            <p className="text-sm text-white/55 mb-8">
              Toggle between voice and text anytime. Power users use both —
              voice for intent, keyboard for precision edits.
            </p>
          </div>

          {/* Two-button toggle mock */}
          <div className="relative z-10 w-full md:w-auto shrink-0">
            <div className="bg-[#070A0F] border border-white/[0.08] rounded-xl p-2 flex items-center gap-2 w-full md:w-[300px]">
              <div className="rounded-lg bg-[#5CE0D8] px-4 py-2.5 flex items-center gap-2 text-[#0D1117] text-sm font-medium shadow-sm flex-1 justify-center">
                <Mic className="w-4 h-4" />
                Voice
              </div>
              <div className="rounded-lg px-4 py-2.5 flex items-center gap-2 text-white/50 text-sm font-medium flex-1 justify-center hover:text-white/80 transition-colors cursor-pointer">
                <Keyboard className="w-4 h-4" />
                Text
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}