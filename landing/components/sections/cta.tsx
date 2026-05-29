'use client'

import { useLanguage } from '@/context/language-context'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'

const translations = {
  en: {
    title: 'Ready to Take Control?',
    subtitle: 'Join thousands of people who are mastering their finances with Trimly.',
    cta: 'Download Now',
    newsletter: 'Get updates',
    placeholder: 'Enter your email',
  },
  fr: {
    title: 'Prêt à Prendre le Contrôle?',
    subtitle: 'Rejoignez des milliers de personnes qui maîtrisent leurs finances avec Trimly.',
    cta: 'Télécharger',
    newsletter: 'Recevez les mises à jour',
    placeholder: 'Entrez votre e-mail',
  },
  es: {
    title: '¿Listo para Tomar el Control?',
    subtitle: 'Únete a miles de personas que dominan sus finanzas con Trimly.',
    cta: 'Descargar Ahora',
    newsletter: 'Obtener actualizaciones',
    placeholder: 'Ingresa tu correo electrónico',
  },
  de: {
    title: 'Bereit die Kontrolle zu Übernehmen?',
    subtitle: 'Schließen Sie sich Tausenden von Menschen an, die ihre Finanzen mit Trimly beherrschen.',
    cta: 'Jetzt Herunterladen',
    newsletter: 'Updates erhalten',
    placeholder: 'Geben Sie Ihre E-Mail ein',
  },
  pt: {
    title: 'Pronto para Tomar o Controle?',
    subtitle: 'Junte-se a milhares de pessoas que estão dominando suas finanças com Trimly.',
    cta: 'Baixar Agora',
    newsletter: 'Obter atualizações',
    placeholder: 'Digite seu e-mail',
  },
  it: {
    title: 'Pronto a Prendere il Controllo?',
    subtitle: 'Unisciti a migliaia di persone che stanno padroneggiando le loro finanze con Trimly.',
    cta: 'Scarica Ora',
    newsletter: 'Ricevi gli aggiornamenti',
    placeholder: 'Inserisci la tua email',
  },
}

export default function CTA() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <section id="contact" className="section-padding bg-gradient-to-br from-primary/10 to-accent/10 border-t border-border">
      <div className="max-w-4xl mx-auto">
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.7, 0.5, 0.7] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t.title}</h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          {/* Main CTA */}
          <motion.div
            className="mb-12"
            whileHover={{ scale: 1.05 }}
          >
            <button className="btn-primary inline-flex items-center gap-2 text-lg">
              {t.cta}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Newsletter signup */}
          <motion.div
            className="card p-8 border-2 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">{t.newsletter}</h3>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="email"
                  placeholder={t.placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {['🔒 Secure & Private', '⭐ Rated 4.8/5', '🌍 200+ Countries'].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-foreground/70">
                <span className="text-xl">{badge.split(' ')[0]}</span>
                <span>{badge.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
