export const dynamic = 'force-dynamic'
import { SignUp } from '@clerk/nextjs'


export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090F]">
      <SignUp
        appearance={{
          variables: { colorPrimary: '#3B82F6', colorBackground: '#111' },
        }}
      />
    </main>
  )
}
