import React, { useState } from 'react';
import { ClaraLogo } from '../components/ClaraLogo';
import {
  Users,
  ChevronDown,
  ArrowLeft,
  UserCircle,
  Settings as SettingsIcon,
  Key,
  Mic,
  CreditCard,
  Bell,
  Blocks } from
'lucide-react';
import { ApiKeysContent } from '../components/ApiKeysContent';
type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'default' | 'red';
};
const navSections: {
  label?: string;
  items: NavItem[];
}[] = [
{
  items: [
  {
    id: 'profile',
    label: 'Profile',
    icon: UserCircle
  },
  {
    id: 'account',
    label: 'Account',
    icon: SettingsIcon
  }]

},
{
  label: 'DEVELOPER',
  items: [
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: Key,
    badge: '3'
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Mic
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard
  }]

},
{
  label: 'WORKSPACE',
  items: [
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    badge: '1'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: '2',
    badgeColor: 'red'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Blocks
  }]

}];

export function Settings() {
  const [activeItem, setActiveItem] = useState('api-keys');
  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans selection:bg-[#7C3AED]/30 selection:text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#070A0F] border-b border-white/[0.06] px-6 flex items-center justify-between z-40">
        <div className="flex items-center">
          <div className="flex items-center gap-2.5">
            <ClaraLogo size={28} />
            <span className="text-base font-semibold text-white">
              Clara Code
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.12] mx-4" />
          <span className="text-sm text-white/40">Settings</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/30 border border-[#7C3AED]/40 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#7C3AED]">AR</span>
            </div>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
        </div>
      </header>

      {/* MOBILE HORIZONTAL NAV (< md) */}
      <div className="md:hidden fixed top-14 left-0 right-0 h-12 bg-[#070A0F] border-b border-white/[0.06] flex items-center gap-1 px-4 overflow-x-auto settings-scroll z-30">
        {navSections.
        flatMap((section) => section.items).
        map((item) =>
        <button
          key={item.id}
          onClick={() => setActiveItem(item.id)}
          className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${activeItem === item.id ? 'bg-[#7C3AED]/15 text-white font-medium' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
          
              {item.label}
            </button>
        )}
      </div>

      {/* LEFT NAV (>= md) */}
      <nav className="hidden md:flex flex-col fixed top-14 left-0 bottom-0 w-14 lg:w-56 bg-[#070A0F] border-r border-white/[0.06] overflow-y-auto settings-scroll pt-6 z-30">
        <div className="flex-1 px-3">
          {navSections.map((section, sIdx) =>
          <div key={sIdx} className="mb-6 last:mb-0">
              {section.label &&
            <div className="hidden lg:block text-[11px] font-semibold text-white/25 uppercase tracking-wider px-3 mb-2">
                  {section.label}
                </div>
            }

              <div className="space-y-1">
                {section.items.map((item) => {
                const isActive = activeItem === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors relative group ${isActive ? 'bg-[#7C3AED]/15' : 'hover:bg-white/5'}`}
                    title={item.label} // Tooltip for collapsed state
                  >
                      {isActive &&
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#7C3AED]" />
                    }

                      <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-white/35 group-hover:text-white/60'}`} />
                    

                      <span
                      className={`hidden lg:block text-sm truncate ${isActive ? 'text-white font-medium' : 'text-white/55 group-hover:text-white/80'}`}>
                      
                        {item.label}
                      </span>

                      {item.badge &&
                    <span
                      className={`hidden lg:flex ml-auto text-xs px-1.5 py-0.5 rounded-md ${item.badgeColor === 'red' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-white/[0.08] text-white/50'}`}>
                      
                          {item.badge}
                        </span>
                    }
                    </button>);

              })}
              </div>

              {sIdx < navSections.length - 1 &&
            <div className="h-px bg-white/[0.06] mx-3 mt-6" />
            }
            </div>
          )}
        </div>

        {/* NAV FOOTER */}
        <div className="hidden lg:block mt-auto p-3 border-t border-white/[0.06]">
          <div className="bg-[#0A0E14] rounded-xl border border-[#7C3AED]/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/50">
                Free Plan
              </span>
              <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors">
                Upgrade
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-white/30">API Calls</span>
                <span className="text-[10px] text-white/50">47 / 100</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full"
                  style={{
                    width: '47%'
                  }} />
                
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="pt-26 md:pt-14 md:ml-14 lg:ml-56 min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <ApiKeysContent />
        </div>
      </main>
    </div>);

}