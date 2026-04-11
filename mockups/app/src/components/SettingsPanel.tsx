import React, { useState } from 'react';
import {
  UserCircle,
  Code2,
  Keyboard,
  Package,
  Mic,
  Sparkles,
  Shield,
  Activity,
  CheckCircle,
  Globe,
  ExternalLink,
  Key } from
'lucide-react';
export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('account');
  const NavItem = ({
    id,
    icon: Icon,
    label




  }: {id: string;icon: any;label: string;}) => {
    const isActive = activeSection === id;
    return (
      <button
        onClick={() => setActiveSection(id)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-mono w-full relative transition-colors
          ${isActive ? 'bg-[#7C3AED]/15 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white/70'}`}>
        
        {isActive &&
        <div className="absolute left-0 inset-y-2 w-0.5 bg-[#7C3AED] rounded-full" />
        }
        <Icon
          size={14}
          className={isActive ? 'text-[#7C3AED]' : 'text-white/25'} />
        
        {label}
      </button>);

  };
  const SectionLabel = ({
    label,
    isFirst = false



  }: {label: string;isFirst?: boolean;}) =>
  <div
    className={`text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 px-3 mb-1 ${isFirst ? '' : 'mt-4'}`}>
    
      {label}
    </div>;

  return (
    <div className="flex-1 h-full flex flex-row bg-[#0D1117] overflow-hidden">
      {/* LEFT NAV */}
      <div className="w-[200px] h-full bg-[#0A0E14] border-r border-white/6 pt-4 px-2 flex-shrink-0 overflow-y-auto no-scrollbar">
        <SectionLabel label="CLARA ACCOUNT" isFirst />
        <NavItem id="account" icon={UserCircle} label="Clara Account" />

        <SectionLabel label="EDITOR" />
        <NavItem id="editor" icon={Code2} label="Editor" />
        <NavItem id="keybindings" icon={Keyboard} label="Keybindings" />
        <NavItem id="extensions" icon={Package} label="Extensions" />

        <SectionLabel label="CLARA VOICE" />
        <NavItem id="voice" icon={Mic} label="Voice" />
        <NavItem id="agent" icon={Sparkles} label="Agent" />

        <SectionLabel label="PRIVACY" />
        <NavItem id="privacy" icon={Shield} label="Privacy" />
        <NavItem id="diagnostics" icon={Activity} label="Diagnostics" />
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#0D1117]">
        {activeSection === 'account' &&
        <div className="max-w-3xl">
            {/* PAGE TITLE */}
            <h1 className="text-[20px] font-bold text-white font-sans">
              Clara Account
            </h1>
            <p className="text-[13px] text-white/45 mt-1 font-mono">
              Connect your Clara account to enable voice sync, vault, and agent
              personas.
            </p>
            <div className="mt-6 mb-6 h-px bg-white/6" />

            {/* CONNECTION STATUS — NOT CONNECTED */}
            <div className="bg-[#070A0F] border border-white/8 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <UserCircle size={20} className="text-white/25" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-white/50 font-mono">
                  Not connected
                </div>
                <div className="text-[12px] text-white/30 font-mono mt-0.5">
                  Sign in to enable cloud features.
                </div>
              </div>
              <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.25)] transition-colors">
                Connect
              </button>
            </div>

            <div className="text-white/20 text-xs mb-2 mt-6 font-mono">
              Connected state preview:
            </div>
            {/* CONNECTION STATUS — CONNECTED */}
            <div className="bg-[#070A0F] border border-[#10B981]/20 rounded-xl p-5 flex items-center gap-4 border-l-[3px] border-l-[#10B981]">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-[#10B981]" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-white font-mono">
                  amenray2k
                </div>
                <div className="text-[12px] text-white/40 font-mono mt-0.5">
                  Pro Plan · Connected to claracode.ai
                </div>
              </div>
              <button className="border border-white/12 text-white/40 hover:text-white text-[13px] px-3 py-1.5 rounded-lg transition-colors">
                Sign out
              </button>
            </div>

            {/* LABELED DIVIDER */}
            <div className="mt-8 mb-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/6" />
              <div className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-mono whitespace-nowrap">
                CONNECTION METHOD
              </div>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* METHOD 1 — Sign in with Browser */}
            <div className="bg-[#0A0E14] border border-white/8 rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-[#7BCDD8]" />
                    <span className="text-[14px] font-semibold text-white font-mono">
                      Sign in with browser
                    </span>
                  </div>
                  <p className="text-[12px] text-white/40 font-mono mt-1 leading-relaxed max-w-lg">
                    Opens claracode.ai in your browser. Clerk authenticates you
                    and sends a token back to the IDE automatically.
                  </p>
                  <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-3 inline-flex w-fit">
                    RECOMMENDED
                  </div>
                </div>
                <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.25)] flex items-center gap-2 transition-colors">
                  <ExternalLink size={14} />
                  Open Browser
                </button>
              </div>
            </div>

            {/* METHOD 2 — API Key */}
            <div className="bg-[#0A0E14] border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-white/40" />
                <span className="text-[14px] font-semibold text-white font-mono">
                  API Key
                </span>
              </div>
              <p className="text-[12px] text-white/40 font-mono mt-1 leading-relaxed">
                Paste an API key from claracode.ai/settings/api-keys. Stored
                securely in your OS keychain.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                type="text"
                placeholder="clr_live_sk_••••••••••••••••"
                className="flex-1 bg-[#070A0F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] font-mono text-white/70 placeholder:text-white/20 focus:border-[#7C3AED]/40 focus:outline-none transition-colors" />
              
                <button className="bg-white/8 hover:bg-white/12 border border-white/12 text-white/70 hover:text-white text-[13px] px-4 py-2.5 rounded-lg transition-colors">
                  Connect
                </button>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <span className="text-[12px] text-white/30 font-mono">
                  Don't have an API key?
                </span>
                <span className="text-[12px] text-[#7BCDD8] hover:underline cursor-pointer font-mono">
                  Get one at claracode.ai →
                </span>
              </div>
            </div>

            {/* LABELED DIVIDER */}
            <div className="mt-8 mb-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/6" />
              <div className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-mono whitespace-nowrap">
                ACTIVE PLAN
              </div>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* PLAN CARD */}
            <div className="bg-[#0A0E14] border border-white/6 rounded-xl p-5 opacity-50">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-white font-mono">
                  Free Plan
                </span>
                <button className="bg-[#7C3AED] text-white text-[12px] font-semibold px-3 py-1 rounded-lg hover:bg-[#6D28D9] transition-colors">
                  Upgrade
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2">
                <div className="text-[12px] font-mono text-white/55">
                  ✓ CLI access
                </div>
                <div className="text-[12px] font-mono text-white/25 line-through">
                  ✗ Cloud sync
                </div>
                <div className="text-[12px] font-mono text-white/55">
                  ✓ Local voice
                </div>
                <div className="text-[12px] font-mono text-white/25 line-through">
                  ✗ Agent personas
                </div>
                <div className="text-[12px] font-mono text-white/55">
                  ✓ MIT Licensed
                </div>
                <div className="text-[12px] font-mono text-white/25 line-through">
                  ✗ Clara vault
                </div>
              </div>

              <span className="text-[12px] text-[#7BCDD8] mt-4 block hover:underline font-mono cursor-pointer w-fit">
                Manage billing at claracode.ai →
              </span>
            </div>

            {/* Bottom padding */}
            <div className="h-12" />
          </div>
        }
      </div>
    </div>);

}