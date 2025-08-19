/**
 * Admin Image HTTP Page - Complete Rewrite
 * Modern interface with shadcn/ui components for health checking and screenshot capture
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Progress } from '@/src/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { toast } from 'sonner';

interface Tool {
  id: number;
  toolName: string;
  toolLink: string;
  toolCategory: string;
  imageUrl: string | null;
  isActive: boolean;
  httpStatusCode: number | null;
  lastCheckedAt: string | null;
  last_optimized_at: string | null;
  featured: boolean;
  quality_score: number | null;
}

interface HealthCheckResult {
  toolId: number;
  toolName: string;
  toolLink: string;
  toolCategory: string;
  httpStatusCode: number;
  isActive: boolean;
  screenshotUrl: string | null;
  error: string | null;
  processingTime: number;
  last_optimized_at: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface FilterState {
  search: string;
  category: string;
  status: string;
  featured: boolean;
}

export default function AdminImageHttpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [_loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalTools, setTotalTools] = useState(0);
  const [activeTab, setActiveTab] = useState('tools');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    featured: false,
  });

  // Categories for filter
  const [categories, setCategories] = useState<string[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Authentication protection
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load tools from database
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tools?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      if (data.success) {
        const toolsData = data.tools.map((tool: { id: number; toolName: string; toolLink: string; toolCategory: string; statusCode?: number; isActive: boolean; lastHttpCheck?: string }) => ({
          id: tool.id,
          toolName: tool.toolName,
          toolLink: tool.toolLink,
          toolCategory: tool.toolCategory,
          imageUrl: tool.imageUrl,
          isActive: tool.isActive,
          httpStatusCode: tool.httpStatusCode,
          lastCheckedAt: tool.lastCheckedAt,
          last_optimized_at: tool.last_optimized_at,
          featured: tool.featured,
          quality_score: tool.quality_score,
        }));

        setTools(toolsData);
        setTotalTools(toolsData.length);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(toolsData.map(t => t.toolCategory).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        addLog('info', `📊 Loaded ${toolsData.length} tools from database`);
        applyFilters(toolsData, filters);
      }
    } catch (error) {
      addLog('error', `❌ Error loading tools: ${error}`);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, [filters, applyFilters]);

  // Apply filters to tools
  const applyFilters = useCallback((toolsToFilter: Tool[], currentFilters: FilterState) => {
    let filtered = toolsToFilter;

    // Search filter
    if (currentFilters.search) {
      filtered = filtered.filter(
        tool =>
          tool.toolName.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
          tool.toolLink.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters.category) {
      filtered = filtered.filter(tool => tool.toolCategory === currentFilters.category);
    }

    // Status filter
    if (currentFilters.status) {
      if (currentFilters.status === 'active') {
        filtered = filtered.filter(tool => tool.isActive);
      } else if (currentFilters.status === 'inactive') {
        filtered = filtered.filter(tool => !tool.isActive);
      }
    }

    // Featured filter
    if (currentFilters.featured) {
      filtered = filtered.filter(tool => tool.featured);
    }

    setFilteredTools(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [pageSize]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(tools, newFilters);
  };

  // Get paginated tools
  const getPaginatedTools = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTools.slice(startIndex, endIndex);
  };

  // Load tools on component mount
  useEffect(() => {
    if (session) {
      loadTools();
    }
  }, [session, loadTools]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Selection handlers
  const toggleToolSelection = (toolId: number) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const selectAllTools = () => {
    const currentPageTools = getPaginatedTools();
    setSelectedTools(currentPageTools.map(t => t.id));
  };

  const deselectAllTools = () => {
    setSelectedTools([]);
  };

  const startHealthCheck = async () => {
    const toolsToProcess =
      selectedTools.length > 0 ? selectedTools : tools.map(t => t.id);

    if (toolsToProcess.length === 0) {
      toast.warning('No tools to process');
      return;
    }

    setProcessing(true);
    setResults([]);
    setCurrentProgress(0);
    addLog('info', `🚀 Starting health check for ${toolsToProcess.length} tools`);

    const newResults: HealthCheckResult[] = [];

    for (let i = 0; i < toolsToProcess.length; i++) {
      const toolId = toolsToProcess[i];
      const tool = tools.find(t => t.id === toolId);

      if (!tool) continue;

      const startTime = Date.now();

      addLog('info', `[${i + 1}/${toolsToProcess.length}] Checking: ${tool.toolName}`);

      try {
        const response = await fetch('/api/admin/image-http/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolId: tool.id, toolLink: tool.toolLink }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const healthResult: HealthCheckResult = {
            toolId: tool.id,
            toolName: tool.toolName,
            toolLink: tool.toolLink,
            toolCategory: tool.toolCategory,
            httpStatusCode: result.data.httpStatusCode,
            isActive: result.data.isActive,
            screenshotUrl: result.data.screenshotUrl,
            error: null,
            processingTime: Date.now() - startTime,
            last_optimized_at: new Date().toISOString(),
          };

          newResults.push(healthResult);

          // Update tool status in local state
          setTools(prev =>
            prev.map(t =>
              t.id === tool.id
                ? {
                    ...t,
                    httpStatusCode: result.data.httpStatusCode,
                    isActive: result.data.isActive,
                    last_optimized_at: new Date().toISOString(),
                  }
                : t
            )
          );

          const statusIcon = result.data.isActive ? '✅' : '❌';
          addLog(
            'success',
            `[${i + 1}/${toolsToProcess.length}] ${tool.toolName}: ${statusIcon} ${result.data.httpStatusCode}`
          );
          toast.success(`${tool.toolName}: ${result.data.httpStatusCode}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(
          'error',
          `[${i + 1}/${toolsToProcess.length}] ${tool.toolName}: ❌ ${errorMessage}`
        );

        newResults.push({
          toolId: tool.id,
          toolName: tool.toolName,
          toolLink: tool.toolLink,
          toolCategory: tool.toolCategory,
          httpStatusCode: 0,
          isActive: false,
          screenshotUrl: null,
          error: errorMessage,
          processingTime: Date.now() - startTime,
          last_optimized_at: new Date().toISOString(),
        });

        toast.error(`${tool.toolName}: ${errorMessage}`);
      }

      setCurrentProgress(i + 1);

      // Add delay to avoid overwhelming the server
      if (i < toolsToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setResults(newResults);
    setProcessing(false);
    addLog(
      'success',
      `🎉 Health check completed! Processed ${toolsToProcess.length} tools`
    );

    // Summary
    const activeTools = newResults.filter(r => r.isActive).length;
    const inactiveTools = newResults.filter(r => !r.isActive).length;
    addLog('info', `📊 Summary: ${activeTools} active, ${inactiveTools} inactive`);

    toast.success(
      `Health check completed! ${activeTools} active, ${inactiveTools} inactive`
    );

    // Refresh tools list
    await loadTools();
  };

  const stopHealthCheck = () => {
    setProcessing(false);
    addLog('warning', '⏹️ Health check stopped by user');
    toast.warning('Health check stopped');
  };


  const getStatusBadge = (statusCode: number | null, _isActive: boolean) => {
    if (statusCode === null) return <Badge variant='secondary'>Non vérifié</Badge>;
    if (statusCode >= 200 && statusCode < 300)
      return <Badge className='bg-green-100 text-green-800'>Actif</Badge>;
    if (statusCode >= 300 && statusCode < 400)
      return <Badge className='bg-yellow-100 text-yellow-800'>Redirection</Badge>;
    return <Badge className='bg-red-100 text-red-800'>Inactif</Badge>;
  };

  const getStatusColor = (statusCode: number | null) => {
    if (statusCode === null) return 'text-gray-500';
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Loading and authentication states
  if (status === 'loading' || !session) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p>Chargement de l'interface d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-4xl font-bold text-gray-900'>
            🔍 Health Check & Screenshots
          </h1>
          <p className='mx-auto max-w-3xl text-lg text-gray-600'>
            Vérifiez le statut HTTP de vos outils et capturez automatiquement des
            screenshots
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='tools'>📊 Outils ({totalTools})</TabsTrigger>
            <TabsTrigger value='results'>📈 Résultats ({results.length})</TabsTrigger>
            <TabsTrigger value='logs'>📋 Logs ({logs.length})</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value='tools' className='space-y-6'>
            {/* Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle>🎮 Contrôle du Health Check</CardTitle>
                <CardDescription>
                  Sélectionnez les outils à vérifier et lancez le processus
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Statistics */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                  <div className='rounded-lg bg-blue-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-blue-600'>{totalTools}</div>
                    <div className='text-sm text-blue-600'>Total</div>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {tools.filter(t => t.isActive).length}
                    </div>
                    <div className='text-sm text-green-600'>Actifs</div>
                  </div>
                  <div className='rounded-lg bg-red-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-red-600'>
                      {tools.filter(t => !t.isActive).length}
                    </div>
                    <div className='text-sm text-red-600'>Inactifs</div>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {selectedTools.length}
                    </div>
                    <div className='text-sm text-purple-600'>Sélectionnés</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-wrap justify-center gap-4'>
                  {!processing ? (
                    <Button
                      onClick={startHealthCheck}
                      disabled={tools.length === 0}
                      size='lg'
                      className='bg-green-600 hover:bg-green-700'
                    >
                      <PlayIcon className='mr-2 h-5 w-5' />
                      Lancer le Health Check
                    </Button>
                  ) : (
                    <Button onClick={stopHealthCheck} size='lg' variant='destructive'>
                      <StopIcon className='mr-2 h-5 w-5' />
                      Arrêter
                    </Button>
                  )}

                  <Button
                    onClick={loadTools}
                    disabled={processing}
                    variant='outline'
                    size='lg'
                  >
                    <ArrowPathIcon className='mr-2 h-5 w-5' />
                    Actualiser
                  </Button>
                </div>

                {/* Progress Bar */}
                {processing && (
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progression</span>
                      <span>
                        {currentProgress}/{totalTools} (
                        {Math.round((currentProgress / totalTools) * 100)}%)
                      </span>
                    </div>
                    <Progress
                      value={(currentProgress / totalTools) * 100}
                      className='h-3'
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Filtres et Recherche</CardTitle>
                <CardDescription>
                  Filtrez les outils pour faciliter la sélection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                  <div>
                    <label className='text-sm font-medium'>Recherche</label>
                    <Input
                      placeholder='Nom ou URL...'
                      value={filters.search}
                      onChange={e => handleFilterChange('search', e.target.value)}
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Catégorie</label>
                    <Select
                      value={filters.category}
                      onValueChange={value => handleFilterChange('category', value)}
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='Toutes' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>Toutes</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Statut</label>
                    <Select
                      value={filters.status}
                      onValueChange={value => handleFilterChange('status', value)}
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='Tous' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>Tous</SelectItem>
                        <SelectItem value='active'>Actifs</SelectItem>
                        <SelectItem value='inactive'>Inactifs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='mt-6 flex items-center space-x-2'>
                    <Checkbox
                      id='featured'
                      checked={filters.featured}
                      onCheckedChange={checked =>
                        handleFilterChange('featured', checked as boolean)
                      }
                    />
                    <label htmlFor='featured' className='text-sm'>
                      En vedette uniquement
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools Table */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>📋 Liste des Outils</CardTitle>
                    <CardDescription>
                      {filteredTools.length} outils trouvés • Page {currentPage} sur{' '}
                      {totalPages}
                    </CardDescription>
                  </div>
                  <div className='flex space-x-2'>
                    <Button onClick={selectAllTools} variant='outline' size='sm'>
                      Tout sélectionner
                    </Button>
                    <Button onClick={deselectAllTools} variant='outline' size='sm'>
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>
                          <Checkbox
                            checked={
                              selectedTools.length === getPaginatedTools().length &&
                              getPaginatedTools().length > 0
                            }
                            onCheckedChange={checked =>
                              checked ? selectAllTools() : deselectAllTools()
                            }
                          />
                        </TableHead>
                        <TableHead>Outil</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Code HTTP</TableHead>
                        <TableHead>Dernière vérification</TableHead>
                        <TableHead>Dernière optimisation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedTools().map(tool => (
                        <TableRow key={tool.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={() => toggleToolSelection(tool.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>{tool.toolName}</div>
                              <div className='max-w-xs truncate text-sm text-gray-500'>
                                {tool.toolLink}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {tool.toolCategory || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(tool.httpStatusCode, tool.isActive)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-mono ${getStatusColor(tool.httpStatusCode)}`}
                            >
                              {tool.httpStatusCode || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm text-gray-500'>
                              {tool.lastCheckedAt
                                ? new Date(tool.lastCheckedAt).toLocaleDateString()
                                : 'Jamais'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm text-gray-500'>
                              {tool.last_optimized_at
                                ? new Date(tool.last_optimized_at).toLocaleDateString()
                                : 'Jamais'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-sm text-gray-700'>
                      Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
                      {Math.min(currentPage * pageSize, filteredTools.length)} sur{' '}
                      {filteredTools.length} résultats
                    </div>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <span className='flex items-center px-3 py-2 text-sm'>
                        Page {currentPage} sur {totalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage(prev => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value='results' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>📊 Résultats du Health Check</CardTitle>
                <CardDescription>Détails des vérifications effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className='py-8 text-center text-gray-500'>
                    Aucun résultat disponible. Lancez un health check pour voir les
                    résultats.
                  </div>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Outil</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Code HTTP</TableHead>
                          <TableHead>Screenshot</TableHead>
                          <TableHead>Temps</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map(result => (
                          <TableRow key={result.toolId}>
                            <TableCell>
                              <div>
                                <div className='font-medium'>{result.toolName}</div>
                                <div className='max-w-xs truncate text-sm text-gray-500'>
                                  {result.toolLink}
                                </div>
                                {result.error && (
                                  <div className='mt-1 text-xs text-red-600'>
                                    Erreur: {result.error}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline'>
                                {result.toolCategory || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(result.httpStatusCode, result.isActive)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-mono ${getStatusColor(result.httpStatusCode)}`}
                              >
                                {result.httpStatusCode || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {result.screenshotUrl ? (
                                <Button variant='outline' size='sm' asChild>
                                  <a
                                    href={result.screenshotUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                  >
                                    📸 Voir
                                  </a>
                                </Button>
                              ) : (
                                <Badge variant='secondary'>❌ Échec</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className='text-sm text-gray-500'>
                                {result.processingTime}ms
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value='logs' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>📋 Logs en temps réel</CardTitle>
                    <CardDescription>
                      Historique détaillé des opérations
                    </CardDescription>
                  </div>
                  <Button onClick={() => setLogs([])} variant='outline' size='sm'>
                    🗑️ Vider les logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='h-96 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm'>
                  {logs.length === 0 ? (
                    <div className='py-8 text-center text-gray-500'>
                      Aucun log disponible. Lancez un health check pour voir les logs en
                      temps réel.
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {logs.map(log => (
                        <div key={log.id} className='flex items-start space-x-3'>
                          <span className='mt-1 text-xs text-gray-500'>
                            {log.timestamp}
                          </span>
                          <span
                            className={`${
                              log.type === 'info'
                                ? 'text-blue-400'
                                : log.type === 'success'
                                  ? 'text-green-400'
                                  : log.type === 'warning'
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                            }`}
                          >
                            {log.type === 'info'
                              ? 'ℹ️'
                              : log.type === 'success'
                                ? '✅'
                                : log.type === 'warning'
                                  ? '⚠️'
                                  : '❌'}
                          </span>
                          <span className='flex-1 text-gray-300'>{log.message}</span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
