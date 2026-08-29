'use client'

import { Mail, Zap, DollarSign, Bell, BarChart3, Lock } from 'lucide-react'

const features = [
  {
    icon: Mail,
    title: 'Email-Powered Discovery',
    description: 'Trimly scans your emails to automatically find every subscription and recurring charge you&apos;re paying for.'
  },
  {
    icon: Zap,
    title: 'One-Click Cancellation',
    description: 'Found a service you don&apos;t need? Cancel directly from the app—no more contacting support or searching for unsubscribe links.'
  },
  {
    icon: DollarSign,
    title: 'Save Thousands Annually',
    description: 'See exactly how much you&apos;re spending on subscriptions and reclaim hundreds every month with smart recommendations.'
  },
  {
    icon: Bell,
    title: 'Smart Renewal Alerts',
    description: 'Get notified before any charge hits your account. Review, approve, or cancel with zero hassle.'
  },
  {
    icon: BarChart3,
    title: 'Spending Insights',
    description: 'Understand your subscription patterns with beautiful analytics. See what&apos;s costing you the most.'
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: 'Your data is protected with enterprise encryption. We never store your password or payment methods.'
  }
]

export default function Features() {
  return (
    <section id="features" className="section bg-gray-50" style={{ backgroundColor: 'hsl(var(--card-bg))' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to take control of your subscriptions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg accent mb-4 flex items-center justify-center text-white"
                     style={{ backgroundColor: 'hsl(var(--accent))' }}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
