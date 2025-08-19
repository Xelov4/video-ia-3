/**
 * Admin Categories Page
 * Categories management with statistics and icon selection
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Folder, BarChart3, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminTable } from '@/src/components/admin/AdminTable';
import { AdvancedFilters } from '@/src/components/admin/AdvancedFilters';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  toolCount: number;
  isActive: boolean;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Mock data for rapid development
  const mockCategories: Category[] = [
    {
      id: 1,
      name: "Génération d'images",
      slug: 'ai-image',
      description: "Outils de création d'images IA",
      emoji: '🎨',
      toolCount: 45,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Génération de texte',
      slug: 'ai-text',
      description: 'Outils de rédaction automatique',
      emoji: '✍️',
      toolCount: 38,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
    {
      id: 3,
      name: 'Génération de vidéos',
      slug: 'ai-video',
      description: 'Création de vidéos avec IA',
      emoji: '🎬',
      toolCount: 23,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-12',
    },
    {
      id: 4,
      name: 'Synthèse vocale',
      slug: 'ai-voice',
      description: 'Génération de voix artificielle',
      emoji: '🎤',
      toolCount: 19,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-08',
    },
    {
      id: 5,
      name: 'Analyse de données',
      slug: 'ai-analysis',
      description: "Outils d'analyse intelligente",
      emoji: '📊',
      toolCount: 31,
      isActive: true,
      parentId: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-14',
    },
  ];

  const filterOptions = [
    {
      key: 'search',
      label: 'Recherche',
      type: 'text' as const,
      placeholder: 'Nom de catégorie...',
    },
    { key: 'active', label: 'Actives uniquement', type: 'checkbox' as const },
    {
      key: 'minTools',
      label: "Minimum d'outils",
      type: 'number' as const,
      placeholder: '10',
    },
  ];

  const columns = [
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (_value: unknown, row: Category) => (
        <div className='flex items-center space-x-3'>
          <div className='text-2xl'>{row.emoji}</div>
          <div>
            <div className='font-medium'>{row.name}</div>
            <div className='text-sm text-muted-foreground'>{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Statistiques',
      render: (_value: unknown, row: Category) => (
        <div className='space-y-2'>
          <Badge variant='outline' className='bg-blue-50'>
            {row.toolCount} outils
          </Badge>
          <div className='text-sm text-muted-foreground'>Slug: {row.slug}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (_value: unknown, row: Category) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${row.id}`}>
                <Eye className='mr-2 h-4 w-4' />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${row.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteId(row.id)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Gestion des catégories</h1>
          <p className='text-muted-foreground'>Organisez vos outils par catégories</p>
        </div>
        <Button asChild>
          <Link href='/admin/categories/new'>
            <Plus className='mr-2 h-4 w-4' />
            Ajouter une catégorie
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total catégories</CardTitle>
            <Folder className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>5</div>
            <p className='text-xs text-muted-foreground'>+1 ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Outils totaux</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-xs text-muted-foreground'>
              Répartis dans toutes les catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Moyenne par catégorie</CardTitle>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>31.2</div>
            <p className='text-xs text-muted-foreground'>outils par catégorie</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdvancedFilters
        filters={filterOptions}
        onFiltersChange={() => {}}
        onReset={() => {}}
        showCount={mockCategories.length}
      />

      {/* Categories Table */}
      <AdminTable
        title='Catégories'
        description={`${mockCategories.length} catégories au total`}
        columns={columns}
        data={mockCategories}
        loading={false}
        totalCount={mockCategories.length}
        pageSize={20}
        currentPage={1}
        onPageChange={() => {}}
        onSort={() => {}}
        sortColumn='name'
        sortDirection='asc'
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les outils
              associés seront déplacés vers "Non catégorisé".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
