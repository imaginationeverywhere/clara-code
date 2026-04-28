import { useEffect, useState, useRef } from 'react';
import { Mic, Keyboard, ArrowRight } from 'lucide-react';
export function VoiceBar() {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript] = useState(
    'Create a new React component for the header...'
  );
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Handle Escape key to return to voice mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVoiceMode && e.key === 'Escape') {
        setIsVoiceMode(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceMode]);
  // Focus input when switching to text mode
  useEffect(() => {
    if (!isVoiceMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVoiceMode]);
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Handle submit logic here
      setInputText('');
    }
  };
  return (
    <div className="h-20 border-t border-white/6 bg-bg-overlay flex items-center px-6 gap-4 flex-shrink-0">
      {isVoiceMode ?
      <>
          {/* Left side: Status & Transcript */}
          <div className="flex-1 flex items-center gap-3">
            {isListening ?
          <div className="flex items-end gap-[2px] h-6 px-2">
                {[...Array(12)].map((_, i) =>
            <div
              key={i}
              className="w-1 rounded-full bg-purple animate-waveform"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '4px' // Base height, animated via CSS
              }} />

            )}
              </div> :

          <div className="text-xs text-white/25">Ready to listen</div>
          }

            {isListening &&
          <div className="text-sm text-white/70 font-mono max-w-sm truncate">
                {transcript}
              </div>
          }
          </div>

          {/* Center: Hero Mic Button */}
          <div className="relative flex flex-col items-center justify-center">
            <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out z-10
                ${isListening ? 'bg-purple text-white shadow-[0_0_24px_rgba(124,58,237,0.6)] scale-110' : 'bg-purple/15 border border-purple/30 text-purple hover:bg-purple/25'}`}>
            
              <Mic size={22} className={isListening ? 'animate-pulse' : ''} />
            </button>
            <div className="absolute -bottom-4 text-[10px] text-white/20 tracking-wide whitespace-nowrap">
              {isListening ? 'RELEASE TO SEND' : 'HOLD TO SPEAK'}
            </div>
          </div>

          {/* Right side: Timer & Text Toggle */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {isListening &&
          <div className="text-xs text-white/30 font-mono">0:04</div>
          }
            <button
            onClick={() => setIsVoiceMode(false)}
            className="w-7 h-7 rounded-md border border-white/10 hover:border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 transition-all duration-200 ease-in-out group relative"
            title="Switch to text">
            
              <Keyboard size={14} />
              <div className="absolute -top-8 bg-bg-raised border border-white/10 text-xs text-white/70 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Switch to text
              </div>
            </button>
          </div>
        </> :

      <>
          {/* TEXT MODE */}
          <button
          onClick={() => setIsVoiceMode(true)}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-purple hover:border-purple/30 flex items-center justify-center transition-all duration-200 ease-in-out flex-shrink-0"
          title="Switch to voice">
          
            <Mic size={16} />
          </button>

          <form
          onSubmit={handleTextSubmit}
          className="flex-1 flex items-center gap-2">
          
            <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message... (or press Esc for voice)"
            className="flex-1 bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:border-purple/40 focus:outline-none focus:ring-1 focus:ring-purple/20 font-mono transition-all duration-200" />
          
            <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-purple disabled:bg-purple/30 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out flex-shrink-0">
            
              <ArrowRight size={14} className="text-white" />
            </button>
          </form>

          <button
          onClick={() => setIsVoiceMode(true)}
          className="w-7 h-7 rounded-md border border-white/10 hover:border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 transition-all duration-200 ease-in-out group relative flex-shrink-0">
          
            <Mic size={14} />
            <div className="absolute -top-8 bg-bg-raised border border-white/10 text-xs text-white/70 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Switch to voice
            </div>
          </button>
        </>
      }
    </div>);

}