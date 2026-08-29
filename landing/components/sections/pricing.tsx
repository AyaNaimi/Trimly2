'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const translations = {
  en: {
    title: 'Simple, Transparent Pricing',
    subtitle: 'No hidden fees. Cancel anytime.',
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: '/forever',
        description: 'Get started with the essentials',
        features: [
          'Budget tracking',
          'Transaction management',
          'Basic reports',
          'Up to 3 categories',
        ],
        cta: 'Get Started',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/month',
        description: 'Unlock powerful features',
        features: [
          'Everything in Free',
          'Unlimited categories',
          'Email subscription scanner',
          'Advanced analytics',
          'Smart reminders',
          'Priority support',
        ],
        cta: 'Start Free Trial',
        highlighted: true,
      },
      {
        name: 'Family',
        price: '$9.99',
        period: '/month',
        description: 'Perfect for households',
        features: [
          'Everything in Pro',
          'Up to 5 family members',
          'Shared budgets',
          'Family analytics',
          'Admin controls',
          'Bulk discounts',
        ],
        cta: 'Start Free Trial',
        highlighted: false,
      },
    ],
  },
  fr: {
    title: 'Tarification Simple et Transparente',
    subtitle: 'Aucun frais caché. Annulez à tout moment.',
    plans: [
      {
        name: 'Gratuit',
        price: '$0',
        period: '/toujours',
        description: 'Commencez par l\'essentiel',
        features: [
          'Suivi du budget',
          'Gestion des transactions',
          'Rapports de base',
          'Jusqu\'à 3 catégories',
        ],
        cta: 'Commencer',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/mois',
        description: 'Débloquez des fonctionnalités puissantes',
        features: [
          'Tout dans Gratuit',
          'Catégories illimitées',
          'Détecteur d\'abonnements',
          'Analyses avancées',
          'Rappels intelligents',
          'Support prioritaire',
        ],
        cta: 'Essai Gratuit',
        highlighted: true,
      },
      {
        name: 'Famille',
        price: '$9.99',
        period: '/mois',
        description: 'Parfait pour les ménages',
        features: [
          'Tout dans Pro',
          'Jusqu\'à 5 membres',
          'Budgets partagés',
          'Analyses familiales',
          'Contrôles d\'administration',
          'Réductions en masse',
        ],
        cta: 'Essai Gratuit',
        highlighted: false,
      },
    ],
  },
  es: {
    title: 'Precios Simples y Transparentes',
    subtitle: 'Sin cargos ocultos. Cancela en cualquier momento.',
    plans: [
      {
        name: 'Gratis',
        price: '$0',
        period: '/siempre',
        description: 'Comienza con lo esencial',
        features: [
          'Seguimiento de presupuesto',
          'Gestión de transacciones',
          'Informes básicos',
          'Hasta 3 categorías',
        ],
        cta: 'Comenzar',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/mes',
        description: 'Desbloquea características poderosas',
        features: [
          'Todo en Gratis',
          'Categorías ilimitadas',
          'Escáner de suscripciones',
          'Análisis avanzados',
          'Recordatorios inteligentes',
          'Soporte prioritario',
        ],
        cta: 'Prueba Gratis',
        highlighted: true,
      },
      {
        name: 'Familia',
        price: '$9.99',
        period: '/mes',
        description: 'Perfecto para hogares',
        features: [
          'Todo en Pro',
          'Hasta 5 miembros',
          'Presupuestos compartidos',
          'Análisis familiar',
          'Controles administrativos',
          'Descuentos masivos',
        ],
        cta: 'Prueba Gratis',
        highlighted: false,
      },
    ],
  },
  de: {
    title: 'Einfache und Transparente Preise',
    subtitle: 'Keine versteckten Gebühren. Jederzeit kündbar.',
    plans: [
      {
        name: 'Kostenlos',
        price: '$0',
        period: '/immer',
        description: 'Beginnen Sie mit dem Wesentlichen',
        features: [
          'Budget-Verfolgung',
          'Transaktionsverwaltung',
          'Grundlegende Berichte',
          'Bis zu 3 Kategorien',
        ],
        cta: 'Jetzt Starten',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/Monat',
        description: 'Schalten Sie leistungsstarke Funktionen frei',
        features: [
          'Alles im kostenlosen Plan',
          'Unbegrenzte Kategorien',
          'Abonnement-Scanner',
          'Erweiterte Analysen',
          'Intelligente Erinnerungen',
          'Prioritäts-Support',
        ],
        cta: 'Kostenlose Testversion',
        highlighted: true,
      },
      {
        name: 'Familie',
        price: '$9.99',
        period: '/Monat',
        description: 'Perfekt für Haushalte',
        features: [
          'Alles im Pro-Plan',
          'Bis zu 5 Familienmitglieder',
          'Gemeinsame Budgets',
          'Familienanalysen',
          'Admin-Kontrollen',
          'Mengenrabatte',
        ],
        cta: 'Kostenlose Testversion',
        highlighted: false,
      },
    ],
  },
  pt: {
    title: 'Preços Simples e Transparentes',
    subtitle: 'Sem taxas ocultas. Cancele a qualquer momento.',
    plans: [
      {
        name: 'Gratuito',
        price: '$0',
        period: '/sempre',
        description: 'Comece com o essencial',
        features: [
          'Rastreamento de orçamento',
          'Gerenciamento de transações',
          'Relatórios básicos',
          'Até 3 categorias',
        ],
        cta: 'Começar',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/mês',
        description: 'Desbloqueie recursos poderosos',
        features: [
          'Tudo em Gratuito',
          'Categorias ilimitadas',
          'Escaneador de assinaturas',
          'Análises avançadas',
          'Lembretes inteligentes',
          'Suporte prioritário',
        ],
        cta: 'Teste Grátis',
        highlighted: true,
      },
      {
        name: 'Família',
        price: '$9.99',
        period: '/mês',
        description: 'Perfeito para famílias',
        features: [
          'Tudo em Pro',
          'Até 5 membros',
          'Orçamentos compartilhados',
          'Análises familiares',
          'Controles administrativos',
          'Descontos em massa',
        ],
        cta: 'Teste Grátis',
        highlighted: false,
      },
    ],
  },
  it: {
    title: 'Prezzi Semplici e Trasparenti',
    subtitle: 'Nessuna tariffa nascosta. Annulla in qualsiasi momento.',
    plans: [
      {
        name: 'Gratuito',
        price: '$0',
        period: '/sempre',
        description: 'Inizia con l\'essenziale',
        features: [
          'Tracciamento del budget',
          'Gestione delle transazioni',
          'Rapporti di base',
          'Fino a 3 categorie',
        ],
        cta: 'Inizia',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: '$4.99',
        period: '/mese',
        description: 'Sblocca funzioni potenti',
        features: [
          'Tutto in Gratuito',
          'Categorie illimitate',
          'Scanner di abbonamenti',
          'Analisi avanzate',
          'Promemoria intelligenti',
          'Supporto prioritario',
        ],
        cta: 'Prova Gratuita',
        highlighted: true,
      },
      {
        name: 'Famiglia',
        price: '$9.99',
        period: '/mese',
        description: 'Perfetto per le famiglie',
        features: [
          'Tutto in Pro',
          'Fino a 5 membri',
          'Bilanci condivisi',
          'Analisi familiari',
          'Controlli amministrativi',
          'Sconti di massa',
        ],
        cta: 'Prova Gratuita',
        highlighted: false,
      },
    ],
  },
}

export default function Pricing() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <section id="pricing" className="section-padding">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {t.plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`card p-8 relative flex flex-col ${
                plan.highlighted ? 'ring-2 ring-primary scale-105 md:scale-100' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-foreground/60 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-foreground/60">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 mb-8 space-y-3">
                {plan.features.map((feature, fidx) => (
                  <motion.div
                    key={fidx}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + fidx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ hint */}
        <motion.p
          className="text-center text-foreground/60 mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          All plans come with a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
