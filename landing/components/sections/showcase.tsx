'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'

const translations = {
  en: {
    title: 'See Trimly in Action',
    subtitle: 'Beautiful, intuitive interface designed for everyone',
    mockups: [
      { label: 'Dashboard', color: 'from-primary' },
      { label: 'Subscriptions', color: 'from-secondary' },
      { label: 'Analytics', color: 'from-accent' },
    ],
  },
  fr: {
    title: 'Voir Trimly en Action',
    subtitle: 'Interface belle et intuitive conçue pour tout le monde',
    mockups: [
      { label: 'Tableau de Bord', color: 'from-primary' },
      { label: 'Abonnements', color: 'from-secondary' },
      { label: 'Analyses', color: 'from-accent' },
    ],
  },
  es: {
    title: 'Ve Trimly en Acción',
    subtitle: 'Interfaz hermosa e intuitiva diseñada para todos',
    mockups: [
      { label: 'Panel de Control', color: 'from-primary' },
      { label: 'Suscripciones', color: 'from-secondary' },
      { label: 'Análisis', color: 'from-accent' },
    ],
  },
  de: {
    title: 'Trimly in Aktion Sehen',
    subtitle: 'Schöne und intuitive Benutzeroberfläche für alle',
    mockups: [
      { label: 'Dashboard', color: 'from-primary' },
      { label: 'Abonnements', color: 'from-secondary' },
      { label: 'Analysen', color: 'from-accent' },
    ],
  },
  pt: {
    title: 'Veja Trimly em Ação',
    subtitle: 'Interface bonita e intuitiva projetada para todos',
    mockups: [
      { label: 'Painel de Controle', color: 'from-primary' },
      { label: 'Assinaturas', color: 'from-secondary' },
      { label: 'Análises', color: 'from-accent' },
    ],
  },
  it: {
    title: 'Vedi Trimly in Azione',
    subtitle: 'Interfaccia bella e intuitiva progettata per tutti',
    mockups: [
      { label: 'Pannello di Controllo', color: 'from-primary' },
      { label: 'Abbonamenti', color: 'from-secondary' },
      { label: 'Analisi', color: 'from-accent' },
    ],
  },
}

export default function Showcase() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t.title}</h2>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">{t.subtitle}</p>
        </motion.div>

        {/* Mockups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {t.mockups.map((mockup, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className={`bg-gradient-to-br ${mockup.color} to-transparent rounded-3xl border border-foreground/10 p-1 overflow-hidden`}>
                <div className="bg-card rounded-3xl p-8 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Animated elements inside mockup */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute top-4 left-4 w-12 h-12 bg-primary/20 rounded-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute bottom-4 right-4 w-16 h-16 bg-accent/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="relative z-10 text-center">
                    <div className="text-5xl font-bold gradient-text mb-4">
                      {idx === 0 ? '$' : '∞'}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{mockup.label}</h3>
                    <p className="text-sm text-foreground/60">
                      {idx === 0 ? 'Track your budget' : idx === 1 ? 'Manage subscriptions' : 'View insights'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature showcase card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="card p-8 md:p-12 border-2 border-primary/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold mb-4">Email Scanner Integration</h3>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  Trimly automatically scans your emails to detect subscriptions you might have forgotten about. Never miss a charge again and discover opportunities to save.
                </p>
                <ul className="space-y-3">
                  {['Auto-detect subscriptions', 'Get spending insights', 'Cancel with recommendations'].map((item, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right side - Visual */}
            <motion.div
              className="relative h-96"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
              <div className="relative bg-card rounded-2xl border border-border p-6 h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="h-3 bg-foreground/10 rounded-full w-3/4" />
                  <div className="h-3 bg-foreground/10 rounded-full w-1/2" />
                  <div className="mt-6 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="h-12 bg-primary/10 rounded-lg"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
