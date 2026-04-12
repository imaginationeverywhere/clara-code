import { Footer } from '@/components/marketing/Footer'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { Header } from '@/components/marketing/Header'
import { HeroSection } from '@/components/marketing/HeroSection'
import { InstallSection } from '@/components/marketing/InstallSection'
import { PricingSection } from '@/components/marketing/PricingSection'

export const runtime = 'edge'

export default function Home() {
	return (
		<main className="min-h-screen bg-[#0D1117] text-white selection:bg-[#7C3AED]/30 selection:text-white">
			<Header />
			<HeroSection />
			<FeaturesSection />
			<InstallSection />
			<PricingSection />
			<Footer />
		</main>
	)
}
