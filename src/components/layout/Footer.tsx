/**
 * Main Footer Component - Multilingual
 * 
 * Comprehensive footer for the AI tools directory platform.
 * Features site links, category navigation, statistics, and
 * social media integration with full multilingual support.
 * 
 * Features:
 * - Site navigation links
 * - Category quick links
 * - Platform statistics
 * - Social media links
 * - SEO-optimized structure
 * - Responsive design
 * - Full multilingual support
 * - Admin access link with authentication check
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import Link from 'next/link'
import { SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'
import { SupportedLocale } from '@/middleware'
import { useSession } from 'next-auth/react'

interface FooterProps {
  currentLanguage: SupportedLocale
  totalToolsCount?: number
  totalCategoriesCount?: number
}

export default function Footer({ 
  currentLanguage,
  totalToolsCount = 16763,
  totalCategoriesCount = 140 
}: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { data: session } = useSession()

  // Traductions par langue
  const translations = {
    'en': {
      tagline: 'AI Tools Directory',
      description: 'The most comprehensive directory of artificial intelligence tools for creators, developers and professionals. Discover the best AI tools on the market.',
      home: 'Home',
      allTools: 'All Tools',
      categories: 'Categories',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      popularCategories: 'Popular Categories',
      writingAssistant: 'Writing Assistant',
      imageEditing: 'Image Editing',
      videoEditing: 'Video Editing',
      music: 'Music',
      productivity: 'Productivity',
      chatbots: 'Chatbots',
      resources: 'Resources',
      submitTool: 'Submit Tool',
      apiDocs: 'API Documentation',
      blog: 'Blog',
      changelog: 'Changelog',
      support: 'Support',
      terms: 'Terms of Use',
      copyright: 'All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      cookies: 'Cookies',
      admin: 'Administration'
    },
    'fr': {
      tagline: 'Répertoire d\'outils IA',
      description: 'Le répertoire le plus complet d\'outils d\'intelligence artificielle pour les créateurs, développeurs et professionnels. Découvrez les meilleurs outils IA du marché.',
      home: 'Accueil',
      allTools: 'Tous les outils',
      categories: 'Catégories',
      about: 'À propos',
      contact: 'Contact',
      privacy: 'Confidentialité',
      popularCategories: 'Catégories populaires',
      writingAssistant: 'Assistant rédaction',
      imageEditing: 'Édition d\'images',
      videoEditing: 'Montage vidéo',
      music: 'Musique',
      productivity: 'Productivité',
      chatbots: 'Chatbots',
      resources: 'Ressources',
      submitTool: 'Soumettre un outil',
      apiDocs: 'Documentation API',
      blog: 'Blog',
      changelog: 'Nouveautés',
      support: 'Support',
      terms: 'Conditions d\'utilisation',
      copyright: 'Tous droits réservés.',
      privacyPolicy: 'Politique de confidentialité',
      termsOfUse: 'Conditions d\'utilisation',
      cookies: 'Cookies',
      admin: 'Administration'
    },
    'es': {
      tagline: 'Directorio de Herramientas IA',
      description: 'El directorio más completo de herramientas de inteligencia artificial para creadores, desarrolladores y profesionales. Descubre las mejores herramientas IA del mercado.',
      home: 'Inicio',
      allTools: 'Todas las herramientas',
      categories: 'Categorías',
      about: 'Acerca de',
      contact: 'Contacto',
      privacy: 'Privacidad',
      popularCategories: 'Categorías populares',
      writingAssistant: 'Asistente de escritura',
      imageEditing: 'Edición de imágenes',
      videoEditing: 'Edición de video',
      music: 'Música',
      productivity: 'Productividad',
      chatbots: 'Chatbots',
      resources: 'Recursos',
      submitTool: 'Enviar herramienta',
      apiDocs: 'Documentación API',
      blog: 'Blog',
      changelog: 'Novedades',
      support: 'Soporte',
      terms: 'Términos de uso',
      copyright: 'Todos los derechos reservados.',
      privacyPolicy: 'Política de privacidad',
      termsOfUse: 'Términos de uso',
      cookies: 'Cookies',
      admin: 'Administración'
    },
    'it': {
      tagline: 'Directory Strumenti IA',
      description: 'La directory più completa di strumenti di intelligenza artificiale per creatori, sviluppatori e professionisti. Scopri i migliori strumenti IA del mercato.',
      home: 'Home',
      allTools: 'Tutti gli strumenti',
      categories: 'Categorie',
      about: 'Chi siamo',
      contact: 'Contatto',
      privacy: 'Privacy',
      popularCategories: 'Categorie popolari',
      writingAssistant: 'Assistente di scrittura',
      imageEditing: 'Editing immagini',
      videoEditing: 'Editing video',
      music: 'Musica',
      productivity: 'Produttività',
      chatbots: 'Chatbot',
      resources: 'Risorse',
      submitTool: 'Invia strumento',
      apiDocs: 'Documentazione API',
      blog: 'Blog',
      changelog: 'Novità',
      support: 'Supporto',
      terms: 'Termini di utilizzo',
      copyright: 'Tutti i diritti riservati.',
      privacyPolicy: 'Politica sulla privacy',
      termsOfUse: 'Termini di utilizzo',
      cookies: 'Cookie',
      admin: 'Amministrazione'
    },
    'de': {
      tagline: 'KI-Tools Verzeichnis',
      description: 'Das umfassendste Verzeichnis von KI-Tools für Kreative, Entwickler und Fachleute. Entdecken Sie die besten KI-Tools auf dem Markt.',
      home: 'Startseite',
      allTools: 'Alle Tools',
      categories: 'Kategorien',
      about: 'Über uns',
      contact: 'Kontakt',
      privacy: 'Datenschutz',
      popularCategories: 'Beliebte Kategorien',
      writingAssistant: 'Schreibassistent',
      imageEditing: 'Bildbearbeitung',
      videoEditing: 'Videobearbeitung',
      music: 'Musik',
      productivity: 'Produktivität',
      chatbots: 'Chatbots',
      resources: 'Ressourcen',
      submitTool: 'Tool einreichen',
      apiDocs: 'API-Dokumentation',
      blog: 'Blog',
      changelog: 'Änderungsprotokoll',
      support: 'Support',
      terms: 'Nutzungsbedingungen',
      copyright: 'Alle Rechte vorbehalten.',
      privacyPolicy: 'Datenschutzrichtlinie',
      termsOfUse: 'Nutzungsbedingungen',
      cookies: 'Cookies',
      admin: 'Administration'
    },
    'nl': {
      tagline: 'AI Tools Directory',
      description: 'De meest uitgebreide directory van AI-tools voor makers, ontwikkelaars en professionals. Ontdek de beste AI-tools op de markt.',
      home: 'Home',
      allTools: 'Alle tools',
      categories: 'Categorieën',
      about: 'Over ons',
      contact: 'Contact',
      privacy: 'Privacy',
      popularCategories: 'Populaire categorieën',
      writingAssistant: 'Schrijfassistent',
      imageEditing: 'Afbeeldingsbewerking',
      videoEditing: 'Videobewerking',
      music: 'Muziek',
      productivity: 'Productiviteit',
      chatbots: 'Chatbots',
      resources: 'Bronnen',
      submitTool: 'Tool indienen',
      apiDocs: 'API-documentatie',
      blog: 'Blog',
      changelog: 'Wijzigingslogboek',
      support: 'Ondersteuning',
      terms: 'Gebruiksvoorwaarden',
      copyright: 'Alle rechten voorbehouden.',
      privacyPolicy: 'Privacybeleid',
      termsOfUse: 'Gebruiksvoorwaarden',
      cookies: 'Cookies',
      admin: 'Beheer'
    },
    'pt': {
      tagline: 'Diretório de Ferramentas IA',
      description: 'O diretório mais completo de ferramentas de inteligência artificial para criadores, desenvolvedores e profissionais. Descubra as melhores ferramentas IA do mercado.',
      home: 'Início',
      allTools: 'Todas as ferramentas',
      categories: 'Categorias',
      about: 'Sobre',
      contact: 'Contato',
      privacy: 'Privacidade',
      popularCategories: 'Categorias populares',
      writingAssistant: 'Assistente de escrita',
      imageEditing: 'Edição de imagens',
      videoEditing: 'Edição de vídeo',
      music: 'Música',
      productivity: 'Produtividade',
      chatbots: 'Chatbots',
      resources: 'Recursos',
      submitTool: 'Enviar ferramenta',
      apiDocs: 'Documentação da API',
      blog: 'Blog',
      changelog: 'Novidades',
      support: 'Suporte',
      terms: 'Termos de uso',
      copyright: 'Todos os direitos reservados.',
      privacyPolicy: 'Política de privacidade',
      termsOfUse: 'Termos de uso',
      cookies: 'Cookies',
      admin: 'Administração'
    }
  }

  const t = translations[currentLanguage] || translations['en']

  const quickLinks = [
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}`, label: t.home },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/tools`, label: t.allTools },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/categories`, label: t.categories },
  ]

  const popularCategories = [
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/writing-assistant`, label: t.writingAssistant },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/image-editing`, label: t.imageEditing },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/video-editing`, label: t.videoEditing },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/music`, label: t.music },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/productivity`, label: t.productivity },
    { href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c/chatbot`, label: t.chatbots },
  ]

  const resourceLinks = [
    // Admin link - only show if user is authenticated or redirect to login
    { 
      href: session ? '/admin' : '/admin/login',
      label: t.admin,
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      isAdmin: true
    },
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
                <p className="text-sm text-gray-400 font-medium">{t.tagline}</p>
              </div>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-8">
              {t.description}
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 glass-effect rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold gradient-text">{formatNumber(totalToolsCount)}</div>
                <div className="text-sm text-gray-400 font-medium">AI Tools</div>
              </div>
              <div className="text-center p-4 glass-effect rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold gradient-text">{totalCategoriesCount}</div>
                <div className="text-sm text-gray-400 font-medium">{t.categories}</div>
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
          
          {/* Navigation */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">{t.home}</h4>
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
            <h4 className="text-xl font-semibold text-white mb-6">{t.popularCategories}</h4>
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
          
          {/* Resources */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">{t.resources}</h4>
            <ul className="space-y-3">
              {resourceLinks.map((resource) => (
                <li key={resource.href}>
                  <Link
                    href={resource.href}
                    className={`text-gray-300 hover:text-white hover:gradient-text transition-all duration-200 text-base font-medium flex items-center space-x-2 ${
                      resource.isAdmin && session ? 'text-purple-400' : ''
                    }`}
                    title={resource.isAdmin && !session ? 'Log in to access admin panel' : undefined}
                  >
                    {resource.icon && <span>{resource.icon}</span>}
                    <span>{resource.label}</span>
                    {resource.isAdmin && session && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-base text-gray-400 mb-4 md:mb-0 font-medium">
              © {currentYear} Video-IA.net. {t.copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}