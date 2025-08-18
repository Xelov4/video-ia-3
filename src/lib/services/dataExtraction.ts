/**
 * Data Extraction Service
 * 
 * Service pour extraire et structurer les données riches des champs texte
 * de la base de données (target_audience, use_cases, key_features, tags)
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../database/client'

export interface AudienceData {
  name: string
  slug: string
  count: number
  description?: string
}

export interface UseCaseData {
  name: string
  slug: string
  count: number
  category?: string
}

export interface FeatureData {
  name: string
  slug: string
  count: number
  category?: string
}

export interface TagData {
  name: string
  slug: string
  count: number
}

export class DataExtractionService {
  
  /**
   * Extraire les audiences uniques depuis target_audience
   */
  static async extractUniqueAudiences(limit?: number): Promise<AudienceData[]> {
    console.log('🎯 Extracting unique audiences from target_audience field...')
    
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true,
        targetAudience: {
          not: null
        },
        NOT: {
          targetAudience: ''
        }
      },
      select: {
        targetAudience: true
      }
    })

    // Compteur d'audiences
    const audienceMap = new Map<string, number>()
    
    tools.forEach(tool => {
      if (!tool.targetAudience) return
      
      // Split par virgules, points-virgules, "and", etc.
      const audiences = tool.targetAudience
        .split(/[,;]|\sand\s|\sor\s/i)
        .map(audience => audience.trim())
        .filter(audience => audience.length > 2 && audience.length < 50)
        .map(audience => this.cleanAudienceString(audience))
        .filter(audience => audience.length > 0)
      
      audiences.forEach(audience => {
        const normalized = this.normalizeString(audience)
        audienceMap.set(normalized, (audienceMap.get(normalized) || 0) + 1)
      })
    })

    // Convertir en array et trier par popularité
    const audiences: AudienceData[] = Array.from(audienceMap.entries())
      .filter(([_, count]) => count >= 5) // Minimum 5 occurrences
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit || 50) // Utiliser limit ou 50 par défaut
      .map(([name, count]) => ({
        name,
        slug: this.createSlug(name),
        count,
        description: this.generateAudienceDescription(name)
      }))

    console.log(`✅ Found ${audiences.length} unique audiences`)
    return audiences
  }

  /**
   * Extraire les cas d'usage depuis use_cases
   */
  static async extractUseCases(limit?: number): Promise<UseCaseData[]> {
    console.log('📝 Extracting use cases from use_cases field...')
    
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true,
        useCases: {
          not: null
        },
        NOT: {
          useCases: ''
        }
      },
      select: {
        useCases: true,
        toolCategory: true
      }
    })

    const useCaseMap = new Map<string, { count: number, categories: Set<string> }>()
    
    tools.forEach(tool => {
      if (!tool.useCases) return
      
      // Split et nettoyer
      const useCases = tool.useCases
        .split(/[,;]|\sand\s|\sor\s/i)
        .map(useCase => useCase.trim())
        .filter(useCase => useCase.length > 5 && useCase.length < 100)
        .map(useCase => this.cleanUseCaseString(useCase))
        .filter(useCase => useCase.length > 0)
      
      useCases.forEach(useCase => {
        const normalized = this.normalizeString(useCase)
        if (!useCaseMap.has(normalized)) {
          useCaseMap.set(normalized, { count: 0, categories: new Set() })
        }
        const data = useCaseMap.get(normalized)!
        data.count++
        if (tool.toolCategory) {
          data.categories.add(tool.toolCategory)
        }
      })
    })

    const useCases: UseCaseData[] = Array.from(useCaseMap.entries())
      .filter(([_, data]) => data.count >= 3) // Minimum 3 occurrences
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit || 100) // Top 100
      .map(([name, data]) => ({
        name,
        slug: this.createSlug(name),
        count: data.count,
        category: data.categories.size > 0 ? Array.from(data.categories)[0] : undefined
      }))

    console.log(`✅ Found ${useCases.length} use cases`)
    return useCases
  }

  /**
   * Extraire les features depuis key_features
   */
  static async extractFeatures(limit?: number): Promise<FeatureData[]> {
    console.log('🔧 Extracting features from key_features field...')
    
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true,
        keyFeatures: {
          not: null
        },
        NOT: {
          keyFeatures: ''
        }
      },
      select: {
        keyFeatures: true,
        toolCategory: true
      }
    })

    const featureMap = new Map<string, { count: number, categories: Set<string> }>()
    
    tools.forEach(tool => {
      if (!tool.keyFeatures) return
      
      // Split et nettoyer
      const features = tool.keyFeatures
        .split(/[,;•\n]|\sand\s|\sor\s/i)
        .map(feature => feature.trim())
        .filter(feature => feature.length > 2 && feature.length < 50)
        .map(feature => this.cleanFeatureString(feature))
        .filter(feature => feature.length > 0)
      
      features.forEach(feature => {
        const normalized = this.normalizeString(feature)
        if (!featureMap.has(normalized)) {
          featureMap.set(normalized, { count: 0, categories: new Set() })
        }
        const data = featureMap.get(normalized)!
        data.count++
        if (tool.toolCategory) {
          data.categories.add(tool.toolCategory)
        }
      })
    })

    const features: FeatureData[] = Array.from(featureMap.entries())
      .filter(([_, data]) => data.count >= 5) // Minimum 5 occurrences
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit || 200) // Top 200
      .map(([name, data]) => ({
        name,
        slug: this.createSlug(name),
        count: data.count,
        category: data.categories.size > 0 ? Array.from(data.categories)[0] : undefined
      }))

    console.log(`✅ Found ${features.length} features`)
    return features
  }

  /**
   * Extraire et nettoyer les tags
   */
  static async extractCleanTags(limit?: number): Promise<TagData[]> {
    console.log('🏷️ Extracting and cleaning tags...')
    
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true,
        tags: {
          not: null
        },
        NOT: {
          tags: ''
        }
      },
      select: {
        tags: true
      }
    })

    const tagMap = new Map<string, number>()
    
    tools.forEach(tool => {
      if (!tool.tags) return
      
      // Split et nettoyer
      const tags = tool.tags
        .split(/[,;]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 1 && tag.length < 30)
        .map(tag => this.cleanTagString(tag))
        .filter(tag => tag.length > 0)
      
      tags.forEach(tag => {
        const normalized = this.normalizeString(tag)
        tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1)
      })
    })

    const tags: TagData[] = Array.from(tagMap.entries())
      .filter(([_, count]) => count >= 3) // Minimum 3 occurrences
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit || 500) // Top 500
      .map(([name, count]) => ({
        name,
        slug: this.createSlug(name),
        count
      }))

    console.log(`✅ Found ${tags.length} clean tags`)
    return tags
  }

  // ========================================
  // UTILITAIRES DE NETTOYAGE
  // ========================================

  private static cleanAudienceString(audience: string): string {
    return audience
      .replace(/^(for\s+|to\s+)/i, '') // Remove "for", "to"
      .replace(/\s+(users|people|professionals)$/i, '') // Remove common suffixes
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
  }

  private static cleanUseCaseString(useCase: string): string {
    return useCase
      .replace(/^(creating\s+|making\s+|building\s+)/i, '') // Remove action prefixes
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
  }

  private static cleanFeatureString(feature: string): string {
    return feature
      .replace(/^[-•\s]+/, '') // Remove bullet points
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
  }

  private static cleanTagString(tag: string): string {
    return tag
      .replace(/^#/, '') // Remove hashtag
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
  }

  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  }

  private static createSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  private static generateAudienceDescription(audience: string): string {
    const descriptions: Record<string, string> = {
      'developers': 'Software developers and programmers',
      'marketers': 'Marketing professionals and digital marketers',
      'designers': 'Graphic designers and creative professionals',
      'content creators': 'Content creators and influencers',
      'businesses': 'Small and medium businesses',
      'students': 'Students and educators',
      'researchers': 'Researchers and data scientists'
    }
    
    return descriptions[audience.toLowerCase()] || `Tools for ${audience}`
  }

  /**
   * Obtenir les statistiques globales
   */
  static async getOverallStats() {
    console.log('📊 Getting overall statistics...')
    
    const [
      totalToolsCount,
      activeCategoriesCount,
      audiencesData,
      useCasesData
    ] = await Promise.all([
      prisma.tool.count({ where: { isActive: true } }),
      prisma.tool.groupBy({
        by: ['toolCategory'],
        where: { isActive: true, toolCategory: { not: null } }
      }),
      this.extractUniqueAudiences(50),
      this.extractUseCases(100)
    ])

    return {
      totalTools: totalToolsCount,
      totalCategories: activeCategoriesCount.length,
      totalAudiences: audiencesData.length,
      totalUseCases: useCasesData.length
    }
  }

  /**
   * Exécuter toutes les extractions en parallèle
   */
  static async extractAllData() {
    console.log('🚀 Starting full data extraction...')
    const startTime = Date.now()

    const [audiences, useCases, features, tags] = await Promise.all([
      this.extractUniqueAudiences(),
      this.extractUseCases(),
      this.extractFeatures(),
      this.extractCleanTags()
    ])

    const duration = Date.now() - startTime
    console.log(`✅ Data extraction completed in ${duration}ms`)

    return {
      audiences,
      useCases,
      features,
      tags,
      stats: {
        totalAudiences: audiences.length,
        totalUseCases: useCases.length,
        totalFeatures: features.length,
        totalTags: tags.length,
        duration
      }
    }
  }
}