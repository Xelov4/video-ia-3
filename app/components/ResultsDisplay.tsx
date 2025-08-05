import { useState } from 'react'
import { ToolAnalysis } from '../page'

interface ResultsDisplayProps {
  results: ToolAnalysis
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'english' | 'french'>('english')

  const formatConfidence = (confidence: number) => {
    if (confidence >= 90) return 'Very High'
    if (confidence >= 80) return 'High'
    if (confidence >= 70) return 'Medium'
    return 'Low'
  }

  const formatCompleteness = (completeness: number) => {
    if (completeness >= 90) return 'Complete'
    if (completeness >= 70) return 'Mostly Complete'
    if (completeness >= 50) return 'Partial'
    return 'Incomplete'
  }

  const hasSocialLinks = Object.values(results.socialLinks || {}).some(link => link)
  const hasContactInfo = Object.values(results.contactInfo || {}).some(info => info)

  const renderEnglishContent = () => (
    <div className="space-y-6">
      {/* Tool Name and Confidence */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {results.toolName}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Confidence: <span className="font-medium">{formatConfidence(results.confidence)}</span></span>
          <span>Completeness: <span className="font-medium">{formatCompleteness(results.dataCompleteness)}</span></span>
        </div>
      </div>

      {/* Screenshot */}
      {results.screenshotUrl && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Website Screenshot</h4>
          <div className="relative">
            <img 
              src={results.screenshotUrl} 
              alt={`Screenshot of ${results.toolName}`}
              className="w-full rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Tool Information</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Slug:</span>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{results.slug}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Primary Function:</span>
              <p className="text-gray-900">{results.primaryFunction}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Category:</span>
              <p className="text-gray-900">{results.category}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Pricing Model:</span>
              <p className="text-gray-900">{results.pricingModel}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Pricing Summary:</span>
              <p className="text-gray-900">{results.pricingSummary}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Target Audience</h4>
          <div className="space-y-2">
            {results.targetAudience.map((audience, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2 mb-2">
                {audience}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Key Features</h4>
        <ul className="space-y-2">
          {results.keyFeatures.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Social Media Links */}
      {hasSocialLinks && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Social Media Links</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(results.socialLinks || {}).map(([platform, url]) => {
              if (!url) return null
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50"
                >
                  <span className="capitalize">{platform}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {hasContactInfo && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2">
            {results.contactInfo?.email && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <a href={`mailto:${results.contactInfo.email}`} className="text-blue-600 hover:text-blue-800">
                  {results.contactInfo.email}
                </a>
              </div>
            )}
            {results.contactInfo?.phone && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <span className="text-gray-900">{results.contactInfo.phone}</span>
              </div>
            )}
            {results.contactInfo?.contactFormUrl && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Contact Form:</span>
                <a href={results.contactInfo.contactFormUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  View Form
                </a>
              </div>
            )}
            {results.contactInfo?.supportUrl && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Support:</span>
                <a href={results.contactInfo.supportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Support Page
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affiliate Information */}
      {results.affiliateInfo && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Affiliate Program</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Has Affiliate Program:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${results.affiliateInfo.hasAffiliateProgram ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {results.affiliateInfo.hasAffiliateProgram ? 'Yes' : 'No'}
              </span>
            </div>
            {results.affiliateInfo.affiliateProgramUrl && (
              <div>
                <span className="text-sm font-medium text-gray-600">Affiliate Program:</span>
                <a href={results.affiliateInfo.affiliateProgramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-2">
                  View Program
                </a>
              </div>
            )}
            {results.affiliateInfo.affiliateContactEmail && (
              <div>
                <span className="text-sm font-medium text-gray-600">Affiliate Contact:</span>
                <a href={`mailto:${results.affiliateInfo.affiliateContactEmail}`} className="text-blue-600 hover:text-blue-800 ml-2">
                  {results.affiliateInfo.affiliateContactEmail}
                </a>
              </div>
            )}
            {results.affiliateInfo.notes && (
              <div>
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <p className="text-gray-700 ml-2">{results.affiliateInfo.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Details */}
      {results.pricingDetails && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Pricing Information</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Model:</span>
              <p className="text-gray-900">{results.pricingDetails.model}</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${results.pricingDetails.freeTier ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm text-gray-600">Free Tier</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${results.pricingDetails.paidPlans ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm text-gray-600">Paid Plans</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${results.pricingDetails.enterpriseAvailable ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm text-gray-600">Enterprise</span>
              </div>
            </div>
            {results.pricingDetails.pricingNotes && (
              <div>
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <p className="text-gray-700 text-sm">{results.pricingDetails.pricingNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Content */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-3">SEO Content</h4>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Meta Title:</span>
            <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded mt-1">{results.metaTitle}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Meta Description:</span>
            <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded mt-1">{results.metaDescription}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {results.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HTML Description */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-3">HTML Description</h4>
        <div 
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: results.description }}
        />
      </div>

      {/* Recommended Actions */}
      {results.recommendedActions && results.recommendedActions.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Recommended Actions</h4>
          <ul className="space-y-2">
            {results.recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderFrenchContent = () => {
    if (!results.translations) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🇫🇷</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            French Translation Not Available
          </h3>
          <p className="text-gray-600">
            French translation will be generated during the analysis process.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Tool Name */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {results.translations.toolName}
          </h3>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Informations de l'outil</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Fonction principale:</span>
                <p className="text-gray-900">{results.translations.primaryFunction}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Résumé des prix:</span>
                <p className="text-gray-900">{results.translations.pricingSummary}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Public cible</h4>
            <div className="space-y-2">
              {results.translations.targetAudience.map((audience, index) => (
                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2 mb-2">
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Fonctionnalités principales</h4>
          <ul className="space-y-2">
            {results.translations.keyFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SEO Content */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Contenu SEO</h4>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Titre Meta:</span>
              <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded mt-1">{results.translations.metaTitle}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Description Meta:</span>
              <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded mt-1">{results.translations.metaDescription}</p>
            </div>
          </div>
        </div>

        {/* HTML Description */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Description HTML</h4>
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: results.translations.description }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('english')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'english'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setActiveTab('french')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'french'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🇫🇷 Français
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'english' ? renderEnglishContent() : renderFrenchContent()}

      {/* Export Options */}
      <div className="flex space-x-3">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(results, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${results.toolName.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.json`
            link.click()
            URL.revokeObjectURL(url)
          }}
          className="btn-primary"
        >
          Export as JSON
        </button>
        <button
          onClick={() => {
            const csvData = [
              ['Tool Name', 'Primary Function', 'Category', 'Pricing Model', 'Meta Title', 'Meta Description'],
              [
                results.toolName,
                results.primaryFunction,
                results.category,
                results.pricingModel,
                results.metaTitle,
                results.metaDescription
              ]
            ]
            const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n')
            const dataBlob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${results.toolName.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.csv`
            link.click()
            URL.revokeObjectURL(url)
          }}
          className="btn-secondary"
        >
          Export as CSV
        </button>
      </div>
    </div>
  )
} 