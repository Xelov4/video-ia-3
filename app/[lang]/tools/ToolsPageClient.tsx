'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Users,
  Zap,
  Heart,
  Bookmark,
} from 'lucide-react';
import { SupportedLocale } from '@/middleware';
import { SafeImage } from '@/src/components/ui/SafeImage';

import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools';
import BreadcrumbWrapper from '@/src/components/layout/BreadcrumbWrapper';
// Phase 3.1: Import de l'adaptateur pour conversion des propriétés
import { adaptToolResponse } from '@/src/types';

interface ToolsPageClientProps {
  lang: SupportedLocale;
  initialSearchParams: Record<string, string | undefined>;
  audiences: Array<{ name: string; count: number }>;
  useCases: Array<{ name: string; count: number }>;
  categories: Array<{
    name: string;
    actualToolCount?: number;
    toolCount?: number | null;
  }>;
  stats: {
    totalTools: number;
    totalCategories: number;
    totalAudiences: number;
    totalUseCases: number;
  };
}

interface Filters {
  query: string;
  audience: string;
  useCase: string;
  category: string;
  minQuality: number;
  sortBy: 'relevance' | 'name' | 'created_at' | 'view_count' | 'quality_score';
  sortOrder: 'asc' | 'desc';
  hasImage: boolean;
  hasVideo: boolean;
  priceRange: 'free' | 'freemium' | 'paid' | 'enterprise' | '';
  featured: boolean;
}

