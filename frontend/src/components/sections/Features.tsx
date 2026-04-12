import { Mic, Terminal, Code2 } from 'lucide-react'

const items = [
  {
    icon: Mic,
    title: 'Voice',
    body: 'Speak to code. Clara listens, understands, and acts.',
  },
  {
    icon: Terminal,
    title: 'Terminal',
    body: 'CLI-native. npx install claracode@latest then clara',
  },
  {
    icon: Code2,
    title: 'IDE',
    body: 'VS Code fork with Clara baked in — voice, memory, and context.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-white/5 bg-[#09090F] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">Built for how you work</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-white/50">
          Three surfaces. One Clara. Voice, terminal, and editor stay in sync.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-clara-surface/50 p-6 shadow-card"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-clara-blue/15 text-clara-blue">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
