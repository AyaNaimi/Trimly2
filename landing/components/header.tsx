'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Moon, Sun } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const html = document.documentElement
    setIsDark(html.getAttribute('data-theme') === 'dark')
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const newTheme = isDark ? 'light' : 'dark'
    html.setAttribute('data-theme', newTheme)
    setIsDark(!isDark)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200" 
            style={isDark ? { backgroundColor: 'hsl(var(--card-bg))', borderColor: 'hsl(var(--border))' } : {}}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Trimly
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</Link>
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</Link>
          <Link href="#about" className="text-gray-600 hover:text-gray-900 transition">About</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {mounted && (
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-lg transition" 
                    style={isDark ? { backgroundColor: 'hsl(var(--border))' } : {}}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button className="btn btn-primary hidden md:block">Get Started</button>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200" style={isDark ? { borderColor: 'hsl(var(--border))' } : {}}>
          <div className="px-6 py-4 space-y-4">
            <Link href="#features" className="block text-gray-600">Features</Link>
            <Link href="#pricing" className="block text-gray-600">Pricing</Link>
            <Link href="#about" className="block text-gray-600">About</Link>
            <button className="btn btn-primary w-full">Get Started</button>
          </div>
        </div>
      )}
    </header>
  )
}
