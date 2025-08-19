/**
 * ModernFooter Component - Footer Informatif et Utile
 *
 * Footer moderne avec liens utiles, newsletter, réseaux sociaux,
 * et informations légales multilingues.
 */

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Globe } from 'lucide-react';
import { SupportedLocale } from '@/middleware';

import { Container } from '@/src/components/ui/Container';
import { Button } from '@/src/components/ui/Button';

interface ModernFooterProps {
  lang: SupportedLocale;
}

const FOOTER_LABELS: Record<
  SupportedLocale,
  {
    explore: string;
    discover: string;
    categories: string;
    audiences: string;
    useCases: string;
    features: string;
    tools: string;
    trending: string;
    newest: string;
    free: string;
    premium: string;
    company: string;
    about: string;
    blog: string;
    contact: string;
    help: string;
    support: string;
    api: string;
    legal: string;
    privacy: string;
    terms: string;
    cookies: string;
    sitemap: string;
    newsletter: string;
    newsletterDesc: string;
    subscribe: string;
    emailPlaceholder: string;
    followUs: string;
    allRights: string;
    made: string;
  }
> = {
  en: {
    explore: 'Explore',
    discover: 'Discover',
    categories: 'Categories',
    audiences: 'For Teams',
    useCases: 'Use Cases',
    features: 'Features',
    tools: 'Tools',
    trending: 'Trending',
    newest: 'Newest',
    free: 'Free Tools',
    premium: 'Premium',
    company: 'Company',
    about: 'About Us',
    blog: 'Blog',
    contact: 'Contact',
    help: 'Help',
    support: 'Support',
    api: 'API',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    sitemap: 'Sitemap',
    newsletter: 'Newsletter',
    newsletterDesc: 'Get the latest AI tools and insights delivered to your inbox',
    subscribe: 'Subscribe',
    emailPlaceholder: 'Enter your email',
    followUs: 'Follow Us',
    allRights: 'All rights reserved.',
    made: 'Made with ❤️ for the AI community',
  },
  fr: {
    explore: 'Explorer',
    discover: 'Découvrir',
    categories: 'Catégories',
    audiences: 'Pour Équipes',
    useCases: "Cas d'Usage",
    features: 'Fonctionnalités',
    tools: 'Outils',
    trending: 'Tendances',
    newest: 'Nouveautés',
    free: 'Outils Gratuits',
    premium: 'Premium',
    company: 'Entreprise',
    about: 'À Propos',
    blog: 'Blog',
    contact: 'Contact',
    help: 'Aide',
    support: 'Support',
    api: 'API',
    legal: 'Légal',
    privacy: 'Politique de Confidentialité',
    terms: "Conditions d'Utilisation",
    cookies: 'Politique des Cookies',
    sitemap: 'Plan du Site',
    newsletter: 'Newsletter',
    newsletterDesc: 'Recevez les derniers outils IA et insights dans votre boîte mail',
    subscribe: "S'abonner",
    emailPlaceholder: 'Votre email',
    followUs: 'Suivez-nous',
    allRights: 'Tous droits réservés.',
    made: 'Fait avec ❤️ pour la communauté IA',
  },
  it: {
    explore: 'Esplora',
    discover: 'Scopri',
    categories: 'Categorie',
    audiences: 'Per Team',
    useCases: "Casi d'Uso",
    features: 'Funzionalità',
    tools: 'Strumenti',
    trending: 'Di Tendenza',
    newest: 'Più Recenti',
    free: 'Strumenti Gratuiti',
    premium: 'Premium',
    company: 'Azienda',
    about: 'Chi Siamo',
    blog: 'Blog',
    contact: 'Contatti',
    help: 'Aiuto',
    support: 'Supporto',
    api: 'API',
    legal: 'Legale',
    privacy: 'Privacy Policy',
    terms: 'Termini di Servizio',
    cookies: 'Cookie Policy',
    sitemap: 'Mappa del Sito',
    newsletter: 'Newsletter',
    newsletterDesc: 'Ricevi gli ultimi strumenti IA e insights nella tua inbox',
    subscribe: 'Iscriviti',
    emailPlaceholder: 'La tua email',
    followUs: 'Seguici',
    allRights: 'Tutti i diritti riservati.',
    made: 'Fatto con ❤️ per la comunità IA',
  },
  es: {
    explore: 'Explorar',
    discover: 'Descubrir',
    categories: 'Categorías',
    audiences: 'Para Equipos',
    useCases: 'Casos de Uso',
    features: 'Características',
    tools: 'Herramientas',
    trending: 'Tendencias',
    newest: 'Más Nuevas',
    free: 'Herramientas Gratuitas',
    premium: 'Premium',
    company: 'Empresa',
    about: 'Sobre Nosotros',
    blog: 'Blog',
    contact: 'Contacto',
    help: 'Ayuda',
    support: 'Soporte',
    api: 'API',
    legal: 'Legal',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    cookies: 'Política de Cookies',
    sitemap: 'Mapa del Sitio',
    newsletter: 'Newsletter',
    newsletterDesc: 'Recibe las últimas herramientas IA e insights en tu bandeja',
    subscribe: 'Suscribirse',
    emailPlaceholder: 'Tu email',
    followUs: 'Síguenos',
    allRights: 'Todos los derechos reservados.',
    made: 'Hecho con ❤️ para la comunidad IA',
  },
  de: {
    explore: 'Erkunden',
    discover: 'Entdecken',
    categories: 'Kategorien',
    audiences: 'Für Teams',
    useCases: 'Anwendungsfälle',
    features: 'Features',
    tools: 'Tools',
    trending: 'Trending',
    newest: 'Neueste',
    free: 'Kostenlose Tools',
    premium: 'Premium',
    company: 'Unternehmen',
    about: 'Über Uns',
    blog: 'Blog',
    contact: 'Kontakt',
    help: 'Hilfe',
    support: 'Support',
    api: 'API',
    legal: 'Rechtliches',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookie-Richtlinie',
    sitemap: 'Sitemap',
    newsletter: 'Newsletter',
    newsletterDesc: 'Erhalten Sie die neuesten KI-Tools und Insights in Ihre Inbox',
    subscribe: 'Abonnieren',
    emailPlaceholder: 'Ihre E-Mail',
    followUs: 'Folgen Sie uns',
    allRights: 'Alle Rechte vorbehalten.',
    made: 'Mit ❤️ für die KI-Community gemacht',
  },
  nl: {
    explore: 'Verkennen',
    discover: 'Ontdekken',
    categories: 'Categorieën',
    audiences: 'Voor Teams',
    useCases: 'Gebruikscases',
    features: 'Kenmerken',
    tools: 'Tools',
    trending: 'Trending',
    newest: 'Nieuwste',
    free: 'Gratis Tools',
    premium: 'Premium',
    company: 'Bedrijf',
    about: 'Over Ons',
    blog: 'Blog',
    contact: 'Contact',
    help: 'Help',
    support: 'Ondersteuning',
    api: 'API',
    legal: 'Juridisch',
    privacy: 'Privacybeleid',
    terms: 'Servicevoorwaarden',
    cookies: 'Cookiebeleid',
    sitemap: 'Sitemap',
    newsletter: 'Nieuwsbrief',
    newsletterDesc: 'Ontvang de nieuwste AI-tools en inzichten in je inbox',
    subscribe: 'Abonneren',
    emailPlaceholder: 'Je email',
    followUs: 'Volg Ons',
    allRights: 'Alle rechten voorbehouden.',
    made: 'Gemaakt met ❤️ voor de AI-community',
  },
  pt: {
    explore: 'Explorar',
    discover: 'Descobrir',
    categories: 'Categorias',
    audiences: 'Para Equipes',
    useCases: 'Casos de Uso',
    features: 'Recursos',
    tools: 'Ferramentas',
    trending: 'Em Alta',
    newest: 'Mais Novas',
    free: 'Ferramentas Gratuitas',
    premium: 'Premium',
    company: 'Empresa',
    about: 'Sobre Nós',
    blog: 'Blog',
    contact: 'Contato',
    help: 'Ajuda',
    support: 'Suporte',
    api: 'API',
    legal: 'Legal',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',
    cookies: 'Política de Cookies',
    sitemap: 'Mapa do Site',
    newsletter: 'Newsletter',
    newsletterDesc:
      'Receba as últimas ferramentas IA e insights na sua caixa de entrada',
    subscribe: 'Inscrever-se',
    emailPlaceholder: 'Seu email',
    followUs: 'Nos Siga',
    allRights: 'Todos os direitos reservados.',
    made: 'Feito com ❤️ para a comunidade IA',
  },
};

