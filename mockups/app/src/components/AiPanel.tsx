import { Mic, Check, GitCompare, Maximize2 } from 'lucide-react';
export function AiPanel() {
  return (
    <div className="h-full w-72 bg-[#090D12] border-l border-white/6 flex flex-col flex-shrink-0 select-none">
      {/* PANEL HEADER */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            C
          </div>
          <span className="text-white text-sm font-medium">Clara</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        </div>
        <button className="w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded">
          <Maximize2 size={13} />
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* MESSAGE 1 — Voice transcript (user, right-aligned) */}
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-[#7C3AED]/12 border border-[#7C3AED]/15 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
            <div className="text-[10px] text-[#7C3AED]/60 mb-1 flex items-center gap-1">
              <Mic size={10} />
              <span>Voice input</span>
            </div>
            <p className="text-[12px] text-white/80 font-mono italic leading-relaxed">
              Add a hero section with a large microphone button and the tagline
              "Code with your voice"
            </p>
          </div>
        </div>

        {/* MESSAGE 2 — AI response with code block */}
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            C
          </div>
          <div className="bg-white/[0.04] border border-white/6 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
            <p className="text-[12px] text-white/75 leading-relaxed">
              Creating a hero section with voice-first design. Here's what I'm
              adding:
            </p>

            {/* Code block */}
            <div className="bg-[#0D1117] rounded-xl border border-white/6 px-3 py-2.5 mt-2 overflow-x-auto">
              <pre className="text-[11px] font-mono leading-relaxed">
                <div>
                  <span className="text-[#7C3AED]">
                    export default function
                  </span>
                  <span className="text-white/80">{' Hero() {'}</span>
                </div>
                <div>
                  <span className="text-white/50">{'  return ('}</span>
                </div>
                <div>
                  <span className="text-white/50">{'    '}</span>
                  <span className="text-red-400/70">{'<section'}</span>
                  <span className="text-yellow-400/60">{' className'}</span>
                  <span className="text-white/50">=</span>
                  <span className="text-[#10B981]">"min-h-screen flex..."</span>
                  <span className="text-red-400/70">{'>'}</span>
                </div>
                <div>
                  <span className="text-white/50">{'      ...'}</span>
                </div>
                <div>
                  <span className="text-white/50">{'    '}</span>
                  <span className="text-red-400/70">{'</section>'}</span>
                </div>
                <div>
                  <span className="text-white/50">{'  )'}</span>
                </div>
                <div>
                  <span className="text-white/50">{'}'}</span>
                </div>
              </pre>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              <button className="bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[11px] rounded-lg px-2.5 py-1 hover:bg-[#10B981]/15 flex items-center gap-1.5 transition-colors">
                <Check size={11} />
                Apply changes
              </button>
              <button className="bg-white/[0.04] border border-white/8 text-white/50 text-[11px] rounded-lg px-2.5 py-1 hover:bg-white/6 flex items-center gap-1.5 transition-colors">
                <GitCompare size={11} />
                View diff
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE 3 — Thinking state */}
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            C
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm px-3 py-2">
            <div className="flex items-center gap-1.5 h-5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{
                  animationDelay: '0ms'
                }} />
              
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{
                  animationDelay: '150ms'
                }} />
              
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{
                  animationDelay: '300ms'
                }} />
              
            </div>
            <div className="text-[10px] text-white/20 mt-1">
              Clara is thinking...
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="flex-shrink-0 border-t border-white/6 p-3">
        {/* Quick action pills */}
        <div className="flex gap-2 flex-wrap">
          <button className="text-[11px] text-white/45 bg-white/[0.04] border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/6 hover:text-white/70 cursor-pointer transition-colors">
            Explain this code
          </button>
          <button className="text-[11px] text-white/45 bg-white/[0.04] border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/6 hover:text-white/70 cursor-pointer transition-colors">
            Add tests
          </button>
          <button className="text-[11px] text-white/45 bg-white/[0.04] border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/6 hover:text-white/70 cursor-pointer transition-colors">
            Fix errors
          </button>
        </div>

        {/* Context info */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-white/20">
            3 exchanges · this file
          </span>
          <button className="text-[10px] text-white/20 hover:text-white/50 cursor-pointer underline transition-colors">
            Clear
          </button>
        </div>
      </div>
    </div>);

}