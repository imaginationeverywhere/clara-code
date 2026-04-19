'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { VoiceBar } from '@/components/voice/VoiceBar'
import { cn } from '@/lib/utils'

const VISITED_COOKIE = 'clara_visited=1'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readVisitedCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => c.startsWith('clara_visited='))
}

function setVisitedCookie(): void {
  document.cookie = `${VISITED_COOKIE}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

interface GreetResponse {
  text: string
  audioUrl: string | null
  fallback?: boolean
}

async function postGreet(body: {
  partnerType?: 'vibe-coder' | 'developer' | 'unknown'
  trigger?: 'first-visit' | 'return-visit' | 'post-oauth' | 'demo-offer' | 'no-response'
  userName?: string
}): Promise<GreetResponse> {
  const res = await fetch('/api/voice/greet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const contentType = res.headers.get('content-type') ?? ''
  if (res.ok && (contentType.startsWith('audio/') || contentType === 'application/octet-stream')) {
    const blob = await res.blob()
    const audioUrl = URL.createObjectURL(blob)
    return { text: '', audioUrl }
  }
  try {
    const data = (await res.json()) as GreetResponse & { error?: string }
    if (!res.ok && !('text' in data && data.text)) {
      return { text: '', audioUrl: null }
    }
    return { text: data.text ?? '', audioUrl: data.audioUrl ?? null, fallback: data.fallback }
  } catch {
    return { text: '', audioUrl: null }
  }
}

export function Hero() {
  const [showSubtext, setShowSubtext] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const playAudio = useCallback((url: string | null, onEnded?: () => void) => {
    if (url) {
      const el = new Audio(url)
      audioRef.current = el
      el.onended = () => {
        setIsPlaying(false)
        onEnded?.()
      }
      el.onerror = () => {
        setIsPlaying(false)
        onEnded?.()
      }
      setIsPlaying(true)
      void el.play().catch(() => {
        setIsPlaying(false)
        onEnded?.()
      })
      return
    }
    onEnded?.()
  }, [])

  const runGreeting = useCallback(
    async (body: Parameters<typeof postGreet>[0], afterFirstVisitCookie: boolean) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      const { text, audioUrl } = await postGreet(body)
      const finish = () => {
        setShowSubtext(true)
        if (afterFirstVisitCookie) setVisitedCookie()
      }
      if (audioUrl) {
        playAudio(audioUrl, finish)
      } else if (text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setIsPlaying(true)
        const u = new SpeechSynthesisUtterance(text)
        u.onend = () => {
          setIsPlaying(false)
          finish()
        }
        u.onerror = () => {
          setIsPlaying(false)
          finish()
        }
        window.speechSynthesis.speak(u)
      } else {
        finish()
      }
    },
    [playAudio],
  )

  useEffect(() => {
    let cancelled = false
    const visited = readVisitedCookie()

    if (visited) {
      void (async () => {
        if (cancelled) return
        await runGreeting({ trigger: 'return-visit', partnerType: 'unknown' }, false)
      })()
      return () => {
        cancelled = true
      }
    }

    idleTimerRef.current = setTimeout(() => {
      if (cancelled) return
      void runGreeting({ trigger: 'first-visit', partnerType: 'unknown' }, true)
    }, 3000)

    return () => {
      cancelled = true
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [runGreeting])

  const onPathA = () => {
    void runGreeting({ trigger: 'first-visit', partnerType: 'vibe-coder' }, false)
  }

  const onPathB = () => {
    void runGreeting({ trigger: 'first-visit', partnerType: 'developer' }, false)
  }

  const onDemo = () => {
    void runGreeting({ trigger: 'demo-offer', partnerType: 'unknown' }, false)
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 pb-16 pt-12 text-center"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="sr-only">Clara Code visitor greeting</h1>
        <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          I&apos;m Clara.
        </p>
        <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          I&apos;ve never written a line of code.
        </p>
        <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Whether you&apos;ve done it before or not.
        </p>

        <p
          className={cn(
            'pt-4 text-lg text-white/60 transition-opacity duration-700 sm:text-xl',
            showSubtext ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={!showSubtext}
        >
          We speak things into existence around here.
        </p>

        <div className="flex flex-col items-center gap-4 pt-6">
          <button
            type="button"
            onClick={onDemo}
            disabled={isPlaying}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {isPlaying ? 'Clara is speaking…' : 'Hear Clara'}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onPathA}
              className="rounded-full bg-clara-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
            >
              I have an idea
            </button>
            <button
              type="button"
              onClick={onPathB}
              className="rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Show me what you can do
            </button>
          </div>

          <div className="pt-4">
            <VoiceBar />
          </div>
        </div>
      </div>
    </section>
  )
}
