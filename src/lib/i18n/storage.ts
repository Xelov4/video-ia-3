/**
 * Système de Stockage et Cache I18n Avancé - Video-IA.net
 * 
 * Gestion intelligente de la persistance des préférences utilisateur
 * et du cache des traductions avec optimisations performance.
 * 
 * Features:
 * - Cache multi-niveau (mémoire + localStorage)
 * - Compression des données stockées
 * - Expiration automatique avec TTL
 * - Synchronisation entre onglets
 * - Fallback gracieux en cas d'erreur
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, DEFAULT_LOCALE } from '@/middleware'

// Types pour le système de stockage
interface StorageItem<T> {
  value: T
  timestamp: number
  ttl: number
  version: number
  compressed?: boolean
}

interface UserPreferencesV2 {
  language: {
    primary: SupportedLocale
    fallbacks: SupportedLocale[]
    autoDetect: boolean
    detectFromContent: boolean
  }
  ui: {
    rememberScrollPosition: boolean
    animationsEnabled: boolean
    compactMode: boolean
    highContrast: boolean
  }
  privacy: {
    allowAnalytics: boolean
    rememberPreferences: boolean
    shareUsageStats: boolean
  }
  advanced: {
    preloadTranslations: boolean
    enableCache: boolean
    maxCacheSize: number
  }
  statistics: {
    languageUsage: Record<SupportedLocale, number>
    lastLanguageChange: Date
    totalSessions: number
    averageSessionDuration: number
  }
  version: number
}

// Configuration du système
const STORAGE_CONFIG = {
  VERSION: 2,
  KEYS: {
    USER_PREFERENCES: 'video-ia-user-prefs-v2',
    TRANSLATION_CACHE: 'video-ia-translation-cache',
    SESSION_DATA: 'video-ia-session',
    NAVIGATION_HISTORY: 'video-ia-nav-history'
  },
  TTL: {
    USER_PREFERENCES: 365 * 24 * 60 * 60 * 1000, // 1 an
    TRANSLATION_CACHE: 24 * 60 * 60 * 1000, // 24h
    SESSION_DATA: 30 * 60 * 1000, // 30 min
    NAVIGATION_HISTORY: 7 * 24 * 60 * 60 * 1000 // 7 jours
  },
  COMPRESSION_THRESHOLD: 1024 // Compresser si > 1KB
} as const

/**
 * Classe principale pour le stockage intelligent
 */
class SmartStorage {
  private memoryCache = new Map<string, any>()
  private compressionSupported = false

  constructor() {
    this.compressionSupported = this.checkCompressionSupport()
    this.initializeStorageEvents()
  }

  /**
   * Vérifier le support de la compression
   */
  private checkCompressionSupport(): boolean {
    try {
      return typeof CompressionStream !== 'undefined' || 
             typeof window !== 'undefined'
    } catch {
      return false
    }
  }

