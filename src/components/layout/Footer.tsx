/**
 * Main Footer Component
 * 
 * Comprehensive footer for the AI tools directory platform.
 * Features site links, category navigation, statistics, and
 * social media integration.
 * 
 * Features:
 * - Site navigation links
 * - Category quick links
 * - Platform statistics
 * - Social media links
 * - SEO-optimized structure
 * - Responsive design
 * 
 * @author Video-IA.net Development Team
 */

import Link from 'next/link'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface FooterProps {
  totalToolsCount?: number
  totalCategoriesCount?: number
}

export default function Footer({ 
  totalToolsCount = 16763,
  totalCategoriesCount = 140 
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/tools', label: 'Tous les outils' },
    { href: '/categories', label: 'Catégories' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Confidentialité' },
  ]

  const popularCategories = [
    { href: '/categories/writing-assistant', label: 'Assistant rédaction' },
    { href: '/categories/image-editing', label: 'Édition d\'images' },
    { href: '/categories/video-editing', label: 'Montage vidéo' },
    { href: '/categories/music', label: 'Musique' },
    { href: '/categories/productivity', label: 'Productivité' },
    { href: '/categories/chatbot', label: 'Chatbots' },
  ]

  const socialLinks = [
    {
      href: 'https://twitter.com/videoianet',
      label: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      href: 'https://linkedin.com/company/video-ia',
      label: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      href: 'https://github.com/video-ia',
      label: 'GitHub',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
  ]

  return (
    <footer className="glass-effect border-t border-gray-700/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Video-IA.net</h3>
                <p className="text-sm text-gray-400 font-medium">Répertoire d'outils IA</p>
              </div>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-8">
              Le répertoire le plus complet d'outils d'intelligence artificielle pour les créateurs, 
              développeurs et professionnels. Découvrez les meilleurs outils IA du marché.
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 glass-effect rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold gradient-text">{formatNumber(totalToolsCount)}</div>
                <div className="text-sm text-gray-400 font-medium">Outils IA</div>
              </div>
              <div className="text-center p-4 glass-effect rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold gradient-text">{totalCategoriesCount}</div>
                <div className="text-sm text-gray-400 font-medium">Catégories</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-effect rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
                  aria-label={social.label}
                >
                  <div className="text-gray-400 group-hover:text-purple-400 transition-colors duration-200">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Navigation</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Catégories populaires</h4>
            <ul className="space-y-3">
              {popularCategories.map((category) => (
                <li key={category.href}>
                  <Link
                    href={category.href}
                    className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources and Support */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Ressources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Soumettre un outil
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Documentation API
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-base text-gray-400 mb-4 md:mb-0 font-medium">
              © {currentYear} Video-IA.net. Tous droits réservés.
            </div>
            <div className="flex items-center space-x-8 text-base text-gray-400">
              <Link href="/privacy" className="hover:text-white hover:gradient-text transition-all duration-200 font-medium">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="hover:text-white hover:gradient-text transition-all duration-200 font-medium">
                Conditions d'utilisation
              </Link>
              <Link href="/cookies" className="hover:text-white hover:gradient-text transition-all duration-200 font-medium">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}