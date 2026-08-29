'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'
import { Wallet, Search, Bell, BarChart3, Zap, Lock } from 'lucide-react'

const translations = {
  en: {
    title: 'Powerful Features',
    subtitle: 'Everything you need to master your finances',
    features: [
      {
        icon: Wallet,
        title: 'Smart Budget Tracking',
        description: 'Set budgets for categories and get real-time insights on your spending patterns.',
      },
      {
        icon: Search,
        title: 'Email Subscription Scanner',
        description: 'Automatically discover and manage subscriptions by scanning your emails.',
      },
      {
        icon: Bell,
        title: 'Smart Reminders',
        description: 'Get notified before billing dates so you never miss a payment.',
      },
      {
        icon: BarChart3,
        title: 'Detailed Reports',
        description: 'Visual analytics to understand where your money goes.',
      },
      {
        icon: Zap,
        title: 'Quick Entry',
        description: 'Log transactions in seconds with our intuitive interface.',
      },
      {
        icon: Lock,
        title: 'Bank-Level Security',
        description: 'Your financial data is encrypted and protected with industry-leading security.',
      },
    ],
  },
  fr: {
    title: 'Fonctionnalités Puissantes',
    subtitle: 'Tout ce dont vous avez besoin pour maîtriser vos finances',
    features: [
      {
        icon: Wallet,
        title: 'Suivi Intelligent du Budget',
        description: 'Définissez des budgets par catégorie et obtenez des insights en temps réel.',
      },
      {
        icon: Search,
        title: 'Détecteur d\'Abonnements',
        description: 'Découvrez automatiquement et gérez les abonnements en scannant vos e-mails.',
      },
      {
        icon: Bell,
        title: 'Rappels Intelligents',
        description: 'Recevez des notifications avant les dates de facturation.',
      },
      {
        icon: BarChart3,
        title: 'Rapports Détaillés',
        description: 'Des analyses visuelles pour comprendre où va votre argent.',
      },
      {
        icon: Zap,
        title: 'Entrée Rapide',
        description: 'Enregistrez les transactions en quelques secondes.',
      },
      {
        icon: Lock,
        title: 'Sécurité de Banque',
        description: 'Vos données financières sont chiffrées et protégées.',
      },
    ],
  },
  es: {
    title: 'Características Poderosas',
    subtitle: 'Todo lo que necesitas para dominar tus finanzas',
    features: [
      {
        icon: Wallet,
        title: 'Seguimiento Inteligente de Presupuesto',
        description: 'Establece presupuestos por categoría y obtén insights en tiempo real.',
      },
      {
        icon: Search,
        title: 'Escáner de Suscripciones',
        description: 'Descubre y gestiona suscripciones automáticamente escaneando tus correos.',
      },
      {
        icon: Bell,
        title: 'Recordatorios Inteligentes',
        description: 'Recibe notificaciones antes de las fechas de facturación.',
      },
      {
        icon: BarChart3,
        title: 'Reportes Detallados',
        description: 'Análisis visuales para entender dónde va tu dinero.',
      },
      {
        icon: Zap,
        title: 'Entrada Rápida',
        description: 'Registra transacciones en segundos.',
      },
      {
        icon: Lock,
        title: 'Seguridad de Banco',
        description: 'Tus datos financieros están encriptados y protegidos.',
      },
    ],
  },
  de: {
    title: 'Leistungsstarke Funktionen',
    subtitle: 'Alles, was Sie brauchen, um Ihre Finanzen zu beherrschen',
    features: [
      {
        icon: Wallet,
        title: 'Intelligente Budgetverfolgung',
        description: 'Legen Sie Budgets nach Kategorie fest und erhalten Sie Echtzeit-Einblicke.',
      },
      {
        icon: Search,
        title: 'Abonnement-Scanner',
        description: 'Entdecken und verwalten Sie Abonnements automatisch durch E-Mail-Scanning.',
      },
      {
        icon: Bell,
        title: 'Intelligente Erinnerungen',
        description: 'Erhalten Sie Benachrichtigungen vor den Abrechnungsdaten.',
      },
      {
        icon: BarChart3,
        title: 'Detaillierte Berichte',
        description: 'Visuelle Analysen zum Verstehen Ihrer Ausgaben.',
      },
      {
        icon: Zap,
        title: 'Schnelle Eingabe',
        description: 'Protokollieren Sie Transaktionen in Sekunden.',
      },
      {
        icon: Lock,
        title: 'Banksicherheit',
        description: 'Ihre Finanzdaten sind verschlüsselt und geschützt.',
      },
    ],
  },
  pt: {
    title: 'Recursos Poderosos',
    subtitle: 'Tudo o que você precisa para dominar suas finanças',
    features: [
      {
        icon: Wallet,
        title: 'Rastreamento Inteligente de Orçamento',
        description: 'Defina orçamentos por categoria e obtenha insights em tempo real.',
      },
      {
        icon: Search,
        title: 'Escaneador de Assinaturas',
        description: 'Descubra e gerencie assinaturas automaticamente escaneando seus e-mails.',
      },
      {
        icon: Bell,
        title: 'Lembretes Inteligentes',
        description: 'Receba notificações antes das datas de cobrança.',
      },
      {
        icon: BarChart3,
        title: 'Relatórios Detalhados',
        description: 'Análises visuais para entender onde seu dinheiro vai.',
      },
      {
        icon: Zap,
        title: 'Entrada Rápida',
        description: 'Registre transações em segundos.',
      },
      {
        icon: Lock,
        title: 'Segurança Bancária',
        description: 'Seus dados financeiros são criptografados e protegidos.',
      },
    ],
  },
  it: {
    title: 'Funzionalità Potenti',
    subtitle: 'Tutto ciò di cui hai bisogno per padroneggiare le tue finanze',
    features: [
      {
        icon: Wallet,
        title: 'Tracciamento Intelligente del Budget',
        description: 'Imposta budget per categoria e ottieni insights in tempo reale.',
      },
      {
        icon: Search,
        title: 'Scanner di Abbonamenti',
        description: 'Scopri e gestisci gli abbonamenti automaticamente scansionando i tuoi email.',
      },
      {
        icon: Bell,
        title: 'Promemoria Intelligenti',
        description: 'Ricevi notifiche prima delle date di fatturazione.',
      },
      {
        icon: BarChart3,
        title: 'Rapporti Dettagliati',
        description: 'Analisi visive per capire dove vanno i tuoi soldi.',
      },
      {
        icon: Zap,
        title: 'Inserimento Rapido',
        description: 'Registra le transazioni in secondi.',
      },
      {
        icon: Lock,
        title: 'Sicurezza Bancaria',
        description: 'I tuoi dati finanziari sono crittografati e protetti.',
      },
    ],
  },
}

export default function Features() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="section-padding bg-card/50 border-y border-border">
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

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {t.features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="card p-8 group cursor-pointer"
              >
                <div className="mb-6 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
