/**
 * Admin Articles Page
 * Complete articles management interface with filtering and CRUD operations
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Users,
  Calendar,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { AdminTable } from '@/src/components/admin/AdminTable';
import { AdvancedFilters } from '@/src/components/admin/AdvancedFilters';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Article {
  id: number;
  slug: string;
  status: string;
  postType: string;
  featuredImageUrl: string | null;
  isFeatured: boolean;
  allowComments: boolean;
  viewCount: number;
  readingTimeMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  translation: {
    title: string;
    content: string;
    excerpt: string | null;
  };
  postCategories: Array<{
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface ArticlesPageState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
}

export default function AdminArticlesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  const [state, setState] = useState<ArticlesPageState>({
    articles: [],
    loading: true,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: 20,
    sortColumn: 'updatedAt',
    sortDirection: 'desc',
    filters: {},
  });

  // Filter configuration
  const filterOptions = [
    {
      key: 'search',
      label: 'Recherche',
      type: 'text' as const,
      placeholder: 'Titre, contenu, auteur...',
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'PUBLISHED', label: 'Publié' },
        { value: 'ARCHIVED', label: 'Archivé' },
      ],
    },
    {
      key: 'postType',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'ARTICLE', label: 'Article' },
        { value: 'NEWS', label: 'Actualité' },
        { value: 'GUIDE', label: 'Guide' },
        { value: 'REVIEW', label: 'Critique' },
      ],
    },
    {
      key: 'featured',
      label: 'En vedette uniquement',
      type: 'checkbox' as const,
    },
    {
      key: 'hasComments',
      label: 'Avec commentaires',
      type: 'checkbox' as const,
    },
    {
      key: 'minViews',
      label: 'Vues minimales',
      type: 'number' as const,
      placeholder: '100',
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: 'article',
      label: 'Article',
      sortable: true,
      render: (value: any, row: Article) => (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={row.featuredImageUrl || ''} />
            <AvatarFallback>
              <FileText className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{row.translation?.title || 'Sans titre'}</div>
            <div className='text-sm text-muted-foreground'>Par {row.author.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: any, row: Article) => (
        <div className='flex flex-col space-y-1'>
          <Badge
            variant={
              row.status === 'PUBLISHED'
                ? 'default'
                : row.status === 'DRAFT'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {row.status === 'PUBLISHED'
              ? 'Publié'
              : row.status === 'DRAFT'
                ? 'Brouillon'
                : 'Archivé'}
          </Badge>
          {row.isFeatured && (
            <Badge variant='outline' className='text-yellow-600'>
              <Star className='mr-1 h-3 w-3' />
              Vedette
            </Badge>
          )}
          <Badge variant='outline' className='text-blue-600'>
            {row.postType}
          </Badge>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Statistiques',
      render: (value: any, row: Article) => (
        <div className='flex items-center space-x-4 text-sm'>
          <div className='flex items-center space-x-1'>
            <Eye className='h-4 w-4 text-muted-foreground' />
            <span>{row.viewCount.toLocaleString()}</span>
          </div>
          {row.allowComments && (
            <div className='flex items-center space-x-1'>
              <MessageCircle className='h-4 w-4 text-muted-foreground' />
              <span>{row._count.comments}</span>
            </div>
          )}
          {row.readingTimeMinutes && (
            <div className='flex items-center space-x-1'>
              <span className='text-muted-foreground'>{row.readingTimeMinutes}min</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'categories',
      label: 'Catégories',
      render: (value: any, row: Article) => (
        <div className='flex flex-wrap gap-1'>
          {row.postCategories.slice(0, 2).map(({ category }) => (
            <Badge key={category.id} variant='outline' className='text-xs'>
              {category.name}
            </Badge>
          ))}
          {row.postCategories.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{row.postCategories.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (value: any, row: Article) => (
        <div className='space-y-1 text-sm'>
          <div className='flex items-center space-x-1'>
            <Calendar className='h-3 w-3 text-muted-foreground' />
            <span>
              {row.publishedAt
                ? `Publié: ${formatDistance(new Date(row.publishedAt), new Date(), { locale: fr })}`
                : 'Non publié'}
            </span>
          </div>
          <div className='text-muted-foreground'>
            Modifié:{' '}
            {formatDistance(new Date(row.updatedAt), new Date(), { locale: fr })}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Article) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
              <Link href={`/admin/articles/${row.id}`}>
                <Eye className='mr-2 h-4 w-4' />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/articles/${row.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Modifier
              </Link>
            </DropdownMenuItem>
            {row.status === 'PUBLISHED' && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/fr/blog/${row.slug}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Voir publié
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => setDeleteArticleId(row.id)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Debounce for search filter
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  useEffect(() => {
    const current = String(state.filters.search || '');
    const handle = setTimeout(() => setDebouncedSearch(current), 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters.search]);

  // Initialize state from URL query on mount
  useEffect(() => {
    if (!searchParams) return;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const postType = searchParams.get('postType') || '';
    const featured = searchParams.get('featured') === 'true';
    const hasComments = searchParams.get('hasComments') === 'true';
    const minViews = searchParams.get('minViews')
      ? parseInt(searchParams.get('minViews') as string)
      : undefined;

    setState(prev => ({
      ...prev,
      currentPage: isNaN(page) ? prev.currentPage : page,
      pageSize: isNaN(pageSize) ? prev.pageSize : pageSize,
      sortColumn: sortBy,
      sortDirection: sortOrder,
      filters: {
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(postType ? { postType } : {}),
        ...(featured ? { featured } : {}),
        ...(hasComments ? { hasComments } : {}),
        ...(minViews ? { minViews } : {}),
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL (shallow) when controls change
  useEffect(() => {
    if (!pathname) return;
    const params = new URLSearchParams();
    params.set('page', String(state.currentPage));
    params.set('pageSize', String(state.pageSize));
    if (state.sortColumn) params.set('sortBy', state.sortColumn);
    if (state.sortDirection) params.set('sortOrder', state.sortDirection);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (state.filters.status) params.set('status', String(state.filters.status));
    if (state.filters.postType) params.set('postType', String(state.filters.postType));
    if (state.filters.featured) params.set('featured', 'true');
    if (state.filters.hasComments) params.set('hasComments', 'true');
    if (state.filters.minViews) params.set('minViews', String(state.filters.minViews));
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(url, { scroll: false });
  }, [
    pathname,
    router,
    state.currentPage,
    state.pageSize,
    state.sortColumn,
    state.sortDirection,
    debouncedSearch,
    state.filters.status,
    state.filters.postType,
    state.filters.featured,
    state.filters.hasComments,
    state.filters.minViews,
  ]);

  useEffect(() => {
    if (session) loadArticles();
  }, [
    session,
    state.currentPage,
    state.pageSize,
    state.sortColumn,
    state.sortDirection,
    debouncedSearch,
    state.filters.status,
    state.filters.postType,
    state.filters.featured,
    state.filters.hasComments,
    state.filters.minViews,
  ]);

  const loadArticles = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams();
      params.set('page', String(state.currentPage));
      params.set('pageSize', String(state.pageSize));
      if (state.sortColumn) params.set('sortBy', state.sortColumn);
      if (state.sortDirection) params.set('sortOrder', state.sortDirection);
      if (state.filters) {
        if (debouncedSearch) params.set('search', String(debouncedSearch));
        if (state.filters.status) params.set('status', String(state.filters.status));
        if (state.filters.postType)
          params.set('postType', String(state.filters.postType));
        if (state.filters.featured === true) params.set('featured', 'true');
        if (state.filters.hasComments === true) params.set('hasComments', 'true');
        if (state.filters.minViews)
          params.set('minViews', String(state.filters.minViews));
      }

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch articles (${res.status})`);
      }
      const data = await res.json();

      const articles: Article[] = (data.data?.posts || []).map((post: any) => ({
        id: post.id,
        slug: post.slug,
        status: post.status,
        postType: post.postType,
        featuredImageUrl: post.featuredImageUrl ?? null,
        isFeatured: Boolean(post.isFeatured),
        allowComments: Boolean(post.allowComments),
        viewCount: Number(post.viewCount ?? 0),
        readingTimeMinutes: post.readingTimeMinutes,
        publishedAt: post.publishedAt,
        createdAt: String(post.createdAt),
        updatedAt: String(post.updatedAt),
        author: post.author,
        translation: (post.translations && post.translations[0]) || {
          title: '',
          content: '',
          excerpt: null,
        },
        postCategories: post.postCategories || [],
        _count: post._count || { comments: 0 },
      }));

      setState(prev => ({
        ...prev,
        articles,
        totalCount: Number(data.data?.totalCount ?? articles.length),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de chargement',
        loading: false,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: direction,
      currentPage: 1,
    }));
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      filters,
      currentPage: 1,
    }));
  };

  const handleResetFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {},
      currentPage: 1,
    }));
  };

  const handleDeleteArticle = async () => {
    if (!deleteArticleId) return;

    try {
      const res = await fetch(`/api/admin/posts?id=${deleteArticleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete article (${res.status})`);
      }
      setDeleteArticleId(null);
      await loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Gestion des articles</h1>
          <p className='text-muted-foreground'>
            Gérez tous les articles et contenus de votre blog
          </p>
        </div>
        <Button asChild>
          <Link href='/admin/articles/new'>
            <Plus className='mr-2 h-4 w-4' />
            Ajouter un article
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

      {/* Articles Table */}
      <AdminTable
        title='Articles du blog'
        description={`${state.totalCount} articles au total`}
        columns={columns}
        data={state.articles}
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
      <AlertDialog
        open={deleteArticleId !== null}
        onOpenChange={() => setDeleteArticleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
