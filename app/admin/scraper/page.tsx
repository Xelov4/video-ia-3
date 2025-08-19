/**
 * Admin Scraper Page
 * Advanced AI tool analysis and database management interface
 * Integrated within the admin panel with authentication protection
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ToolAnalysis } from '@/src/types/analysis';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface DatabaseTool {
  id: number;
  tool_name: string;
  tool_category: string;
  tool_link: string;
  overview: string;
  tool_description: string;
  target_audience: string;
  key_features: string;
  use_cases: string;
  tags: string;
  image_url: string;
  slug: string;
  is_active: boolean;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  view_count: number;
  click_count: number;
  favorite_count: number;
  created_at: Date;
  updated_at: Date;
  last_checked_at: Date;
  last_optimized_at?: Date;
}

interface UpdateField {
  key: string;
  label: string;
  description: string;
}

const UPDATE_FIELDS: UpdateField[] = [
  {
    key: 'tool_name',
    label: "Nom de l'outil",
    description: "Nom principal de l'outil",
  },
  { key: 'tool_category', label: 'Catégorie', description: "Catégorie de l'outil" },
  { key: 'overview', label: 'Aperçu', description: "Description courte de l'outil" },
  {
    key: 'tool_description',
    label: 'Description complète',
    description: 'Description détaillée avec HTML',
  },
  {
    key: 'target_audience',
    label: 'Public cible',
    description: "Audience cible de l'outil",
  },
  {
    key: 'key_features',
    label: 'Fonctionnalités clés',
    description: 'Liste des fonctionnalités principales',
  },
  { key: 'tags', label: 'Tags', description: 'Tags pour le référencement' },
  {
    key: 'meta_title',
    label: 'Titre SEO',
    description: 'Titre optimisé pour les moteurs de recherche',
  },
  {
    key: 'meta_description',
    label: 'Description SEO',
    description: 'Description optimisée pour les moteurs de recherche',
  },
  {
    key: 'seo_keywords',
    label: 'Mots-clés SEO',
    description: 'Mots-clés pour le référencement',
  },
];

export default function AdminScraperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ToolAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [professionalMode, setProfessionalMode] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<
    'form' | 'results' | 'logs' | 'database' | 'batch'
  >('form');
  const [tools, setTools] = useState<DatabaseTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<DatabaseTool | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);
  const [batchFilter, setBatchFilter] = useState<
    'all' | 'never_optimized' | 'needs_update'
  >('never_optimized');
  const [batchSelectedTools, setBatchSelectedTools] = useState<number[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Authentication protection
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Load tools from database
  const loadTools = async (page: number = 1, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/tools?${params}`);
      const data = await response.json();

      if (data.success) {
        setTools(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      loadTools(1, searchTerm);
    } else if (activeTab === 'batch') {
      loadBatchTools(batchFilter, 1, searchTerm);
    }
  }, [searchTerm, activeTab, batchFilter, loadBatchTools]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);
    setActiveTab('logs');

    addLog('info', `🚀 Starting analysis for: ${url}`);

    try {
      addLog('info', '📡 Connecting to scraping API...');

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, professional: professionalMode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      addLog('success', '✅ API connection successful');
      addLog('info', '🔍 Analyzing website content...');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      addLog('success', '🎉 Analysis completed successfully!');
      setResult(data);
      setActiveTab('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      addLog('error', `❌ Error: ${errorMessage}`);
      setError(errorMessage);
      setActiveTab('logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatabaseAnalysis = async () => {
    if (!selectedTool) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);
    setActiveTab('logs');

    addLog('info', `🚀 Starting database analysis for: ${selectedTool.tool_name}`);
    addLog(
      'info',
      `📊 Selected fields: ${selectedFields.length > 0 ? selectedFields.join(', ') : 'All fields'}`
    );

    try {
      addLog('info', '📡 Connecting to analysis API...');

      const response = await fetch(`/api/tools/${selectedTool.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: selectedFields,
          updateOptions: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      addLog('success', '✅ API connection successful');
      addLog('info', '🔍 Analyzing tool website...');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      addLog('success', '🎉 Database analysis completed successfully!');
      addLog('info', `📊 Updated fields: ${data.data.updatedFields.join(', ')}`);

      setResult(data.data.analysis);
      setActiveTab('results');

      // Refresh tools list
      loadTools(currentPage, searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      addLog('error', `❌ Error: ${errorMessage}`);
      setError(errorMessage);
      setActiveTab('logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const toggleFieldSelection = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey) ? prev.filter(f => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  // Batch processing functions
  const loadBatchTools = useCallback(async (
    filter: typeof batchFilter,
    page: number = 1,
    search?: string
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (search) {
        params.append('search', search);
      }

      // Add filter for optimization status
      if (filter === 'never_optimized') {
        params.append('filter', 'never_optimized');
      } else if (filter === 'needs_update') {
        params.append('filter', 'needs_update');
      }

      const response = await fetch(`/api/tools?${params}`);
      const data = await response.json();

      if (data.success) {
        setTools(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error loading batch tools:', error);
    }
  }, []);

  const toggleBatchToolSelection = (toolId: number) => {
    setBatchSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const selectAllBatchTools = () => {
    setBatchSelectedTools(tools.map(tool => tool.id));
  };

  const deselectAllBatchTools = () => {
    setBatchSelectedTools([]);
  };

  const handleBatchProcessing = async () => {
    if (batchSelectedTools.length === 0) return;

    setBatchProcessing(true);
    setBatchProgress(0);
    setBatchTotal(batchSelectedTools.length);
    setLogs([]);
    setActiveTab('logs');

    addLog(
      'info',
      `🚀 Starting batch processing for ${batchSelectedTools.length} tools`
    );

    for (let i = 0; i < batchSelectedTools.length; i++) {
      const toolId = batchSelectedTools[i];
      const tool = tools.find(t => t.id === toolId);

      if (!tool) continue;

      try {
        addLog(
          'info',
          `[${i + 1}/${batchSelectedTools.length}] Processing: ${tool.tool_name}`
        );

        const response = await fetch(`/api/tools/${toolId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields:
              selectedFields.length > 0
                ? selectedFields
                : UPDATE_FIELDS.map(f => f.key),
            updateOptions: { updateOptimizedAt: true },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        addLog(
          'success',
          `✅ [${i + 1}/${batchSelectedTools.length}] ${tool.tool_name} processed successfully`
        );
        setBatchProgress(i + 1);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        addLog(
          'error',
          `❌ [${i + 1}/${batchSelectedTools.length}] ${tool.tool_name} failed: ${errorMessage}`
        );
        setBatchProgress(i + 1);
      }

      // Add delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    addLog(
      'success',
      `🎉 Batch processing completed! Processed ${batchSelectedTools.length} tools`
    );
    setBatchProcessing(false);

    // Refresh the tools list
    loadBatchTools(batchFilter, currentPage, searchTerm);
    setBatchSelectedTools([]);
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
        {/* Admin Header */}
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-4xl font-bold text-gray-900'>
            Scraper d'Administration
          </h1>
          <p className='mx-auto max-w-3xl text-lg text-gray-600'>
            Analysez automatiquement les outils d'intelligence artificielle avec des
            logs en temps réel
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className='mb-8 flex space-x-1 rounded-lg bg-white p-1 shadow-sm'>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            📝 URL Directe
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            🗄️ Base de Données
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            ⚡ Traitement en Lot
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            disabled={!result}
          >
            📊 Résultats {result && `(${result.toolName})`}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            📋 Logs ({logs.length})
          </button>
        </div>

        {/* Direct URL Form Tab */}
        {activeTab === 'form' && (
          <div className='rounded-xl bg-white p-8 shadow-lg'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              Analyse d'outil IA par URL
            </h2>

            <form onSubmit={handleScrape} className='space-y-6'>
              <div>
                <label
                  htmlFor='url'
                  className='mb-2 block text-sm font-medium text-gray-700'
                >
                  URL de l'outil IA
                </label>
                <input
                  type='url'
                  id='url'
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder='https://example.com'
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>

              {/* Professional Mode Toggle */}
              <div className='flex items-center space-x-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                <div className='flex-1'>
                  <h3 className='mb-2 text-lg font-semibold text-blue-900'>
                    🚀 Mode Professionnel
                  </h3>
                  <p className='text-sm text-blue-800'>
                    Active l'analyse avancée avec des prompts optimisés pour un contenu
                    ultra-haute qualité, une traduction française professionnelle, et un
                    scoring de qualité détaillé.
                  </p>
                  <div className='mt-2 text-xs text-blue-600'>
                    ✨ Recommandé pour la production et les outils importants
                  </div>
                </div>
                <div className='flex-shrink-0'>
                  <label className='relative inline-flex cursor-pointer items-center'>
                    <input
                      type='checkbox'
                      checked={professionalMode}
                      onChange={e => setProfessionalMode(e.target.checked)}
                      className='peer sr-only'
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                  </label>
                </div>
              </div>

              <button
                type='submit'
                disabled={isLoading || !url.trim()}
                className='w-full transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-bold text-white transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Analyse en cours...
                  </span>
                ) : professionalMode ? (
                  "🚀 Lancer l'analyse professionnelle"
                ) : (
                  "🚀 Lancer l'analyse standard"
                )}
              </button>
            </form>

            {error && (
              <div className='mt-6 rounded-lg border border-red-200 bg-red-50 p-4'>
                <div className='flex items-center'>
                  <span className='mr-2 text-red-500'>❌</span>
                  <span className='text-red-800'>{error}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Database Tools Tab */}
        {activeTab === 'database' && (
          <div className='rounded-xl bg-white p-8 shadow-lg'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              Analyse d'outils depuis la base de données
            </h2>

            {/* Search */}
            <div className='mb-6'>
              <input
                type='text'
                placeholder='Rechercher un outil...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Tools List */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Outils disponibles ({tools.length})
              </h3>
              <div className='max-h-64 space-y-3 overflow-y-auto'>
                {tools.map(tool => (
                  <div
                    key={tool.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedTool?.id === tool.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <h4 className='font-medium text-gray-900'>{tool.tool_name}</h4>
                        <p className='text-sm text-gray-600'>{tool.tool_category}</p>
                        <p className='truncate text-xs text-gray-500'>
                          {tool.tool_link}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span className='text-xs text-gray-500'>
                          {tool.last_checked_at
                            ? new Date(tool.last_checked_at).toLocaleDateString()
                            : 'Jamais vérifié'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            {selectedTool && (
              <div className='mb-6'>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  Champs à mettre à jour
                </h3>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {UPDATE_FIELDS.map(field => (
                    <label
                      key={field.key}
                      className='flex cursor-pointer items-center space-x-3'
                    >
                      <input
                        type='checkbox'
                        checked={selectedFields.includes(field.key)}
                        onChange={() => toggleFieldSelection(field.key)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <div>
                        <span className='text-sm font-medium text-gray-900'>
                          {field.label}
                        </span>
                        <p className='text-xs text-gray-600'>{field.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className='mt-4'>
                  <button
                    onClick={() => setSelectedFields(UPDATE_FIELDS.map(f => f.key))}
                    className='mr-4 text-sm text-blue-600 hover:text-blue-800'
                  >
                    Sélectionner tout
                  </button>
                  <button
                    onClick={() => setSelectedFields([])}
                    className='text-sm text-gray-600 hover:text-gray-800'
                  >
                    Désélectionner tout
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Button */}
            {selectedTool && (
              <button
                onClick={handleDatabaseAnalysis}
                disabled={isLoading}
                className='w-full transform rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 font-bold text-white transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Analyse en cours...
                  </span>
                ) : (
                  `🔍 Analyser et mettre à jour: ${selectedTool.tool_name}`
                )}
              </button>
            )}
          </div>
        )}

        {/* Batch Processing Tab */}
        {activeTab === 'batch' && (
          <div className='rounded-xl bg-white p-8 shadow-lg'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              ⚡ Traitement en lot des outils
            </h2>

            {/* Filter Controls */}
            <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Filtrer par statut d'optimisation
                </label>
                <select
                  value={batchFilter}
                  onChange={e => {
                    setBatchFilter(e.target.value as typeof batchFilter);
                    loadBatchTools(e.target.value as typeof batchFilter, 1, searchTerm);
                    setBatchSelectedTools([]);
                  }}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                >
                  <option value='never_optimized'>Jamais optimisés</option>
                  <option value='needs_update'>
                    Nécessitent une mise à jour (&gt;30 jours)
                  </option>
                  <option value='all'>Tous les outils</option>
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Rechercher
                </label>
                <input
                  type='text'
                  placeholder="Nom de l'outil..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    loadBatchTools(batchFilter, 1, e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='flex items-end'>
                <button
                  onClick={() => loadBatchTools(batchFilter, currentPage, searchTerm)}
                  className='w-full rounded-lg bg-gray-600 px-4 py-3 text-white transition-colors hover:bg-gray-700'
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {batchProcessing && (
              <div className='mb-6 rounded-lg bg-gray-50 p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm text-gray-700'>
                    Progression du traitement
                  </span>
                  <span className='text-sm font-medium text-gray-900'>
                    {batchProgress}/{batchTotal}
                  </span>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-200'>
                  <div
                    className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300'
                    style={{
                      width: `${batchTotal > 0 ? (batchProgress / batchTotal) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Selection Controls */}
            <div className='mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4'>
              <div>
                <span className='font-medium text-gray-900'>
                  {batchSelectedTools.length} outil
                  {batchSelectedTools.length !== 1 ? 's' : ''} sélectionné
                  {batchSelectedTools.length !== 1 ? 's' : ''}
                </span>
                <span className='ml-2 text-sm text-gray-600'>
                  sur {tools.length} disponible{tools.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className='space-x-3'>
                <button
                  onClick={selectAllBatchTools}
                  className='text-sm text-blue-600 hover:text-blue-800'
                  disabled={batchProcessing}
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={deselectAllBatchTools}
                  className='text-sm text-gray-600 hover:text-gray-800'
                  disabled={batchProcessing}
                >
                  Tout désélectionner
                </button>
              </div>
            </div>

            {/* Tools List */}
            <div className='mb-6 max-h-96 space-y-2 overflow-y-auto'>
              {tools.length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  Aucun outil trouvé avec les critères sélectionnés.
                </div>
              ) : (
                tools.map(tool => {
                  const isSelected = batchSelectedTools.includes(tool.id);
                  const optimizedAt = tool.last_optimized_at;
                  const needsUpdate =
                    optimizedAt &&
                    new Date(optimizedAt) <
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={tool.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() =>
                        !batchProcessing && toggleBatchToolSelection(tool.id)
                      }
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() =>
                              !batchProcessing && toggleBatchToolSelection(tool.id)
                            }
                            disabled={batchProcessing}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <div>
                            <h4 className='font-medium text-gray-900'>
                              {tool.tool_name}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {tool.tool_category}
                            </p>
                          </div>
                        </div>
                        <div className='text-right text-sm'>
                          <div className='flex items-center space-x-2'>
                            {!optimizedAt && (
                              <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-800'>
                                Jamais optimisé
                              </span>
                            )}
                            {optimizedAt && needsUpdate && (
                              <span className='rounded bg-orange-100 px-2 py-1 text-xs text-orange-800'>
                                Mise à jour requise
                              </span>
                            )}
                            {optimizedAt && !needsUpdate && (
                              <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-800'>
                                Récent
                              </span>
                            )}
                          </div>
                          <div className='mt-1 text-xs text-gray-500'>
                            {optimizedAt
                              ? `Optimisé: ${new Date(optimizedAt).toLocaleDateString()}`
                              : 'Non optimisé'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Field Selection */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Champs à optimiser
              </h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {UPDATE_FIELDS.map(field => (
                  <label
                    key={field.key}
                    className='flex cursor-pointer items-center space-x-3'
                  >
                    <input
                      type='checkbox'
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleFieldSelection(field.key)}
                      disabled={batchProcessing}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div>
                      <span className='text-sm font-medium text-gray-900'>
                        {field.label}
                      </span>
                      <p className='text-xs text-gray-600'>{field.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className='mt-4'>
                <button
                  onClick={() => setSelectedFields(UPDATE_FIELDS.map(f => f.key))}
                  className='mr-4 text-sm text-blue-600 hover:text-blue-800'
                  disabled={batchProcessing}
                >
                  Sélectionner tout
                </button>
                <button
                  onClick={() => setSelectedFields([])}
                  className='text-sm text-gray-600 hover:text-gray-800'
                  disabled={batchProcessing}
                >
                  Désélectionner tout
                </button>
              </div>
            </div>

            {/* Batch Processing Button */}
            <div className='rounded-lg bg-gray-50 p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Lancement du traitement en lot
                  </h3>
                  <p className='mt-1 text-sm text-gray-600'>
                    {batchSelectedTools.length} outil
                    {batchSelectedTools.length !== 1 ? 's' : ''} sélectionné
                    {batchSelectedTools.length !== 1 ? 's' : ''}
                    {selectedFields.length > 0
                      ? ` • ${selectedFields.length} champ${selectedFields.length !== 1 ? 's' : ''} à optimiser`
                      : ' • Tous les champs seront optimisés'}
                  </p>
                </div>
                {batchProcessing && (
                  <div className='text-right'>
                    <div className='font-medium text-blue-600'>
                      Traitement en cours...
                    </div>
                    <div className='text-sm text-gray-600'>
                      Veuillez patienter, cela peut prendre plusieurs minutes
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBatchProcessing}
                disabled={batchProcessing || batchSelectedTools.length === 0}
                className='w-full transform rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-bold text-white transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {batchProcessing ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Traitement en cours... ({batchProgress}/{batchTotal})
                  </span>
                ) : (
                  `⚡ Lancer le traitement en lot (${batchSelectedTools.length} outils)`
                )}
              </button>

              {batchSelectedTools.length === 0 && (
                <p className='mt-2 text-center text-sm text-gray-500'>
                  Sélectionnez au moins un outil pour commencer le traitement
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <div className='rounded-xl bg-white p-8 shadow-lg'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Résultats de l'analyse
              </h2>
              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                <span>Confiance: {result.confidence}%</span>
                {(result as { qualityScore?: number }).qualityScore && (
                  <span>Qualité: {(result as { qualityScore?: number }).qualityScore}/10</span>
                )}
                {(result as { completenessScore?: number }).completenessScore && (
                  <span>Complétude: {(result as { completenessScore?: number }).completenessScore}%</span>
                )}
                {(result as { processingMode?: string }).processingMode && (
                  <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                    {(result as { processingMode?: string }).processingMode === 'professional' ? 'PRO' : 'STD'}
                  </span>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              {/* Basic Info */}
              <div className='space-y-6'>
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                    📋 Informations générales
                  </h3>
                  <div className='space-y-3'>
                    <div>
                      <span className='text-sm font-medium text-gray-600'>
                        Nom de l'outil:
                      </span>
                      <p className='font-medium text-gray-900'>{result.toolName}</p>
                    </div>
                    <div>
                      <span className='text-sm font-medium text-gray-600'>
                        Fonction principale:
                      </span>
                      <p className='text-gray-900'>{result.primaryFunction}</p>
                    </div>
                    <div>
                      <span className='text-sm font-medium text-gray-600'>
                        Catégorie:
                      </span>
                      <span className='inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800'>
                        {result.category}
                      </span>
                    </div>
                    <div>
                      <span className='text-sm font-medium text-gray-600'>
                        Modèle de prix:
                      </span>
                      <span className='inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'>
                        {result.pricingModel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-gray-50 p-6'>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                    🎯 Public cible
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {result.targetAudience.map((audience, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800'
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='rounded-lg bg-gray-50 p-6'>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>🏷️ Tags</h3>
                  <div className='flex flex-wrap gap-2'>
                    {result.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className='space-y-6'>
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                    ⚡ Fonctionnalités clés
                  </h3>
                  <ul className='space-y-2'>
                    {result.keyFeatures.map((feature, index) => (
                      <li key={index} className='flex items-start'>
                        <span className='mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></span>
                        <span className='text-gray-700'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Details */}
                {result.pricingDetails && (
                  <div className='rounded-lg bg-gray-50 p-6'>
                    <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                      💰 Détails de prix
                    </h3>
                    <div className='space-y-3'>
                      <div>
                        <span className='text-sm font-medium text-gray-600'>
                          Modèle:
                        </span>
                        <span className='ml-2 text-gray-900'>
                          {result.pricingDetails.model}
                        </span>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-600'>
                          Niveau gratuit:
                        </span>
                        <span
                          className={`ml-2 ${result.pricingDetails.freeTier ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {result.pricingDetails.freeTier ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-600'>
                          Plans payants:
                        </span>
                        <span
                          className={`ml-2 ${result.pricingDetails.paidPlans ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {result.pricingDetails.paidPlans ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      {result.pricingDetails.pricingNotes && (
                        <div>
                          <span className='text-sm font-medium text-gray-600'>
                            Notes:
                          </span>
                          <p className='mt-1 text-gray-700'>
                            {result.pricingDetails.pricingNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Affiliate Info */}
                {result.affiliateInfo && (
                  <div className='rounded-lg bg-gray-50 p-6'>
                    <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                      🤝 Programme d'affiliation
                    </h3>
                    <div className='space-y-3'>
                      <div>
                        <span className='text-sm font-medium text-gray-600'>
                          Programme disponible:
                        </span>
                        <span
                          className={`ml-2 ${result.affiliateInfo.hasAffiliateProgram ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {result.affiliateInfo.hasAffiliateProgram
                            ? '✅ Oui'
                            : '❌ Non'}
                        </span>
                      </div>
                      {result.affiliateInfo.notes && (
                        <div>
                          <span className='text-sm font-medium text-gray-600'>
                            Notes:
                          </span>
                          <p className='mt-1 text-gray-700'>
                            {result.affiliateInfo.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className='mt-8 rounded-lg bg-gray-50 p-6'>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  📝 Description détaillée
                </h3>
                <div
                  className='prose max-w-none text-gray-700'
                  dangerouslySetInnerHTML={{ __html: result.description }}
                />
              </div>
            )}

            {/* Metrics */}
            <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='rounded-lg bg-gray-50 p-6'>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  📊 Métriques de qualité
                </h3>
                <div className='space-y-4'>
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Confiance</span>
                      <span className='text-sm font-medium text-gray-900'>
                        {result.confidence}%
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500'
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Complétude des données
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {result.dataCompleteness}%
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-green-500'
                        style={{ width: `${result.dataCompleteness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {result.recommendedActions && result.recommendedActions.length > 0 && (
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                    💡 Actions recommandées
                  </h3>
                  <ul className='space-y-2'>
                    {result.recommendedActions.map((action, index) => (
                      <li key={index} className='flex items-start'>
                        <span className='mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500'></span>
                        <span className='text-sm text-gray-700'>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className='rounded-xl bg-white p-8 shadow-lg'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900'>
                📋 Logs en temps réel
              </h2>
              <button
                onClick={() => setLogs([])}
                className='rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700'
              >
                🗑️ Vider les logs
              </button>
            </div>

            <div className='h-96 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm'>
              {logs.length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  Aucun log disponible. Lancez une analyse pour voir les logs en temps
                  réel.
                </div>
              ) : (
                <div className='space-y-2'>
                  {logs.map(log => (
                    <div key={log.id} className='flex items-start space-x-3'>
                      <span className='mt-1 text-xs text-gray-500'>
                        {log.timestamp}
                      </span>
                      <span className={`${getLogColor(log.type)}`}>
                        {getLogIcon(log.type)}
                      </span>
                      <span className='flex-1 text-gray-300'>{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
