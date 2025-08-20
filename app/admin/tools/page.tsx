/**
 * Admin Tools Page
 * Complete tools management interface with filtering and CRUD operations
 */

'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  Star,
  Users,
  Calendar
} from 'lucide-react'
import { AdvancedDataTable, DataTableColumn } from '@/src/components/admin/AdvancedDataTable'
import { AdvancedFilters } from '@/src/components/admin/AdvancedFilters'
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { formatDistance } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Tool {
  id: number
  toolName: string
  toolCategory: string
  toolLink: string
  imageUrl: string | null
  overview: string | null
  toolDescription: string | null
  targetAudience: string | null
  keyFeatures: string | null
  useCases: string | null
  tags: string | null
  slug: string | null
  featured: boolean
  isActive: boolean
  qualityScore: number
  metaTitle: string | null
  metaDescription: string | null
  viewCount: number
  clickCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  lastCheckedAt: string | null
  lastOptimizedAt: string | null
  affiliateLink: string | null
  changelogLink: string | null
  docsLink: string | null
  httpStatusCode: number | null
  mailAddress: string | null
  pricingModel: string | null
  socialDiscord: string | null
  socialFacebook: string | null
  socialGithub: string | null
  socialInstagram: string | null
  socialLinkedin: string | null
  socialTiktok: string | null
  socialX: string | null
}

interface ToolsPageState {
  tools: Tool[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  filters: Record<string, any>
}

export default function AdminToolsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [deleteToolId, setDeleteToolId] = useState<number | null>(null)
  
  const [state, setState] = useState<ToolsPageState>({
    tools: [],
    loading: true,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: 20,
    sortColumn: 'updatedAt',
    sortDirection: 'desc',
    filters: {}
  })

  // Filter configuration
  const filterOptions = [
    {
      key: 'search',
      label: 'Recherche',
      type: 'text' as const,
      placeholder: 'Nom de l\'outil, catégorie...'
    },
    {
      key: 'category',
      label: 'Catégorie',
      type: 'select' as const,
      options: [
        { value: 'ai-image', label: 'Génération d\'images' },
        { value: 'ai-text', label: 'Génération de texte' },
        { value: 'ai-video', label: 'Génération de vidéos' },
        { value: 'ai-voice', label: 'Synthèse vocale' },
        { value: 'ai-analysis', label: 'Analyse et insights' }
      ]
    },
    {
      key: 'featured',
      label: 'En vedette uniquement',
      type: 'checkbox' as const
    },
    {
      key: 'active',
      label: 'Actifs uniquement',
      type: 'checkbox' as const
    },
    {
      key: 'minViews',
      label: 'Vues minimales',
      type: 'number' as const,
      placeholder: '1000'
    }
  ]

