'use client'

import { useState } from 'react'

interface ScraperFormProps {
  onScrape: (url: string) => void
  isLoading: boolean
}

export default function ScraperForm({ onScrape, isLoading }: ScraperFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    onScrape(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          Tool Website URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="input-field"
          disabled={isLoading}
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Tool'}
        </button>
        
        {isLoading && (
          <div className="text-sm text-gray-500">
            This may take 30-60 seconds
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">How it works</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Scrapes the website content and metadata</li>
          <li>• Analyzes content using Gemini AI</li>
          <li>• Extracts tool information and categorizes it</li>
          <li>• Generates SEO-optimized descriptions</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-800 font-medium mb-2">Example URLs</h3>
        <div className="text-yellow-700 text-sm space-y-1">
          <p>Try these AI tool websites:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>https://cassetteai.com/</li>
            <li>https://midjourney.com/</li>
            <li>https://chat.openai.com/</li>
          </ul>
        </div>
      </div>
    </form>
  )
} 