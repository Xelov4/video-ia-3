'use client'

import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Search, Grid, List, ArrowUpDown, Filter, ChevronRight, Star, TrendingUp } from 'lucide-react'
import { SupportedLocale } from '@/middleware'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Separator } from '@/src/components/ui/separator'
import { cn } from '@/src/lib/utils'
import BreadcrumbWrapper from '@/src/components/layout/BreadcrumbWrapper'

interface Category {
  id: number
  name: string
  slug: string | null
  description: string | null
  toolCount: number
  actualToolCount?: number
  displayName: string
  displayDescription?: string
  iconName?: string
  emoji?: string
  isPopular?: boolean
}

interface CategoriesPageClientProps {
  categories: Category[]
  lang: SupportedLocale
  initialSort?: 'name' | 'count'
  initialOrder?: 'asc' | 'desc'
  initialView?: 'grid' | 'list'
}

// Traductions
const getTranslations = (lang: SupportedLocale) => {
  const translations = {
    'en': {
      title: 'AI Tools Categories',
      subtitle: 'Explore tools by category',
      searchPlaceholder: 'Search categories...',
      sortBy: 'Sort by',
      sortName: 'Name',
      sortCount: 'Tool count',
      orderAsc: 'Ascending',
      orderDesc: 'Descending',
      viewGrid: 'Grid view',
      viewList: 'List view',
      topCategories: 'Top Categories',
      allCategories: 'All Categories',
      toolsInCategory: 'tools',
      categoriesFound: 'categories found',
      showMore: 'Show more',
      popularCategories: 'Popular Categories',
      browseAll: 'Browse all categories alphabetically'
    },
    'fr': {
      title: 'Catégories d\'Outils IA',
      subtitle: 'Explorez les outils par catégorie',
      searchPlaceholder: 'Rechercher des catégories...',
      sortBy: 'Trier par',
      sortName: 'Nom',
      sortCount: 'Nombre d\'outils',
      orderAsc: 'Croissant',
      orderDesc: 'Décroissant',
      viewGrid: 'Vue grille',
      viewList: 'Vue liste',
      topCategories: 'Top Catégories',
      allCategories: 'Toutes les Catégories',
      toolsInCategory: 'outils',
      categoriesFound: 'catégories trouvées',
      showMore: 'Voir plus',
      popularCategories: 'Catégories Populaires',
      browseAll: 'Parcourir toutes les catégories par ordre alphabétique'
    },
    'es': {
      title: 'Categorías de Herramientas IA',
      subtitle: 'Explora herramientas por categoría',
      searchPlaceholder: 'Buscar categorías...',
      sortBy: 'Ordenar por',
      sortName: 'Nombre',
      sortCount: 'Número de herramientas',
      orderAsc: 'Ascendente',
      orderDesc: 'Descendente',
      viewGrid: 'Vista grilla',
      viewList: 'Vista lista',
      topCategories: 'Top Categorías',
      allCategories: 'Todas las Categorías',
      toolsInCategory: 'herramientas',
      categoriesFound: 'categorías encontradas',
      showMore: 'Ver más',
      popularCategories: 'Categorías Populares',
      browseAll: 'Explorar todas las categorías alfabéticamente'
    },
    'de': {
      title: 'KI-Tools Kategorien',
      subtitle: 'Tools nach Kategorie erkunden',
      searchPlaceholder: 'Kategorien suchen...',
      sortBy: 'Sortieren nach',
      sortName: 'Name',
      sortCount: 'Anzahl Tools',
      orderAsc: 'Aufsteigend',
      orderDesc: 'Absteigend',
      viewGrid: 'Rasteransicht',
      viewList: 'Listenansicht',
      topCategories: 'Top Kategorien',
      allCategories: 'Alle Kategorien',
      toolsInCategory: 'Tools',
      categoriesFound: 'Kategorien gefunden',
      showMore: 'Mehr anzeigen',
      popularCategories: 'Beliebte Kategorien',
      browseAll: 'Alle Kategorien alphabetisch durchsuchen'
    },
    'it': {
      title: 'Categorie Strumenti IA',
      subtitle: 'Esplora strumenti per categoria',
      searchPlaceholder: 'Cerca categorie...',
      sortBy: 'Ordina per',
      sortName: 'Nome',
      sortCount: 'Numero strumenti',
      orderAsc: 'Crescente',
      orderDesc: 'Decrescente',
      viewGrid: 'Vista griglia',
      viewList: 'Vista lista',
      topCategories: 'Top Categorie',
      allCategories: 'Tutte le Categorie',
      toolsInCategory: 'strumenti',
      categoriesFound: 'categorie trovate',
      showMore: 'Mostra altro',
      popularCategories: 'Categorie Popolari',
      browseAll: 'Sfoglia tutte le categorie alfabeticamente'
    },
    'nl': {
      title: 'AI Tools Categorieën',
      subtitle: 'Verken tools per categorie',
      searchPlaceholder: 'Zoek categorieën...',
      sortBy: 'Sorteer op',
      sortName: 'Naam',
      sortCount: 'Aantal tools',
      orderAsc: 'Oplopend',
      orderDesc: 'Aflopend',
      viewGrid: 'Rasterweergave',
      viewList: 'Lijstweergave',
      topCategories: 'Top Categorieën',
      allCategories: 'Alle Categorieën',
      toolsInCategory: 'tools',
      categoriesFound: 'categorieën gevonden',
      showMore: 'Toon meer',
      popularCategories: 'Populaire Categorieën',
      browseAll: 'Blader door alle categorieën alfabetisch'
    },
    'pt': {
      title: 'Categorias de Ferramentas IA',
      subtitle: 'Explore ferramentas por categoria',
      searchPlaceholder: 'Buscar categorias...',
      sortBy: 'Ordenar por',
      sortName: 'Nome',
      sortCount: 'Número de ferramentas',
      orderAsc: 'Crescente',
      orderDesc: 'Decrescente',
      viewGrid: 'Vista grade',
      viewList: 'Vista lista',
      topCategories: 'Top Categorias',
      allCategories: 'Todas as Categorias',
      toolsInCategory: 'ferramentas',
      categoriesFound: 'categorias encontradas',
      showMore: 'Ver mais',
      popularCategories: 'Categorias Populares',
      browseAll: 'Navegar por todas as categorias alfabeticamente'
    }
  }
  return translations[lang] || translations['en']
}

