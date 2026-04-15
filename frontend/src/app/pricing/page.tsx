import { PricingViewTracking } from '@/components/analytics/PricingViewTracking'
import { Header } from '@/components/layout/Header'
import { PricingCards } from '@/components/sections/PricingCards'
import { Footer } from '@/components/layout/Footer'


export default function PricingPage() {
  return (
    <main>
      <PricingViewTracking />
      <Header />
      <PricingCards />
      <Footer />
    </main>
  )
}
