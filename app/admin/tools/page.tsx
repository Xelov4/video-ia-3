/**
 * Admin Tools Page
 * Complete tools management interface with filtering and CRUD operations
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import { AdminTable } from '@/src/components/admin/AdminTable'
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
  featured: boolean
  isActive: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
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

  // Table columns configuration
  const columns = [
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
      key: 'status',
      label: 'Statut',
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
      key: 'stats',
      label: 'Statistiques',
      render: (value: any, row: Tool) => (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{row.viewCount.toLocaleString()}</span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
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
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Tool) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/tools/${row.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/tools/${row.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={row.toolLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setDeleteToolId(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  useEffect(() => {
    if (session) {
      loadTools()
    }
  }, [session, state.currentPage, state.sortColumn, state.sortDirection, state.filters])

  const loadTools = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // For now, use mock data - replace with real API call
      const mockTools: Tool[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        toolName: `Tool ${i + 1}`,
        toolCategory: ['ai-image', 'ai-text', 'ai-video'][i % 3],
        toolLink: `https://example.com/tool-${i + 1}`,
        imageUrl: null,
        overview: `Description de l'outil ${i + 1}`,
        featured: i % 5 === 0,
        isActive: i % 10 !== 9,
        viewCount: Math.floor(Math.random() * 10000),
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
      }))

      setState(prev => ({
        ...prev,
        tools: mockTools,
        totalCount: 156,
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

  const handleDeleteTool = async () => {
    if (!deleteToolId) return
    
    try {
      // API call to delete tool
      console.log('Deleting tool:', deleteToolId)
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
      <AdminTable
        title="Outils IA"
        description={`${state.totalCount} outils au total`}
        columns={columns}
        data={state.tools}
        loading={state.loading}
        totalCount={state.totalCount}
        pageSize={state.pageSize}
        currentPage={state.currentPage}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortColumn={state.sortColumn}
        sortDirection={state.sortDirection}
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