  /**
   * Initialiser les événements de synchronisation
   */
  private initializeStorageEvents() {
    if (typeof window === 'undefined') return

    // Synchronisation entre onglets
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('video-ia-')) {
        // Invalidate memory cache for the changed key
        this.memoryCache.delete(event.key)
        
        // Émettre événement personnalisé
        window.dispatchEvent(new CustomEvent('video-ia-storage-sync', {
          detail: { key: event.key, newValue: event.newValue }
        }))
      }
    })

    // Cleanup périodique
    setInterval(() => {
      this.cleanupExpiredItems()
    }, 60 * 1000) // Toutes les minutes
  }

  /**
   * Compresser des données si nécessaire
   */
  private async compressData(data: string): Promise<string> {
    if (!this.compressionSupported || data.length < STORAGE_CONFIG.COMPRESSION_THRESHOLD) {
      return data
    }

    try {
      // Simple compression en base64 (peut être améliorée avec de vraies libs)
      return btoa(unescape(encodeURIComponent(data)))
    } catch {
      return data
    }
  }

  /**
   * Décompresser des données
   */
  private async decompressData(data: string, isCompressed: boolean = false): Promise<string> {
    if (!isCompressed || !this.compressionSupported) {
      return data
    }

    try {
      return decodeURIComponent(escape(atob(data)))
    } catch {
      return data
    }
  }

  /**
   * Sauvegarder un item avec métadonnées
   */
  async setItem<T>(
    key: string, 
    value: T, 
    ttl: number = STORAGE_CONFIG.TTL.USER_PREFERENCES
  ): Promise<boolean> {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl,
        version: STORAGE_CONFIG.VERSION,
        compressed: false
      }

      const serialized = JSON.stringify(item)
      const compressed = await this.compressData(serialized)
      
      if (compressed !== serialized) {
        item.compressed = true
      }

      // Stocker en mémoire
      this.memoryCache.set(key, item)

      // Stocker en localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, compressed)
      }

      return true
    } catch (error) {
      console.warn(`Failed to store ${key}:`, error)
      return false
    }
  }

  /**
   * Récupérer un item avec validation
   */
  async getItem<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      // Vérifier le cache mémoire d'abord
      const cached = this.memoryCache.get(key)
      if (cached && this.isItemValid(cached)) {
        return cached.value
      }

      // Récupérer depuis localStorage
      if (typeof localStorage === 'undefined') {
        return defaultValue
      }

      const stored = localStorage.getItem(key)
      if (!stored) {
        return defaultValue
      }

      const decompressed = await this.decompressData(stored, stored !== stored)
      const item: StorageItem<T> = JSON.parse(decompressed)

      // Validation de la version et TTL
      if (!this.isItemValid(item)) {
        await this.removeItem(key)
        return defaultValue
      }

      // Mettre à jour le cache mémoire
      this.memoryCache.set(key, item)
      
      return item.value
    } catch (error) {
      console.warn(`Failed to retrieve ${key}:`, error)
      return defaultValue
    }
  }

  /**
   * Vérifier si un item est valide
   */
  private isItemValid<T>(item: StorageItem<T>): boolean {
    if (!item || typeof item !== 'object') return false
    
    // Vérifier la version
    if (item.version !== STORAGE_CONFIG.VERSION) return false
    
    // Vérifier l'expiration
    const now = Date.now()
    if (now - item.timestamp > item.ttl) return false
    
    return true
  }

  /**
   * Supprimer un item
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      this.memoryCache.delete(key)
      
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      }
      
      return true
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error)
      return false
    }
  }

  /**
   * Nettoyer les items expirés
   */
  async cleanupExpiredItems(): Promise<void> {
    if (typeof localStorage === 'undefined') return

    try {
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('video-ia-')) {
          const item = await this.getItem(key)
          if (!item) {
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach(key => this.removeItem(key))
    } catch (error) {
      console.warn('Failed to cleanup expired items:', error)
    }
  }

  /**
   * Obtenir les statistiques du stockage
   */
  getStorageStats() {
    const stats = {
      memoryCacheSize: this.memoryCache.size,
      localStorageUsed: 0,
      totalItems: 0,
      expiredItems: 0
    }

    if (typeof localStorage !== 'undefined') {
      let usedSpace = 0
      let totalItems = 0
      let expiredItems = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('video-ia-')) {
          totalItems++
          const value = localStorage.getItem(key)
          if (value) {
            usedSpace += value.length
            
            try {
              const item = JSON.parse(value)
              if (!this.isItemValid(item)) {
                expiredItems++
              }
            } catch {
              expiredItems++
            }
          }
        }
      }

      stats.localStorageUsed = usedSpace
      stats.totalItems = totalItems
      stats.expiredItems = expiredItems
    }

    return stats
  }
}

// Instance singleton
const smartStorage = new SmartStorage()

/**
 * Hook pour les préférences utilisateur avancées
 */
export class UserPreferencesManager {
  private static instance: UserPreferencesManager
  private storage = smartStorage
  private currentPreferences: UserPreferencesV2 | null = null

  static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager()
    }
    return UserPreferencesManager.instance
  }

  /**
   * Charger les préférences utilisateur
   */
  async loadPreferences(): Promise<UserPreferencesV2> {
    if (this.currentPreferences) {
      return this.currentPreferences
    }

    const defaultPreferences: UserPreferencesV2 = {
      language: {
        primary: DEFAULT_LOCALE,
        fallbacks: ['en'],
        autoDetect: true,
        detectFromContent: false
      },
      ui: {
        rememberScrollPosition: true,
        animationsEnabled: true,
        compactMode: false,
        highContrast: false
      },
      privacy: {
        allowAnalytics: true,
        rememberPreferences: true,
        shareUsageStats: false
      },
      advanced: {
        preloadTranslations: true,
        enableCache: true,
        maxCacheSize: 1000
      },
      statistics: {
        languageUsage: {},
        lastLanguageChange: new Date(),
        totalSessions: 0,
        averageSessionDuration: 0
      },
      version: STORAGE_CONFIG.VERSION
    }

    const stored = await this.storage.getItem<UserPreferencesV2>(
      STORAGE_CONFIG.KEYS.USER_PREFERENCES,
      defaultPreferences
    )

    this.currentPreferences = stored || defaultPreferences
    return this.currentPreferences
  }

  /**
   * Sauvegarder les préférences
   */
  async savePreferences(preferences: Partial<UserPreferencesV2>): Promise<boolean> {
    try {
      const current = await this.loadPreferences()
      const updated = this.deepMerge(current, preferences)
      
      this.currentPreferences = updated
      
      return await this.storage.setItem(
        STORAGE_CONFIG.KEYS.USER_PREFERENCES,
        updated,
        STORAGE_CONFIG.TTL.USER_PREFERENCES
      )
    } catch (error) {
      console.error('Failed to save preferences:', error)
      return false
    }
  }

  /**
   * Mettre à jour les statistiques d'usage
   */
  async updateUsageStats(language: SupportedLocale): Promise<void> {
    const preferences = await this.loadPreferences()
    
    const updatedStats = {
      ...preferences.statistics,
      languageUsage: {
        ...preferences.statistics.languageUsage,
        [language]: (preferences.statistics.languageUsage[language] || 0) + 1
      },
      lastLanguageChange: new Date()
    }

    await this.savePreferences({ statistics: updatedStats })
  }

  /**
   * Deep merge des objets
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key] as any)
      } else {
        result[key] = source[key] as any
      }
    }
    
    return result
  }

  /**
   * Réinitialiser les préférences
   */
  async resetPreferences(): Promise<boolean> {
    this.currentPreferences = null
    return await this.storage.removeItem(STORAGE_CONFIG.KEYS.USER_PREFERENCES)
  }
}

