import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-16 text-text-secondary">
        <h1 className="mb-8 text-3xl font-semibold text-white">Privacy Policy</h1>

        <section className="space-y-4" aria-labelledby="ai-memory-heading">
          <h2 id="ai-memory-heading" className="text-xl font-semibold text-white">
            AI Memory &amp; Query Logs
          </h2>
          <p className="leading-relaxed">
            When an AI agent in this service uses our shared memory system (&apos;Clara brain&apos;) to
            retrieve context, we record the query — the natural-language question (truncated to 768
            characters), the agent that made the request, response timing, and result counts.{' '}
            Retention: we automatically delete these query logs after <strong>90 days</strong>. No query text is retained longer. What we do NOT store:
            personally identifying content beyond what the agent&apos;s query embedding includes.
            Contact{' '}
            <a href="mailto:privacy@quiknation.com" className="text-white/80 underline hover:text-white">
              privacy@quiknation.com
            </a>
            .
          </p>
        </section>
      </div>
      <Footer />
    </main>
  )
}
