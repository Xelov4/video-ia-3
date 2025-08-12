/**
 * Système de Détection Automatique de Langue Avancé - Video-IA.net
 * 
 * Algorithmes intelligents pour détecter la langue préférée utilisateur :
 * - Analyse multi-source (URL, cookie, navigateur, IP, contenu)
 * - Machine learning basique pour améliorer la précision
 * - Cache des détections pour performance
 * - Fallback hiérarchique robuste
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, supportedLocales, defaultLocale } from '@/middleware'
import { userPrefsManager } from './storage'

// Types pour le système de détection
interface DetectionResult {
  language: SupportedLocale
  confidence: number
  source: DetectionSource
  metadata?: Record<string, any>
}

type DetectionSource = 
  | 'url' 
  | 'cookie' 
  | 'localStorage' 
  | 'browser' 
  | 'geolocation' 
  | 'content' 
  | 'userHistory' 
  | 'default'

interface GeoLocationData {
  country?: string
  region?: string
  timezone?: string
}

interface BrowserLanguageInfo {
  languages: string[]
  primary: string
  timezone: string
  locale: string
}

/**
 * Classe principale pour la détection de langue
 */
export class LanguageDetector {
  private cache = new Map<string, DetectionResult>()
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes

  /**
   * Détecter la langue avec algorithme multi-source
   */
  async detectLanguage(context: {
    url?: string
    userAgent?: string
    acceptLanguage?: string
    existingPreferences?: any
  } = {}): Promise<DetectionResult> {
    const cacheKey = this.generateCacheKey(context)
    const cached = this.getCachedResult(cacheKey)
    
    if (cached) {
      return cached
    }

    // Collecter toutes les sources de détection
    const detectionSources = await Promise.allSettled([
      this.detectFromURL(context.url),
      this.detectFromCookie(),
      this.detectFromLocalStorage(),
      this.detectFromBrowser(context.acceptLanguage),
      this.detectFromGeolocation(),
      this.detectFromUserHistory(),
      this.detectFromContentAnalysis()
    ])

    // Analyser les résultats et calculer le score final
    const results = detectionSources
      .filter((result): result is PromiseFulfilledResult<DetectionResult | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value!)

    const finalResult = this.computeFinalResult(results)
    
    // Mettre en cache
    this.cache.set(cacheKey, {
      ...finalResult,
      metadata: {
        ...finalResult.metadata,
        detectedAt: Date.now(),
        sourcesCount: results.length
      }
    })

    return finalResult
  }

  /**
   * Détection depuis l'URL
   */
  private async detectFromURL(url?: string): Promise<DetectionResult | null> {
    if (!url) {
      url = typeof window !== 'undefined' ? window.location.pathname : ''
    }

    const pathSegments = url.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    if (supportedLocales.includes(firstSegment as SupportedLocale)) {
      return {
        language: firstSegment as SupportedLocale,
        confidence: 0.9,
        source: 'url',
        metadata: { url }
      }
    }

    return null
  }

  /**
   * Détection depuis les cookies
   */
  private async detectFromCookie(): Promise<DetectionResult | null> {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('preferred-language='))

    if (langCookie) {
      const language = langCookie.split('=')[1].trim() as SupportedLocale
      if (supportedLocales.includes(language)) {
        return {
          language,
          confidence: 0.8,
          source: 'cookie',
          metadata: { cookieValue: language }
        }
      }
    }

