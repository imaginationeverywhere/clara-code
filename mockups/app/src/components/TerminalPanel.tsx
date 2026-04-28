import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  X,
  Mic,
  Keyboard,
  ExternalLink } from
'lucide-react';
export function TerminalPanel({ onClose }: {onClose: () => void;}) {
  const [activeTab, setActiveTab] = useState<'clara' | 'terminal'>('clara');
  return (
    <div className="h-[280px] bg-[#09090F] border-t border-white/6 flex flex-col flex-shrink-0 select-none">
      {/* TOP BAR */}
      <div className="h-9 flex items-center px-3 border-b border-white/6 bg-[#0A0E14] flex-shrink-0">
        {/* Tabs */}
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 h-9 flex items-center text-[12px] font-mono cursor-pointer transition-colors border-b-2
            ${activeTab === 'terminal' ? 'text-white border-[#7C3AED]' : 'text-white/35 border-transparent hover:text-white/55'}`}>
          
          TERMINAL
        </button>
        <button
          onClick={() => setActiveTab('clara')}
          className={`px-4 h-9 flex items-center gap-1.5 text-[12px] font-mono cursor-pointer transition-colors border-b-2
            ${activeTab === 'clara' ? 'text-white border-[#7C3AED]' : 'text-white/35 border-transparent hover:text-white/55'}`}>
          
          CLARA
          {activeTab === 'clara' &&
          <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
          }
        </button>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1 text-white/25 hover:text-white/50 transition-colors">
            <Plus size={16} />
          </button>
          <button className="p-1 text-white/25 hover:text-white/50 transition-colors">
            <Trash2 size={16} />
          </button>
          <button className="p-1 text-white/25 hover:text-white/50 transition-colors">
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-white/25 hover:text-white/50 transition-colors">
            
            <X size={16} />
          </button>
        </div>
      </div>

      {activeTab === 'clara' ?
      <>
          {/* VOICE STATUS STRIP */}
          <div className="h-7 flex items-center gap-3 px-4 bg-[#070A0F] border-b border-white/5 flex-shrink-0">
            <div className="flex items-end gap-0.5 h-3">
              {[2, 5, 10, 12, 8, 6, 10, 4].map((h, i) =>
            <div
              key={i}
              className="w-[2px] rounded-sm bg-[#7C3AED]"
              style={{
                height: `${h}px`
              }} />

            )}
            </div>
            <span className="text-[11px] font-mono text-[#7C3AED]">
              Listening
            </span>

            <div className="flex-1 text-center">
              <span className="text-[11px] font-mono text-white/20">Hold </span>
              <span className="text-[11px] font-mono text-white/35 bg-white/6 border border-white/10 rounded px-1 py-0.5">
                Ctrl+Space
              </span>
              <span className="text-[11px] font-mono text-white/20">
                {' '}
                to speak
              </span>
            </div>

            <button className="text-[11px] font-mono text-white/25 hover:text-white/45 cursor-pointer flex items-center gap-1 transition-colors">
              <Keyboard size={10} />
              Text mode →
            </button>
          </div>

          {/* CLARA TERMINAL CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-6">
            {/* ITEM 1 — Past voice command (dimmed) */}
            <div className="flex items-start gap-2">
              <Mic
              size={10}
              className="text-[#7C3AED]/40 mt-1.5 flex-shrink-0" />
            
              <span className="text-white/30 italic">
                'Add auth middleware to /api/orders'
              </span>
            </div>
            <div className="ml-[18px]">
              <span className="text-[#10B981]/60">✓ </span>
              <span className="text-white/25">middleware/auth.ts updated</span>
            </div>

            {/* ITEM 2 — Past shell command (dimmed) */}
            <div className="mt-1.5">
              <span className="text-white/20">$ </span>
              <span className="text-white/40">npm run dev</span>
            </div>
            <div className="ml-[18px]">
              <span className="text-white/20">
                ▶ Local: http://localhost:3000
              </span>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/5 my-2" />

            {/* ITEM 3 — CURRENT (active) */}
            <div className="flex items-start gap-2">
              <Mic size={10} className="text-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span className="text-[#10B981]">
                'Create a loading skeleton for the dashboard'
              </span>
            </div>
            <div className="ml-[18px] space-y-1 mt-1">
              <div>
                <span className="text-[#7C3AED] animate-pulse">● </span>
                <span className="text-white/50">
                  Analyzing src/components/dashboard/...
                </span>
              </div>
              <div>
                <span className="text-[#10B981]">✓ </span>
                <span className="text-white/70">DashboardSkeleton.tsx</span>
                <span className="text-white/40"> created</span>
              </div>
              <div className="text-[11px]">
                <span className="text-white/20"> → </span>
                <span className="text-[#7BCDD8]">
                  src/components/dashboard/DashboardSkeleton.tsx
                </span>
              </div>
            </div>

            {/* Action row */}
            <div className="mt-1.5 ml-[18px] flex items-center gap-3">
              <button className="text-[11px] font-mono text-[#7BCDD8] hover:underline cursor-pointer flex items-center gap-1 transition-colors">
                <ExternalLink size={10} />
                Open file
              </button>
              <span className="text-white/20">·</span>
              <button className="text-[11px] font-mono text-white/35 hover:text-white/60 cursor-pointer transition-colors">
                View diff
              </button>
              <span className="text-white/20">·</span>
              <button className="text-[11px] font-mono text-white/35 hover:text-white/60 cursor-pointer transition-colors">
                Undo
              </button>
            </div>

            {/* Blinking cursor */}
            <div className="mt-1 ml-[18px]">
              <span className="text-[#7C3AED] animate-pulse text-[12px]">
                ▌
              </span>
            </div>
          </div>
        </> :

      <>
          {/* PLAIN TERMINAL — no voice strip */}
          <div className="h-7 flex items-center px-4 bg-[#070A0F] border-b border-white/5 flex-shrink-0">
            <span className="text-white/30 text-[11px] font-mono">
              zsh — ~/projects/my-app
            </span>
          </div>

          {/* PLAIN TERMINAL CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-6">
            <div>
              <span className="text-white/30">amenray@macbook my-app % </span>
              <span className="text-white/70">git status</span>
            </div>
            <div className="text-white/40">On branch main</div>
            <div className="text-white/40">Changes not staged:</div>
            <div className="text-[#10B981]/70">
              {' '}
              modified: src/components/dashboard/DashboardSkeleton.tsx
            </div>
            <div className="mt-2">
              <span className="text-white/30">amenray@macbook my-app % </span>
              <span className="text-white animate-pulse">█</span>
            </div>
          </div>
        </>
      }

      {/* BOTTOM STATUS BAR */}
      <div className="h-6 flex items-center px-4 gap-4 border-t border-white/5 bg-[#070A0F] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#7C3AED]/10 text-[#7C3AED] text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded">
            {activeTab === 'clara' ? 'CLARA' : 'TERM'}
          </span>
          <span className="text-white/15">·</span>
          <span className="text-[10px] font-mono text-white/25">
            zsh — ~/projects/my-app
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/20">⌃`</span>
          <span className="text-white/15">·</span>
          <span className="text-[10px] font-mono text-white/20 hover:text-white/40 cursor-pointer transition-colors">
            Split
          </span>
        </div>
      </div>
    </div>);

}