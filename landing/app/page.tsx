import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import About from '@/components/sections/about'
import Showcase from '@/components/sections/showcase'
import Pricing from '@/components/sections/pricing'
import CTA from '@/components/sections/cta'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Features />
      <Showcase />
      <About />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
