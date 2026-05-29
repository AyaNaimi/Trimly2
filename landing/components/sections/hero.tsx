'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'
import { ChevronRight, Download, Play } from 'lucide-react'

const translations = {
  en: {
    title: 'Budget Smart, Live Better',
    subtitle: 'Take control of your finances with intelligent budget tracking, subscription discovery, and spending insights in one beautiful app.',
    cta: 'Download Now',
    watch: 'Watch Demo',
  },
  fr: {
    title: 'Budgétisez Intelligemment, Vivez Mieux',
    subtitle: 'Contrôlez vos finances avec un suivi budgétaire intelligent, une détection d\'abonnements et des analyses de dépenses.',
    cta: 'Télécharger',
    watch: 'Voir la démo',
  },
  es: {
    title: 'Presupuesta Inteligentemente, Vive Mejor',
    subtitle: 'Controla tus finanzas con seguimiento inteligente de presupuesto, descubrimiento de suscripciones e insights de gastos.',
    cta: 'Descargar Ahora',
    watch: 'Ver Demo',
  },
  de: {
    title: 'Intelligent Budgetieren, Besser Leben',
    subtitle: 'Kontrollieren Sie Ihre Finanzen mit intelligentem Budget-Tracking, Abonnemententdeckung und Ausgabenanalysen.',
    cta: 'Jetzt Herunterladen',
    watch: 'Demo ansehen',
  },
  pt: {
    title: 'Orçamente Inteligentemente, Viva Melhor',
    subtitle: 'Controle suas finanças com rastreamento inteligente de orçamento, descoberta de assinaturas e análises de gastos.',
    cta: 'Baixar Agora',
    watch: 'Assistir Demo',
  },
  it: {
    title: 'Bilancia in Modo Intelligente, Vivi Meglio',
    subtitle: 'Controlla le tue finanze con tracciamento intelligente del budget, scoperta di abbonamenti e analisi delle spese.',
    cta: 'Scarica Ora',
    watch: 'Guarda Demo',
  },
}

export default function Hero() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
            ✨ Now Available on iOS & Android
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight"
        >
          {t.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {t.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button className="btn-primary flex items-center gap-2 group">
            <Download className="w-5 h-5" />
            {t.cta}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Play className="w-5 h-5" />
            {t.watch}
          </button>
        </motion.div>

        {/* Hero Image/Preview */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="relative mx-auto max-w-2xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl border border-primary/20 p-8 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-32 bg-primary/20 rounded-2xl animate-pulse" />
                <div className="h-32 bg-secondary/20 rounded-2xl animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-32 bg-accent/20 rounded-2xl animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-foreground/10 rounded-full w-3/4" />
                <div className="h-4 bg-foreground/10 rounded-full w-1/2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          variants={itemVariants}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { number: '50K+', label: 'Active Users' },
            { number: '$1M+', label: 'Money Saved' },
            { number: '6', label: 'Languages' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="card p-6"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <p className="text-foreground/60 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
