'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Sparkles,
  Bot,
  Zap,
  Users,
  Star,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { SupportedLocale } from '@/middleware';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Separator } from '@/src/components/ui/separator';
import { Card, CardContent } from '@/src/components/ui/card';

interface ShadcnFooterProps {
  currentLanguage: SupportedLocale;
}

const FOOTER_LINKS = {
  navigation: {
    title: 'Navigation',
    links: [
      { name: 'Accueil', href: '/' },
      { name: 'Outils IA', href: '/tools' },
      { name: 'Catégories', href: '/categories' },
      { name: 'Nouveau', href: '/tools?new=true' },
      { name: 'Populaires', href: '/tools?featured=true' },
    ],
  },
  categories: {
    title: 'Catégories populaires',
    links: [
      { name: 'Création de contenu', href: '/categories' },
      { name: "Génération d'images", href: '/categories' },
      { name: 'Assistant IA', href: '/categories' },
      { name: 'Outils vidéo', href: '/categories' },
      { name: 'Analyse de données', href: '/categories' },
    ],
  },
  resources: {
    title: 'Ressources',
    links: [
      { name: 'Tous les outils', href: '/tools' },
      { name: 'Outils gratuits', href: '/tools?pricing=free' },
      { name: 'Tendances', href: '/tools?sort=trending' },
      { name: 'Nouveautés', href: '/tools?sort=recent' },
      { name: 'Mieux notés', href: '/tools?sort=rating' },
    ],
  },
  legal: {
    title: 'Légal',
    links: [
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: "Conditions d'utilisation", href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Contact', href: '/contact' },
      { name: 'À propos', href: '/about' },
    ],
  },
};

const STATS = [
  { label: 'Outils IA', value: '16,765+', icon: Bot },
  { label: 'Catégories', value: '150+', icon: Zap },
  { label: 'Utilisateurs', value: '250K+', icon: Users },
  { label: 'Évaluations', value: '50K+', icon: Star },
];

export default function ShadcnFooter({ currentLanguage }: ShadcnFooterProps) {
  const [email, setEmail] = React.useState('');

  const getLocalizedPath = (path: string) => {
    return currentLanguage === 'en' ? path : `/${currentLanguage}${path}`;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className='border-t border-slate-800 bg-slate-900'>
      {/* Stats Section */}
      <div className='bg-slate-800 text-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className='text-center'>
                  <div className='mb-2 flex justify-center'>
                    <Icon className='h-6 w-6 text-blue-400' />
                  </div>
                  <div className='mb-1 text-2xl font-bold text-white'>{stat.value}</div>
                  <div className='text-sm text-slate-300'>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className='container mx-auto px-4 py-12'>
        <Card className='border-slate-700 bg-slate-800'>
          <CardContent className='p-8 text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600'>
                <Mail className='h-6 w-6 text-white' />
              </div>
            </div>
            <h3 className='mb-2 text-2xl font-bold text-white'>
              Restez informé des nouveautés
            </h3>
            <p className='mx-auto mb-6 max-w-md text-slate-300'>
              Recevez les derniers outils IA, tendances et guides directement dans votre
              boîte mail.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'
            >
              <Input
                type='email'
                placeholder='votre@email.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='flex-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-400'
                required
              />
              <Button
                type='submit'
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              >
                S'abonner
                <Sparkles className='ml-2 h-4 w-4' />
              </Button>
            </form>
            <p className='mt-3 text-xs text-slate-400'>
              Pas de spam. Désabonnement à tout moment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Footer */}
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5'>
          {/* Brand Column */}
          <div className='lg:col-span-1'>
            <Link
              href={getLocalizedPath('/')}
              className='mb-4 flex items-center space-x-3'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg'>
                <Sparkles className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold text-white'>Video-IA.net</span>
            </Link>
            <p className='mb-4 text-sm text-slate-300'>
              Le répertoire le plus complet d'outils d'intelligence artificielle pour
              créateurs, développeurs et professionnels.
            </p>
            <div className='flex space-x-2'>
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-400 hover:bg-slate-800 hover:text-white'
              >
                <Github className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-400 hover:bg-slate-800 hover:text-white'
              >
                <Twitter className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-400 hover:bg-slate-800 hover:text-white'
              >
                <Linkedin className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h4 className='mb-4 font-semibold text-white'>{section.title}</h4>
              <ul className='space-y-2'>
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={getLocalizedPath(link.href)}
                      className='group flex items-center text-sm text-slate-300 transition-colors hover:text-white'
                    >
                      {link.name}
                      <ExternalLink className='ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className='my-8 bg-slate-700' />

        {/* Bottom Section */}
        <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'>
          <div className='flex items-center space-x-4 text-sm text-slate-400'>
            <span>© 2025 Video-IA.net</span>
            <Separator orientation='vertical' className='h-4 bg-slate-600' />
            <Link href='/privacy' className='transition-colors hover:text-white'>
              Confidentialité
            </Link>
            <Separator orientation='vertical' className='h-4 bg-slate-600' />
            <Link href='/terms' className='transition-colors hover:text-white'>
              Conditions
            </Link>
            <Separator orientation='vertical' className='h-4 bg-slate-600' />
            <Link href='/cookies' className='transition-colors hover:text-white'>
              Cookies
            </Link>
          </div>

          <div className='flex items-center space-x-2 text-sm text-slate-400'>
            <span>Fait avec</span>
            <Heart className='h-4 w-4 animate-pulse text-red-500' />
            <span>en France</span>
            <Badge variant='outline' className='ml-2 border-slate-600 text-slate-400'>
              <TrendingUp className='mr-1 h-3 w-3' />
              v2.1.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}
