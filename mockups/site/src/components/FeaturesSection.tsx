import React from 'react';
import { Mic, Sparkles, Code, Volume2, Keyboard } from 'lucide-react';
export function FeaturesSection() {
  // Static heights for the waveform bars
  const waveformHeights = [
  8, 12, 24, 16, 8, 28, 20, 12, 16, 24, 12, 8, 20, 16, 8, 12];

  return (
    <section className="py-28 bg-[#080C12]">
      {/* Section intro */}
      <div className="text-center mb-20 px-6">
        <div className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-medium">
          WHY CLARA CODE
        </div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-white mt-3 leading-tight">
          Built for how developers actually think.
        </h2>
        <div className="text-[32px] md:text-[40px] font-bold bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent inline leading-tight">
          Not how they type.
        </div>
      </div>

      {/* Feature bento grid */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card 1 — LARGE (Voice-First Input) */}
        <div className="md:col-span-7 md:row-span-2 bg-[#0D1117] rounded-2xl border border-white/[0.08] p-8 overflow-hidden relative flex flex-col">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center mb-4">
            <Mic className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <h3 className="text-white text-xl font-semibold">
            Speak. Don't type.
          </h3>
          <p className="text-white/55 text-sm mt-2 leading-relaxed flex-grow">
            Hold the mic button, say what you want built. Clara Code
            transcribes, interprets, and implements — while you think of the
            next thing.
          </p>

          {/* Bottom mock UI */}
          <div className="mt-6 rounded-xl bg-[#070A0F] border border-white/5 p-4 relative z-10">
            <div className="flex items-center justify-center gap-1 h-8">
              {waveformHeights.map((height, i) =>
              <div
                key={i}
                className="w-1 bg-[#7C3AED] rounded-full"
                style={{
                  height: `${height}px`
                }} />

              )}
            </div>
            <div className="text-[#10B981] text-xs font-mono mt-4 text-center">
              ▶ 'Create a React component for the user profile card with
              avatar, name, and bio'
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#7C3AED] opacity-[0.06] blur-[80px] rounded-full pointer-events-none" />
        </div>

        {/* Card 2 — MEDIUM (Context-Aware) */}
        <div className="md:col-span-5 bg-[#0D1117] rounded-2xl border border-white/[0.08] p-6">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-[#10B981]" />
          </div>
          <h3 className="text-white text-lg font-semibold">
            Knows your codebase.
          </h3>
          <p className="text-white/55 text-sm mt-2 leading-relaxed">
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

        {/* Card 3 — MEDIUM (Open Source) */}
        <div className="md:col-span-5 bg-[#0D1117] rounded-2xl border border-white/[0.08] p-6 flex flex-col">
          <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center mb-4">
            <Code className="w-5 h-5 text-[#4F8EF7]" />
          </div>
          <h3 className="text-white text-lg font-semibold">MIT licensed.</h3>
          <p className="text-white/55 text-sm mt-2 leading-relaxed flex-grow">
            Fork it. Self-host it. Build on top of it. The harness is open; the
            intelligence scales with your subscription.
          </p>

          {/* GitHub stars badge */}
          <div className="mt-5 inline-flex w-fit rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/50 items-center gap-1.5">
            ⭐ 2.4k stars on GitHub
          </div>
        </div>

        {/* Card 4 — WIDE (Multimodal) */}
        <div className="md:col-span-12 bg-gradient-to-r from-[#0D1117] to-[#0A0E14] rounded-2xl border border-white/[0.08] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <h3 className="text-white text-xl font-semibold">
              Voice is the default. Text is the escape hatch.
            </h3>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">
              Toggle between voice and text anytime. Power users use both —
              voice for intent, keyboard for precision edits.
            </p>
          </div>

          {/* Two-button toggle mock */}
          <div className="flex rounded-xl bg-[#070A0F] border border-white/[0.08] p-1 gap-1 shrink-0">
            <div className="rounded-lg bg-[#7C3AED] px-4 py-2.5 flex items-center gap-2 text-white text-sm font-medium shadow-sm">
              <Mic className="w-4 h-4" />
              Voice
            </div>
            <div className="rounded-lg px-4 py-2.5 flex items-center gap-2 text-white/40 text-sm hover:text-white/60 transition-colors cursor-default">
              <Keyboard className="w-4 h-4" />
              Text
            </div>
          </div>
        </div>
      </div>
    </section>);

}