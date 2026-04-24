import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { ClaraLogo } from '../components/ClaraLogo';
export function SignIn() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Sign In — Clara Code';
  }, []);
  return (
    <div className="min-h-screen w-full flex bg-[#0D1117] text-white font-sans selection:bg-[#7BCDD8]/30 selection:text-white">
      {/* LEFT COLUMN */}
      <div className="hidden lg:flex flex-col justify-center relative w-[45%] bg-[#070A0F] px-12 xl:px-24">
        {/* Subtle right edge line */}
        <div className="absolute right-0 top-16 bottom-16 w-px bg-white/6" />

        <div className="max-w-sm w-full mx-auto flex flex-col">
          {/* Clara Code Mark */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            
            <ClaraLogo size={40} />
            <span className="font-sans font-semibold text-[22px] text-white tracking-tight">
              Clara Code
            </span>
          </Link>
          <div className="h-8" /> {/* 32px gap */}
          <h1 className="text-[32px] font-bold text-white leading-[1.2]">
            Your AI is waiting.
          </h1>
          <div className="h-3" /> {/* 12px gap */}
          <p className="text-[16px] text-white/55 leading-[1.6] max-w-xs">
            Sign in to access your agents, API keys, and voice settings.
          </p>
          <div className="h-12" /> {/* 48px gap */}
          {/* Trust Badges */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[14px] text-white/70">
                Agents running 24/7
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[14px] text-white/70">
                Voice cloning included
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[14px] text-white/70">
                API access on all plans
              </span>
            </div>
          </div>
          <div className="h-12" /> {/* 48px gap */}
          <div className="text-[12px] text-white/30 mt-auto pt-12">
            © 2026 Quik Nation, Inc.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col justify-center w-full lg:w-[55%] bg-[#0D1117] px-6 py-12">
        <div className="max-w-sm w-full mx-auto flex flex-col">
          {/* Mobile Branding (Hidden on Desktop) */}
          <Link
            to="/"
            className="flex lg:hidden items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            
            <ClaraLogo size={32} />
            <span className="font-sans font-semibold text-[20px] text-white tracking-tight">
              Clara Code
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
            
            <span>←</span>
            <span>Back to home</span>
          </Link>
          <h2 className="text-[28px] font-bold text-white mb-2">
            Welcome back
          </h2>
          <p className="text-[14px] text-white/55">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="text-[#7BCDD8] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5CE0D8] focus:ring-offset-2 focus:ring-offset-[#0D1117] rounded-sm">
              
              Sign up
            </Link>
          </p>
          <div className="h-8" /> {/* 32px gap */}
          {/* CLERK SIGN-IN SLOT */}
          <div
            id="clerk-sign-in-mount"
            className="w-full min-h-[380px] rounded-2xl border border-white/8 bg-[#0A0E14] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            
            {/* Clerk <SignIn /> mounts here with dark appearance override */}

            {/* Placeholder Content */}
            <div className="w-full flex flex-col">
              {/* GitHub OAuth Button */}
              <button
                onClick={() => navigate('/settings')}
                className="h-10 w-full bg-white/8 hover:bg-white/12 border border-white/12 rounded-full flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5CE0D8] focus:ring-offset-2 focus:ring-offset-[#0A0E14]">
                
                <Github className="w-4 h-4 text-white" />
                <span className="text-[14px] font-medium text-white">
                  Continue with GitHub
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <hr className="flex-1 border-white/8" />
                <span className="text-[12px] text-white/30 px-2 uppercase tracking-wider">
                  or
                </span>
                <hr className="flex-1 border-white/8" />
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5CE0D8]/50 focus:border-[#5CE0D8]/50" />
                
              </div>

              {/* Password Input */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-white/70">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-[#7BCDD8] hover:underline">
                    
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-10 bg-[#070A0F] border border-white/[0.12] rounded-xl px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5CE0D8]/50 focus:border-[#5CE0D8]/50" />
                
              </div>

              <div className="h-4" />

              {/* Submit Button */}
              <button
                type="submit"
                onClick={() => navigate('/settings')}
                className="h-10 w-full bg-[#5CE0D8] hover:bg-[#4BCBC3] text-[#0D1117] text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5CE0D8] focus:ring-offset-2 focus:ring-offset-[#0A0E14] shadow-[0_0_20px_rgba(92,224,216,0.3)]">
                
                Sign In
              </button>
            </div>
          </div>
          <div className="h-6" /> {/* 24px gap */}
          <p className="text-[12px] text-white/30 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>);

}