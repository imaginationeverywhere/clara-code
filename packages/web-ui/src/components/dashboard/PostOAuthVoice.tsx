'use client'

import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'clara_post_oauth_voice_done'

interface PostOAuthVoiceProps {
  /** True when Clerk user was created within the last 60 seconds */
  isFreshSession: boolean
  githubUsername?: string | null
}

export function PostOAuthVoice({ isFreshSession, githubUsername }: PostOAuthVoiceProps) {
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isFreshSession || playedRef.current) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY)) return

    playedRef.current = true
    sessionStorage.setItem(STORAGE_KEY, '1')

    void (async () => {
      try {
        const res = await fetch('/api/voice/greet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger: 'post-oauth',
            partnerType: 'unknown',
            userName: githubUsername ?? undefined,
          }),
        })
        const data = (await res.json()) as { audioUrl?: string | null; text?: string }
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl)
          void audio.play().catch(() => {})
        } else if (data.text && 'speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(data.text)
          window.speechSynthesis.speak(u)
        }
      } catch {
        /* ignore */
      }
    })()
  }, [githubUsername, isFreshSession])

  return null
}
