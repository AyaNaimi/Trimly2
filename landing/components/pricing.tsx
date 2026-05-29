'use client'

import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for individuals',
    features: [
      'Email subscription scanning',
      'Up to 50 subscriptions tracked',
      'Basic analytics',
      'Mobile app access',
      'Standard support'
    ],
    cta: 'Start Free'
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious savers',
    features: [
      'Everything in Starter',
      'Unlimited subscriptions',
      'Advanced analytics & insights',
      'Smart renewal alerts',
      'One-click cancellations',
      'Priority support',
      'Multi-account support'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Family',
    price: '$14.99',
    period: '/month',
    description: 'Manage the whole family',
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Shared spending dashboard',
      'Family approval workflows',
      'Group analytics',
      'Dedicated account manager'
    ],
    cta: 'Start Family Trial'
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card transition-all duration-300 flex flex-col ${
                plan.popular ? 'ring-2 ring-green-500 transform scale-105' : ''
              }`}
              style={plan.popular ? { borderColor: 'hsl(var(--accent))' } : {}}
            >
              {plan.popular && (
                <div className="text-sm font-semibold text-green-600 mb-4" style={{ color: 'hsl(var(--accent))' }}>
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-600">{plan.period}</span>}
              </div>

              <button className={`btn w-full mb-8 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </button>

              <div className="space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={20} className="accent flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--accent))' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
