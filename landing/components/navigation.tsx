'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useLanguage } from '@/context/language-context'
import Link from 'next/link'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const themeContext = useTheme()
  const { language, setLanguage } = useLanguage()
  
  if (!mounted) return null
  
  const { theme, toggleTheme } = themeContext

  const t = {
    en: {
      features: 'Features',
      about: 'About',
      pricing: 'Pricing',
      contact: 'Contact',
      download: 'Download App',
    },
    fr: {
      features: 'Fonctionnalités',
      about: 'À propos',
      pricing: 'Tarification',
      contact: 'Contact',
      download: 'Télécharger',
    },
    es: {
      features: 'Características',
      about: 'Acerca de',
      pricing: 'Precios',
      contact: 'Contacto',
      download: 'Descargar',
    },
    de: {
      features: 'Funktionen',
      about: 'Über uns',
      pricing: 'Preise',
      contact: 'Kontakt',
      download: 'Herunterladen',
    },
    pt: {
      features: 'Recursos',
      about: 'Sobre',
      pricing: 'Preços',
      contact: 'Contato',
      download: 'Baixar',
    },
    it: {
      features: 'Funzionalità',
      about: 'Chi siamo',
      pricing: 'Prezzi',
      contact: 'Contatti',
      download: 'Scarica',
    },
  }

  const texts = t[language as keyof typeof t] || t.en
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'it', label: 'Italiano' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg md:text-xl gradient-text">Trimly</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">
              {texts.features}
            </a>
            <a href="#about" className="text-foreground/70 hover:text-foreground transition-colors">
              {texts.about}
            </a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">
              {texts.pricing}
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-foreground transition-colors">
              {texts.contact}
            </a>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors px-3 py-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">{language.toUpperCase()}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${
                      language === lang.code ? 'text-primary font-semibold' : ''
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-card transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-4 border-t border-border pt-4">
            <a href="#features" className="block text-foreground/70 hover:text-foreground transition-colors">
              {texts.features}
            </a>
            <a href="#about" className="block text-foreground/70 hover:text-foreground transition-colors">
              {texts.about}
            </a>
            <a href="#pricing" className="block text-foreground/70 hover:text-foreground transition-colors">
              {texts.pricing}
            </a>
            <a href="#contact" className="block text-foreground/70 hover:text-foreground transition-colors">
              {texts.contact}
            </a>
            <div className="flex gap-2 pt-4 border-t border-border flex-wrap">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground/70 hover:bg-card/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
