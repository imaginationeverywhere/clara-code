import { Github, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
export function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#5CE0D8] opacity-10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#4F8EF7] opacity-10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center border border-[#5CE0D8]/30 bg-[#5CE0D8]/[0.08] text-[#5CE0D8] text-xs font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-6">
          <span className="relative flex h-2 w-2 mr-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CE0D8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5CE0D8]"></span>
          </span>
          Open Source · MIT Licensed
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5CE0D8] to-[#4F8EF7] opacity-20 blur-2xl rounded-full" />
        </div>

        {/* 3D Logo */}
        <div className="mb-8 relative">
          <img
            src="/final2-v3-wavy-voice-v3.png"
            alt="Clara Code"
            className="relative w-[120px] md:w-[160px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
          
        </div>

        {/* Headline */}
        <h1 className="text-[56px] md:text-[80px] font-bold text-white leading-[1.05] tracking-tight mb-6">
          Code with your <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-[#5CE0D8] to-[#4F8EF7] bg-clip-text text-transparent">
            voice.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-[18px] text-white/55 max-w-[520px] mx-auto leading-relaxed mb-8">
          Speak naturally. Clara Code hears your intent and writes the
          implementation.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            to="/sign-up"
            className="w-full sm:w-auto bg-[#5CE0D8] hover:bg-[#4BCBC3] transition-colors text-[#0D1117] rounded-full px-7 py-3.5 text-[15px] font-semibold shadow-[0_0_30px_rgba(92,224,216,0.35)] text-center">
            
            Get Early Access
          </Link>
          <a
            href="#"
            className="w-full sm:w-auto border border-white/15 hover:border-white/30 transition-colors text-white/70 hover:text-white rounded-full px-7 py-3.5 text-[15px] flex items-center justify-center gap-2 font-medium">
            
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        {/* Social Proof */}
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[
            {
              bg: 'from-blue-500 to-blue-700',
              initial: 'A'
            },
            {
              bg: 'from-purple-500 to-purple-700',
              initial: 'J'
            },
            {
              bg: 'from-emerald-500 to-emerald-700',
              initial: 'S'
            },
            {
              bg: 'from-amber-500 to-amber-700',
              initial: 'M'
            },
            {
              bg: 'from-rose-500 to-rose-700',
              initial: 'D'
            }].
            map((avatar, i) =>
            <div
              key={i}
              className={`w-7 h-7 rounded-full border-2 border-[#0D1117] bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-[9px] text-white font-medium`}>
              
                {avatar.initial}
              </div>
            )}
          </div>
          <span className="text-xs text-white/40 font-medium">
            Trusted by 2,400+ developers
          </span>
        </div>
      </div>

      {/* Demo Preview Block */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-16 px-4 md:px-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E14] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          {/* Mock window bar */}
          <div className="h-10 bg-[#070B10] border-b border-white/5 flex items-center px-4 relative">
            <div className="flex items-center gap-2 absolute left-4">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
            </div>
            <div className="mx-auto text-xs text-white/25 bg-[#0D1117] rounded px-3 py-1 font-mono border border-white/5">
              claracode.ai/app
            </div>
          </div>

          {/* App content area */}
          <div className="min-h-[260px] bg-[#0D1117] flex flex-col items-center justify-end pb-8 relative">
            {/* Code snippet floating card */}
            <div className="bg-[#0F1318] border border-white/[0.08] rounded-xl p-4 text-left mb-6 w-[90%] sm:w-[380px] shadow-lg">
              <div className="text-[#10B981] text-xs font-mono mb-3 flex items-center gap-2">
                <span className="text-[10px]">▶</span> 'Add authentication to
                the login page'
              </div>
              <div className="h-px w-full bg-white/5 mb-3" />
              <div className="flex flex-col gap-1">
                <div className="text-white/40 text-xs font-mono leading-relaxed">
                  {'const handleLogin = async (email: string) => {'}
                </div>
                <div className="text-[#4F8EF7] text-xs font-mono ml-4 leading-relaxed">
                  {'  const { data } = await signIn({ email })'}
                </div>
                <div className="text-white/40 text-xs font-mono leading-relaxed">
                  {'}'}
                </div>
              </div>
            </div>

            {/* Mic Button */}
            <div className="relative mt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[80px] rounded-full ring-4 ring-[#5CE0D8]/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <button className="relative z-10 w-[80px] h-[80px] rounded-full bg-[#5CE0D8] shadow-[0_0_40px_rgba(92,224,216,0.5)] flex items-center justify-center hover:bg-[#4BCBC3] transition-colors group">
                <Mic className="w-8 h-8 text-[#0D1117] group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>);

}