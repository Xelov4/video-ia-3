/**
 * ModernHeader Component - Navigation Intelligente
 *
 * Header moderne avec mega-menu exploitant les données extraites,
 * navigation mobile responsive, et optimisations performance.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { SupportedLocale } from '@/middleware';

import { Button } from '@/src/components/ui/Button';
import { Container } from '@/src/components/ui/Container';
import { cn } from '@/src/lib/utils/cn';

interface ModernHeaderProps {
  lang: SupportedLocale;
}

interface MegaMenuData {
  audiences: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; count: number }>;
  useCases: Array<{ name: string; count: number }>;
}

const LANGUAGE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  pt: 'Português',
};

const NAVIGATION_LABELS: Record<
  SupportedLocale,
  {
    discover: string;
    categories: string;
    audiences: string;
    useCases: string;
    features: string;
    search: string;
    searchPlaceholder: string;
  }
> = {
  en: {
    discover: 'Discover',
    categories: 'Categories',
    audiences: 'For Teams',
    useCases: 'Use Cases',
    features: 'Features',
    search: 'Search',
    searchPlaceholder: 'Search 16,765+ AI tools...',
  },
  fr: {
    discover: 'Découvrir',
    categories: 'Catégories',
    audiences: 'Pour Équipes',
    useCases: "Cas d'Usage",
    features: 'Fonctionnalités',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher parmi 16 765+ outils IA...',
  },
  it: {
    discover: 'Scopri',
    categories: 'Categorie',
    audiences: 'Per Team',
    useCases: "Casi d'Uso",
    features: 'Funzionalità',
    search: 'Cerca',
    searchPlaceholder: 'Cerca tra 16.765+ strumenti IA...',
  },
  es: {
    discover: 'Descubrir',
    categories: 'Categorías',
    audiences: 'Para Equipos',
    useCases: 'Casos de Uso',
    features: 'Características',
    search: 'Buscar',
    searchPlaceholder: 'Buscar entre 16.765+ herramientas IA...',
  },
  de: {
    discover: 'Entdecken',
    categories: 'Kategorien',
    audiences: 'Für Teams',
    useCases: 'Anwendungsfälle',
    features: 'Features',
    search: 'Suchen',
    searchPlaceholder: 'Durchsuchen Sie 16.765+ KI-Tools...',
  },
  nl: {
    discover: 'Ontdekken',
    categories: 'Categorieën',
    audiences: 'Voor Teams',
    useCases: 'Gebruikscases',
    features: 'Kenmerken',
    search: 'Zoeken',
    searchPlaceholder: 'Zoek in 16.765+ AI-tools...',
  },
  pt: {
    discover: 'Descobrir',
    categories: 'Categorias',
    audiences: 'Para Equipes',
    useCases: 'Casos de Uso',
    features: 'Recursos',
    search: 'Pesquisar',
    searchPlaceholder: 'Pesquisar em 16.765+ ferramentas IA...',
  },
};

export default function ModernHeader({ lang }: ModernHeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [megaMenuData, setMegaMenuData] = useState<MegaMenuData | null>(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const labels = NAVIGATION_LABELS[lang];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load mega menu data
  useEffect(() => {
    async function loadMegaMenuData() {
      try {
        // Chargement des données par défaut pour éviter les erreurs API
        let audiencesData: any = [];
        let categoriesData: any = [];
        let useCasesData: any = [];

        try {
          const audiencesRes = await fetch(
            '/api/data-extraction?type=audiences&limit=12'
          );
          if (audiencesRes.ok) {
            const audiencesJson = await audiencesRes.json();
            audiencesData = audiencesJson.data || [];
          }
        } catch (e) {
          console.warn('Failed to load audiences data:', e);
        }

        try {
          const categoriesRes = await fetch(
            '/api/categories?lang=' + lang + '&limit=12'
          );
          if (categoriesRes.ok) {
            const categoriesJson = await categoriesRes.json();
            categoriesData = categoriesJson.data || [];
          }
        } catch (e) {
          console.warn('Failed to load categories data:', e);
        }

        try {
          const useCasesRes = await fetch(
            '/api/data-extraction?type=use-cases&limit=12'
          );
          if (useCasesRes.ok) {
            const useCasesJson = await useCasesRes.json();
            useCasesData = useCasesJson.data || [];
          }
        } catch (e) {
          console.warn('Failed to load use cases data:', e);
        }

        // Set fallback data if API fails
        if (audiencesData.length === 0) {
          audiencesData = [
            { name: 'Developers', count: 938, slug: 'developers' },
            { name: 'Content Creators', count: 745, slug: 'content-creators' },
            { name: 'Marketers', count: 623, slug: 'marketers' },
            { name: 'Designers', count: 512, slug: 'designers' },
          ];
        }

        if (categoriesData.length === 0) {
          categoriesData = [
            { name: 'AI Assistant', count: 939, slug: 'ai-assistant' },
            { name: 'Content Creation', count: 775, slug: 'content-creation' },
            { name: 'Image Generation', count: 598, slug: 'image-generation' },
            { name: 'Data Analysis', count: 581, slug: 'data-analysis' },
          ];
        }

        if (useCasesData.length === 0) {
          useCasesData = [
            { name: 'Video Creation', count: 467, slug: 'video-creation' },
            { name: 'Content Writing', count: 432, slug: 'content-writing' },
            { name: 'Image Editing', count: 398, slug: 'image-editing' },
            { name: 'Data Visualization', count: 321, slug: 'data-visualization' },
          ];
        }

        setMegaMenuData({
          audiences: audiencesData,
          categories: categoriesData,
          useCases: useCasesData,
        });
      } catch (error) {
        console.error('Failed to load mega menu data:', error);
      }
    }

    loadMegaMenuData();
  }, [lang]);

  const isActiveLink = (href: string) => {
    if (href === `/${lang}` || href === '/') {
      return pathname === `/${lang}` || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLocalizedHref = (path: string) => {
    if (lang === 'en') {
      return path === '/' ? '/' : path;
    }
    return path === '/' ? `/${lang}` : `/${lang}${path}`;
  };

  // New function for short URLs
  const getShortUrl = (type: 'category' | 'audience' | 'usecase', slug: string) => {
    const shortPath = `/${type === 'category' ? 'c' : type === 'audience' ? 'p' : 'u'}/${slug}`;
    return getLocalizedHref(shortPath);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-200',
          isScrolled
            ? 'border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md'
            : 'border-b border-gray-200 bg-white shadow-sm'
        )}
      >
        <Container size='xl'>
          <nav className='flex h-16 items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center space-x-4'>
              <Link
                href={getLocalizedHref('/')}
                className='group flex items-center space-x-2'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600'>
                  <span className='text-sm font-bold text-white'>V</span>
                </div>
                <span className='text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                  Video-IA.net
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden items-center space-x-8 lg:flex'>
              <Link
                href={getLocalizedHref('/discover')}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  isActiveLink(getLocalizedHref('/discover'))
                    ? 'text-blue-600'
                    : 'text-gray-700'
                )}
              >
                {labels.discover}
              </Link>

              {/* Categories Mega Menu */}
              <div
                className='relative'
                onMouseEnter={() => setActiveMegaMenu('categories')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className='flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'>
                  <span>{labels.categories}</span>
                  <ChevronDown className='h-4 w-4' />
                </button>

                {activeMegaMenu === 'categories' && megaMenuData && (
                  <div className='absolute left-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
                    <h3 className='mb-4 font-semibold text-gray-900'>Top Categories</h3>
                    <div className='grid grid-cols-2 gap-2'>
                      {megaMenuData.categories.slice(0, 10).map(category => (
                        <Link
                          key={category.name}
                          href={getLocalizedHref(
                            `/category/${encodeURIComponent(category.name.toLowerCase())}`
                          )}
                          className='py-1 text-sm text-gray-600 transition-colors hover:text-blue-600'
                        >
                          {category.name} ({category.count})
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={getLocalizedHref('/categories')}
                      className='mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700'
                    >
                      View all categories →
                    </Link>
                  </div>
                )}
              </div>

              {/* Audiences Mega Menu */}
              <div
                className='relative'
                onMouseEnter={() => setActiveMegaMenu('audiences')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className='flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'>
                  <span>{labels.audiences}</span>
                  <ChevronDown className='h-4 w-4' />
                </button>

                {activeMegaMenu === 'audiences' && megaMenuData && (
                  <div className='absolute left-0 top-full mt-2 w-96 rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
                    <h3 className='mb-4 font-semibold text-gray-900'>
                      Find Tools For Your Team
                    </h3>
                    <div className='grid grid-cols-2 gap-2'>
                      {megaMenuData.audiences.slice(0, 12).map(audience => (
                        <Link
                          key={audience.name}
                          href={getLocalizedHref(
                            `/for/${encodeURIComponent(audience.name.toLowerCase().replace(/\s+/g, '-'))}`
                          )}
                          className='py-1 text-sm text-gray-600 transition-colors hover:text-blue-600'
                        >
                          {audience.name} ({audience.count})
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={getLocalizedHref('/audiences')}
                      className='mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700'
                    >
                      View all audiences →
                    </Link>
                  </div>
                )}
              </div>

              {/* Use Cases Mega Menu */}
              <div
                className='relative'
                onMouseEnter={() => setActiveMegaMenu('usecases')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className='flex items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'>
                  <span>{labels.useCases}</span>
                  <ChevronDown className='h-4 w-4' />
                </button>

                {activeMegaMenu === 'usecases' && megaMenuData && (
                  <div className='absolute left-0 top-full mt-2 w-96 rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
                    <h3 className='mb-4 font-semibold text-gray-900'>
                      Popular Use Cases
                    </h3>
                    <div className='grid grid-cols-2 gap-2'>
                      {megaMenuData.useCases.slice(0, 12).map(useCase => (
                        <Link
                          key={useCase.name}
                          href={getLocalizedHref(
                            `/use-cases/${encodeURIComponent(useCase.name.toLowerCase().replace(/\s+/g, '-'))}`
                          )}
                          className='py-1 text-sm text-gray-600 transition-colors hover:text-blue-600'
                        >
                          {useCase.name} ({useCase.count})
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={getLocalizedHref('/use-cases')}
                      className='mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700'
                    >
                      View all use cases →
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href={getLocalizedHref('/features')}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  isActiveLink(getLocalizedHref('/features'))
                    ? 'text-blue-600'
                    : 'text-gray-700'
                )}
              >
                {labels.features}
              </Link>
            </div>

            {/* Search & Actions */}
            <div className='flex items-center space-x-4'>
              {/* Search Bar - Desktop */}
              <div className='hidden items-center md:flex'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <input
                    type='text'
                    placeholder={labels.searchPlaceholder}
                    className='w-80 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              {/* Language Switcher */}
              <div className='group relative'>
                <button className='flex items-center space-x-1 text-sm text-gray-600 transition-colors hover:text-gray-900'>
                  <Globe className='h-4 w-4' />
                  <span className='hidden sm:inline'>{LANGUAGE_LABELS[lang]}</span>
                  <ChevronDown className='h-3 w-3' />
                </button>

                <div className='invisible absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100'>
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <Link
                      key={code}
                      href={code === 'en' ? '/' : `/${code}`}
                      className={cn(
                        'block px-4 py-2 text-sm transition-colors hover:bg-gray-50',
                        code === lang ? 'font-medium text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant='ghost'
                size='sm'
                className='lg:hidden'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className='h-5 w-5' />
                ) : (
                  <Menu className='h-5 w-5' />
                )}
              </Button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-50 bg-white lg:hidden'>
          <div className='flex h-full flex-col'>
            {/* Mobile Header */}
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <Link
                href={getLocalizedHref('/')}
                className='flex items-center space-x-2'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600'>
                  <span className='text-sm font-bold text-white'>V</span>
                </div>
                <span className='text-xl font-bold text-gray-900'>Video-IA.net</span>
              </Link>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className='h-5 w-5' />
              </Button>
            </div>

            {/* Mobile Search */}
            <div className='border-b border-gray-200 p-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder={labels.searchPlaceholder}
                  className='w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className='flex-1 overflow-y-auto'>
              <nav className='space-y-4 p-4'>
                <Link
                  href={getLocalizedHref('/discover')}
                  className='block py-2 text-lg font-medium text-gray-900'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.discover}
                </Link>

                <Link
                  href={getLocalizedHref('/categories')}
                  className='block py-2 text-lg font-medium text-gray-900'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.categories}
                </Link>

                <Link
                  href={getLocalizedHref('/audiences')}
                  className='block py-2 text-lg font-medium text-gray-900'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.audiences}
                </Link>

                <Link
                  href={getLocalizedHref('/use-cases')}
                  className='block py-2 text-lg font-medium text-gray-900'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.useCases}
                </Link>

                <Link
                  href={getLocalizedHref('/features')}
                  className='block py-2 text-lg font-medium text-gray-900'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.features}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
