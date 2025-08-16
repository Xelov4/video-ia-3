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
  tools: {
    title: 'Outils IA',
    links: [
      { name: 'Tous les outils', href: '/tools' },
      { name: 'Nouveautés', href: '/tools?new=true' },
      { name: 'Gratuits', href: '/tools?pricing=free' },
      { name: 'En vedette', href: '/tools?featured=true' },
      { name: 'API disponible', href: '/tools?api=true' }
    ]
  },
  categories: {
    title: 'Catégories',
    links: [
      { name: 'Assistant IA', href: '/c/ai-assistant' },
      { name: 'Création de contenu', href: '/c/content-creation' },
      { name: 'Génération d\'images', href: '/c/image-generation' },
      { name: 'Outils vidéo', href: '/c/video-tools' },
      { name: 'Analyse de données', href: '/c/data-analysis' }
    ]
  },
  audiences: {
    title: 'Pour qui ?',
    links: [
      { name: 'Développeurs', href: '/for/developers' },
      { name: 'Créateurs', href: '/for/content-creators' },
      { name: 'Marketeurs', href: '/for/marketers' },
      { name: 'Designers', href: '/for/designers' },
      { name: 'Étudiants', href: '/for/students' }
    ]
  },
  company: {
    title: 'Entreprise',
    links: [
      { name: 'À propos', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'API', href: '/api' },
      { name: 'Partenaires', href: '/partners' }
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
    <footer className="bg-background border-t">
      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Restez informé des nouveautés</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Recevez les derniers outils IA, tendances et guides directement dans votre boîte mail.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                S'abonner
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
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
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Video-IA.net
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Le répertoire le plus complet d'outils d'intelligence artificielle pour créateurs, développeurs et professionnels.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4 text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={getLocalizedPath(link.href)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center group"
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

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© 2025 Video-IA.net</span>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Conditions
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Fait avec</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>en France</span>
            <Badge variant="outline" className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              v2.1.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}