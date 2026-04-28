import { useState } from 'react';
import {
  Terminal,
  Monitor,
  Copy,
  CheckCircle,
  Download,
  ExternalLink,
  Github } from
'lucide-react';
type PackageManager = 'npm' | 'pnpm' | 'brew';
const commands: Record<
  PackageManager,
  {
    prefix: string;
    pkg: string;
  }> =
{
  npm: {
    prefix: 'npm install -g ',
    pkg: '@clara/cli'
  },
  pnpm: {
    prefix: 'pnpm add -g ',
    pkg: '@clara/cli'
  },
  brew: {
    prefix: 'brew install ',
    pkg: 'clara-code'
  }
};
export function InstallSection() {
  const [activeTab, setActiveTab] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const cmd = commands[activeTab];
    navigator.clipboard.writeText(`${cmd.prefix}${cmd.pkg}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const cmd = commands[activeTab];
  return (
    <section className="py-24 bg-[#080C12]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Section Intro */}
        <div className="mb-12">
          <div className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-mono">
            GET STARTED
          </div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-white mt-3 tracking-tight">
            Two ways in.
          </h2>
          <p className="text-[17px] text-white/45 mt-3 font-mono">
            CLI for terminal purists. IDE for everyone else.
          </p>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* LEFT — CLI Install */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-[#7BCDD8]" />
              <span className="text-[13px] font-semibold text-white font-mono">
                Command Line
              </span>
              <span className="text-[13px] text-white/30 font-mono">
                · for terminal purists
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {(['npm', 'pnpm', 'brew'] as PackageManager[]).map((tab) =>
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCopied(false);
                }}
                className={`px-4 py-2 text-[12px] font-mono rounded-t-lg border border-b-0 transition-colors ${activeTab === tab ? 'bg-[#070A0F] border-white/[0.08] text-white/85' : 'bg-[#0A0E14] border-white/[0.08] text-white/35 hover:text-white/60'}`}>
                
                  {tab}
                </button>
              )}
            </div>

            {/* Install Command Block */}
            <div className="bg-[#070A0F] border border-white/[0.08] rounded-b-xl rounded-tr-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="font-mono text-sm">
                  <span className="text-white/25">$ </span>
                  <span className="text-white/70">{cmd.prefix}</span>
                  <span className="text-[#10B981]">{cmd.pkg}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 transition-colors shrink-0 ml-3">
                  
                  {copied ?
                  <>
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[12px] font-mono text-[#10B981]">
                        Copied!
                      </span>
                    </> :

                  <>
                      <Copy className="w-4 h-4 text-white/35 hover:text-white/60" />
                      <span className="text-[12px] font-mono text-white/35 hover:text-white/60">
                        Copy
                      </span>
                    </>
                  }
                </button>
              </div>

              <div className="px-5 py-3 border-t border-white/[0.06] space-y-1">
                {activeTab !== 'pnpm' &&
                <div className="text-[11px] font-mono text-white/[0.18]">
                    # or: pnpm add -g @clara/cli
                  </div>
                }
                {activeTab !== 'brew' &&
                <div className="text-[11px] font-mono text-white/[0.18]">
                    # or: brew install clara-code
                  </div>
                }
                {activeTab !== 'npm' &&
                <div className="text-[11px] font-mono text-white/[0.18]">
                    # or: npm install -g @clara/cli
                  </div>
                }
              </div>

              <div className="px-5 pb-4 pt-2">
                <span className="text-[12px] font-mono text-white/30">
                  Then run:{' '}
                </span>
                <span className="text-[12px] font-mono text-[#7BCDD8] bg-[#7BCDD8]/[0.08] border border-[#7BCDD8]/15 rounded-md px-1.5 py-0.5">
                  clara
                </span>
                <span className="text-[12px] font-mono text-white/30">
                  {' '}
                  to launch the voice TUI
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-mono text-white/25">
                Node.js 18+ required ·{' '}
              </span>
              <a
                href="#"
                className="text-[11px] font-mono text-[#7BCDD8] hover:underline">
                
                docs →
              </a>
            </div>
          </div>

          {/* RIGHT — IDE Download */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-[#5CE0D8]" />
              <span className="text-[13px] font-semibold text-white font-mono">
                Desktop IDE
              </span>
              <span className="text-[13px] text-white/30 font-mono">
                · VS Code, voice-first
              </span>
            </div>

            <div className="bg-[#0A0E14] border border-white/[0.08] rounded-xl overflow-hidden">
              {/* Top Section */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#5CE0D8]/10 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-[#5CE0D8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Clara Code IDE
                  </h3>
                </div>
                <div className="text-[12px] font-mono text-white/30 mt-0.5">
                  v1.0.0 · Stable
                </div>

                {/* Primary Download */}
                <button className="mt-4 w-full bg-[#5CE0D8] hover:bg-[#4BCBC3] text-[#0D1117] rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-[0_0_20px_rgba(92,224,216,0.3)] transition-colors">
                  <Download className="w-4 h-4" />
                  Download for macOS
                </button>
                <div className="text-[11px] font-mono text-white/30 text-center mt-2">
                  Universal Binary · Apple Silicon + Intel
                </div>
              </div>

              <div className="border-t border-white/[0.06]" />

              {/* Other Platforms */}
              <div className="px-5 py-3">
                <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-3">
                  Other platforms
                </div>
                <div className="space-y-1">
                  <a
                    href="#"
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-white/40" />
                      <span className="text-[13px] font-mono text-white/55">
                        Linux
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-white/25">
                        .AppImage
                      </span>
                      <Download className="w-3 h-3 text-white/25" />
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-white/40" />
                      <span className="text-[13px] font-mono text-white/55">
                        Windows
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-white/25">
                        .exe
                      </span>
                      <Download className="w-3 h-3 text-white/25" />
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-white/40" />
                      <span className="text-[13px] font-mono text-white/55">
                        Source code
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/25" />
                  </a>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/25">
                  MIT Licensed · Open Source
                </span>
                <a
                  href="#"
                  className="text-[11px] font-mono text-[#7BCDD8] hover:underline">
                  
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-10">
          <div>
            <span className="text-[13px] font-mono text-white/30">
              Already installed? Run{' '}
            </span>
            <span className="text-[13px] font-mono text-[#7BCDD8] bg-[#7BCDD8]/[0.08] border border-[#7BCDD8]/15 rounded-md px-2 py-0.5">
              clara update
            </span>
            <span className="text-[13px] font-mono text-white/30">
              {' '}
              to get the latest.
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-mono text-white/20">
              Verified downloads · SHA-256 checksums available ·{' '}
            </span>
            <a
              href="#"
              className="text-[11px] font-mono text-[#7BCDD8]/60 hover:text-[#7BCDD8] transition-colors">
              
              Security policy →
            </a>
          </div>
        </div>
      </div>
    </section>);

}