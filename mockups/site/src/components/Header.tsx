import React from 'react';
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/85 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <span className="font-sans font-bold text-white text-lg tracking-tight">
            Clara
          </span>
          <span className="font-mono font-bold text-[#4F8EF7] text-lg tracking-tight">
            Code
          </span>
        </div>
        <nav className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
          <button className="bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors rounded-full px-5 py-2 text-sm font-medium text-white">
            Get Early Access
          </button>
        </nav>
      </div>
    </header>);

}