export default function ModernFooter({ lang }: ModernFooterProps) {
  const labels = FOOTER_LABELS[lang];

  const getLocalizedHref = (path: string) => {
    if (lang === 'en') {
      return path === '/' ? '/' : path;
    }
    return path === '/' ? `/${lang}` : `/${lang}${path}`;
  };

  return (
    <footer className='bg-gray-900 text-gray-300'>
      <Container size='xl'>
        {/* Main Footer Content */}
        <div className='py-16'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5'>
            {/* Brand Section */}
            <div className='lg:col-span-2'>
              <div className='mb-6 flex items-center space-x-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600'>
                  <span className='text-sm font-bold text-white'>V</span>
                </div>
                <span className='text-xl font-bold text-white'>Video-IA.net</span>
              </div>

              <p className='mb-6 max-w-md text-gray-400'>{labels.made}</p>

              {/* Newsletter Signup */}
              <div className='mb-6'>
                <h3 className='mb-2 font-semibold text-white'>{labels.newsletter}</h3>
                <p className='mb-4 text-sm text-gray-400'>{labels.newsletterDesc}</p>
                <div className='flex space-x-2'>
                  <input
                    type='email'
                    placeholder={labels.emailPlaceholder}
                    className='flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <Button variant='primary' size='sm'>
                    {labels.subscribe}
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className='mb-3 font-semibold text-white'>{labels.followUs}</h3>
                <div className='flex space-x-4'>
                  <a
                    href='#'
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    <Twitter className='h-5 w-5' />
                  </a>
                  <a
                    href='#'
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    <Github className='h-5 w-5' />
                  </a>
                  <a
                    href='#'
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    <Linkedin className='h-5 w-5' />
                  </a>
                  <a
                    href='#'
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    <Mail className='h-5 w-5' />
                  </a>
                </div>
              </div>
            </div>

            {/* Explore Section */}
            <div>
              <h3 className='mb-4 font-semibold text-white'>{labels.explore}</h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href={getLocalizedHref('/discover')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.discover}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/categories')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.categories}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/audiences')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.audiences}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/use-cases')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.useCases}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/features')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.features}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tools Section */}
            <div>
              <h3 className='mb-4 font-semibold text-white'>{labels.tools}</h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href={getLocalizedHref('/trending')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.trending}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/newest')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.newest}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/free')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.free}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/premium')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.premium}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className='mb-4 font-semibold text-white'>{labels.company}</h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href={getLocalizedHref('/about')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/blog')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.blog}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/contact')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.contact}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/help')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.help}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedHref('/api')}
                    className='text-gray-400 transition-colors hover:text-white'
                  >
                    {labels.api}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-800 py-8'>
          <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'>
            <div className='flex flex-col items-center space-y-2 md:flex-row md:space-x-6 md:space-y-0'>
              <p className='text-sm text-gray-400'>
                © 2024 Video-IA.net. {labels.allRights}
              </p>

              <div className='flex items-center space-x-6'>
                <Link
                  href={getLocalizedHref('/privacy')}
                  className='text-sm text-gray-400 transition-colors hover:text-white'
                >
                  {labels.privacy}
                </Link>
                <Link
                  href={getLocalizedHref('/terms')}
                  className='text-sm text-gray-400 transition-colors hover:text-white'
                >
                  {labels.terms}
                </Link>
                <Link
                  href={getLocalizedHref('/cookies')}
                  className='text-sm text-gray-400 transition-colors hover:text-white'
                >
                  {labels.cookies}
                </Link>
                <Link
                  href={getLocalizedHref('/sitemap')}
                  className='text-sm text-gray-400 transition-colors hover:text-white'
                >
                  {labels.sitemap}
                </Link>
              </div>
            </div>

            <div className='flex items-center space-x-2 text-sm text-gray-400'>
              <Globe className='h-4 w-4' />
              <span>16,765+ AI Tools</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
