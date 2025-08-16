/**
 * AdvancedFilters - Composant de filtres avancés optimisé
 * 
 * Composant lazy-loaded pour les filtres avancés avec optimisations
 * de performance et rendu conditionnel.
 */

import React, { memo } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'

interface Filters {
  query: string
  audience: string
  useCase: string
  category: string
  minQuality: number
  maxQuality: number
  sortBy: 'relevance' | 'name' | 'created_at' | 'view_count' | 'quality_score'
  sortOrder: 'asc' | 'desc'
  hasImage: boolean
  hasVideo: boolean
  priceRange: 'free' | 'freemium' | 'paid' | 'enterprise' | ''
  platform: 'web' | 'mobile' | 'desktop' | 'api' | ''
  language: string
  tags: string[]
  excludeTags: string[]
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | ''
  minViews: number
  maxViews: number
  filterLogic: 'AND' | 'OR'
  exactMatch: boolean
}

interface AdvancedFiltersProps {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: any) => void
  onReset: () => void
  audiences: Array<{ name: string; count: number }>
  useCases: Array<{ name: string; count: number }>
  categories: Array<{ name: string; actualToolCount?: number; toolCount?: number | null }>
  lang: string
  activeFiltersCount: number
}

const AdvancedFilters = memo(({
  filters,
  onFilterChange,
  onReset,
  audiences,
  useCases,
  categories,
  lang,
  activeFiltersCount
}: AdvancedFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Filtres de base */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {lang === 'fr' ? 'Filtres de Base' : 'Basic Filters'}
        </h4>
        
        {/* Audience */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Audience' : 'Audience'}
          </label>
          <select
            value={filters.audience}
            onChange={(e) => onFilterChange('audience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Toutes les audiences' : 'All audiences'}</option>
            {audiences.map((audience) => (
              <option key={audience.name} value={audience.name}>
                {audience.name} ({audience.count})
              </option>
            ))}
          </select>
        </div>

        {/* Cas d'usage */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Cas d\'usage' : 'Use Case'}
          </label>
          <select
            value={filters.useCase}
            onChange={(e) => onFilterChange('useCase', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Tous les cas d\'usage' : 'All use cases'}</option>
            {useCases.map((useCase) => (
              <option key={useCase.name} value={useCase.name}>
                {useCase.name} ({useCase.count})
              </option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Catégorie' : 'Category'}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Toutes les catégories' : 'All categories'}</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.actualToolCount || category.toolCount || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Score de qualité */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Score de qualité' : 'Quality Score'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              value={filters.minQuality}
              onChange={(e) => onFilterChange('minQuality', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
              {filters.minQuality}+
            </span>
          </div>
        </div>

        {/* Options de contenu */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasImage}
              onChange={(e) => onFilterChange('hasImage', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {lang === 'fr' ? 'Avec image' : 'With image'}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasVideo}
              onChange={(e) => onFilterChange('hasVideo', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {lang === 'fr' ? 'Avec vidéo' : 'With video'}
            </span>
          </label>
        </div>
      </div>

      {/* Section Filtres Avancés */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {lang === 'fr' ? 'Filtres Avancés' : 'Advanced Filters'}
        </h4>
        
        {/* Plage de prix */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Modèle de prix' : 'Pricing Model'}
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Tous les modèles' : 'All models'}</option>
            <option value="free">{lang === 'fr' ? 'Gratuit' : 'Free'}</option>
            <option value="freemium">{lang === 'fr' ? 'Freemium' : 'Freemium'}</option>
            <option value="paid">{lang === 'fr' ? 'Payant' : 'Paid'}</option>
            <option value="enterprise">{lang === 'fr' ? 'Entreprise' : 'Enterprise'}</option>
          </select>
        </div>

        {/* Plateforme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Plateforme' : 'Platform'}
          </label>
          <select
            value={filters.platform}
            onChange={(e) => onFilterChange('platform', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Toutes les plateformes' : 'All platforms'}</option>
            <option value="web">{lang === 'fr' ? 'Web' : 'Web'}</option>
            <option value="mobile">{lang === 'fr' ? 'Mobile' : 'Mobile'}</option>
            <option value="desktop">{lang === 'fr' ? 'Desktop' : 'Desktop'}</option>
            <option value="api">{lang === 'fr' ? 'API' : 'API'}</option>
          </select>
        </div>

        {/* Plage de vues */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Nombre de vues' : 'View Count'}
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minViews || ''}
                onChange={(e) => onFilterChange('minViews', parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxViews === 999999 ? '' : filters.maxViews}
                onChange={(e) => onFilterChange('maxViews', parseInt(e.target.value) || 999999)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Plage de date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Mise à jour' : 'Last Updated'}
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">{lang === 'fr' ? 'Toutes les dates' : 'All dates'}</option>
            <option value="today">{lang === 'fr' ? 'Aujourd\'hui' : 'Today'}</option>
            <option value="week">{lang === 'fr' ? 'Cette semaine' : 'This week'}</option>
            <option value="month">{lang === 'fr' ? 'Ce mois' : 'This month'}</option>
            <option value="quarter">{lang === 'fr' ? 'Ce trimestre' : 'This quarter'}</option>
            <option value="year">{lang === 'fr' ? 'Cette année' : 'This year'}</option>
          </select>
        </div>

        {/* Logique de filtres */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'fr' ? 'Logique des filtres' : 'Filter Logic'}
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filterLogic"
                value="AND"
                checked={filters.filterLogic === 'AND'}
                onChange={(e) => onFilterChange('filterLogic', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {lang === 'fr' ? 'ET (tous)' : 'AND (all)'}
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filterLogic"
                value="OR"
                checked={filters.filterLogic === 'OR'}
                onChange={(e) => onFilterChange('filterLogic', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {lang === 'fr' ? 'OU (au moins un)' : 'OR (at least one)'}
              </span>
            </label>
          </div>
        </div>

        {/* Correspondance exacte */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.exactMatch}
              onChange={(e) => onFilterChange('exactMatch', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {lang === 'fr' ? 'Correspondance exacte' : 'Exact match'}
            </span>
          </label>
        </div>
      </div>

      {/* Bouton réinitialiser */}
      <Button
        variant="outline"
        onClick={onReset}
        className="w-full"
        disabled={activeFiltersCount === 0}
      >
        <X className="w-4 h-4 mr-2" />
        {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
        {activeFiltersCount > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </div>
  )
})

AdvancedFilters.displayName = 'AdvancedFilters'

export default AdvancedFilters
