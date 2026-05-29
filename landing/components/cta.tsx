export default function CTA() {
  return (
    <section className="section bg-gray-900 text-white" style={{ backgroundColor: 'hsl(var(--foreground))' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to take control?</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of users saving thousands of dollars annually. Start your free trial today—no credit card required.
        </p>
        <button className="btn" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
          Get Started Free
        </button>
        <p className="text-sm opacity-75 mt-6">
          No credit card needed. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
