'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolAnalysis } from '@/src/types/analysis'

interface LogEntry {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

export default function ScraperPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ToolAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState<'form' | 'results' | 'logs'>('form')
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
        body: JSON.stringify({ url }),
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
            📝 Formulaire
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

        {/* Form Tab */}
        {activeTab === 'form' && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Analyse d'outil IA</h2>
            
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
                  '🚀 Lancer l\'analyse'
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

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Résultats de l'analyse</h2>
              <span className="text-sm text-gray-400">Confiance: {result.confidence}%</span>
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
                        <span className={`ml-2 ${result.pricingDetails.freeTier ? 'text-green-400' : 'text-red-400'}`}>
                          {result.pricingDetails.freeTier ? '✅ Oui' : '❌ Non'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400">Plans payants:</span>
                        <span className={`ml-2 ${result.pricingDetails.paidPlans ? 'text-green-400' : 'text-red-400'}`}>
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
                        <span className={`ml-2 ${result.affiliateInfo.hasAffiliateProgram ? 'text-green-400' : 'text-red-400'}`}>
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
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Complétude des données</span>
                      <span className="text-sm font-medium text-white">{result.dataCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.dataCompleteness}%` }}></div>
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
                      <span className={`${getLogColor(log.type)}`}>{getLogIcon(log.type)}</span>
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