    return null
  }

  /**
   * Détection depuis localStorage
   */
  private async detectFromLocalStorage(): Promise<DetectionResult | null> {
    if (typeof localStorage === 'undefined') return null

    try {
      const prefs = await userPrefsManager.loadPreferences()
      
      if (prefs.language.primary && supportedLocales.includes(prefs.language.primary)) {
        // Calculer confiance basée sur l'usage
        const usage = prefs.statistics.languageUsage[prefs.language.primary] || 0
        const confidence = Math.min(0.75 + (usage * 0.05), 0.95)

        return {
          language: prefs.language.primary,
          confidence,
          source: 'localStorage',
          metadata: { 
            usageCount: usage,
            autoDetect: prefs.language.autoDetect
          }
        }
      }
    } catch (error) {
      console.warn('Failed to detect from localStorage:', error)
    }

    return null
  }

  /**
   * Détection depuis le navigateur
   */
  private async detectFromBrowser(acceptLanguage?: string): Promise<DetectionResult | null> {
    const browserInfo = this.getBrowserLanguageInfo(acceptLanguage)
    
    if (!browserInfo) return null

    // Analyser les langues par ordre de préférence
    for (const browserLang of browserInfo.languages) {
      const lang = this.normalizeLanguageCode(browserLang)
      if (supportedLocales.includes(lang as SupportedLocale)) {
        const position = browserInfo.languages.indexOf(browserLang)
        const confidence = Math.max(0.3, 0.7 - (position * 0.1))

        return {
          language: lang as SupportedLocale,
          confidence,
          source: 'browser',
          metadata: {
            browserLanguages: browserInfo.languages,
            timezone: browserInfo.timezone,
            locale: browserInfo.locale
          }
        }
      }
    }

    return null
  }

  /**
   * Détection géographique (simulation - nécessiterait une vraie API)
   */
  private async detectFromGeolocation(): Promise<DetectionResult | null> {
    // Simulation basée sur le timezone
    if (typeof Intl === 'undefined') return null

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const geoLang = this.getLanguageFromTimezone(timezone)

      if (geoLang && supportedLocales.includes(geoLang)) {
        return {
          language: geoLang,
          confidence: 0.4,
          source: 'geolocation',
          metadata: { timezone }
        }
      }
    } catch (error) {
      console.warn('Geolocation detection failed:', error)
    }

    return null
  }

  /**
   * Détection depuis l'historique utilisateur
   */
  private async detectFromUserHistory(): Promise<DetectionResult | null> {
    try {
      const prefs = await userPrefsManager.loadPreferences()
      const usage = prefs.statistics.languageUsage

      if (Object.keys(usage).length === 0) return null

      // Trouver la langue la plus utilisée
      const mostUsed = Object.entries(usage)
        .sort(([, a], [, b]) => b - a)[0]

      if (mostUsed && supportedLocales.includes(mostUsed[0] as SupportedLocale)) {
        const totalUsage = Object.values(usage).reduce((a, b) => a + b, 0)
        const confidence = Math.min(0.6 + (mostUsed[1] / totalUsage) * 0.3, 0.85)

        return {
          language: mostUsed[0] as SupportedLocale,
          confidence,
          source: 'userHistory',
          metadata: {
            usageStats: usage,
            totalSessions: totalUsage
          }
        }
      }
    } catch (error) {
      console.warn('User history detection failed:', error)
    }

    return null
  }

  /**
   * Détection depuis l'analyse de contenu
   */
  private async detectFromContentAnalysis(): Promise<DetectionResult | null> {
    if (typeof document === 'undefined') return null

    // Analyser le contenu textuel de la page
    const textContent = document.body?.textContent || ''
    
    if (textContent.length < 50) return null

    const detectedLang = this.analyzeTextLanguage(textContent.substring(0, 500))
    
    if (detectedLang.confidence > 0.6 && supportedLocales.includes(detectedLang.language)) {
      return {
        language: detectedLang.language,
        confidence: detectedLang.confidence * 0.5, // Réduire confiance car moins fiable
        source: 'content',
        metadata: {
          textSample: textContent.substring(0, 100),
          textLength: textContent.length
        }
      }
    }

    return null
  }

  /**
   * Calculer le résultat final avec pondération
   */
  private computeFinalResult(results: DetectionResult[]): DetectionResult {
    if (results.length === 0) {
      return {
        language: defaultLocale,
        confidence: 1.0,
        source: 'default'
      }
    }

    // Pondération par source
    const sourceWeights: Record<DetectionSource, number> = {
      url: 1.0,
      cookie: 0.9,
      localStorage: 0.85,
      userHistory: 0.8,
      browser: 0.6,
      geolocation: 0.4,
      content: 0.3,
      default: 0.1
    }

    // Calculer score pondéré pour chaque langue
    const languageScores: Record<string, { score: number; sources: DetectionSource[] }> = {}

    for (const result of results) {
      const weight = sourceWeights[result.source] || 0.1
      const score = result.confidence * weight

      if (!languageScores[result.language]) {
        languageScores[result.language] = { score: 0, sources: [] }
      }

      languageScores[result.language].score += score
      languageScores[result.language].sources.push(result.source)
    }

    // Trouver le meilleur candidat
    const bestCandidate = Object.entries(languageScores)
      .sort(([, a], [, b]) => b.score - a.score)[0]

    if (!bestCandidate) {
      return {
        language: defaultLocale,
        confidence: 1.0,
        source: 'default'
      }
    }

    const [language, data] = bestCandidate
    
    return {
      language: language as SupportedLocale,
      confidence: Math.min(data.score / Math.max(results.length * 0.5, 1), 1.0),
      source: data.sources[0], // Source principale
      metadata: {
        allSources: data.sources,
        totalScore: data.score,
        alternativesConsidered: results.length
      }
    }
  }

  /**
   * Utilitaires de support
   */
  private generateCacheKey(context: any): string {
    return JSON.stringify(context) + '_' + Date.now().toString().slice(-6)
  }

  private getCachedResult(key: string): DetectionResult | null {
    const result = this.cache.get(key)
    if (result && result.metadata?.detectedAt) {
      const age = Date.now() - result.metadata.detectedAt
      if (age < this.CACHE_TTL) {
        return result
      }
      this.cache.delete(key)
    }
    return null
  }

  private getBrowserLanguageInfo(acceptLanguage?: string): BrowserLanguageInfo | null {
    if (typeof navigator === 'undefined' && !acceptLanguage) return null

    const languages = acceptLanguage ? 
      acceptLanguage.split(',').map(l => l.split(';')[0].trim()) :
      (navigator.languages || [navigator.language])

    return {
      languages,
      primary: languages[0] || 'en',
      timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || 'UTC',
      locale: navigator?.language || 'en-US'
    }
  }

  private normalizeLanguageCode(langCode: string): string {
    return langCode.split('-')[0].toLowerCase()
  }

  private getLanguageFromTimezone(timezone: string): SupportedLocale | null {
    // Mapping basique timezone -> langue
    const timezoneMap: Record<string, SupportedLocale> = {
      'Europe/Paris': 'fr',
      'Europe/Rome': 'it',
      'Europe/Madrid': 'es',
      'Europe/Berlin': 'de',
      'Europe/Amsterdam': 'nl',
      'Europe/Lisbon': 'pt',
      'America/New_York': 'en',
      'America/Los_Angeles': 'en'
    }

    return timezoneMap[timezone] || null
  }

  private analyzeTextLanguage(text: string): { language: SupportedLocale; confidence: number } {
    // Patterns linguistiques simples
    const patterns: Record<SupportedLocale, { words: string[]; patterns: RegExp[] }> = {
      en: {
        words: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'],
        patterns: [/ing\b/gi, /\bthe\b/gi, /tion\b/gi]
      },
      fr: {
        words: ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'dans', 'sur'],
        patterns: [/\ble\b/gi, /\bla\b/gi, /tion\b/gi, /ment\b/gi]
      },
      es: {
        words: ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'o', 'en', 'con'],
        patterns: [/\bel\b/gi, /\bla\b/gi, /ción\b/gi, /mente\b/gi]
      },
      it: {
        words: ['il', 'la', 'i', 'le', 'di', 'del', 'e', 'o', 'in', 'con'],
        patterns: [/\bil\b/gi, /\bla\b/gi, /zione\b/gi, /mente\b/gi]
      },
      de: {
        words: ['der', 'die', 'das', 'den', 'dem', 'des', 'und', 'oder', 'in', 'an'],
        patterns: [/\bder\b/gi, /\bdie\b/gi, /ung\b/gi, /lich\b/gi]
      },
      nl: {
        words: ['de', 'het', 'een', 'van', 'in', 'op', 'met', 'voor', 'door', 'naar'],
        patterns: [/\bde\b/gi, /\bhet\b/gi, /ing\b/gi, /lijk\b/gi]
      },
      pt: {
        words: ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'e', 'ou', 'em'],
        patterns: [/\bo\b/gi, /\ba\b/gi, /ção\b/gi, /mente\b/gi]
      }
    }

    let bestMatch = defaultLocale
    let maxScore = 0

    for (const [lang, data] of Object.entries(patterns) as [SupportedLocale, any][]) {
      let score = 0
      
      // Score des mots courants
      for (const word of data.words) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = text.match(regex)
        score += matches ? matches.length : 0
      }

      // Score des patterns
      for (const pattern of data.patterns) {
        const matches = text.match(pattern)
        score += matches ? matches.length * 0.5 : 0
      }

      if (score > maxScore) {
        maxScore = score
        bestMatch = lang
      }
    }

    const confidence = Math.min(maxScore / (text.split(/\s+/).length || 1), 1)
    return { language: bestMatch, confidence }
  }
}

// Instance singleton
export const languageDetector = new LanguageDetector()

/**
 * Hook pour utiliser la détection de langue
 */
export function useLanguageDetection() {
  return {
    detectLanguage: (context?: any) => languageDetector.detectLanguage(context),
    detector: languageDetector
  }
}