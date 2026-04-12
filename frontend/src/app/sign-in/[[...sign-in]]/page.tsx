import { SignIn } from '@clerk/nextjs'

export const runtime = 'edge'

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090F]">
      <SignIn
        appearance={{
          variables: { colorPrimary: '#3B82F6', colorBackground: '#111' },
        }}
      />
    </main>
  )
}
