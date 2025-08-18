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
import { useEffect, useState, useCallback, useMemo } from 'react'
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  EyeIcon,
  GlobeAltIcon,
  FolderIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { LanguageTabs, type Language, type TranslationStatus } from '@/src/components/admin/LanguageTabs'
import { TranslationForm, type ToolTranslation, type BaseToolData } from '@/src/components/admin/TranslationForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Switch } from '@/src/components/ui/switch'
import { Button } from '@/src/components/ui/button'
import { Toaster } from '@/src/components/ui/sonner'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog'
import { RichTextEditor } from '@/src/components/admin/RichTextEditor'

// Types
interface Tool {
  id: number;
  toolName: string;
  toolCategory: string;
  toolLink: string;
  overview: string;
  toolDescription: string;
  targetAudience: string;
  keyFeatures: string;
  useCases: string;
  tags: string;
  imageUrl: string;
  slug: string;
  isActive: boolean;
  featured: boolean;
  quality_score: number;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string;
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
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

  const [toolId, setToolId] = useState<number | null>(null)
  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [translations, setTranslations] = useState<Record<string, ToolTranslation>>({})
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationStatus>>({})
  const [activeLanguage, setActiveLanguage] = useState<string>('en')

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        const id = parseInt(resolvedParams.id)
        if (!isNaN(id)) setToolId(id)
        else setError("ID d'outil invalide")
      } catch (err) {
        setError('Erreur lors de la résolution des paramètres')
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  const fetchToolData = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const toolResponse = await fetch(`/api/tools/${id}`)
      if (!toolResponse.ok) {
        throw new Error(`Erreur HTTP: ${toolResponse.status}`)
      }
      const toolData = await toolResponse.json()
      if (!toolData.success || !toolData.tool) {
        throw new Error(toolData.error || "Données d'outil invalides")
      }
      setTool(toolData.tool)
      await fetchTranslations(id)
    } catch (error) {
      console.error('Error fetching tool:', error)
      setError(error instanceof Error ? error.message : "Erreur lors du chargement de l'outil")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTranslations = async (id: number) => {
    try {
      const response = await fetch(`/api/tools/${id}/translations`)
      if (response.ok) {
        const data = await response.json()
        const translationsMap: Record<string, ToolTranslation> = {}
        if (data.translations && Array.isArray(data.translations)) {
          data.translations.forEach((t: any) => {
            translationsMap[t.languageCode] = { ...t }
          })
        }
        setTranslations(translationsMap)
      }
    } catch (error) {
      console.error('Error fetching translations:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        const cats = Array.isArray(data?.data) ? data.data : []
        setCategories(cats)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    if (session && toolId) {
      fetchToolData(toolId)
      fetchCategories()
    }
  }, [session, toolId, fetchToolData])

  const updateTranslationStatus = useCallback(() => {
    const status: Record<string, TranslationStatus> = {}
    LANGUAGES.forEach(language => {
      const translation = translations[language.code]
      if (translation) {
        const fields = ['name', 'overview', 'description', 'metaTitle', 'metaDescription']
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof ToolTranslation]
          return typeof value === 'string' && value.trim().length > 0 && value.trim() !== '<p><br></p>'
        })
        const completionPercentage = Math.round((filledFields.length / fields.length) * 100)
        status[language.code] = {
          isComplete: completionPercentage === 100,
          completionPercentage,
          hasChanges: hasUnsavedChanges,
          isHumanReviewed: translation.humanReviewed,
          qualityScore: translation.quality_score
        }
      } else {
        status[language.code] = { isComplete: false, completionPercentage: 0, hasChanges: false, isHumanReviewed: false, qualityScore: 0 }
      }
    })
    setTranslationStatus(status)
  }, [translations, hasUnsavedChanges])

  useEffect(() => {
    updateTranslationStatus()
  }, [translations, updateTranslationStatus])

  const handleToolChange = useCallback((updatedTool: Partial<Tool>) => {
    if (!tool) return
    setTool({ ...tool, ...updatedTool })
    setHasUnsavedChanges(true)
  }, [tool])

  const handleTranslationChange = useCallback((translation: ToolTranslation) => {
    setTranslations(prev => ({ ...prev, [translation.languageCode]: translation }))
    setHasUnsavedChanges(true)
  }, [])
  
  const handleDescriptionChange = (content: string) => {
    handleToolChange({ toolDescription: content });
  };
  
  const handleOverviewChange = (content: string) => {
    handleToolChange({ overview: content });
  };

  const handleSave = async () => {
    if (!tool || !toolId) return
    setSaving(true)
    try {
      const { id, createdAt, updatedAt, ...toolDataToSave } = tool
      const toolResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolDataToSave),
      })
      if (!toolResponse.ok) throw new Error((await toolResponse.json()).error || "Erreur lors de la sauvegarde de l'outil")

      const translationPromises = Object.values(translations).map(t => {
        const endpoint = t.id ? `/api/tools/${toolId}/translations/${t.id}` : `/api/tools/${toolId}/translations`
        const method = t.id ? 'PUT' : 'POST'
        return fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
      })
      const results = await Promise.allSettled(translationPromises)
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)).length

      if (failed > 0) toast.error(`Outil sauvegardé, mais ${failed} traduction(s) ont échoué.`)
      else {
        toast.success('Outil et traductions sauvegardés avec succès !')
        setHasUnsavedChanges(false)
        await fetchTranslations(toolId)
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toolId) return
    try {
      const response = await fetch(`/api/tools/${toolId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur de suppression')
      router.push('/admin/tools?message=Outil supprimé avec succès')
    } catch (error) {
      console.error('Error deleting tool:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de suppression')
    }
  }

  const handleAutoTranslate = async (targetLanguage: string) => {
    // Implementation can be added here
  }

  const handleCopyFromBase = (targetLanguage: string) => {
    if (!tool) return
    const base: ToolTranslation = {
      toolId: tool.id,
      languageCode: targetLanguage,
      name: tool.toolName,
      overview: tool.overview || '',
      description: tool.toolDescription || '',
      metaTitle: tool.metaTitle || '',
      metaDescription: tool.metaDescription || '',
      translationSource: 'imported',
      quality_score: 5,
      humanReviewed: false
    }
    handleTranslationChange(base)
    toast.info(`Contenu de base copié vers ${targetLanguage.toUpperCase()}`)
  }

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

  if (status === 'loading' || loading || !toolId) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }
  if (!session) return null
  if (!tool) {
    return <div className="container mx-auto p-6 text-center">Outil non trouvé.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/admin/tools" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{tool.toolName}</h1>
              {hasUnsavedChanges && (
                <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Modifications non sauvegardées
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <a href={tool.toolLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center btn-secondary">
                <EyeIcon className="w-4 h-4 mr-2" />
                Voir l'outil
              </a>
              <Link href={`/en/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center btn-secondary">
                 <LinkIcon className="w-4 h-4 mr-2" />
                 Voir la page
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><TrashIcon className="w-4 h-4 mr-2" />Supprimer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible et supprimera l'outil et ses traductions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleSave} disabled={saving}>
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tool Editor */}
        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Éditeur Principal (Anglais - Référence)</CardTitle>
              <CardDescription>
                Modifiez ici les informations de base de l'outil. Ces informations serviront de source pour les traductions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="visibility">Visibilité</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-medium">Nom de l'outil *</label>
                      <Input value={tool.toolName} onChange={e => handleToolChange({ toolName: e.target.value })} className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="font-medium">Catégorie</label>
                      <Select value={tool.toolCategory} onValueChange={value => handleToolChange({ toolCategory: value })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-medium">Lien de l'outil</label>
                      <Input value={tool.toolLink} onChange={e => handleToolChange({ toolLink: e.target.value })} className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="font-medium">Slug</label>
                      <Input value={tool.slug} onChange={e => handleToolChange({ slug: e.target.value })} className="bg-slate-50" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="content" className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="font-medium">Présentation (Overview)</label>
                      <RichTextEditor content={tool.overview} onChange={handleOverviewChange} className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="font-medium">Description complète</label>
                      <RichTextEditor content={tool.toolDescription} onChange={handleDescriptionChange} className="bg-slate-50" />
                    </div>
                     <div>
                      <label className="font-medium">Public Cible (séparé par virgules)</label>
                      <Input value={tool.targetAudience} onChange={e => handleToolChange({ targetAudience: e.target.value })} className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="font-medium">Fonctionnalités Clés (séparé par virgules)</label>
                      <Input value={tool.keyFeatures} onChange={e => handleToolChange({ keyFeatures: e.target.value })} className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="font-medium">Cas d'usage (séparé par virgules)</label>
                      <Input value={tool.useCases} onChange={e => handleToolChange({ useCases: e.target.value })} className="bg-slate-50" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="seo" className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-medium">Meta Titre</label>
                        <Input value={tool.metaTitle} onChange={e => handleToolChange({ metaTitle: e.target.value })} className="bg-slate-50" />
                      </div>
                      <div>
                        <label className="font-medium">Meta Description</label>
                        <Input value={tool.metaDescription} onChange={e => handleToolChange({ metaDescription: e.target.value })} className="bg-slate-50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-medium">Mots-clés SEO (séparé par virgules)</label>
                        <Input value={tool.seoKeywords} onChange={e => handleToolChange({ seoKeywords: e.target.value })} className="bg-slate-50" />
                      </div>
                   </div>
                </TabsContent>
                <TabsContent value="visibility" className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-medium">URL de l'image</label>
                        <Input value={tool.imageUrl} onChange={e => handleToolChange({ imageUrl: e.target.value })} className="bg-slate-50" />
                      </div>
                       <div>
                        <label className="font-medium">Score de Qualité</label>
                        <Input type="number" value={tool.quality_score} onChange={e => handleToolChange({ quality_score: parseInt(e.target.value) })} className="bg-slate-50" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="isActive" checked={tool.isActive} onCheckedChange={c => handleToolChange({ isActive: c })} />
                        <label htmlFor="isActive">Actif</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="featured" checked={tool.featured} onCheckedChange={c => handleToolChange({ featured: c })} />
                        <label htmlFor="featured">En vedette</label>
                      </div>
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Translations Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Gestion des Traductions</CardTitle>
              <CardDescription>
                Sélectionnez une langue pour ajouter ou modifier sa traduction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageTabs
                languages={LANGUAGES}
                activeLanguage={activeLanguage}
                onLanguageChange={setActiveLanguage}
                translationStatus={translationStatus}
              />
              <div className="mt-6">
                <TranslationForm
                  key={activeLanguage}
                  language={LANGUAGES.find(l => l.code === activeLanguage)!}
                  translation={translations[activeLanguage] || null}
                  baseData={tool}
                  onTranslationChange={handleTranslationChange}
                  onAutoTranslate={handleAutoTranslate}
                  onCopyFromBase={handleCopyFromBase}
                  loading={saving}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}