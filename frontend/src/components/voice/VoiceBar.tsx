'use client'

/**
 * VoiceBar — Voice UX for Clara Code
 *
 * Controls:
 *   - Mic button: click to start/stop voice input (Web Speech API)
 *   - Enter key: mute/stop mic while recording
 *   - S key (global, unfocused): toggle Clara Radio (voice output mode)
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoiceBarProps {
  /** Called with the latest transcript as the user speaks */
  onTranscript?: (text: string) => void
  /** Called when Clara Radio mode is toggled */
  onRadioToggle?: (active: boolean) => void
  /** Optional user id forwarded to Hermes via /api/voice/chat */
  userId?: string
  /** Called with Clara's text response and optional audio URL */
  onResponse?: (text: string, audioUrl: string | null) => void
  className?: string
}

type SpeechRecCtor = new () => SpeechRecognition

// ---------------------------------------------------------------------------
// Inline SVG icons (no external dependency)
// ---------------------------------------------------------------------------

function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function MicOffIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function RadioIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// VoiceBar component
// ---------------------------------------------------------------------------

export function VoiceBar({
  onTranscript,
  onRadioToggle,
  userId,
  onResponse,
  className = '',
}: VoiceBarProps) {
  const [isMicActive, setIsMicActive] = useState(false)
  const [isRadioActive, setIsRadioActive] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef('')

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsMicActive(false)
  }, [])

  const sendToHermes = useCallback(
    async (finalTranscript: string) => {
      setIsChatLoading(true)
      try {
        const res = await fetch('/api/voice/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: finalTranscript,
            ...(userId ? { userId } : {}),
          }),
        })
        const data = (await res.json()) as {
          text?: string
          audio_url?: string | null
        }
        if (!res.ok) {
          return
        }
        const text = typeof data.text === 'string' ? data.text : ''
        const audioUrl =
          data.audio_url === undefined || data.audio_url === null ? null : String(data.audio_url)
        onTranscript?.(finalTranscript)
        onResponse?.(text, audioUrl)
        if (audioUrl) {
          const audio = new Audio(audioUrl)
          void audio.play().catch(() => {
            if (text) {
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
            }
          })
        } else if (text) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
        }
      } catch {
        onResponse?.('Clara is unavailable right now.', null)
      } finally {
        setIsChatLoading(false)
      }
    },
    [onTranscript, onResponse, userId],
  )

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecCtor }).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      console.warn('VoiceBar: Web Speech API not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? '')
        .join('')
      transcriptRef.current = text
      setLiveTranscript(text)
      onTranscript?.(text)
    }

    recognition.onerror = () => {
      stopListening()
    }

    recognition.onend = () => {
      setIsMicActive(false)
      recognitionRef.current = null
      const finalText = transcriptRef.current.trim()
      transcriptRef.current = ''
      if (finalText) {
        void sendToHermes(finalText)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsMicActive(true)
    setLiveTranscript('')
    transcriptRef.current = ''
  }, [onTranscript, stopListening, sendToHermes])

  const toggleMic = useCallback(() => {
    if (isMicActive) {
      stopListening()
    } else {
      startListening()
    }
  }, [isMicActive, startListening, stopListening])

  const toggleRadio = useCallback(() => {
    setIsRadioActive((prev) => {
      const next = !prev
      onRadioToggle?.(next)
      return next
    })
  }, [onRadioToggle])

  useEffect(() => {
    const ctor =
      typeof window !== 'undefined'
        ? (window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor })
            .SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: SpeechRecCtor }).webkitSpeechRecognition
        : undefined
    setSpeechSupported(!!ctor)
  }, [])

  // Keyboard shortcuts: Enter = mute mic, S (unfocused) = Clara Radio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter → mute while mic is active
      if (e.key === 'Enter' && isMicActive) {
        e.preventDefault()
        stopListening()
        return
      }

      // S → toggle Clara Radio when no input element is focused
      if (e.key === 's' || e.key === 'S') {
        const active = document.activeElement
        const tag = active?.tagName.toLowerCase()
        if (tag === 'input' || tag === 'textarea' || (active as HTMLElement)?.isContentEditable) {
          return
        }
        e.preventDefault()
        toggleRadio()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMicActive, stopListening, toggleRadio])

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const showMicPulse = isMicActive || isChatLoading

  return (
    <div className={`flex items-center gap-2 ${className}`} role="toolbar" aria-label="Voice controls">
      {speechSupported === false && (
        <span className="text-xs text-amber-400/90 max-w-[220px]">
          Voice input needs a supported browser (e.g. Chrome) and HTTPS.
        </span>
      )}

      {/* Mic button */}
      <button
        type="button"
        onClick={toggleMic}
        disabled={speechSupported === false || isChatLoading}
        aria-label={isMicActive ? 'Stop mic (or press Enter)' : 'Start mic'}
        aria-pressed={isMicActive}
        aria-busy={isChatLoading}
        title={isMicActive ? 'Stop mic · Press Enter to mute' : 'Start mic'}
        className={[
          'relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
          'border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          showMicPulse
            ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white',
          (speechSupported === false || isChatLoading) && 'opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        {isMicActive ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
        {/* Pulse ring while recording or awaiting Hermes */}
        {showMicPulse && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full animate-ping border border-red-500/40"
          />
        )}
      </button>

      {/* Clara Radio button */}
      <button
        type="button"
        onClick={toggleRadio}
        aria-label={isRadioActive ? 'Stop Clara Radio' : 'Start Clara Radio (press S)'}
        aria-pressed={isRadioActive}
        title={isRadioActive ? 'Stop Clara Radio' : 'Clara Radio · Press S'}
        className={[
          'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
          'border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          isRadioActive
            ? 'bg-violet-500/20 border-violet-500/60 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white',
        ].join(' ')}
      >
        <RadioIcon size={18} />
      </button>

      {/* Live transcript */}
      {isMicActive && liveTranscript && (
        <span
          aria-live="polite"
          className="text-sm text-white/50 truncate max-w-[200px]"
        >
          {liveTranscript}
        </span>
      )}

      {/* Keyboard hints */}
      {!isMicActive && !isRadioActive && (
        <span className="text-xs text-white/25 hidden sm:block">
          Press <kbd className="font-mono">S</kbd> for Radio
        </span>
      )}
    </div>
  )
}
