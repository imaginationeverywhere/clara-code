'use client'

import { useCallback, useState } from 'react'

type VoiceButtonProps = {
  className?: string
}

export function VoiceButton({ className = '' }: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playGreeting = useCallback(async () => {
    if (isPlaying) return
    setError(null)
    setIsPlaying(true)
    let objectUrl: string | null = null
    try {
      const response = await fetch('/api/voice/greet')
      if (!response.ok) {
        throw new Error(`Voice unavailable (${response.status})`)
      }
      const blob = await response.blob()
      objectUrl = URL.createObjectURL(blob)
      const audio = new Audio(objectUrl)
      audio.onended = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        setIsPlaying(false)
      }
      audio.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        setIsPlaying(false)
        setError('Playback failed')
      }
      await audio.play()
    } catch (e) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setIsPlaying(false)
      setError(e instanceof Error ? e.message : 'Could not play voice demo')
    }
  }, [isPlaying])

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void playGreeting()}
        disabled={isPlaying}
        className="inline-flex items-center gap-2 rounded-full bg-clara px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-clara/25 transition hover:bg-clara/90 disabled:cursor-wait disabled:opacity-80"
        aria-label={isPlaying ? 'Playing voice demo' : 'Play voice demo'}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {isPlaying ? (
            <span className="inline-flex h-5 w-5 items-end justify-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-sm bg-white waveform-bar"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          )}
        </span>
        {isPlaying ? 'Playing…' : 'Hear Clara'}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
