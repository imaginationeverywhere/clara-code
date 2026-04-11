import React, { useEffect, useState, memo } from 'react';
import { Github, Mic, Check } from 'lucide-react';
import { ClaraLogo } from '../components/ClaraLogo';
const waveformHeights = [
8, 16, 24, 32, 40, 48, 56, 48, 64, 48, 40, 56, 32, 48, 24, 16, 8, 16, 32, 48,
56, 64, 48, 40, 32, 24, 16, 24, 32, 16, 12, 8];

export function SignUp() {
  const [phase, setPhase] = useState<1 | 2>(1);
  useEffect(() => {
    document.title = 'Create Account — Clara Code';
  }, []);
  return (
    <div className="min-h-screen w-full flex bg-[#0D1117] text-white font-sans selection:bg-[#7BCDD8]/30 selection:text-white">
      {/* LEFT COLUMN */}
      <div className="hidden lg:flex flex-col justify-center relative w-[45%] bg-[#070A0F] px-12 xl:px-24">
        <div className="absolute right-0 top-16 bottom-16 w-px bg-white/6" />

        <div className="max-w-sm w-full mx-auto flex flex-col">
          {/* Clara Code Mark */}
          <div className="flex items-center gap-3">
            <ClaraLogo size={40} />
            <span className="font-sans font-semibold text-[22px] text-white tracking-tight">
              Clara Code
            </span>
          </div>

          <div className="h-8" />

          <h1 className="text-[32px] font-bold text-white leading-[1.2]">
            Build with your own voice.
          </h1>

          <div className="h-3" />

          <p className="text-base text-white/55 leading-relaxed max-w-xs">
            Join 2,400+ developers who deploy AI agents in minutes, not months.
          </p>

          <div className="h-12" />

          {/* Free tier callout card */}
          <div className="bg-[#0A0E14] rounded-2xl border border-white/[0.08] p-5">
            <div className="text-[11px] font-semibold text-white/30 tracking-wider uppercase mb-3">
              What you get free
            </div>
            {[
            '1 AI agent with memory',
            '1 free voice clone',
            '100 API calls / month',
            'Clara Code IDE access'].
            map((feature, i) =>
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#10B981]" />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </div>
            )}
            <p className="text-xs text-white/30 mt-4 text-center">
              No credit card required
            </p>
          </div>

          <div className="h-6" />

          <div className="text-xs text-white/30 mt-auto pt-12">
            © 2026 Quik Nation, Inc.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col justify-center w-full lg:w-[55%] bg-[#0D1117] px-6 py-12">
        <div className="max-w-sm w-full mx-auto flex flex-col">
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center gap-3 mb-12">
            <ClaraLogo size={32} />
            <span className="font-sans font-semibold text-xl text-white tracking-tight">
              Clara Code
            </span>
          </div>

          {/* PHASE 1 — Sign-Up Form */}
          {phase === 1 &&
          <div data-phase="1">
              <h2 className="text-[28px] font-bold text-white mb-2">
                Create your account
              </h2>
              <p className="text-sm text-white/55">
                Already have an account?{' '}
                <a
                href="/sign-in"
                className="text-[#7BCDD8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117] rounded-sm">
                
                  Sign in
                </a>
              </p>

              <div className="h-8" />

              {/* CLERK SIGN-UP SLOT */}
              <div
              id="clerk-sign-up-mount"
              className="w-full min-h-[420px] rounded-2xl border border-white/[0.08] bg-[#0A0E14] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              
                {/* Clerk <SignUp /> mounts here with dark appearance override */}

                <div className="w-full flex flex-col">
                  {/* GitHub OAuth Button */}
                  <button
                  className="h-10 w-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] rounded-full flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0A0E14]"
                  onClick={() => setPhase(2)}>
                  
                    <Github className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Continue with GitHub
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-6">
                    <hr className="flex-1 border-white/[0.08]" />
                    <span className="text-xs text-white/30 px-2 uppercase tracking-wider">
                      or
                    </span>
                    <hr className="flex-1 border-white/[0.08]" />
                  </div>

                  {/* Email Input Skeleton */}
                  <div className="h-10 w-full bg-white/[0.08] rounded-xl mb-3 animate-pulse" />

                  {/* Password Input Skeleton */}
                  <div className="h-10 w-full bg-white/[0.08] rounded-xl mb-6 animate-pulse" />

                  {/* Submit Button Skeleton */}
                  <div className="h-10 w-full bg-[#7C3AED]/60 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="h-6" />

              <p className="text-xs text-white/30 text-center">
                By signing up, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          }

          {/* PHASE 2 — Voice Clone Hook */}
          {phase === 2 &&
          <div data-phase="2">
              {/* Success badge */}
              <div className="inline-flex items-center gap-2 bg-[#10B981]/15 border border-[#10B981]/25 rounded-full px-4 py-1.5 mb-6">
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[13px] text-[#10B981] font-medium">
                  Account created
                </span>
              </div>

              <h2 className="text-[28px] font-bold text-white leading-tight">
                Your free voice clone is waiting.
              </h2>

              <div className="h-2" />

              <p className="text-[15px] text-white/55 leading-relaxed">
                Clara can speak in your voice. Record 10 seconds and make it
                yours.
              </p>

              <div className="h-8" />

              {/* Waveform Teaser Card */}
              <div className="bg-[#0A0E14] rounded-2xl border border-[#7BCDD8]/20 p-6 shadow-[0_0_40px_rgba(123,205,216,0.08)]">
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">
                    Voice Clone
                  </span>
                  <span className="bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#10B981]/25">
                    FREE
                  </span>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-end justify-center gap-[3px] h-16 mb-6">
                  {waveformHeights.map((h, i) => {
                  const isCenter = i >= 12 && i < 20;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full motion-reduce:animate-none ${isCenter ? 'bg-[#7BCDD8]/80 animate-pulse' : 'bg-[#7BCDD8]/40'}`}
                      style={{
                        height: `${h}px`,
                        animationDelay: isCenter ?
                        `${(i - 12) * 75}ms` :
                        undefined
                      }} />);


                })}
                </div>

                {/* Mic Button */}
                <div className="flex flex-col items-center">
                  <button
                  aria-label="Record voice sample"
                  className="w-16 h-16 rounded-full bg-[#7C3AED] shadow-[0_0_30px_rgba(124,58,237,0.35)] flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0A0E14]">
                  
                    <Mic className="w-6 h-6 text-white" />
                  </button>
                  <span className="mt-3 text-[13px] text-white/30 text-center">
                    Tap to record 10 seconds
                  </span>
                </div>

                <div className="h-5" />

                <p className="text-[11px] text-white/20 text-center">
                  Your voice never leaves our servers. Powered by Voxtral.
                </p>
              </div>

              <div className="h-6" />

              {/* Skip link */}
              <button className="w-full text-sm text-white/30 text-center hover:text-white/55 underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117] rounded-sm">
                Skip for now — I'll do this later
              </button>

              <div className="h-4" />

              {/* CTA Button */}
              <button className="h-11 w-full rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0D1117]">
                Go to Dashboard
              </button>
            </div>
          }
        </div>
      </div>
    </div>);

}