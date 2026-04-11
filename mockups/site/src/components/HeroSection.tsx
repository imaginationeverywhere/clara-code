import React from 'react';
import { Github, Mic } from 'lucide-react';
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#0D1117] pt-24 pb-12 overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
            'radial-gradient(rgba(124, 58, 237, 0.08) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px'
          }} />
        
        {/* Radial glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#7C3AED] opacity-10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#4F8EF7] opacity-[0.07] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center border border-[#7C3AED]/30 bg-[#7C3AED]/[0.08] text-[#7C3AED] text-xs font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-6">
          Now in Beta
        </div>

        {/* 3D Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED] to-[#4F8EF7] opacity-20 blur-2xl rounded-full" />
          <img
            src="/clara-code-logo-3d.png"
            alt="Clara Code"
            className="relative w-[120px] md:w-[160px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
          
        </div>

        {/* H1 */}
        <h1 className="text-[48px] md:text-[64px] font-bold leading-[1.08] tracking-tight flex flex-col items-center mb-5">
          <span className="text-white">Your voice.</span>
          <span className="bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent">
            Your code.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-[18px] text-white/55 max-w-[520px] mx-auto leading-relaxed mb-8">
          Speak naturally. Clara Code hears your intent and writes the
          implementation.
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
          <button className="w-full sm:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors text-white rounded-full px-7 py-3.5 text-[15px] font-semibold shadow-[0_0_30px_rgba(124,58,237,0.35)]">
            Get Early Access
          </button>
          <button className="w-full sm:w-auto border border-white/15 hover:border-white/30 transition-colors text-white/70 hover:text-white rounded-full px-7 py-3.5 text-[15px] flex items-center justify-center gap-2 font-medium">
            <Github className="w-4 h-4" />
            View on GitHub
          </button>
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

            {/* Mic button */}
            <div className="relative flex flex-col items-center mt-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[80px] rounded-full ring-4 ring-[#7C3AED]/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <button className="relative z-10 w-[80px] h-[80px] rounded-full bg-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center hover:bg-[#6D28D9] transition-colors group">
                <Mic className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </button>
              <div className="mt-5 text-xs text-white/25 tracking-widest font-semibold">
                HOLD TO SPEAK
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}