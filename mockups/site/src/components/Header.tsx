import React from 'react';
import { Link } from 'react-router-dom';
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/85 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          
          <img
            src="/clara-ai-icon-1024-cyan.png"
            alt="Clara Code"
            width={32}
            height={32}
            className="object-contain rounded-lg" />
          
          <div className="flex items-center gap-0.5">
            <span className="font-sans font-bold text-white text-lg tracking-tight">
              Clara
            </span>
            <span className="font-mono font-bold text-[#5CE0D8] text-lg tracking-tight">
              Code
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <Link to="/sign-in" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
          <Link
            to="/sign-up"
            className="bg-[#5CE0D8] hover:bg-[#4BCBC3] transition-colors rounded-full px-5 py-2 text-sm font-medium text-[#0D1117]">
            
            Get Early Access
          </Link>
        </nav>
      </div>
    </header>);

}