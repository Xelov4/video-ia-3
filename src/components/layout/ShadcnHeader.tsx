'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, Sparkles, Globe, Filter, Star, Zap, Bot } from 'lucide-react';
import { SupportedLocale } from '@/middleware';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/src/components/ui/sheet';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/src/lib/utils';

interface ShadcnHeaderProps {
  currentLanguage: SupportedLocale;
  totalTools?: number;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
] as const;

export default function ShadcnHeader({
  currentLanguage,
  totalTools = 16765,
}: ShadcnHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isScrolled, setIsScrolled] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchPath =
        currentLanguage === 'en'
          ? `/tools?search=${encodeURIComponent(searchQuery.trim())}`
          : `/${currentLanguage}/tools?search=${encodeURIComponent(searchQuery.trim())}`;
      router.push(searchPath);
      setSearchQuery('');
    }
  };

  const getLocalizedPath = (path: string) => {
    return currentLanguage === 'en' ? path : `/${currentLanguage}${path}`;
  };

  const isActivePath = (path: string) => {
    const localizedPath = getLocalizedPath(path);
    return pathname === localizedPath || pathname.startsWith(localizedPath + '/');
  };

  // Traductions pour la navigation
  const navTranslations = {
    en: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categories',
      audiences: 'Audiences',
      useCases: 'Use Cases',
      blog: 'Blog',
    },
    fr: {
      home: 'Accueil',
      tools: 'Outils IA',
      categories: 'Catégories',
      audiences: 'Audiences',
      useCases: "Cas d'usage",
      blog: 'Blog',
    },
    it: {
      home: 'Home',
      tools: 'Strumenti IA',
      categories: 'Categorie',
      audiences: 'Pubblico',
      useCases: "Casi d'uso",
      blog: 'Blog',
    },
    es: {
      home: 'Inicio',
      tools: 'Herramientas IA',
      categories: 'Categorías',
      audiences: 'Audiencias',
      useCases: 'Casos de uso',
      blog: 'Blog',
    },
    de: {
      home: 'Startseite',
      tools: 'KI-Tools',
      categories: 'Kategorien',
      audiences: 'Zielgruppen',
      useCases: 'Anwendungsfälle',
      blog: 'Blog',
    },
    nl: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categorieën',
      audiences: 'Doelgroepen',
      useCases: 'Use Cases',
      blog: 'Blog',
    },
    pt: {
      home: 'Início',
      tools: 'Ferramentas IA',
      categories: 'Categorias',
      audiences: 'Audiência',
      useCases: 'Casos de uso',
      blog: 'Blog',
    },
  };

  const t = navTranslations[currentLanguage] || navTranslations['en'];

  const navigation = [
    {
      name: t.home,
      href: getLocalizedPath('/'),
      icon: Sparkles,
      active: pathname === '/' || pathname === `/${currentLanguage}`,
    },
    {
      name: t.tools,
      href: getLocalizedPath('/tools'),
      icon: Bot,
      active: isActivePath('/tools'),
    },
    {
      name: t.categories,
      href: getLocalizedPath('/categories'),
      icon: Filter,
      active: isActivePath('/categories') || isActivePath('/c'),
    },
    {
      name: t.audiences,
      href: getLocalizedPath('/audiences'),
      icon: Star,
      active: isActivePath('/audiences') || isActivePath('/for'),
    },
    {
      name: t.useCases,
      href: getLocalizedPath('/use-cases'),
      icon: Zap,
      active: isActivePath('/use-cases'),
    },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-200',
        'border-b border-slate-800 bg-slate-900 shadow-lg'
      )}
    >
      {/* Top bar with stats */}
      <div className='bg-slate-800 text-white'>
        <div className='container mx-auto px-4 py-1'>
          <div className='flex items-center justify-center space-x-4 text-xs font-medium'>
            <div className='flex items-center space-x-1'>
              <Zap className='h-3 w-3' />
              <span>
                {totalTools.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} AI Tools
              </span>
            </div>
            <Separator orientation='vertical' className='h-3 bg-white/30' />
            <div className='flex items-center space-x-1'>
              <Star className='h-3 w-3' />
              <span>New tools added daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className='container mx-auto bg-slate-900 px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href={getLocalizedPath('/')} className='flex items-center space-x-3'>
            <div className='relative'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg'>
                <Sparkles className='h-5 w-5 text-white' />
              </div>
              <div className='absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-green-500' />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-xl font-bold text-white'>Video-IA.net</h1>
              <Badge
                variant='secondary'
                className='border-blue-500 bg-blue-600 text-xs text-white'
              >
                {Math.floor(totalTools / 1000)}K+ Tools
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden items-center space-x-1 lg:flex'>
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                    item.active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className='flex items-center space-x-4'>
            <form onSubmit={handleSearch} className='hidden md:block'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <Input
                  type='search'
                  placeholder='Rechercher des outils IA...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-64 border-slate-700 bg-slate-800 pl-9 text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-slate-700'
                />
              </div>
            </form>

            {/* Language Selector - Stylé avec shadcn */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='min-w-[120px] justify-start space-x-2 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white'
                >
                  <span className='text-lg'>{currentLang?.flag}</span>
                  <span className='hidden font-medium sm:block'>
                    {currentLang?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 border-slate-700 bg-slate-800 p-2'
              >
                <div className='mb-1 px-2 py-1 text-xs font-medium text-slate-400'>
                  {currentLanguage === 'en'
                    ? 'Choose language'
                    : currentLanguage === 'fr'
                      ? 'Choisir la langue'
                      : currentLanguage === 'es'
                        ? 'Elegir idioma'
                        : currentLanguage === 'de'
                          ? 'Sprache wählen'
                          : currentLanguage === 'it'
                            ? 'Scegli lingua'
                            : currentLanguage === 'nl'
                              ? 'Kies taal'
                              : currentLanguage === 'pt'
                                ? 'Escolher idioma'
                                : 'Choose language'}
                </div>
                <Separator className='mb-2 bg-slate-700' />
                {languages.map(lang => (
                  <DropdownMenuItem key={lang.code} asChild>
                    <Link
                      href={lang.code === 'en' ? '/' : `/${lang.code}`}
                      className={cn(
                        'flex w-full cursor-pointer items-center space-x-3 rounded-md px-2 py-2 transition-colors',
                        lang.code === currentLanguage && 'bg-blue-600 text-white',
                        lang.code !== currentLanguage &&
                          'text-slate-200 hover:bg-slate-700'
                      )}
                    >
                      <span className='text-lg'>{lang.flag}</span>
                      <div className='flex-1'>
                        <div className='font-medium'>{lang.name}</div>
                        <div className='text-xs text-slate-400'>
                          {lang.code.toUpperCase()}
                        </div>
                      </div>
                      {lang.code === currentLanguage && (
                        <Badge
                          variant='secondary'
                          className='bg-blue-500 text-xs text-white'
                        >
                          Active
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-white hover:bg-slate-800 lg:hidden'
                >
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-80'>
                <div className='flex flex-col space-y-6 py-6'>
                  {/* Logo in mobile */}
                  <Link
                    href={getLocalizedPath('/')}
                    className='flex items-center space-x-3'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'>
                      <Sparkles className='h-4 w-4 text-white' />
                    </div>
                    <span className='text-lg font-bold'>Video-IA.net</span>
                  </Link>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        type='search'
                        placeholder='Rechercher...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className='pl-9'
                      />
                    </div>
                  </form>

                  <Separator />

                  {/* Mobile Navigation */}
                  <nav className='flex flex-col space-y-2'>
                    {navigation.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                            item.active
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <Icon className='h-4 w-4' />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <Separator />

                  {/* Mobile Language Selector */}
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-slate-600'>Langue</h4>
                    <div className='grid grid-cols-2 gap-2'>
                      {languages.map(lang => (
                        <Link
                          key={lang.code}
                          href={lang.code === 'en' ? '/' : `/${lang.code}`}
                          className={cn(
                            'flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors',
                            lang.code === currentLanguage
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