  // Table columns configuration - toutes les colonnes disponibles
  const columns: DataTableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      render: (value: any, row: Tool) => (
        <div className="font-mono text-sm">{row.id}</div>
      )
    },
    {
      key: 'tool',
      label: 'Outil',
      sortable: true,
      render: (value: any, row: Tool) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.imageUrl || ''} />
            <AvatarFallback>
              {row.toolName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.toolName}</div>
            <div className="text-sm text-muted-foreground">
              {row.toolCategory}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'toolCategory',
      label: 'Catégorie',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <Badge variant="outline">{row.toolCategory}</Badge>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="font-mono text-sm">{row.slug}</div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value: any, row: Tool) => (
        <div className="flex flex-col space-y-1">
          <Badge variant={row.isActive ? 'default' : 'secondary'}>
            {row.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          {row.featured && (
            <Badge variant="outline" className="text-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              Vedette
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'qualityScore',
      label: 'Score qualité',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-center">
          <Badge 
            variant={row.qualityScore >= 8 ? 'default' : row.qualityScore >= 6 ? 'secondary' : 'destructive'}
          >
            {row.qualityScore?.toFixed(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Statistiques',
      render: (value: any, row: Tool) => (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{row.viewCount?.toLocaleString() || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'viewCount',
      label: 'Vues',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-center">{row.viewCount?.toLocaleString() || 0}</div>
      )
    },
    {
      key: 'clickCount',
      label: 'Clics',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-center">{row.clickCount?.toLocaleString() || 0}</div>
      )
    },
    {
      key: 'favoriteCount',
      label: 'Favoris',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-center">{row.favoriteCount?.toLocaleString() || 0}</div>
      )
    },
    {
      key: 'overview',
      label: 'Aperçu',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.overview || '-'}
        </div>
      )
    },
    {
      key: 'toolDescription',
      label: 'Description',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.toolDescription || '-'}
        </div>
      )
    },
    {
      key: 'targetAudience',
      label: 'Audience',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.targetAudience || '-'}
        </div>
      )
    },
    {
      key: 'keyFeatures',
      label: 'Fonctionnalités',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.keyFeatures || '-'}
        </div>
      )
    },
    {
      key: 'useCases',
      label: 'Cas d\'usage',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.useCases || '-'}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.tags || '-'}
        </div>
      )
    },
    {
      key: 'metaTitle',
      label: 'Meta titre',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.metaTitle || '-'}
        </div>
      )
    },
    {
      key: 'metaDescription',
      label: 'Meta description',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="max-w-xs truncate text-sm">
          {row.metaDescription || '-'}
        </div>
      )
    },
    {
      key: 'pricingModel',
      label: 'Tarification',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <Badge variant="outline">{row.pricingModel || 'Non défini'}</Badge>
      )
    },
    {
      key: 'httpStatusCode',
      label: 'Status HTTP',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <Badge 
          variant={row.httpStatusCode === 200 ? 'default' : 'destructive'}
        >
          {row.httpStatusCode || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'links',
      label: 'Liens',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="flex flex-col space-y-1 text-xs">
          {row.toolLink && (
            <a href={row.toolLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Site principal
            </a>
          )}
          {row.affiliateLink && (
            <a href={row.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
              Lien affilié
            </a>
          )}
          {row.docsLink && (
            <a href={row.docsLink} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
              Documentation
            </a>
          )}
        </div>
      )
    },
    {
      key: 'socials',
      label: 'Réseaux sociaux',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="flex flex-col space-y-1 text-xs">
          {row.socialGithub && (
            <a href={row.socialGithub} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
              GitHub
            </a>
          )}
          {row.socialX && (
            <a href={row.socialX} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
              X/Twitter
            </a>
          )}
          {row.socialLinkedin && (
            <a href={row.socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              LinkedIn
            </a>
          )}
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      sortable: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>Créé: {formatDistance(new Date(row.createdAt), new Date(), { locale: fr })}</span>
          </div>
          <div className="text-muted-foreground">
            Modifié: {formatDistance(new Date(row.updatedAt), new Date(), { locale: fr })}
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date création',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm">
          {new Date(row.createdAt).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    {
      key: 'updatedAt',
      label: 'Dernière modification',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm">
          {new Date(row.updatedAt).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    {
      key: 'lastCheckedAt',
      label: 'Dernière vérification',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm">
          {row.lastCheckedAt ? new Date(row.lastCheckedAt).toLocaleDateString('fr-FR') : 'Jamais'}
        </div>
      )
    },
    {
      key: 'lastOptimizedAt',
      label: 'Dernière optimisation',
      sortable: true,
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm">
          {row.lastOptimizedAt ? new Date(row.lastOptimizedAt).toLocaleDateString('fr-FR') : 'Jamais'}
        </div>
      )
    },
    {
      key: 'mailAddress',
      label: 'Email',
      hidden: true,
      render: (value: any, row: Tool) => (
        <div className="text-sm">
          {row.mailAddress ? (
            <a href={`mailto:${row.mailAddress}`} className="text-blue-500 hover:underline">
              {row.mailAddress}
            </a>
          ) : '-'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Tool) => (
        <TooltipProvider>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/tools/${row.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir les détails</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/tools/${row.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <a href={row.toolLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ouvrir le lien</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDeleteToolId(row.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    }
  ]

  // Debounce for search filter
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  useEffect(() => {
    const current = String(state.filters.search || '')
    const handle = setTimeout(() => setDebouncedSearch(current), 400)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters.search])

  // Initialize state from URL query on mount
  useEffect(() => {
    if (!searchParams) return
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') === 'true'
    const active = searchParams.get('active') === 'true'
    const minViews = searchParams.get('minViews') ? parseInt(searchParams.get('minViews') as string) : undefined

    setState(prev => ({
      ...prev,
      currentPage: isNaN(page) ? prev.currentPage : page,
      pageSize: isNaN(pageSize) ? prev.pageSize : pageSize,
      sortColumn: sortBy,
      sortDirection: sortOrder,
      filters: {
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(featured ? { featured } : {}),
        ...(active ? { active } : {}),
        ...(minViews ? { minViews } : {}),
      }
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync state to URL (shallow) when controls change
  useEffect(() => {
    if (!pathname) return
    const params = new URLSearchParams()
    params.set('page', String(state.currentPage))
    params.set('pageSize', String(state.pageSize))
    if (state.sortColumn) params.set('sortBy', state.sortColumn)
    if (state.sortDirection) params.set('sortOrder', state.sortDirection)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (state.filters.category) params.set('category', String(state.filters.category))
    if (state.filters.featured) params.set('featured', 'true')
    if (state.filters.active) params.set('active', 'true')
    if (state.filters.minViews) params.set('minViews', String(state.filters.minViews))
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(url, { scroll: false })
  }, [pathname, router, state.currentPage, state.pageSize, state.sortColumn, state.sortDirection, debouncedSearch, state.filters.category, state.filters.featured, state.filters.active, state.filters.minViews])

  useEffect(() => {
    if (session) loadTools()
  }, [session, state.currentPage, state.pageSize, state.sortColumn, state.sortDirection, debouncedSearch, state.filters.category, state.filters.featured, state.filters.active, state.filters.minViews])

  const loadTools = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams()
      params.set('page', String(state.currentPage))
      params.set('pageSize', String(state.pageSize))
      if (state.sortColumn) params.set('sortBy', state.sortColumn)
      if (state.sortDirection) params.set('sortOrder', state.sortDirection)
      if (state.filters) {
        if (debouncedSearch) params.set('search', String(debouncedSearch))
        if (state.filters.category) params.set('category', String(state.filters.category))
        if (state.filters.featured === true) params.set('featured', 'true')
        if (state.filters.active === true) params.set('active', 'true')
        if (state.filters.minViews) params.set('minViews', String(state.filters.minViews))
      }

      const res = await fetch(`/api/admin/tools?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to fetch tools (${res.status})`)
      }
      const data = await res.json()

      const tools: Tool[] = (data.tools || []).map((t: any) => ({
        id: t.id,
        toolName: t.toolName || t.tool_name,
        toolCategory: t.toolCategory || t.tool_category,
        toolLink: t.toolLink || t.tool_link,
        imageUrl: t.imageUrl || t.image_url,
        overview: t.overview,
        toolDescription: t.toolDescription || t.tool_description,
        targetAudience: t.targetAudience || t.target_audience,
        keyFeatures: t.keyFeatures || t.key_features,
        useCases: t.useCases || t.use_cases,
        tags: t.tags,
        slug: t.slug,
        featured: Boolean(t.featured),
        isActive: Boolean(t.isActive || t.is_active),
        qualityScore: Number(t.qualityScore || t.quality_score || 0),
        metaTitle: t.metaTitle || t.meta_title,
        metaDescription: t.metaDescription || t.meta_description,
        viewCount: Number(t.viewCount || t.view_count || 0),
        clickCount: Number(t.clickCount || t.click_count || 0),
        favoriteCount: Number(t.favoriteCount || t.favorite_count || 0),
        createdAt: String(t.createdAt || t.created_at),
        updatedAt: String(t.updatedAt || t.updated_at),
        lastCheckedAt: t.lastCheckedAt || t.last_checked_at,
        lastOptimizedAt: t.lastOptimizedAt || t.last_optimized_at,
        affiliateLink: t.affiliateLink || t.affiliate_link,
        changelogLink: t.changelogLink || t.changelog_link,
        docsLink: t.docsLink || t.docs_link,
        httpStatusCode: t.httpStatusCode || t.http_status_code,
        mailAddress: t.mailAddress || t.mail_address,
        pricingModel: t.pricingModel || t.pricing_model,
        socialDiscord: t.socialDiscord || t.social_discord,
        socialFacebook: t.socialFacebook || t.social_facebook,
        socialGithub: t.socialGithub || t.social_github,
        socialInstagram: t.socialInstagram || t.social_instagram,
        socialLinkedin: t.socialLinkedin || t.social_linkedin,
        socialTiktok: t.socialTiktok || t.social_tiktok,
        socialX: t.socialX || t.social_x
      }))

      setState(prev => ({
        ...prev,
        tools,
        totalCount: Number(data.totalCount ?? tools.length),
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de chargement',
        loading: false
      }))
    }
  }

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: direction,
      currentPage: 1
    }))
  }

  const handleFiltersChange = (filters: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      filters,
      currentPage: 1
    }))
  }

  const handleResetFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {},
      currentPage: 1
    }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setState(prev => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1
    }))
  }

  const handleDeleteTool = async () => {
    if (!deleteToolId) return
    
    try {
      const res = await fetch(`/api/admin/tools?id=${deleteToolId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to delete tool (${res.status})`)
      }
      setDeleteToolId(null)
      await loadTools()
    } catch (error) {
      console.error('Error deleting tool:', error)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des outils</h1>
          <p className="text-muted-foreground">
            Gérez tous les outils IA de votre plateforme
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tools/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un outil
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <AdvancedFilters
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        defaultValues={state.filters}
        showCount={state.totalCount}
      />

      {/* Tools Table */}
      <AdvancedDataTable
        title="Outils IA"
        description={`${state.totalCount} outils au total`}
        columns={columns}
        data={state.tools}
        loading={state.loading}
        totalCount={state.totalCount}
        pageSize={state.pageSize}
        currentPage={state.currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        sortColumn={state.sortColumn}
        sortDirection={state.sortDirection}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        allowColumnToggle={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteToolId !== null} onOpenChange={() => setDeleteToolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet outil ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTool} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}