// Component pour une carte de catégorie
const CategoryCard = ({ category, lang, t, onClick }: { 
  category: Category; 
  lang: SupportedLocale; 
  t: any;
  onClick: () => void;
}) => {
  const toolCount = category.actualToolCount || category.toolCount || 0
  
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1 bg-white"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {category.emoji || category.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="group-hover:text-primary transition-colors text-sm md:text-base line-clamp-1">
                {category.displayName}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">
                {toolCount} {t.toolsInCategory}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 leading-relaxed">
          {category.displayDescription || category.description || `Découvrez les meilleurs outils de ${category.displayName.toLowerCase()}`}
        </p>
      </CardContent>
    </Card>
  )
}

// Component pour le carousel horizontal
const TopCategoriesCarousel = ({ categories, lang, t, onCategoryClick }: {
  categories: Category[];
  lang: SupportedLocale;
  t: any;
  onCategoryClick: (category: Category) => void;
}) => {
  const topCategories = categories
    .sort((a, b) => (b.actualToolCount || b.toolCount || 0) - (a.actualToolCount || a.toolCount || 0))
    .slice(0, 12)

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{t.popularCategories}</h2>
        <Button variant="outline" size="sm">
          {t.showMore}
        </Button>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 md:space-x-6 w-max">
          {topCategories.map((category) => (
            <div key={category.id} className="flex-none w-72 md:w-80">
              <CategoryCard 
                category={category} 
                lang={lang} 
                t={t}
                onClick={() => onCategoryClick(category)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPageClient({
  categories,
  lang,
  initialSort = 'count',
  initialOrder = 'desc',
  initialView = 'grid'
}: CategoriesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'count'>(initialSort)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOrder)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView)
  const [visibleCount, setVisibleCount] = useState(24) // Pour infinite scroll

  const t = getTranslations(lang)

  // Filtrage et tri des catégories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category =>
      category.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.displayDescription || category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.displayName.localeCompare(b.displayName)
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        const aCount = a.actualToolCount || a.toolCount || 0
        const bCount = b.actualToolCount || b.toolCount || 0
        const comparison = aCount - bCount
        return sortOrder === 'asc' ? comparison : -comparison
      }
    })

    return filtered
  }, [categories, searchQuery, sortBy, sortOrder])

  // Grouper par lettres pour l'affichage alphabétique
  const categoriesByLetter = useMemo(() => {
    const groups: { [key: string]: Category[] } = {}
    
    filteredAndSortedCategories.forEach(category => {
      const firstLetter = category.displayName.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(category)
    })

    return Object.keys(groups).sort().map(letter => ({
      letter,
      categories: groups[letter]
    }))
  }, [filteredAndSortedCategories])

  const handleCategoryClick = (category: Category) => {
    const categorySlug = category.slug || category.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
    
    const categoryLink = lang === 'en' 
      ? `/categories/${categorySlug}` 
      : `/${lang}/categories/${categorySlug}`
    
    window.location.href = categoryLink
  }

  const loadMore = () => {
    setVisibleCount(prev => prev + 24)
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      {/* Breadcrumb Navigation */}
      <BreadcrumbWrapper lang={lang} />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{t.title}</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Top Categories Carousel */}
        <TopCategoriesCarousel 
          categories={categories}
          lang={lang}
          t={t}
          onCategoryClick={handleCategoryClick}
        />

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Controls */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-') as ['name' | 'count', 'asc' | 'desc']
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count-desc">{t.sortCount} ({t.orderDesc})</SelectItem>
                <SelectItem value="count-asc">{t.sortCount} ({t.orderAsc})</SelectItem>
                <SelectItem value="name-asc">{t.sortName} ({t.orderAsc})</SelectItem>
                <SelectItem value="name-desc">{t.sortName} ({t.orderDesc})</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            {filteredAndSortedCategories.length} {t.categoriesFound}
          </p>
        </div>

        {/* Categories Display */}
        {viewMode === 'grid' ? (
          /* Grid View avec lettres */
          <div className="space-y-8">
            {categoriesByLetter.slice(0, Math.ceil(visibleCount / 24) * categoriesByLetter.length).map(({ letter, categories: letterCategories }) => (
              <div key={letter}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl font-bold mr-4">
                    {letter}
                  </div>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {letterCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      lang={lang}
                      t={t}
                      onClick={() => handleCategoryClick(category)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredAndSortedCategories.slice(0, visibleCount).map((category) => (
              <Card 
                key={category.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {category.emoji || category.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.displayName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {category.displayDescription || category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {category.actualToolCount || category.toolCount || 0} {t.toolsInCategory}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button pour infinite scroll */}
        {visibleCount < filteredAndSortedCategories.length && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} variant="outline" size="lg">
              {t.showMore}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}