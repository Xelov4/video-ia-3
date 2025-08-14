/**
 * Complete Admin Tool Edit Page - Refactored Version
 * 
 * Features:
 * - Full tool information display (all fields)
 * - Categories and tags management 
 * - Multilingual translation system
 * - Real-time data loading and validation
 * - Comprehensive error handling
 * - Next.js 15 compatibility
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  EyeIcon,
  GlobeAltIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { LanguageTabs, type Language, type TranslationStatus } from '@/src/components/admin/LanguageTabs'
import { TranslationForm, type ToolTranslation, type BaseToolData } from '@/src/components/admin/TranslationForm'
import { LanguageSection } from '@/src/components/admin/LanguageSection'

// Types
interface Tool {
  id: number
  tool_name: string
  tool_category: string
  tool_link: string
  overview: string
  tool_description: string
  target_audience: string
  key_features: string
  use_cases: string
  tags: string
  image_url: string
  slug: string
  is_active: boolean
  featured: boolean
  quality_score: number
  meta_title: string
  meta_description: string
  seo_keywords: string
  view_count: number
  click_count: number
  favorite_count: number
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  tool_count?: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

// Supported languages
const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true, isBase: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', enabled: true }
]

export default function AdminToolEditPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Resolve params properly for Next.js 15
  const [toolId, setToolId] = useState<number | null>(null)

  // Core data states
  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [translations, setTranslations] = useState<Record<string, ToolTranslation>>({})
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Translation status tracking
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationStatus>>({})

  // Resolve params on component mount
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        const id = parseInt(resolvedParams.id)
        if (!isNaN(id)) {
          setToolId(id)
        } else {
          setError('ID d\'outil invalide')
        }
      } catch (err) {
        setError('Erreur lors de la résolution des paramètres')
      }
    }

    resolveParams()
  }, [params])

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Data fetching
  useEffect(() => {
    if (session && toolId) {
      fetchToolData(toolId)
      fetchCategories()
    }
  }, [session, toolId])

  // Update translation status when translations change
  useEffect(() => {
    updateTranslationStatus()
  }, [translations])

  /**
   * Fetch complete tool data including all fields
   */
  const fetchToolData = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Fetching tool data for ID: ${id}`)
      
      // Fetch main tool data
      const toolResponse = await fetch(`/api/tools/${id}`)
      if (!toolResponse.ok) {
        if (toolResponse.status === 404) {
          throw new Error('Outil non trouvé')
        }
        throw new Error(`Erreur HTTP: ${toolResponse.status}`)
      }
      
      const toolData = await toolResponse.json()
      console.log('Tool data received:', toolData)

      if (!toolData.success || !toolData.tool) {
        throw new Error(toolData.error || 'Données d\'outil invalides')
      }

      setTool(toolData.tool)

      // Fetch all translations
      await fetchTranslations(id)
      
    } catch (error) {
      console.error('Error fetching tool:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'outil')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch all translations for the tool
   */
  const fetchTranslations = async (id: number) => {
    try {
      console.log(`Fetching translations for tool ID: ${id}`)
      
      const response = await fetch(`/api/tools/${id}/translations`)
      if (response.ok) {
        const data = await response.json()
        console.log('Translations received:', data)
        
        const translationsMap: Record<string, ToolTranslation> = {}
        
        if (data.translations && Array.isArray(data.translations)) {
          data.translations.forEach((translation: any) => {
            translationsMap[translation.languageCode] = {
              id: translation.id,
              toolId: translation.toolId,
              languageCode: translation.languageCode,
              name: translation.name,
              overview: translation.overview || '',
              description: translation.description || '',
              metaTitle: translation.metaTitle || '',
              metaDescription: translation.metaDescription || '',
              translationSource: translation.translationSource || 'auto',
              qualityScore: translation.qualityScore || 0,
              humanReviewed: translation.humanReviewed || false,
              createdAt: translation.createdAt,
              updatedAt: translation.updatedAt
            }
          })
        }
        
        setTranslations(translationsMap)
        console.log('Translations map created:', translationsMap)
      } else {
        console.warn('Failed to fetch translations:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching translations:', error)
    }
  }

  /**
   * Fetch all available categories
   */
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories')
      
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        console.log('Categories received:', data)
        
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        }
      } else {
        console.warn('Failed to fetch categories:', response.status)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  /**
   * Update translation completion status for each language
   */
  const updateTranslationStatus = () => {
    const status: Record<string, TranslationStatus> = {}
    
    LANGUAGES.forEach(language => {
      const translation = translations[language.code]
      if (translation) {
        const fields = ['name', 'overview', 'description', 'metaTitle', 'metaDescription']
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof ToolTranslation]
          return typeof value === 'string' && value.trim().length > 0
        })
        
        const completionPercentage = Math.round((filledFields.length / fields.length) * 100)
        
        status[language.code] = {
          isComplete: completionPercentage === 100,
          completionPercentage,
          hasChanges: hasUnsavedChanges,
          isHumanReviewed: translation.humanReviewed,
          qualityScore: translation.qualityScore
        }
      } else {
        status[language.code] = {
          isComplete: false,
          completionPercentage: 0,
          hasChanges: false,
          isHumanReviewed: false,
          qualityScore: 0
        }
      }
    })
    
    setTranslationStatus(status)
  }

  /**
   * Handle changes to main tool data
   */
  const handleToolChange = useCallback((updatedTool: Partial<Tool>) => {
    if (!tool) return
    
    console.log('Tool change:', updatedTool)
    setTool({ ...tool, ...updatedTool })
    setHasUnsavedChanges(true)
  }, [tool])

  /**
   * Handle changes to translation data
   */
  const handleTranslationChange = useCallback((translation: ToolTranslation) => {
    console.log('Translation change:', translation)
    setTranslations(prev => ({
      ...prev,
      [translation.languageCode]: translation
    }))
    setHasUnsavedChanges(true)
  }, [])

  /**
   * Save all changes (tool + translations)
   */
  const handleSave = async () => {
    if (!tool || !toolId) return

    setSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      console.log('Saving tool and translations...')

      // Save main tool data (exclude system fields)
      const { id, created_at, updated_at, last_checked_at, ...toolDataToSave } = tool
      const toolResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolDataToSave),
      })

      if (!toolResponse.ok) {
        const errorData = await toolResponse.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde de l\'outil principal')
      }

      // Save all translations
      const translationPromises = Object.values(translations).map(async (translation) => {
        const endpoint = translation.id 
          ? `/api/tools/${toolId}/translations/${translation.id}`
          : `/api/tools/${toolId}/translations`
        
        const method = translation.id ? 'PUT' : 'POST'
        
        console.log(`Saving translation (${method}):`, endpoint, translation)
        
        return fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(translation),
        })
      })

      const translationResults = await Promise.allSettled(translationPromises)
      const failedTranslations = translationResults.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.ok)
      ).length

      if (failedTranslations > 0) {
        setSaveMessage({
          type: 'error',
          text: `Outil sauvegardé, mais ${failedTranslations} traduction(s) ont échoué`
        })
      } else {
        setSaveMessage({
          type: 'success',
          text: 'Outil et traductions sauvegardés avec succès'
        })
        setHasUnsavedChanges(false)
        
        // Refresh translations to get IDs for new translations
        if (toolId) {
          await fetchTranslations(toolId)
        }
      }

    } catch (error) {
      console.error('Error saving:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Delete the tool
   */
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet outil et toutes ses traductions ?')) {
      return
    }

    if (!toolId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      router.push('/admin/tools?message=Outil supprimé avec succès')
    } catch (error) {
      console.error('Error deleting tool:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Generate automatic translation
   */
  const handleAutoTranslate = async (targetLanguage: string) => {
    if (!tool || !toolId) return

    try {
      const response = await fetch(`/api/tools/${toolId}/translations/auto-translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetLanguage,
          baseData: {
            name: tool.tool_name,
            overview: tool.overview,
            description: tool.tool_description,
            metaTitle: tool.meta_title,
            metaDescription: tool.meta_description
          }
        }),
      })

      if (response.ok) {
        const translatedData = await response.json()
        handleTranslationChange(translatedData.translation)
        setSaveMessage({
          type: 'success',
          text: `Traduction automatique générée pour ${targetLanguage.toUpperCase()}`
        })
      } else {
        throw new Error('Échec de la traduction automatique')
      }
    } catch (error) {
      console.error('Auto-translation failed:', error)
      setSaveMessage({
        type: 'error',
        text: 'Échec de la traduction automatique'
      })
    }
  }

  /**
   * Copy content from base language
   */
  const handleCopyFromBase = (targetLanguage: string) => {
    if (!tool) return

    const baseTranslation: ToolTranslation = {
      toolId: tool.id,
      languageCode: targetLanguage,
      name: tool.tool_name,
      overview: tool.overview || '',
      description: tool.tool_description || '',
      metaTitle: tool.meta_title || '',
      metaDescription: tool.meta_description || '',
      translationSource: 'imported',
      qualityScore: 5,
      humanReviewed: false
    }

    handleTranslationChange(baseTranslation)
    setSaveMessage({
      type: 'success',
      text: `Contenu copié depuis la langue de base vers ${targetLanguage.toUpperCase()}`
    })
  }

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const interval = setInterval(() => {
      handleSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [hasUnsavedChanges, tool, translations])

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Loading state
  if (status === 'loading' || loading || !toolId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null
  }

  // Tool not found
  if (!tool) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
          <p className="text-gray-600 mb-4">
            {error || "L'outil demandé n'existe pas ou vous n'avez pas les permissions pour y accéder."}
          </p>
          <Link href="/admin/tools" className="text-blue-600 hover:text-blue-800">
            Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/tools"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Modifier l'outil #{tool.id}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <p className="text-gray-600">{tool.tool_name}</p>
                  {tool.tool_category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FolderIcon className="w-3 h-3 mr-1" />
                      {tool.tool_category}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                      Modifications non sauvegardées
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {tool.tool_link && (
                <a
                  href={tool.tool_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Voir l'outil
                </a>
              )}
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Supprimer
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 mr-2 animate-pulse" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={saveMessage.type === 'success' ? 'text-green-800' : 'text-yellow-800'}>
              {saveMessage.text}
            </p>
            <button
              onClick={() => setSaveMessage(null)}
              className={saveMessage.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tool Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Vues</div>
            <div className="text-2xl font-bold text-gray-900">{tool.view_count.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Clics</div>
            <div className="text-2xl font-bold text-gray-900">{tool.click_count.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Favoris</div>
            <div className="text-2xl font-bold text-gray-900">{tool.favorite_count.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Score qualité</div>
            <div className="text-2xl font-bold text-gray-900">{tool.quality_score}/100</div>
          </div>
        </div>

        {/* Main Form Content - Base Language First */}
        <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-lg mr-2">🇺🇸</span>
                Informations de base (English - Langue de référence)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'outil *
                  </label>
                  <input
                    type="text"
                    value={tool.tool_name}
                    onChange={(e) => handleToolChange({ tool_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={tool.tool_category}
                    onChange={(e) => handleToolChange({ tool_category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name} {category.tool_count && `(${category.tool_count} outils)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien de l'outil
                  </label>
                  <input
                    type="url"
                    value={tool.tool_link || ''}
                    onChange={(e) => handleToolChange({ tool_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={tool.slug || ''}
                    onChange={(e) => handleToolChange({ slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="nom-de-l-outil"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu
                </label>
                <textarea
                  value={tool.overview || ''}
                  onChange={(e) => handleToolChange({ overview: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Description courte de l'outil..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description complète
                </label>
                <textarea
                  value={tool.tool_description || ''}
                  onChange={(e) => handleToolChange({ tool_description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Description détaillée de l'outil..."
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails et fonctionnalités</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience cible
                  </label>
                  <textarea
                    value={tool.target_audience || ''}
                    onChange={(e) => handleToolChange({ target_audience: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Qui est l'audience cible ?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cas d'usage
                  </label>
                  <textarea
                    value={tool.use_cases || ''}
                    onChange={(e) => handleToolChange({ use_cases: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Quels sont les cas d'usage ?"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonctionnalités clés
                </label>
                <textarea
                  value={tool.key_features || ''}
                  onChange={(e) => handleToolChange({ key_features: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Liste des fonctionnalités principales..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tool.tags || ''}
                  onChange={(e) => handleToolChange({ tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Séparez les tags par des virgules
                </p>
              </div>
            </div>

            {/* SEO and Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO et métadonnées</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre SEO
                  </label>
                  <input
                    type="text"
                    value={tool.meta_title || ''}
                    onChange={(e) => handleToolChange({ meta_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Titre pour les moteurs de recherche"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(tool.meta_title || '').length} caractères (optimal: 50-60)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score de qualité
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tool.quality_score || 0}
                    onChange={(e) => handleToolChange({ quality_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description SEO
                </label>
                <textarea
                  value={tool.meta_description || ''}
                  onChange={(e) => handleToolChange({ meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Description pour les moteurs de recherche"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(tool.meta_description || '').length} caractères (optimal: 150-160)
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mots-clés SEO
                </label>
                <input
                  type="text"
                  value={tool.seo_keywords || ''}
                  onChange={(e) => handleToolChange({ seo_keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="mot-clé1, mot-clé2, mot-clé3"
                />
              </div>
            </div>

            {/* Status and Visibility */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Statut et visibilité</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={tool.is_active}
                    onChange={(e) => handleToolChange({ is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Outil actif (visible sur le site)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={tool.featured}
                    onChange={(e) => handleToolChange({ featured: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Mettre en vedette (page d'accueil)
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={tool.image_url || ''}
                  onChange={(e) => handleToolChange({ image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="https://example.com/image.jpg"
                />
                {tool.image_url && (
                  <div className="mt-2">
                    <img 
                      src={tool.image_url} 
                      alt="Aperçu"
                      className="h-20 w-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations système</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créé le
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {new Date(tool.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dernière modification
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {new Date(tool.updated_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* All Language Sections */}
        <div className="space-y-8">
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des traductions multilingues
            </h2>
            <p className="text-gray-600">
              Gérez toutes les traductions de votre outil dans les langues supportées
            </p>
          </div>

          {/* Display all languages */}
          {LANGUAGES.map((language) => (
            <LanguageSection
              key={language.code}
              language={language}
              translation={translations[language.code] || null}
              baseData={tool}
              onTranslationChange={handleTranslationChange}
              onAutoTranslate={handleAutoTranslate}
              onCopyFromBase={handleCopyFromBase}
              loading={saving}
            />
          ))}
        </div>
      </div>
    </div>
  )
}