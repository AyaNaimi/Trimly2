'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="pt-32 pb-20 section">
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Take control of<br/>
            <span className="accent">every subscription</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
            Stop paying for services you forgot about. Trimly automatically discovers, tracks, and helps you cancel unused subscriptions&mdash;all through email scanning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button className="btn btn-primary flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary">Watch Demo</button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-8 items-center text-sm text-gray-600">
            <div>
              <div className="font-semibold text-black" style={{ color: 'hsl(var(--foreground))' }}>$2,400/year</div>
              <div>average savings per user</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <div className="font-semibold text-black" style={{ color: 'hsl(var(--foreground))' }}>50K+</div>
              <div>subscriptions tracked</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <div className="font-semibold text-black" style={{ color: 'hsl(var(--foreground))' }}>Enterprise</div>
              <div>security standard</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
