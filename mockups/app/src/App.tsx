import { useEffect, useState } from 'react';
import { GitBranch, Settings, File, Play } from 'lucide-react';
import { VoiceBar } from './components/VoiceBar';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { AiPanel } from './components/AiPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TerminalDemo } from './components/TerminalDemo';
import { TerminalPanel } from './components/TerminalPanel';
export function App() {
  const [activeView, setActiveView] = useState<'code' | 'settings'>('code');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setActiveView((prev) => prev === 'settings' ? 'code' : 'settings');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  if (isDemoMode) {
    return <TerminalDemo onBack={() => setIsDemoMode(false)} />;
  }
  return (
    <div className="h-screen w-screen bg-bg-base flex flex-col overflow-hidden font-sans text-text-body">
      {/* TOP BAR */}
      <div className="h-11 flex items-center border-b border-white/6 bg-bg-overlay px-4 justify-between flex-shrink-0">
        {/* Left: Wordmark */}
        <div className="flex items-center gap-2">
          <img
            src="/clara-code-logo-2d.png"
            alt="Clara Code Logo"
            className="h-6 w-6 rounded-md object-cover" />
          
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm text-white">Clara</span>
            <span className="font-mono text-sm text-blue">Code</span>
          </div>
        </div>

        {/* Center: Breadcrumb */}
        <div className="text-xs text-white/30 font-mono flex items-center gap-2">
          {activeView === 'settings' ?
          <span className="text-white/70">Clara Settings</span> :

          <>
              <span className="hover:text-white/60 cursor-pointer transition-colors">
                src
              </span>
              <span className="text-white/15">/</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">
                app
              </span>
              <span className="text-white/15">/</span>
              <span className="text-white/70">page.tsx</span>
            </>
          }
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoMode(true)}
            className="h-7 px-3 rounded-md bg-clara-blue/10 text-clara-blue hover:bg-clara-blue/20 flex items-center gap-1.5 transition-colors border border-clara-blue/20">
            
            <Play size={12} className="fill-current" />
            <span className="text-xs font-mono font-medium">CLI Demo</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button className="h-7 px-2 rounded-md hover:bg-white/6 flex items-center gap-1.5 transition-colors">
            <GitBranch size={14} className="text-white/35" />
            <span className="text-xs text-white/35 font-mono">main</span>
          </button>
          <button
            onClick={() =>
            setActiveView((prev) =>
            prev === 'settings' ? 'code' : 'settings'
            )
            }
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${activeView === 'settings' ? 'bg-white/10 text-white' : 'hover:bg-white/6 text-white/35'}`}>
            
            <Settings size={14} />
          </button>
          <div className="w-7 h-7 rounded-full bg-purple/20 text-purple text-xs font-medium flex items-center justify-center ml-1 border border-purple/30">
            AR
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — File Tree */}
        <FileTree />

        {/* CENTER PANEL — Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-bg-base">
          {/* Editor Tabs */}
          <div className="h-9 flex bg-bg-overlay border-b border-white/6 overflow-x-auto no-scrollbar flex-shrink-0">
            {/* Code Tab */}
            <div
              onClick={() => setActiveView('code')}
              className={`flex items-center gap-2 px-4 border-r border-white/6 text-xs font-mono cursor-pointer min-w-fit transition-colors
                ${activeView === 'code' ? 'bg-bg-base border-t-2 border-t-blue text-white' : 'text-white/40 hover:bg-white/5'}`}>
              
              <File
                size={14}
                className={
                activeView === 'code' ? 'text-green/70' : 'text-white/30'
                } />
              
              page.tsx
            </div>

            {/* Settings Tab (only when active) */}
            {activeView === 'settings' &&
            <div className="flex items-center gap-2 px-4 bg-bg-base border-r border-white/6 border-t-2 border-t-purple text-xs font-mono text-white min-w-fit">
                <Settings size={14} className="text-purple/70" />
                Clara Settings
                <div
                className="w-2 h-2 rounded-full bg-white/20 ml-2 hover:bg-white/40 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('code');
                }} />
              
              </div>
            }
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden flex">
            {activeView === 'settings' && <SettingsPanel />}
            {activeView === 'code' && <CodeEditor />}
          </div>

          {/* INTEGRATED TERMINAL PANEL */}
          {showTerminal &&
          <TerminalPanel onClose={() => setShowTerminal(false)} />
          }
        </div>

        {/* RIGHT PANEL — AI Assistant */}
        <AiPanel />
      </div>

      {/* BOTTOM VOICE BAR */}
      <VoiceBar />
    </div>);

}