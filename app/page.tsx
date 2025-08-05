'use client'

import { useState } from 'react'
import ScraperForm from './components/ScraperForm'
import ResultsDisplay from './components/ResultsDisplay'
import LoadingSpinner from './components/LoadingSpinner'

export interface ToolAnalysis {
  toolName: string
  slug: string
  primaryFunction: string
  keyFeatures: string[]
  targetAudience: string[]
  pricingModel: string
  category: string
  description: string
  metaTitle: string
  metaDescription: string
  tags: string[]
  confidence: number
  dataCompleteness: number
  recommendedActions: string[]
  socialLinks: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    github?: string
    youtube?: string
    tiktok?: string
    discord?: string
    telegram?: string
    reddit?: string
  }
  contactInfo: {
    email?: string
    contactFormUrl?: string
    supportUrl?: string
    phone?: string
    address?: string
  }
  pricingDetails: {
    model: string
    plans: {
      name: string
      price: string
      features: string[]
      billing: 'monthly' | 'yearly' | 'one-time'
    }[]
    freeTier: boolean
    paidPlans: boolean
    enterpriseAvailable: boolean
    pricingNotes: string
  }
  pricingSummary: string
  affiliateInfo: {
    affiliateProgramUrl?: string
    affiliateContactEmail?: string
    affiliateContactForm?: string
    hasAffiliateProgram: boolean
    notes: string
  }
  translations?: {
    toolName: string
    primaryFunction: string
    keyFeatures: string[]
    targetAudience: string[]
    description: string
    metaTitle: string
    metaDescription: string
    pricingSummary: string
  }
  screenshotUrl?: string
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ToolAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async (url: string) => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze tool')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video-IA.net Tool Scraper MVP
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze AI tools with advanced web scraping, AI-powered content generation, 
            and comprehensive data extraction including screenshots, social links, and pricing information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tool Analysis
              </h2>
              <ScraperForm onScrape={handleScrape} isLoading={isLoading} />
            </div>

            {isLoading && (
              <div className="card">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <LoadingSpinner />
                  <span className="text-gray-600 font-medium">Analyzing tool website...</span>
                </div>
                
                {/* Progress Steps */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Web scraping and content extraction</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Screenshot capture and storage</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Social media link detection</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Contact information extraction</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Pricing analysis with AI</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500">SEO-optimized content generation</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500">French translation generation</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> This process typically takes 10-30 seconds depending on the website complexity and AI processing time.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="card border-red-200 bg-red-50">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Analysis Error
                </h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-4 text-sm text-red-600">
                  <p>Common issues:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Website may be blocking automated access</li>
                    <li>URL might be invalid or unreachable</li>
                    <li>Rate limiting from AI service</li>
                    <li>Network connectivity issues</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {results && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Analysis Results
                </h2>
                <ResultsDisplay results={results} />
              </div>
            )}

            {!results && !isLoading && (
              <div className="card">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-gray-600">
                    Enter a tool URL to start the analysis. The system will extract comprehensive information including screenshots, social links, contact details, and pricing information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            This MVP demonstrates the core functionality of the Video-IA.net Intelligent Tool Scraper.
            Features include web scraping, AI analysis, screenshot capture, social media extraction, 
            contact information detection, and pricing analysis.
          </p>
        </div>
      </div>
    </div>
  )
} 