/**
 * Gestionnaire de cache pour les traductions
 */
export class TranslationCacheManager {
  private storage = smartStorage
  private cache = new Map<string, { value: string; hits: number; timestamp: number }>()

  /**
   * Obtenir une traduction du cache
   */
  async getCachedTranslation(
    language: SupportedLocale,
    key: string,
    variables?: Record<string, any>
  ): Promise<string | null> {
    const cacheKey = this.buildCacheKey(language, key, variables)
    
    // Vérifier cache mémoire
    const memoryItem = this.cache.get(cacheKey)
    if (memoryItem) {
      memoryItem.hits++
      return memoryItem.value
    }

    // Vérifier cache persistent
    const cached = await this.storage.getItem<Record<string, any>>(
      STORAGE_CONFIG.KEYS.TRANSLATION_CACHE
    )

    if (cached && cached[cacheKey]) {
      const item = cached[cacheKey]
      
      // Mettre à jour cache mémoire
      this.cache.set(cacheKey, {
        value: item.value,
        hits: item.hits + 1,
        timestamp: item.timestamp
      })
      
      return item.value
    }

    return null
  }

  /**
   * Mettre en cache une traduction
   */
  async setCachedTranslation(
    language: SupportedLocale,
    key: string,
    value: string,
    variables?: Record<string, any>
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(language, key, variables)
    const timestamp = Date.now()

    // Cache mémoire
    this.cache.set(cacheKey, { value, hits: 1, timestamp })

    // Cache persistent
    const cached = await this.storage.getItem<Record<string, any>>(
      STORAGE_CONFIG.KEYS.TRANSLATION_CACHE,
      {}
    ) || {}

    cached[cacheKey] = { value, hits: 1, timestamp }

    // Limiter la taille du cache
    await this.pruneCache(cached)

    await this.storage.setItem(
      STORAGE_CONFIG.KEYS.TRANSLATION_CACHE,
      cached,
      STORAGE_CONFIG.TTL.TRANSLATION_CACHE
    )
  }

  /**
   * Construire une clé de cache
   */
  private buildCacheKey(
    language: SupportedLocale,
    key: string,
    variables?: Record<string, any>
  ): string {
    const variablesStr = variables ? JSON.stringify(variables) : ''
    return `${language}:${key}:${variablesStr}`
  }

  /**
   * Nettoyer le cache en gardant les plus utilisés
   */
  private async pruneCache(cache: Record<string, any>): Promise<void> {
    const maxSize = 500 // Limite du cache
    const entries = Object.entries(cache)

    if (entries.length > maxSize) {
      // Trier par hits puis par timestamp
      const sorted = entries.sort(([, a], [, b]) => {
        if (b.hits !== a.hits) return b.hits - a.hits
        return b.timestamp - a.timestamp
      })

      // Garder seulement les meilleurs
      const pruned = Object.fromEntries(sorted.slice(0, maxSize))
      Object.keys(cache).forEach(key => delete cache[key])
      Object.assign(cache, pruned)
    }
  }

  /**
   * Vider le cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear()
    await this.storage.removeItem(STORAGE_CONFIG.KEYS.TRANSLATION_CACHE)
  }
}

// Export des instances
export const userPrefsManager = UserPreferencesManager.getInstance()
export const translationCache = new TranslationCacheManager()
export { smartStorage }

// Export des types
export type { UserPreferencesV2, StorageItem }