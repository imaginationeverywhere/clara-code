'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setUser, clearUser } from '@/lib/store/authSlice'
import { useAppDispatch } from '@/lib/store/hooks'
import type { PlanType } from '@/lib/apollo/operations'

function mapPlan(plan: string | undefined): PlanType {
  if (plan === 'PRO' || plan === 'BUSINESS' || plan === 'FREE') return plan
  return 'FREE'
}

export function ClerkTokenSync() {
  const { getToken, isSignedIn } = useAuth()
  const { user, isLoaded } = useUser()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      if (!isLoaded) return
      if (!isSignedIn || !user) {
        if (typeof window !== 'undefined') {
          window.__clerk_token = ''
        }
        dispatch(clearUser())
        return
      }

      const token = await getToken().catch(() => null)
      if (cancelled) return
      if (typeof window !== 'undefined') {
        window.__clerk_token = token ?? ''
      }

      const primary = user.primaryEmailAddress?.emailAddress ?? ''
      const plan = mapPlan(user.publicMetadata?.plan as string | undefined)
      dispatch(
        setUser({
          userId: user.id,
          email: primary,
          plan,
        }),
      )
    }

    void sync()
    return () => {
      cancelled = true
    }
  }, [dispatch, getToken, isLoaded, isSignedIn, user])

  return null
}
