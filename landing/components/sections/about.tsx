'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'
import { Sparkles, Users, Target, Heart } from 'lucide-react'

const translations = {
  en: {
    title: 'About Trimly',
    subtitle: 'Built for people who care about their finances',
    description: 'Trimly is designed to make financial management simple, beautiful, and empowering. We believe that everyone deserves control over their money.',
    values: [
      {
        icon: Sparkles,
        title: 'Simplicity',
        description: 'Financial management shouldn\'t be complicated',
      },
      {
        icon: Users,
        title: 'Inclusive',
        description: 'Available in 6 languages for global users',
      },
      {
        icon: Target,
        title: 'Focused',
        description: 'We do one thing, and we do it exceptionally well',
      },
      {
        icon: Heart,
        title: 'Trusted',
        description: 'Your financial data is sacred to us',
      },
    ],
  },
  fr: {
    title: 'À Propos de Trimly',
    subtitle: 'Conçu pour les personnes qui se soucient de leurs finances',
    description: 'Trimly est conçu pour rendre la gestion financière simple, belle et autonomisante. Nous croyons que tout le monde mérite de contrôler son argent.',
    values: [
      {
        icon: Sparkles,
        title: 'Simplicité',
        description: 'La gestion financière ne devrait pas être compliquée',
      },
      {
        icon: Users,
        title: 'Inclusif',
        description: 'Disponible en 6 langues pour les utilisateurs mondiaux',
      },
      {
        icon: Target,
        title: 'Ciblé',
        description: 'Nous faisons une chose, et nous la faisons exceptionnellement bien',
      },
      {
        icon: Heart,
        title: 'Fiable',
        description: 'Vos données financières nous sont sacrées',
      },
    ],
  },
  es: {
    title: 'Acerca de Trimly',
    subtitle: 'Diseñado para personas que se preocupan por sus finanzas',
    description: 'Trimly está diseñado para hacer la gestión financiera simple, hermosa y empoderadora. Creemos que todos merecen control sobre su dinero.',
    values: [
      {
        icon: Sparkles,
        title: 'Simplicidad',
        description: 'La gestión financiera no debería ser complicada',
      },
      {
        icon: Users,
        title: 'Inclusivo',
        description: 'Disponible en 6 idiomas para usuarios globales',
      },
      {
        icon: Target,
        title: 'Enfocado',
        description: 'Hacemos una cosa, y la hacemos excepcionalmente bien',
      },
      {
        icon: Heart,
        title: 'Confiable',
        description: 'Tus datos financieros nos son sagrados',
      },
    ],
  },
  de: {
    title: 'Über Trimly',
    subtitle: 'Entworfen für Menschen, die sich um ihre Finanzen kümmern',
    description: 'Trimly ist so gestaltet, dass die Finanzverwaltung einfach, schön und ermächtigend ist. Wir glauben, dass jeder die Kontrolle über sein Geld verdient.',
    values: [
      {
        icon: Sparkles,
        title: 'Einfachheit',
        description: 'Finanzverwaltung sollte nicht kompliziert sein',
      },
      {
        icon: Users,
        title: 'Inklusiv',
        description: 'In 6 Sprachen für globale Benutzer verfügbar',
      },
      {
        icon: Target,
        title: 'Fokussiert',
        description: 'Wir machen eine Sache und machen sie außergewöhnlich gut',
      },
      {
        icon: Heart,
        title: 'Vertrauenswürdig',
        description: 'Ihre Finanzdaten sind uns heilig',
      },
    ],
  },
  pt: {
    title: 'Sobre Trimly',
    subtitle: 'Construído para pessoas que se importam com suas finanças',
    description: 'Trimly é projetado para tornar a gestão financeira simples, bonita e capacitadora. Acreditamos que todos merecem controle sobre seu dinheiro.',
    values: [
      {
        icon: Sparkles,
        title: 'Simplicidade',
        description: 'A gestão financeira não deve ser complicada',
      },
      {
        icon: Users,
        title: 'Inclusivo',
        description: 'Disponível em 6 idiomas para usuários globais',
      },
      {
        icon: Target,
        title: 'Focado',
        description: 'Fazemos uma coisa e fazemos excepcionalmente bem',
      },
      {
        icon: Heart,
        title: 'Confiável',
        description: 'Seus dados financeiros nos são sagrados',
      },
    ],
  },
  it: {
    title: 'Su Trimly',
    subtitle: 'Costruito per persone che si preoccupano delle loro finanze',
    description: 'Trimly è progettato per rendere la gestione finanziaria semplice, bella e consapevole. Crediamo che ognuno meriti il ​​controllo dei propri soldi.',
    values: [
      {
        icon: Sparkles,
        title: 'Semplicità',
        description: 'La gestione finanziaria non dovrebbe essere complicata',
      },
      {
        icon: Users,
        title: 'Inclusivo',
        description: 'Disponibile in 6 lingue per utenti globali',
      },
      {
        icon: Target,
        title: 'Focalizzato',
        description: 'Facciamo una cosa e la facciamo eccezionalmente bene',
      },
      {
        icon: Heart,
        title: 'Affidabile',
        description: 'I tuoi dati finanziari ci sono sacri',
      },
    ],
  },
}

export default function About() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <section id="about" className="section-padding bg-card/30 border-y border-border">
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
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-6">{t.subtitle}</p>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">{t.description}</p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.values.map((value, idx) => {
            const Icon = value.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="card p-6 text-center cursor-pointer group"
              >
                <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-foreground/60">{value.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats section */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {[
            { number: '6', label: 'Languages', suffix: '' },
            { number: '1', label: 'Platform', suffix: '+' },
            { number: '24/7', label: 'Support', suffix: '' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="card p-8 text-center"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl font-bold gradient-text mb-2">
                {stat.number}
                {stat.suffix}
              </div>
              <p className="text-foreground/60">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
