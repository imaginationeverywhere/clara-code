import { CliDemo } from './(marketing)/components/CliDemo'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F0F0F]">
      <section id="hero" className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white md:text-6xl">Code with your voice.</h1>
          <p className="mt-4 text-white/60">Clara Code — CLI, IDE, and web</p>
        </div>
        <CliDemo />
      </section>
    </main>
  )
}
