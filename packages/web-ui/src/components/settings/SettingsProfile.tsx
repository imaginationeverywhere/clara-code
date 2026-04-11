'use client'

import { UserProfile } from '@clerk/nextjs'

export function SettingsProfile() {
  return (
    <UserProfile routing="hash" appearance={{ variables: { colorPrimary: '#3B82F6' } }} />
  )
}
