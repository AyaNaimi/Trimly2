'use client'

import { motion } from 'framer-motion'
import { MessageCircle, GitBranch, Share2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookies', href: '#' },
      { label: 'License', href: '#' },
    ],
  }

  const socialLinks = [
    { icon: MessageCircle, href: '#', label: 'Twitter' },
    { icon: GitBranch, href: '#', label: 'GitHub' },
    { icon: Share2, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ]

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="font-bold text-lg gradient-text">Trimly</span>
            </Link>
            <p className="text-foreground/60 text-sm">
              Master your finances with intelligent budget tracking and subscription management.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 capitalize text-foreground">
                {category === 'company' ? 'Company' : category === 'legal' ? 'Legal' : 'Product'}
              </h4>
              <ul className="space-y-2">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-foreground/60 hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/60 text-sm">
            © {currentYear} Trimly. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg hover:bg-primary/10 text-foreground/60 hover:text-primary transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              )
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