// Component pour une carte d'outil
const ToolCard = ({
  tool,
  lang: _lang,
  onClick,
}: {
  tool: ToolWithTranslation;
  lang: SupportedLocale;
  onClick: () => void;
}) => {
  // Phase 3.1: Application de l'adaptateur pour conversion des propriétés
  const adaptedTool = adaptToolResponse(tool as unknown as Record<string, unknown>);

  const qualityScore = adaptedTool.qualityScore || 0; // ✅ qualityScore
  const viewCount = adaptedTool.views || 0; // ✅ views

  return (
    <Card
      className='group cursor-pointer border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
      onClick={onClick}
    >
      <CardContent className='p-0'>
        {/* Image */}
        <div className='relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100'>
          <SafeImage
            src={adaptedTool.imageUrl || '/images/placeholders/tool-1.jpg'} // ✅ imageUrl
            alt={adaptedTool.displayName || adaptedTool.toolName}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='absolute right-3 top-3'>
            <Badge variant='secondary' className='bg-white/90 text-xs'>
              {tool.toolCategory}
            </Badge>
          </div>
        </div>

        {/* Contenu */}
        <div className='p-4'>
          <div className='mb-2 flex items-start justify-between'>
            <h3 className='line-clamp-1 font-bold text-gray-900 transition-colors group-hover:text-primary'>
              {tool.displayName}
            </h3>
            {qualityScore > 0 && (
              <div className='ml-2 flex items-center'>
                <Star className='mr-1 h-3 w-3 text-yellow-400' />
                <span className='text-xs text-gray-600'>{qualityScore.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className='mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600'>
            {tool.displayOverview ||
              tool.displayDescription ||
              `Discover the power of ${tool.displayName}`}
          </p>

          <div className='flex items-center justify-between'>
            <div className='flex items-center text-xs text-gray-500'>
              <Users className='mr-1 h-3 w-3' />
              <span>
                {viewCount > 0 ? `${viewCount.toLocaleString()} users` : 'New tool'}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <Heart className='h-3 w-3' />
              </Button>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <Bookmark className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ToolsPageClient({
  lang,
  initialSearchParams,
  audiences,
  useCases,
  categories,
  stats: _stats,
}: ToolsPageClientProps) {
  const router = useRouter();

  // Traductions pour l'interface
  const getTranslations = (lang: SupportedLocale) => {
    const translations = {
      en: {
        title: 'AI Tools Directory',
        subtitle: 'Discover 16,765+ AI tools with advanced filters',
        searchPlaceholder: 'Search tools, categories, or features...',
        filters: 'Filters',
        sortBy: 'Sort by',
        sortRelevance: 'Relevance',
        sortName: 'Name',
        sortDate: 'Date Added',
        sortViews: 'Popularity',
        sortQuality: 'Quality',
        orderAsc: 'Ascending',
        orderDesc: 'Descending',
        viewGrid: 'Grid view',
        viewList: 'List view',
        toolsFound: 'tools found',
        showFilters: 'Show Filters',
        hideFilters: 'Hide Filters',
        resetFilters: 'Reset All',
        allCategories: 'All Categories',
        allAudiences: 'All Audiences',
        allUseCases: 'All Use Cases',
        minQuality: 'Minimum Quality',
        pricing: 'Pricing',
        featuredOnly: 'Featured Only',
        withImages: 'With Images',
        withVideos: 'With Videos',
        noResults: 'No tools found',
        noResultsDesc: 'Try adjusting your search terms or filters',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        showingResults: 'Showing',
      },
      fr: {
        title: "Répertoire d'Outils IA",
        subtitle: 'Découvrez 16 765+ outils IA avec des filtres avancés',
        searchPlaceholder: 'Rechercher des outils, catégories ou fonctionnalités...',
        filters: 'Filtres',
        sortBy: 'Trier par',
        sortRelevance: 'Pertinence',
        sortName: 'Nom',
        sortDate: "Date d'ajout",
        sortViews: 'Popularité',
        sortQuality: 'Qualité',
        orderAsc: 'Croissant',
        orderDesc: 'Décroissant',
        viewGrid: 'Vue grille',
        viewList: 'Vue liste',
        toolsFound: 'outils trouvés',
        showFilters: 'Afficher Filtres',
        hideFilters: 'Masquer Filtres',
        resetFilters: 'Tout réinitialiser',
        allCategories: 'Toutes les Catégories',
        allAudiences: 'Toutes les Audiences',
        allUseCases: "Tous les Cas d'usage",
        minQuality: 'Qualité minimum',
        pricing: 'Tarification',
        featuredOnly: 'Vedettes uniquement',
        withImages: 'Avec images',
        withVideos: 'Avec vidéos',
        noResults: 'Aucun outil trouvé',
        noResultsDesc: "Essayez d'ajuster vos termes de recherche ou filtres",
        previous: 'Précédent',
        next: 'Suivant',
        page: 'Page',
        of: 'sur',
        showingResults: 'Affichage de',
      },
      es: {
        title: 'Directorio de Herramientas IA',
        subtitle: 'Descubre 16.765+ herramientas IA con filtros avanzados',
        searchPlaceholder: 'Buscar herramientas, categorías o características...',
        filters: 'Filtros',
        sortBy: 'Ordenar por',
        sortRelevance: 'Relevancia',
        sortName: 'Nombre',
        sortDate: 'Fecha de incorporación',
        sortViews: 'Popularidad',
        sortQuality: 'Calidad',
        orderAsc: 'Ascendente',
        orderDesc: 'Descendente',
        viewGrid: 'Vista grilla',
        viewList: 'Vista lista',
        toolsFound: 'herramientas encontradas',
        showFilters: 'Mostrar Filtros',
        hideFilters: 'Ocultar Filtros',
        resetFilters: 'Reiniciar Todo',
        allCategories: 'Todas las Categorías',
        allAudiences: 'Todas las Audiencias',
        allUseCases: 'Todos los Casos de Uso',
        minQuality: 'Calidad mínima',
        pricing: 'Precios',
        featuredOnly: 'Solo destacados',
        withImages: 'Con imágenes',
        withVideos: 'Con videos',
        noResults: 'No se encontraron herramientas',
        noResultsDesc: 'Intenta ajustar tus términos de búsqueda o filtros',
        previous: 'Anterior',
        next: 'Siguiente',
        page: 'Página',
        of: 'de',
        showingResults: 'Mostrando',
      },
      de: {
        title: 'KI-Tools Verzeichnis',
        subtitle: 'Entdecke 16.765+ KI-Tools mit erweiterten Filtern',
        searchPlaceholder: 'Tools, Kategorien oder Features suchen...',
        filters: 'Filter',
        sortBy: 'Sortieren nach',
        sortRelevance: 'Relevanz',
        sortName: 'Name',
        sortDate: 'Hinzugefügt am',
        sortViews: 'Beliebtheit',
        sortQuality: 'Qualität',
        orderAsc: 'Aufsteigend',
        orderDesc: 'Absteigend',
        viewGrid: 'Rasteransicht',
        viewList: 'Listenansicht',
        toolsFound: 'Tools gefunden',
        showFilters: 'Filter anzeigen',
        hideFilters: 'Filter ausblenden',
        resetFilters: 'Alle zurücksetzen',
        allCategories: 'Alle Kategorien',
        allAudiences: 'Alle Zielgruppen',
        allUseCases: 'Alle Anwendungsfälle',
        minQuality: 'Mindestqualität',
        pricing: 'Preise',
        featuredOnly: 'Nur hervorgehoben',
        withImages: 'Mit Bildern',
        withVideos: 'Mit Videos',
        noResults: 'Keine Tools gefunden',
        noResultsDesc: 'Versuche deine Suchbegriffe oder Filter anzupassen',
        previous: 'Zurück',
        next: 'Weiter',
        page: 'Seite',
        of: 'von',
        showingResults: 'Zeige',
      },
      it: {
        title: 'Directory Strumenti IA',
        subtitle: 'Scopri 16.765+ strumenti IA con filtri avanzati',
        searchPlaceholder: 'Cerca strumenti, categorie o funzionalità...',
        filters: 'Filtri',
        sortBy: 'Ordina per',
        sortRelevance: 'Rilevanza',
        sortName: 'Nome',
        sortDate: 'Data aggiunta',
        sortViews: 'Popolarità',
        sortQuality: 'Qualità',
        orderAsc: 'Crescente',
        orderDesc: 'Decrescente',
        viewGrid: 'Vista griglia',
        viewList: 'Vista lista',
        toolsFound: 'strumenti trovati',
        showFilters: 'Mostra Filtri',
        hideFilters: 'Nascondi Filtri',
        resetFilters: 'Reimposta Tutto',
        allCategories: 'Tutte le Categorie',
        allAudiences: 'Tutti i Pubblici',
        allUseCases: "Tutti i Casi d'uso",
        minQuality: 'Qualità minima',
        pricing: 'Prezzi',
        featuredOnly: 'Solo in evidenza',
        withImages: 'Con immagini',
        withVideos: 'Con video',
        noResults: 'Nessuno strumento trovato',
        noResultsDesc: 'Prova ad aggiustare i termini di ricerca o i filtri',
        previous: 'Precedente',
        next: 'Successivo',
        page: 'Pagina',
        of: 'di',
        showingResults: 'Mostrando',
      },
      nl: {
        title: 'AI Tools Directory',
        subtitle: 'Ontdek 16.765+ AI-tools met geavanceerde filters',
        searchPlaceholder: 'Zoek tools, categorieën of functies...',
        filters: 'Filters',
        sortBy: 'Sorteer op',
        sortRelevance: 'Relevantie',
        sortName: 'Naam',
        sortDate: 'Toegevoegd op',
        sortViews: 'Populariteit',
        sortQuality: 'Kwaliteit',
        orderAsc: 'Oplopend',
        orderDesc: 'Aflopend',
        viewGrid: 'Rasterweergave',
        viewList: 'Lijstweergave',
        toolsFound: 'tools gevonden',
        showFilters: 'Toon Filters',
        hideFilters: 'Verberg Filters',
        resetFilters: 'Alles resetten',
        allCategories: 'Alle Categorieën',
        allAudiences: 'Alle Doelgroepen',
        allUseCases: 'Alle Use Cases',
        minQuality: 'Minimale kwaliteit',
        pricing: 'Prijzen',
        featuredOnly: 'Alleen uitgelicht',
        withImages: 'Met afbeeldingen',
        withVideos: "Met video's",
        noResults: 'Geen tools gevonden',
        noResultsDesc: 'Probeer je zoektermen of filters aan te passen',
        previous: 'Vorige',
        next: 'Volgende',
        page: 'Pagina',
        of: 'van',
        showingResults: 'Tonen van',
      },
      pt: {
        title: 'Diretório de Ferramentas IA',
        subtitle: 'Descubra 16.765+ ferramentas IA com filtros avançados',
        searchPlaceholder: 'Buscar ferramentas, categorias ou recursos...',
        filters: 'Filtros',
        sortBy: 'Ordenar por',
        sortRelevance: 'Relevância',
        sortName: 'Nome',
        sortDate: 'Data de adição',
        sortViews: 'Popularidade',
        sortQuality: 'Qualidade',
        orderAsc: 'Crescente',
        orderDesc: 'Decrescente',
        viewGrid: 'Vista grade',
        viewList: 'Vista lista',
        toolsFound: 'ferramentas encontradas',
        showFilters: 'Mostrar Filtros',
        hideFilters: 'Ocultar Filtros',
        resetFilters: 'Redefinir Tudo',
        allCategories: 'Todas as Categorias',
        allAudiences: 'Todas as Audiências',
        allUseCases: 'Todos os Casos de Uso',
        minQuality: 'Qualidade mínima',
        pricing: 'Preços',
        featuredOnly: 'Apenas em destaque',
        withImages: 'Com imagens',
        withVideos: 'Com vídeos',
        noResults: 'Nenhuma ferramenta encontrada',
        noResultsDesc: 'Tente ajustar seus termos de busca ou filtros',
        previous: 'Anterior',
        next: 'Próximo',
        page: 'Página',
        of: 'de',
        showingResults: 'Mostrando',
      },
    };
    return translations[lang] || translations['en'];
  };

  const t = getTranslations(lang);

  // État des filtres
  const [filters, setFilters] = useState<Filters>({
    query: initialSearchParams.search || '',
    audience: initialSearchParams.audience || '',
    useCase: initialSearchParams.useCase || '',
    category: initialSearchParams.category || '',
    minQuality: parseInt(initialSearchParams.minQuality || '0'),
    sortBy: (initialSearchParams.sort as Filters['sortBy']) || 'created_at',
    sortOrder: (initialSearchParams.order as 'asc' | 'desc') || 'desc',
    hasImage: initialSearchParams.hasImage === 'true',
    hasVideo: initialSearchParams.hasVideo === 'true',
    priceRange: (initialSearchParams.priceRange as Filters['priceRange']) || '',
    featured: initialSearchParams.featured === 'true',
  });

  // Constantes pour la pagination
  const ITEMS_PER_PAGE = 24;

  // État des résultats
  const [tools, setTools] = useState<ToolWithTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(initialSearchParams.page || '1')
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (initialSearchParams.view as 'grid' | 'list') || 'grid'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Calcul des variables de pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Fonction pour obtenir le lien localisé d'un outil
  const getLocalizedHref = useCallback(
    (tool: ToolWithTranslation) => {
      const slug = tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-');
      return lang === 'en' ? `/t/${slug}` : `/${lang}/t/${slug}`;
    },
    [lang]
  );

  // Fonction de recherche via l'API
  const searchTools = useCallback(
    async (newFilters: Filters, page: number = 1) => {
      setLoading(true);
      try {
        // Build the search URL
        const params = new URLSearchParams({
          lang,
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        // Add filters if they exist
        if (newFilters.query) params.set('query', newFilters.query);
        if (newFilters.audience && newFilters.audience !== 'all_audiences')
          params.set('audience', newFilters.audience);
        if (newFilters.useCase && newFilters.useCase !== 'all_usecases')
          params.set('useCase', newFilters.useCase);
        if (newFilters.category && newFilters.category !== 'all_categories')
          params.set('category', newFilters.category);
        if (newFilters.minQuality > 0)
          params.set('minQualityScore', newFilters.minQuality.toString());
        if (newFilters.hasImage) params.set('hasImageUrl', 'true');
        if (newFilters.hasVideo) params.set('hasVideoUrl', 'true');
        if (newFilters.featured) params.set('featured', 'true');
        if (newFilters.priceRange)
          // ✅ Simplification de la condition
          params.set('priceRange', newFilters.priceRange);
        if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
        if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);

        // Fetch results from the API endpoint
        const response = await fetch(`/api/tools/search?${params.toString()}`);
        if (!response.ok) throw new Error('Search request failed');

        const data = await response.json();

        if (data.success && data.data) {
          setTools(data.data);
          setTotalCount(data.meta.pagination.totalCount);
          setCurrentPage(page);
        } else {
          console.error('API returned error:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  // Gestion des changements de filtres
  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string | number | boolean) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      searchTools(newFilters, 1);
    },
    [filters, searchTools]
  );

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    const resetFilters: Filters = {
      query: '',
      audience: '',
      useCase: '',
      category: '',
      minQuality: 0,
      sortBy: 'created_at',
      sortOrder: 'desc',
      hasImage: false,
      hasVideo: false,
      priceRange: '',
      featured: false,
    };
    setFilters(resetFilters);
    searchTools(resetFilters, 1);
  }, [searchTools]);

  // Gestion du changement de page
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        searchTools(filters, page);
      }
    },
    [totalPages, filters, searchTools]
  );

  // Gestion du clic sur un outil
  const handleToolClick = useCallback(
    (tool: ToolWithTranslation) => {
      const href = getLocalizedHref(tool);
      router.push(href);
    },
    [getLocalizedHref, router]
  );

  // Effect pour la recherche initiale
  useEffect(() => {
    searchTools(filters, currentPage);
  }, [searchTools, filters, currentPage]);

  // Filtres actifs
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== 0 && value !== false;
  }).length;

  return (
    <div className='min-h-screen bg-background pt-20 md:pt-24'>
      {/* Breadcrumb Navigation */}
      <BreadcrumbWrapper lang={lang} />

      <div className='container mx-auto px-4 py-8 md:py-12'>
        {/* Header */}
        <div className='mb-8 text-center md:mb-12'>
          <h1 className='mb-3 text-2xl font-bold md:mb-4 md:text-4xl'>{t.title}</h1>
          <p className='mx-auto max-w-2xl text-sm text-muted-foreground md:text-lg'>
            {t.subtitle}
          </p>
        </div>

        {/* Search and Controls */}
        <div className='mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-md flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t.searchPlaceholder}
                value={filters.query}
                onChange={e => handleFilterChange('query', e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Sort Controls */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={value => {
                const [newSortBy, newSortOrder] = value.split('-') as [
                  Filters['sortBy'],
                  'asc' | 'desc',
                ];
                setFilters(prev => ({
                  ...prev,
                  sortBy: newSortBy,
                  sortOrder: newSortOrder,
                }));
                searchTools(
                  { ...filters, sortBy: newSortBy, sortOrder: newSortOrder },
                  1
                );
              }}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder={`${t.sortBy}...`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='created_at-desc'>
                  {t.sortDate} ({t.orderDesc})
                </SelectItem>
                <SelectItem value='created_at-asc'>
                  {t.sortDate} ({t.orderAsc})
                </SelectItem>
                <SelectItem value='view_count-desc'>
                  {t.sortViews} ({t.orderDesc})
                </SelectItem>
                <SelectItem value='view_count-asc'>
                  {t.sortViews} ({t.orderAsc})
                </SelectItem>
                <SelectItem value='quality_score-desc'>
                  {t.sortQuality} ({t.orderDesc})
                </SelectItem>
                <SelectItem value='quality_score-asc'>
                  {t.sortQuality} ({t.orderAsc})
                </SelectItem>
                <SelectItem value='name-asc'>
                  {t.sortName} ({t.orderAsc})
                </SelectItem>
                <SelectItem value='name-desc'>
                  {t.sortName} ({t.orderDesc})
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className='flex overflow-hidden rounded-lg border'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='rounded-none'
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='rounded-none'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              size='sm'
              className='lg:hidden'
            >
              <Filter className='mr-2 h-4 w-4' />
              {t.filters}
              {activeFiltersCount > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className='mb-6'>
          <p className='text-sm text-muted-foreground'>
            {totalCount.toLocaleString()} {t.toolsFound}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className='flex gap-6'>
          {/* Filter Sidebar */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className='sticky top-24'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center'>
                      <Filter className='mr-2 h-5 w-5' />
                      {t.filters}
                    </CardTitle>
                    {activeFiltersCount > 0 && (
                      <Button variant='ghost' size='sm' onClick={resetFilters}>
                        {t.resetFilters}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Category Filter */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      {t.allCategories}
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={value => handleFilterChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.allCategories} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all_categories'>
                          {t.allCategories}
                        </SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name} (
                            {category.actualToolCount || category.toolCount || 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Audience Filter */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      {t.allAudiences}
                    </label>
                    <Select
                      value={filters.audience}
                      onValueChange={value => handleFilterChange('audience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.allAudiences} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all_audiences'>{t.allAudiences}</SelectItem>
                        {audiences.map(audience => (
                          <SelectItem key={audience.name} value={audience.name}>
                            {audience.name} ({audience.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Use Case Filter */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      {t.allUseCases}
                    </label>
                    <Select
                      value={filters.useCase}
                      onValueChange={value => handleFilterChange('useCase', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.allUseCases} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all_usecases'>{t.allUseCases}</SelectItem>
                        {useCases.map(useCase => (
                          <SelectItem key={useCase.name} value={useCase.name}>
                            {useCase.name} ({useCase.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quality Filter */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      {t.minQuality}
                    </label>
                    <Select
                      value={filters.minQuality.toString()}
                      onValueChange={value =>
                        handleFilterChange('minQuality', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`${t.sortBy}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Any Quality</SelectItem>
                        <SelectItem value='50'>5.0+ ⭐</SelectItem>
                        <SelectItem value='60'>6.0+ ⭐⭐</SelectItem>
                        <SelectItem value='70'>7.0+ ⭐⭐⭐</SelectItem>
                        <SelectItem value='80'>8.0+ ⭐⭐⭐⭐</SelectItem>
                        <SelectItem value='90'>9.0+ ⭐⭐⭐⭐⭐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Filter */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      {t.pricing}
                    </label>
                    <Select
                      value={filters.priceRange}
                      onValueChange={value => handleFilterChange('priceRange', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='All Pricing' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all_pricing'>All Pricing</SelectItem>
                        <SelectItem value='free'>Free</SelectItem>
                        <SelectItem value='freemium'>Freemium</SelectItem>
                        <SelectItem value='paid'>Paid</SelectItem>
                        <SelectItem value='enterprise'>Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Feature Toggles */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium text-gray-700'>
                        {t.featuredOnly}
                      </label>
                      <Button
                        variant={filters.featured ? 'default' : 'outline'}
                        size='sm'
                        onClick={() =>
                          handleFilterChange('featured', !filters.featured)
                        }
                      >
                        <Star className='mr-1 h-3 w-3' />
                        {filters.featured ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium text-gray-700'>
                        {t.withImages}
                      </label>
                      <Button
                        variant={filters.hasImage ? 'default' : 'outline'}
                        size='sm'
                        onClick={() =>
                          handleFilterChange('hasImage', !filters.hasImage)
                        }
                      >
                        {/* Eye icon was removed, using Zap for video */}
                        {filters.hasImage ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium text-gray-700'>
                        {t.withVideos}
                      </label>
                      <Button
                        variant={filters.hasVideo ? 'default' : 'outline'}
                        size='sm'
                        onClick={() =>
                          handleFilterChange('hasVideo', !filters.hasVideo)
                        }
                      >
                        <Zap className='mr-1 h-3 w-3' />
                        {filters.hasVideo ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Tools Display */}
          <main className='flex-1'>
            {loading ? (
              <div className='py-12 text-center'>
                <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
                <p className='text-muted-foreground'>Loading tools...</p>
              </div>
            ) : tools.length === 0 ? (
              <div className='py-12 text-center'>
                <div className='mx-auto mb-4 h-16 w-16 text-muted-foreground'>
                  <Search className='h-full w-full' />
                </div>
                <h3 className='mb-2 text-xl font-semibold'>{t.noResults}</h3>
                <p className='mb-4 text-muted-foreground'>{t.noResultsDesc}</p>
                <Button variant='outline' onClick={resetFilters}>
                  {t.resetFilters}
                </Button>
              </div>
            ) : (
              <>
                {/* Tools Grid */}
                {viewMode === 'grid' ? (
                  <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
                    {tools.map(tool => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        lang={lang}
                        onClick={() => handleToolClick(tool)}
                      />
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className='mb-8 space-y-4'>
                    {tools.map(tool => {
                      // Phase 3.1: Application de l'adaptateur pour conversion des propriétés
                      const adaptedTool = adaptToolResponse(
                        tool as unknown as Record<string, unknown>
                      );

                      return (
                        <Card
                          key={tool.id}
                          className='cursor-pointer transition-shadow hover:shadow-md'
                          onClick={() => handleToolClick(tool)}
                        >
                          <CardContent className='p-4'>
                            <div className='flex gap-4'>
                              <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                                <SafeImage
                                  src={
                                    adaptedTool.imageUrl || // ✅ imageUrl depuis l'outil adapté
                                    '/images/placeholders/ai-placeholder.jpg'
                                  }
                                  alt={adaptedTool.displayName || adaptedTool.toolName}
                                  className='h-full w-full object-cover'
                                />
                              </div>
                              <div className='flex-1'>
                                <div className='mb-2 flex items-start justify-between'>
                                  <h3 className='font-semibold text-gray-900 transition-colors hover:text-primary'>
                                    {adaptedTool.displayName || adaptedTool.toolName}
                                  </h3>
                                  <div className='flex items-center space-x-2'>
                                    {adaptedTool.qualityScore && ( // ✅ qualityScore depuis l'outil adapté
                                      <div className='flex items-center'>
                                        <Star className='mr-1 h-3 w-3 text-yellow-400' />
                                        <span className='text-sm text-gray-600'>
                                          {adaptedTool.qualityScore.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                    <Badge variant='secondary' className='text-xs'>
                                      {adaptedTool.toolCategory}
                                    </Badge>
                                  </div>
                                </div>
                                <p className='mb-2 line-clamp-2 text-sm text-gray-600'>
                                  {adaptedTool.displayOverview ||
                                    adaptedTool.toolDescription}
                                </p>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center text-sm text-gray-500'>
                                    <Users className='mr-1 h-3 w-3' />
                                    <span>{adaptedTool.views || 0} users</span>{' '}
                                    {/* ✅ views depuis l'outil adapté */}
                                  </div>
                                  <div className='text-sm font-medium text-primary hover:underline'>
                                    Learn More →
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-8 flex items-center justify-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                    >
                      {/* ChevronLeft icon was removed */}
                      {t.previous}
                    </Button>

                    <div className='flex items-center gap-1'>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        if (totalPages <= 5) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => handlePageChange(page)}
                              className='min-w-[40px]'
                            >
                              {page}
                            </Button>
                          );
                        }

                        // Complex pagination logic for many pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => handlePageChange(page)}
                              className='min-w-[40px]'
                            >
                              {page}
                            </Button>
                          );
                        }

                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className='px-2'>
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                    >
                      {t.next}
                      {/* ChevronRight icon was removed */}
                    </Button>
                  </div>
                )}

                {/* Info pagination */}
                <div className='mt-4 text-center text-sm text-muted-foreground'>
                  {t.showingResults} {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} {t.of}{' '}
                  {totalCount.toLocaleString()} {t.toolsFound}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
