/**
 * Simple Tools Grid Component
 * Simplified grid for homepage and other use cases without pagination
 */

'use client'

import { ToolCard } from './ToolCard'

interface Tool {
  id: string
  slug?: string
  displayName: string
  displayDescription?: string
  displayOverview?: string
  toolCategory?: string
  imageUrl?: string
  featured?: boolean
  resolvedLanguage?: string
}

interface SimpleToolsGridProps {
  tools: Tool[]
  lang?: string
  showCategory?: boolean
}

export default function SimpleToolsGrid({ 
  tools, 
  lang = 'en',
  showCategory = true 
}: SimpleToolsGridProps) {
  if (!tools || tools.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tools.map((tool) => (
        <ToolCard 
          key={tool.id} 
          tool={tool} 
          showCategory={showCategory}
          size="medium"
          lang={lang}
        />
      ))}
    </div>
  )
}