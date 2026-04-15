export const dynamic = 'force-dynamic'
import { SignIn } from '@clerk/nextjs'


export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-terminal">
      <SignIn
        appearance={{
          variables: { colorPrimary: '#3B82F6', colorBackground: '#111' },
        }}
      />
    </main>
  )
}
