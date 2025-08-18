/**
 * Edit Article Page - Modification d'un article existant
 * 
 * Page d'édition d'un article dans l'interface admin.
 * Basée sur la page d'édition des tools, adaptée pour les articles.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  ArrowLeftIcon, 
  CloudArrowUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { LanguageTabs, type Language, type TranslationStatus } from '@/src/components/admin/LanguageTabs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Switch } from '@/src/components/ui/switch'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Textarea } from '@/src/components/ui/textarea'
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
interface Post {
  id: number
  slug: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'TRASHED'
  postType: 'ARTICLE' | 'NEWS' | 'PAGE'
  featuredImageUrl?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  isFeatured: boolean
  allowComments: boolean
  viewCount: number
  readingTimeMinutes?: number
  author: {
    id: number
    name: string
    email: string
  }
  translations: Array<{
    id?: number
    languageCode: string
    title: string
    content: string
    excerpt?: string
    metaTitle?: string
    metaDescription?: string
    translationSource: string
    humanReviewed: boolean
  }>
  postCategories: Array<{
    category: {
      id: number
      name: string
      slug: string
    }
  }>
  postTags: Array<{
    tag: {
      id: number
      name: string
      slug: string
    }
  }>
  _count: {
    comments: number
  }
}

interface PostTranslationFormData {
  id?: number
  languageCode: string
  title: string
  content: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  translationSource: string
  humanReviewed: boolean
}

interface PageProps {
  params: Promise<{ id: string }>
}

// Langues supportées
const LANGUAGES: Language[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true, isBase: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', enabled: true }
]

export default function EditArticlePage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [postId, setPostId] = useState<number | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Traductions
  const [translations, setTranslations] = useState<Record<string, PostTranslationFormData>>({})
  const [activeLanguage, setActiveLanguage] = useState<string>('fr')
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationStatus>>({})

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        const id = parseInt(resolvedParams.id)
        if (!isNaN(id)) setPostId(id)
        else setError("ID d'article invalide")
      } catch (err) {
        setError('Erreur lors de la résolution des paramètres')
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  const fetchPost = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/posts/${id}`)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data.success || !data.post) {
        throw new Error(data.error || "Données d'article invalides")
      }
      
      setPost(data.post)
      
      // Convertir les traductions en format form
      const translationsMap: Record<string, PostTranslationFormData> = {}
      data.post.translations.forEach((t: any) => {
        translationsMap[t.languageCode] = {
          id: t.id,
          languageCode: t.languageCode,
          title: t.title,
          content: t.content,
          excerpt: t.excerpt || '',
          metaTitle: t.metaTitle || '',
          metaDescription: t.metaDescription || '',
          translationSource: t.translationSource,
          humanReviewed: t.humanReviewed
        }
      })
      setTranslations(translationsMap)
      
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error instanceof Error ? error.message : "Erreur lors du chargement de l'article")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session && postId) {
      fetchPost(postId)
    }
  }, [session, postId, fetchPost])

  const updateTranslationStatus = useCallback(() => {
    const status: Record<string, TranslationStatus> = {}
    LANGUAGES.forEach(language => {
      const translation = translations[language.code]
      if (translation) {
        const fields = ['title', 'content', 'excerpt', 'metaTitle', 'metaDescription']
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof PostTranslationFormData]
          return typeof value === 'string' && value.trim().length > 0 && value.trim() !== '<p><br></p>'
        })
        const completionPercentage = Math.round((filledFields.length / fields.length) * 100)
        status[language.code] = {
          isComplete: completionPercentage >= 60,
          completionPercentage,
          hasChanges: hasUnsavedChanges,
          isHumanReviewed: translation.humanReviewed,
          qualityScore: translation.humanReviewed ? 9 : 7
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

  const handlePostChange = useCallback((updatedPost: Partial<Post>) => {
    if (!post) return
    setPost({ ...post, ...updatedPost })
    setHasUnsavedChanges(true)
  }, [post])

  const handleTranslationChange = useCallback((translation: PostTranslationFormData) => {
    setTranslations(prev => ({ ...prev, [translation.languageCode]: translation }))
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = async () => {
    if (!post || !postId) return
    setSaving(true)
    try {
      // Sauvegarder l'article
      const { id, author, translations: _, postCategories, postTags, _count, createdAt, updatedAt, publishedAt, ...postDataToSave } = post
      
      const postResponse = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postDataToSave),
      })
      
      if (!postResponse.ok) {
        const error = await postResponse.json()
        throw new Error(error.error || "Erreur lors de la sauvegarde de l'article")
      }

      // Sauvegarder les traductions
      const translationPromises = Object.values(translations).map(t => {
        const endpoint = t.id ? `/api/admin/posts/${postId}/translations/${t.languageCode}` : `/api/admin/posts/${postId}/translations`
        const method = t.id ? 'PUT' : 'POST'
        return fetch(endpoint, { 
          method, 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(t) 
        })
      })
      
      const results = await Promise.allSettled(translationPromises)
      const failed = results.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)
      ).length

      if (failed > 0) {
        toast.error(`Article sauvegardé, mais ${failed} traduction(s) ont échoué.`)
      } else {
        toast.success('Article et traductions sauvegardés avec succès !')
        setHasUnsavedChanges(false)
        await fetchPost(postId) // Recharger les données
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!postId) return
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de suppression')
      }
      router.push('/admin/articles?message=Article supprimé avec succès')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de suppression')
    }
  }

  const handlePublish = async () => {
    if (!postId) return
    try {
      const response = await fetch(`/api/admin/posts/${postId}/publish`, { method: 'POST' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de publication')
      }
      toast.success('Article publié avec succès !')
      await fetchPost(postId)
    } catch (error) {
      console.error('Error publishing post:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de publication')
    }
  }

  const handleUnpublish = async () => {
    if (!postId) return
    try {
      const response = await fetch(`/api/admin/posts/${postId}/publish`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de dépublication')
      }
      toast.success('Article dépublié avec succès !')
      await fetchPost(postId)
    } catch (error) {
      console.error('Error unpublishing post:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de dépublication')
    }
  }

  const handleCopyFromBase = (targetLanguage: string) => {
    const baseTranslation = translations['fr']
    if (!baseTranslation) {
      toast.error('Aucun contenu français à copier')
      return
    }

    const newTranslation: PostTranslationFormData = {
      languageCode: targetLanguage,
      title: baseTranslation.title,
      content: baseTranslation.content,
      excerpt: baseTranslation.excerpt || '',
      metaTitle: baseTranslation.metaTitle || '',
      metaDescription: baseTranslation.metaDescription || '',
      translationSource: 'imported',
      humanReviewed: false
    }
    
    handleTranslationChange(newTranslation)
    toast.info(`Contenu copié vers ${targetLanguage.toUpperCase()}`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', variant: 'secondary' as const },
      PENDING_REVIEW: { label: 'En attente', variant: 'outline' as const },
      PUBLISHED: { label: 'Publié', variant: 'default' as const },
      TRASHED: { label: 'Corbeille', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Protection contre les changements non sauvegardés
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

  if (status === 'loading' || loading || !postId) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!session) return null

  if (!post) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Article non trouvé</h1>
        <p className="text-gray-600">{error}</p>
        <Link href="/admin/articles" className="mt-4 inline-block btn-primary">
          Retour aux articles
        </Link>
      </div>
    )
  }

  const frTranslation = translations['fr']
  const title = frTranslation?.title || post.slug

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/admin/articles" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Retour aux articles
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
                {title}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                {getStatusBadge(post.status)}
                {post.isFeatured && <Badge variant="secondary">En vedette</Badge>}
                <span className="text-sm text-gray-500">
                  {post.viewCount} vues • {post._count.comments} commentaires
                </span>
              </div>
              {hasUnsavedChanges && (
                <div className="mt-2 text-orange-600 text-sm font-medium">
                  ⚠️ Modifications non sauvegardées
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              {post.status === 'PUBLISHED' && (
                <Link 
                  href={`/blog/${post.slug}`} 
                  target="_blank" 
                  className="inline-flex items-center btn-secondary"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Voir l'article
                </Link>
              )}
              
              {post.status === 'PUBLISHED' ? (
                <Button onClick={handleUnpublish} variant="outline">
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Dépublier
                </Button>
              ) : (
                <Button onClick={handlePublish} variant="outline">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Publier
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible et supprimera l'article et toutes ses traductions.
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

        {/* Informations de l'article */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle>Informations de l'Article</CardTitle>
            <CardDescription>
              Configuration et métadonnées de l'article
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="font-medium">Slug URL</label>
                <Input 
                  value={post.slug} 
                  onChange={e => handlePostChange({ slug: e.target.value })}
                  className="bg-slate-50" 
                />
                <p className="text-sm text-gray-500 mt-1">URL: /blog/{post.slug}</p>
              </div>
              <div>
                <label className="font-medium">Statut</label>
                <Select value={post.status} onValueChange={value => handlePostChange({ status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PENDING_REVIEW">En attente</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="TRASHED">Corbeille</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Type</label>
                <Select value={post.postType} onValueChange={value => handlePostChange({ postType: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTICLE">Article</SelectItem>
                    <SelectItem value="NEWS">Actualité</SelectItem>
                    <SelectItem value="PAGE">Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Image mise en avant</label>
                <Input 
                  value={post.featuredImageUrl || ''} 
                  onChange={e => handlePostChange({ featuredImageUrl: e.target.value })}
                  placeholder="URL de l'image"
                  className="bg-slate-50" 
                />
              </div>
              <div>
                <label className="font-medium">Temps de lecture (minutes)</label>
                <Input 
                  type="number"
                  value={post.readingTimeMinutes || ''} 
                  onChange={e => handlePostChange({ readingTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-slate-50" 
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={post.isFeatured} 
                    onCheckedChange={checked => handlePostChange({ isFeatured: checked })} 
                  />
                  <label>En vedette</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={post.allowComments} 
                    onCheckedChange={checked => handlePostChange({ allowComments: checked })} 
                  />
                  <label>Commentaires autorisés</label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Informations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Auteur:</span> {post.author.name}
                </div>
                <div>
                  <span className="text-gray-500">Créé:</span> {formatDate(post.createdAt)}
                </div>
                <div>
                  <span className="text-gray-500">Modifié:</span> {formatDate(post.updatedAt)}
                </div>
                {post.publishedAt && (
                  <div>
                    <span className="text-gray-500">Publié:</span> {formatDate(post.publishedAt)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traductions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Contenu et Traductions</CardTitle>
            <CardDescription>
              Gérez le contenu de votre article dans différentes langues
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
              <PostTranslationForm
                key={activeLanguage}
                language={LANGUAGES.find(l => l.code === activeLanguage)!}
                translation={translations[activeLanguage]}
                onTranslationChange={handleTranslationChange}
                onCopyFromBase={handleCopyFromBase}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Composant pour le formulaire de traduction
interface PostTranslationFormProps {
  language: Language
  translation?: PostTranslationFormData
  onTranslationChange: (translation: PostTranslationFormData) => void
  onCopyFromBase: (languageCode: string) => void
}

function PostTranslationForm({ 
  language, 
  translation, 
  onTranslationChange, 
  onCopyFromBase 
}: PostTranslationFormProps) {
  const [formData, setFormData] = useState<PostTranslationFormData>(
    translation || {
      languageCode: language.code,
      title: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      translationSource: 'manual',
      humanReviewed: false
    }
  )

  useEffect(() => {
    if (translation) {
      setFormData(translation)
    }
  }, [translation])

  const handleChange = (field: keyof PostTranslationFormData, value: string | boolean) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onTranslationChange(updated)
  }

  return (
    <div className="space-y-6">
      {!translation && !language.isBase && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Traduction {language.nativeName} {language.flag}
          </h3>
          <p className="text-gray-500 mb-4">Aucun contenu pour cette langue</p>
          <Button onClick={() => onCopyFromBase(language.code)} variant="outline">
            Copier depuis le français
          </Button>
        </div>
      )}

      {(translation || language.isBase) && (
        <>
          <div>
            <label className="font-medium">Titre</label>
            <Input 
              value={formData.title} 
              onChange={e => handleChange('title', e.target.value)}
              className="bg-slate-50" 
            />
          </div>

          <div>
            <label className="font-medium">Contenu</label>
            <RichTextEditor 
              content={formData.content} 
              onChange={content => handleChange('content', content)}
              className="bg-slate-50"
            />
          </div>

          <div>
            <label className="font-medium">Extrait</label>
            <Textarea 
              value={formData.excerpt} 
              onChange={e => handleChange('excerpt', e.target.value)}
              rows={3}
              className="bg-slate-50" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium">Meta Titre</label>
              <Input 
                value={formData.metaTitle} 
                onChange={e => handleChange('metaTitle', e.target.value)}
                className="bg-slate-50" 
              />
            </div>
            <div>
              <label className="font-medium">Meta Description</label>
              <Input 
                value={formData.metaDescription} 
                onChange={e => handleChange('metaDescription', e.target.value)}
                className="bg-slate-50" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.humanReviewed} 
              onCheckedChange={checked => handleChange('humanReviewed', checked)} 
            />
            <label>Révisé par un humain</label>
          </div>
        </>
      )}
    </div>
  )
}