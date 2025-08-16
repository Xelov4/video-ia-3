'use client'

import * as React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Heart, Sparkles, Bot, Zap, Users, Star, TrendingUp, ExternalLink } from 'lucide-react'
import { SupportedLocale } from '@/middleware'

import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Separator } from '@/src/components/ui/separator'
import { Card, CardContent } from '@/src/components/ui/card'

interface ShadcnFooterProps {
  currentLanguage: SupportedLocale
}

const FOOTER_LINKS = {
  navigation: {
    title: 'Navigation',
    links: [
      { name: 'Accueil', href: '/' },
      { name: 'Outils IA', href: '/tools' },
      { name: 'Catégories', href: '/categories' },
      { name: 'Nouveau', href: '/tools?new=true' },
      { name: 'Populaires', href: '/tools?featured=true' }
    ]
  },
  categories: {
    title: 'Catégories populaires',
    links: [
      { name: 'Création de contenu', href: '/categories' },
      { name: 'Génération d\'images', href: '/categories' },
      { name: 'Assistant IA', href: '/categories' },
      { name: 'Outils vidéo', href: '/categories' },
      { name: 'Analyse de données', href: '/categories' }
    ]
  },
  resources: {
    title: 'Ressources',
    links: [
      { name: 'Tous les outils', href: '/tools' },
      { name: 'Outils gratuits', href: '/tools?pricing=free' },
      { name: 'Tendances', href: '/tools?sort=trending' },
      { name: 'Nouveautés', href: '/tools?sort=recent' },
      { name: 'Mieux notés', href: '/tools?sort=rating' }
    ]
  },
  legal: {
    title: 'Légal',
    links: [
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Contact', href: '/contact' },
      { name: 'À propos', href: '/about' }
    ]
  }
}

const STATS = [
  { label: 'Outils IA', value: '16,765+', icon: Bot },
  { label: 'Catégories', value: '150+', icon: Zap },
  { label: 'Utilisateurs', value: '250K+', icon: Users },
  { label: 'Évaluations', value: '50K+', icon: Star }
]

export default function ShadcnFooter({ currentLanguage }: ShadcnFooterProps) {
  const [email, setEmail] = React.useState('')

  const getLocalizedPath = (path: string) => {
    return currentLanguage === 'en' ? path : `/${currentLanguage}${path}`
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail('')
  }

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Stats Section */}
      <div className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-white">{stat.value}</div>
                  <div className="text-sm text-slate-300">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Restez informé des nouveautés</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Recevez les derniers outils IA, tendances et guides directement dans votre boîte mail.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                S'abonner
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </form>
            <p className="text-xs text-slate-400 mt-3">
              Pas de spam. Désabonnement à tout moment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href={getLocalizedPath('/')} className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Video-IA.net
              </span>
            </Link>
            <p className="text-slate-300 text-sm mb-4">
              Le répertoire le plus complet d'outils d'intelligence artificielle pour créateurs, développeurs et professionnels.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={getLocalizedPath(link.href)}
                      className="text-slate-300 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-slate-700" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>© 2025 Video-IA.net</span>
            <Separator orientation="vertical" className="h-4 bg-slate-600" />
            <Link href="/privacy" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Separator orientation="vertical" className="h-4 bg-slate-600" />
            <Link href="/terms" className="hover:text-white transition-colors">
              Conditions
            </Link>
            <Separator orientation="vertical" className="h-4 bg-slate-600" />
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>Fait avec</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>en France</span>
            <Badge variant="outline" className="ml-2 border-slate-600 text-slate-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              v2.1.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}