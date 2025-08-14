'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolAnalysis } from '@/src/types/analysis'

interface LogEntry {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

interface DatabaseTool {
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
  created_at: Date
  updated_at: Date
  last_checked_at: Date
  last_optimized_at?: Date
}

interface UpdateField {
  key: string
  label: string
  description: string
}

const UPDATE_FIELDS: UpdateField[] = [
  { key: 'tool_name', label: 'Nom de l\'outil', description: 'Nom principal de l\'outil' },
  { key: 'tool_category', label: 'Catégorie', description: 'Catégorie de l\'outil' },
  { key: 'overview', label: 'Aperçu', description: 'Description courte de l\'outil' },
  { key: 'tool_description', label: 'Description complète', description: 'Description détaillée avec HTML' },
  { key: 'target_audience', label: 'Public cible', description: 'Audience cible de l\'outil' },
  { key: 'key_features', label: 'Fonctionnalités clés', description: 'Liste des fonctionnalités principales' },
  { key: 'tags', label: 'Tags', description: 'Tags pour le référencement' },
  { key: 'meta_title', label: 'Titre SEO', description: 'Titre optimisé pour les moteurs de recherche' },
  { key: 'meta_description', label: 'Description SEO', description: 'Description optimisée pour les moteurs de recherche' },
  { key: 'seo_keywords', label: 'Mots-clés SEO', description: 'Mots-clés pour le référencement' },
  { key: 'quality_score', label: 'Score de qualité', description: 'Score de confiance de l\'analyse' }
]

export default function ScraperPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ToolAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [professionalMode, setProfessionalMode] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState<'form' | 'results' | 'logs' | 'database' | 'batch'>('form')
  const [tools, setTools] = useState<DatabaseTool[]>([])
  const [selectedTool, setSelectedTool] = useState<DatabaseTool | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [batchFilter, setBatchFilter] = useState<'all' | 'never_optimized' | 'needs_update'>('never_optimized')
  const [batchSelectedTools, setBatchSelectedTools] = useState<number[]>([])
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchTotal, setBatchTotal] = useState(0)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    }
    setLogs(prev => [...prev, newLog])
  }

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  // Load tools from database
  const loadTools = async (page: number = 1, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/tools?${params}`)
      const data = await response.json()

      if (data.success) {
        setTools(data.data)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.page)
      }
    } catch (error) {
      console.error('Error loading tools:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'database') {
      loadTools(1, searchTerm)
    } else if (activeTab === 'batch') {
      loadBatchTools(batchFilter, 1, searchTerm)
    }
  }, [searchTerm, activeTab, batchFilter])

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)
    setLogs([])
    setActiveTab('logs')

    addLog('info', `🚀 Starting analysis for: ${url}`)

    try {
      addLog('info', '📡 Connecting to scraping API...')
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, professional: professionalMode }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      addLog('success', '✅ API connection successful')
      addLog('info', '🔍 Analyzing website content...')

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      addLog('success', '🎉 Analysis completed successfully!')
      setResult(data)
      setActiveTab('results')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      addLog('error', `❌ Error: ${errorMessage}`)
      setError(errorMessage)
      setActiveTab('logs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDatabaseAnalysis = async () => {
    if (!selectedTool) return

    setIsLoading(true)
    setError(null)
    setResult(null)
    setLogs([])
    setActiveTab('logs')

    addLog('info', `🚀 Starting database analysis for: ${selectedTool.tool_name}`)
    addLog('info', `📊 Selected fields: ${selectedFields.length > 0 ? selectedFields.join(', ') : 'All fields'}`)

    try {
      addLog('info', '📡 Connecting to analysis API...')
      
      const response = await fetch(`/api/tools/${selectedTool.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fields: selectedFields,
          updateOptions: {}
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      addLog('success', '✅ API connection successful')
      addLog('info', '🔍 Analyzing tool website...')

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      addLog('success', '🎉 Database analysis completed successfully!')
      addLog('info', `📊 Updated fields: ${data.data.updatedFields.join(', ')}`)
      
      setResult(data.data.analysis)
      setActiveTab('results')
      
      // Refresh tools list
      loadTools(currentPage, searchTerm)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      addLog('error', `❌ Error: ${errorMessage}`)
      setError(errorMessage)
      setActiveTab('logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'ℹ️'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '📝'
    }
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'text-blue-400'
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const toggleFieldSelection = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }

  // Batch processing functions
  const loadBatchTools = async (filter: typeof batchFilter, page: number = 1, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      
      if (search) {
        params.append('search', search)
      }

      // Add filter for optimization status
      if (filter === 'never_optimized') {
        params.append('filter', 'never_optimized')
      } else if (filter === 'needs_update') {
        params.append('filter', 'needs_update')
      }

      const response = await fetch(`/api/tools?${params}`)
      const data = await response.json()

      if (data.success) {
        setTools(data.data)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.page)
      }
    } catch (error) {
      console.error('Error loading batch tools:', error)
    }
  }

  const toggleBatchToolSelection = (toolId: number) => {
    setBatchSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const selectAllBatchTools = () => {
    setBatchSelectedTools(tools.map(tool => tool.id))
  }

  const deselectAllBatchTools = () => {
    setBatchSelectedTools([])
  }

  const handleBatchProcessing = async () => {
    if (batchSelectedTools.length === 0) return

    setBatchProcessing(true)
    setBatchProgress(0)
    setBatchTotal(batchSelectedTools.length)
    setLogs([])
    setActiveTab('logs')

    addLog('info', `🚀 Starting batch processing for ${batchSelectedTools.length} tools`)

    for (let i = 0; i < batchSelectedTools.length; i++) {
      const toolId = batchSelectedTools[i]
      const tool = tools.find(t => t.id === toolId)
      
      if (!tool) continue

      try {
        addLog('info', `[${i + 1}/${batchSelectedTools.length}] Processing: ${tool.tool_name}`)
        
        const response = await fetch(`/api/tools/${toolId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            fields: selectedFields.length > 0 ? selectedFields : UPDATE_FIELDS.map(f => f.key),
            updateOptions: { updateOptimizedAt: true }
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        addLog('success', `✅ [${i + 1}/${batchSelectedTools.length}] ${tool.tool_name} processed successfully`)
        setBatchProgress(i + 1)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        addLog('error', `❌ [${i + 1}/${batchSelectedTools.length}] ${tool.tool_name} failed: ${errorMessage}`)
        setBatchProgress(i + 1)
      }

      // Add delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    addLog('success', `🎉 Batch processing completed! Processed ${batchSelectedTools.length} tools`)
    setBatchProcessing(false)
    
    // Refresh the tools list
    loadBatchTools(batchFilter, currentPage, searchTerm)
    setBatchSelectedTools([])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Video-IA Scraper
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Analysez automatiquement n'importe quel outil d'intelligence artificielle avec des logs en temps réel
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'form' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📝 URL Directe
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'database' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            🗄️ Base de Données
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'batch' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            ⚡ Traitement en Lot
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'results' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            disabled={!result}
          >
            📊 Résultats {result && `(${result.toolName})`}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'logs' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📋 Logs ({logs.length})
          </button>
        </div>

        {/* Direct URL Form Tab */}
        {activeTab === 'form' && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Analyse d'outil IA par URL</h2>
            
            <form onSubmit={handleScrape} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                  URL de l'outil IA
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Professional Mode Toggle */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">🚀 Mode Professionnel</h3>
                  <p className="text-sm text-gray-300">
                    Active l'analyse avancée avec des prompts optimisés pour un contenu ultra-haute qualité, 
                    une traduction française professionnelle, et un scoring de qualité détaillé.
                  </p>
                  <div className="mt-2 text-xs text-blue-400">
                    ✨ Recommandé pour la production et les outils importants
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={professionalMode}
                      onChange={(e) => setProfessionalMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyse en cours...
                  </span>
                ) : (
                  professionalMode ? '🚀 Lancer l\'analyse professionnelle' : '🚀 Lancer l\'analyse standard'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span>
                  <span className="text-red-200">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Database Tools Tab */}
        {activeTab === 'database' && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Analyse d'outils depuis la base de données</h2>
            
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher un outil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tools List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Outils disponibles ({tools.length})</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTool?.id === tool.id
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{tool.tool_name}</h4>
                        <p className="text-sm text-gray-400">{tool.tool_category}</p>
                        <p className="text-xs text-gray-500 truncate">{tool.tool_link}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Score: {tool.quality_score}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {tool.last_checked_at ? new Date(tool.last_checked_at).toLocaleDateString() : 'Jamais vérifié'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            {selectedTool && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Champs à mettre à jour</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {UPDATE_FIELDS.map((field) => (
                    <label key={field.key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.key)}
                        onChange={() => toggleFieldSelection(field.key)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">{field.label}</span>
                        <p className="text-xs text-gray-400">{field.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedFields(UPDATE_FIELDS.map(f => f.key))}
                    className="text-sm text-blue-400 hover:text-blue-300 mr-4"
                  >
                    Sélectionner tout
                  </button>
                  <button
                    onClick={() => setSelectedFields([])}
                    className="text-sm text-gray-400 hover:text-gray-300"
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
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">⚡ Traitement en lot des outils</h2>
            
            {/* Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filtrer par statut d'optimisation
                </label>
                <select
                  value={batchFilter}
                  onChange={(e) => {
                    setBatchFilter(e.target.value as typeof batchFilter)
                    loadBatchTools(e.target.value as typeof batchFilter, 1, searchTerm)
                    setBatchSelectedTools([])
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="never_optimized">Jamais optimisés</option>
                  <option value="needs_update">Nécessitent une mise à jour (&gt;30 jours)</option>
                  <option value="all">Tous les outils</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Nom de l'outil..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    loadBatchTools(batchFilter, 1, e.target.value)
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => loadBatchTools(batchFilter, currentPage, searchTerm)}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {batchProcessing && (
              <div className="mb-6 bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Progression du traitement</span>
                  <span className="text-sm text-white font-medium">{batchProgress}/{batchTotal}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${batchTotal > 0 ? (batchProgress / batchTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Selection Controls */}
            <div className="mb-4 flex items-center justify-between bg-gray-700 rounded-lg p-4">
              <div>
                <span className="text-white font-medium">
                  {batchSelectedTools.length} outil{batchSelectedTools.length !== 1 ? 's' : ''} sélectionné{batchSelectedTools.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-400 text-sm ml-2">sur {tools.length} disponible{tools.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-x-3">
                <button
                  onClick={selectAllBatchTools}
                  className="text-sm text-blue-400 hover:text-blue-300"
                  disabled={batchProcessing}
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={deselectAllBatchTools}
                  className="text-sm text-gray-400 hover:text-gray-300"
                  disabled={batchProcessing}
                >
                  Tout désélectionner
                </button>
              </div>
            </div>

            {/* Tools List */}
            <div className="mb-6 space-y-2 max-h-96 overflow-y-auto">
              {tools.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Aucun outil trouvé avec les critères sélectionnés.
                </div>
              ) : (
                tools.map((tool) => {
                  const isSelected = batchSelectedTools.includes(tool.id)
                  const optimizedAt = tool.last_optimized_at
                  const needsUpdate = optimizedAt && new Date(optimizedAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  
                  return (
                    <div
                      key={tool.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                      onClick={() => !batchProcessing && toggleBatchToolSelection(tool.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !batchProcessing && toggleBatchToolSelection(tool.id)}
                            disabled={batchProcessing}
                            className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <h4 className="font-medium text-white">{tool.tool_name}</h4>
                            <p className="text-sm text-gray-400">{tool.tool_category}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Score: {tool.quality_score}</span>
                            {!optimizedAt && (
                              <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                                Jamais optimisé
                              </span>
                            )}
                            {optimizedAt && needsUpdate && (
                              <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs">
                                Mise à jour requise
                              </span>
                            )}
                            {optimizedAt && !needsUpdate && (
                              <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                Récent
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {optimizedAt 
                              ? `Optimisé: ${new Date(optimizedAt).toLocaleDateString()}`
                              : 'Non optimisé'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Field Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Champs à optimiser</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UPDATE_FIELDS.map((field) => (
                  <label key={field.key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleFieldSelection(field.key)}
                      disabled={batchProcessing}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white">{field.label}</span>
                      <p className="text-xs text-gray-400">{field.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedFields(UPDATE_FIELDS.map(f => f.key))}
                  className="text-sm text-blue-400 hover:text-blue-300 mr-4"
                  disabled={batchProcessing}
                >
                  Sélectionner tout
                </button>
                <button
                  onClick={() => setSelectedFields([])}
                  className="text-sm text-gray-400 hover:text-gray-300"
                  disabled={batchProcessing}
                >
                  Désélectionner tout
                </button>
              </div>
            </div>

            {/* Batch Processing Button */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Lancement du traitement en lot</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {batchSelectedTools.length} outil{batchSelectedTools.length !== 1 ? 's' : ''} sélectionné{batchSelectedTools.length !== 1 ? 's' : ''} 
                    {selectedFields.length > 0 
                      ? ` • ${selectedFields.length} champ${selectedFields.length !== 1 ? 's' : ''} à optimiser`
                      : ' • Tous les champs seront optimisés'
                    }
                  </p>
                </div>
                {batchProcessing && (
                  <div className="text-right">
                    <div className="text-blue-400 font-medium">Traitement en cours...</div>
                    <div className="text-sm text-gray-400">
                      Veuillez patienter, cela peut prendre plusieurs minutes
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleBatchProcessing}
                disabled={batchProcessing || batchSelectedTools.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {batchProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours... ({batchProgress}/{batchTotal})
                  </span>
                ) : (
                  `⚡ Lancer le traitement en lot (${batchSelectedTools.length} outils)`
                )}
              </button>
              
              {batchSelectedTools.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-2">
                  Sélectionnez au moins un outil pour commencer le traitement
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Résultats de l'analyse</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Confiance: {result.confidence}%</span>
                {(result as any).qualityScore && (
                  <span>Qualité: {(result as any).qualityScore}/10</span>
                )}
                {(result as any).completenessScore && (
                  <span>Complétude: {(result as any).completenessScore}%</span>
                )}
                {(result as any).processingMode && (
                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                    {(result as any).processingMode === 'professional' ? 'PRO' : 'STD'}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Informations générales</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Nom de l'outil:</span>
                      <p className="text-white font-medium">{result.toolName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Fonction principale:</span>
                      <p className="text-white">{result.primaryFunction}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Catégorie:</span>
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {result.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Modèle de prix:</span>
                      <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        {result.pricingModel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🎯 Public cible</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.targetAudience.map((audience, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">⚡ Fonctionnalités clés</h3>
                  <ul className="space-y-2">
                    {result.keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Details */}
                {result.pricingDetails && (
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">💰 Détails de prix</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-400">Modèle:</span>
                        <span className="ml-2 text-white">{result.pricingDetails.model}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400">Niveau gratuit:</span>
                        <span className={`ml-2 ${result.pricingDetails.freeTier ? 'text-green-400' : 'text-red-400'}`}
                          {result.pricingDetails.freeTier ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400">Plans payants:</span>
                        <span className={`ml-2 ${result.pricingDetails.paidPlans ? 'text-green-400' : 'text-red-400'}`}
                          {result.pricingDetails.paidPlans ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      {result.pricingDetails.pricingNotes && (
                        <div>
                          <span className="text-sm font-medium text-gray-400">Notes:</span>
                          <p className="text-gray-300 mt-1">{result.pricingDetails.pricingNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Affiliate Info */}
                {result.affiliateInfo && (
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">🤝 Programme d'affiliation</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-400">Programme disponible:</span>
                        <span className={`ml-2 ${result.affiliateInfo.hasAffiliateProgram ? 'text-green-400' : 'text-red-400'}`}
                          {result.affiliateInfo.hasAffiliateProgram ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      {result.affiliateInfo.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-400">Notes:</span>
                          <p className="text-gray-300 mt-1">{result.affiliateInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className="mt-8 bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📝 Description détaillée</h3>
                <div 
                  className="prose prose-invert max-w-none text-gray-300"
                  dangerouslySetInnerHTML={{ __html: result.description }}
                />
              </div>
            )}

            {/* Metrics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Métriques de qualité</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Confiance</span>
                      <span className="text-sm font-medium text-white">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.confidence}%` }}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Complétude des données</span>
                      <span className="text-sm font-medium text-white">{result.dataCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.dataCompleteness}%` }}</div>
                    </div>
                  </div>
                </div>
              </div>

              {result.recommendedActions && result.recommendedActions.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">💡 Actions recommandées</h3>
                  <ul className="space-y-2">
                    {result.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></span>
                        <span className="text-sm text-gray-300">{action}</span>
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
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">📋 Logs en temps réel</h2>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                🗑️ Vider les logs
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Aucun log disponible. Lancez une analyse pour voir les logs en temps réel.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <span className="text-gray-500 text-xs mt-1">{log.timestamp}</span>
                      <span className={`${getLogColor(log.type)}`}{getLogIcon(log.type)}</span>
                      <span className="text-gray-300 flex-1">{log.message}</span>
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
  )
}