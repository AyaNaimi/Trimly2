import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import Pricing from '@/components/pricing'
import CTA from '@/components/cta'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-16">
        <Hero />
        <Features />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </>
  )
}
