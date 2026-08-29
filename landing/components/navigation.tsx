'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun, Globe } from 'lucide-react'
import Link from 'next/link'

// Navigation content component that uses context
function NavigationContent() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedLang = localStorage.getItem('language') || 'en'
    setTheme(savedTheme)
    setLanguage(savedLang)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', newTheme)
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

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
      features: 'Caratteristiche',
      about: 'Chi Siamo',
      pricing: 'Prezzi',
      contact: 'Contattaci',
      download: 'Scarica',
    },
  }

  const languages = ['en', 'fr', 'es', 'de', 'pt', 'it']
  const currentLabels = t[language as keyof typeof t] || t.en

  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl gradient-text">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">T</div>
            Trimly
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-primary transition-colors text-sm font-medium">
              {currentLabels.features}
            </a>
            <a href="#about" className="hover:text-primary transition-colors text-sm font-medium">
              {currentLabels.about}
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors text-sm font-medium">
              {currentLabels.pricing}
            </a>
            <a href="#contact" className="hover:text-primary transition-colors text-sm font-medium">
              {currentLabels.contact}
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50">
              <Globe size={16} />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-medium border-none outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Download Button */}
            <button className="btn-primary hidden sm:block text-sm px-4 py-2">
              {currentLabels.download}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg border border-border hover:bg-muted"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 py-4 border-t border-border">
            <a href="#features" className="hover:text-primary transition-colors font-medium">
              {currentLabels.features}
            </a>
            <a href="#about" className="hover:text-primary transition-colors font-medium">
              {currentLabels.about}
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors font-medium">
              {currentLabels.pricing}
            </a>
            <a href="#contact" className="hover:text-primary transition-colors font-medium">
              {currentLabels.contact}
            </a>
            <button className="btn-primary w-full text-sm">
              {currentLabels.download}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavigationContent
