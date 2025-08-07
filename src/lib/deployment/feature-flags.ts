/**
 * Système de Feature Flags & Rollback Strategy - Video-IA.net
 * 
 * Système de feature flags multilingue avec rollback intelligent :
 * - Feature flags par langue et région
 * - Rollback automatique basé sur métriques
 * - A/B testing multilingue
 * - Configuration centralisée avec hot reload
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale } from '@/middleware'

// Types pour le système de feature flags
export interface FeatureFlag {
  id: string
  name: string
  description: string
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage'
  value: any
  defaultValue: any
  enabled: boolean
  rules: FeatureFlagRule[]
  languages: SupportedLocale[]
  environments: Environment[]
  rolloutStrategy: RolloutStrategy
  monitoring: FeatureFlagMonitoring
  created: Date
  lastModified: Date
  version: number
}

export interface FeatureFlagRule {
  id: string
  name: string
  condition: RuleCondition
  value: any
  priority: number
  enabled: boolean
}

export interface RuleCondition {
  type: 'user' | 'language' | 'country' | 'device' | 'time' | 'percentage' | 'custom'
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'in' | 'not_in' | 'regex'
  field: string
  value: any
}

export interface RolloutStrategy {
  type: 'immediate' | 'gradual' | 'canary' | 'blue_green' | 'ring'
  percentage: number
  targetGroups: string[]
  schedule?: {
    startDate: Date
    endDate?: Date
    increments: Array<{
      date: Date
      percentage: number
    }>
  }
  conditions: {
    languages?: SupportedLocale[]
    countries?: string[]
    devices?: string[]
    userSegments?: string[]
  }
}

export interface FeatureFlagMonitoring {
  metrics: {
    errorRate: number
    performanceImpact: number
    userSatisfaction: number
    conversionRate: number
  }
  thresholds: {
    errorRateMax: number
    performanceThreshold: number
    userSatisfactionMin: number
    conversionRateMin: number
  }
  autoRollback: {
    enabled: boolean
    triggers: AutoRollbackTrigger[]
    cooldownMinutes: number
  }
}

export interface AutoRollbackTrigger {
  metric: string
  condition: 'gt' | 'lt' | 'equals'
  value: number
  duration: number // minutes
  languages?: SupportedLocale[]
}

export type Environment = 'development' | 'staging' | 'production'

export interface FeatureFlagContext {
  userId?: string
  sessionId?: string
  language: SupportedLocale
  country?: string
  device: string
  userAgent?: string
  customAttributes?: Record<string, any>
}

export interface RollbackEvent {
  id: string
  featureFlagId: string
  trigger: string
  reason: string
  language?: SupportedLocale
  affectedUsers: number
  timestamp: Date
  rollbackData: {
    previousValue: any
    newValue: any
    performanceImpact: number
  }
  automatic: boolean
}

/**
 * Gestionnaire principal des feature flags
 */
export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()
  private cache: Map<string, { value: any; timestamp: number; ttl: number }> = new Map()
  private rollbackEvents: RollbackEvent[] = []
  private metricsCollector: Map<string, Array<{ timestamp: Date; value: number }>> = new Map()
  private environment: Environment
  private isInitialized = false

  constructor(environment: Environment = 'production') {
    this.environment = environment
    this.initializeFlags()
    this.startMonitoring()
  }

  /**
   * Initialiser les feature flags par défaut
   */
  private async initializeFlags() {
    const defaultFlags: Omit<FeatureFlag, 'created' | 'lastModified' | 'version'>[] = [
      // Feature flag pour nouvelles traductions
      {
        id: 'new-translation-system',
        name: 'New Translation System',
        description: 'Nouveau système de traduction avec cache amélioré',
        type: 'boolean',
        value: false,
        defaultValue: false,
        enabled: true,
        rules: [
          {
            id: 'rule-1',
            name: 'Enable for French users first',
            condition: {
              type: 'language',
              operator: 'equals',
              field: 'language',
              value: 'fr'
            },
            value: true,
            priority: 100,
            enabled: true
          }
        ],
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        environments: ['development', 'staging', 'production'],
        rolloutStrategy: {
          type: 'gradual',
          percentage: 10,
          targetGroups: ['beta-users'],
          conditions: {
            languages: ['fr', 'es']
          }
        },
        monitoring: {
          metrics: {
            errorRate: 0,
            performanceImpact: 0,
            userSatisfaction: 85,
            conversionRate: 12.5
          },
          thresholds: {
            errorRateMax: 2.0, // 2% max
            performanceThreshold: 500, // 500ms max
            userSatisfactionMin: 80,
            conversionRateMin: 10.0
          },
          autoRollback: {
            enabled: true,
            triggers: [
              {
                metric: 'error_rate',
                condition: 'gt',
                value: 5.0,
                duration: 5,
                languages: ['fr']
              }
            ],
            cooldownMinutes: 30
          }
        }
      },

      // Feature flag pour nouveau design
      {
        id: 'new-ui-design',
        name: 'New UI Design',
        description: 'Nouveau design pour les pages d\'outils',
        type: 'percentage',
        value: 25,
        defaultValue: 0,
        enabled: true,
        rules: [
          {
            id: 'rule-2',
            name: 'Show to 50% of German users',
            condition: {
              type: 'language',
              operator: 'equals',
              field: 'language',
              value: 'de'
            },
            value: 50,
            priority: 90,
            enabled: true
          }
        ],
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        environments: ['staging', 'production'],
        rolloutStrategy: {
          type: 'canary',
          percentage: 25,
          targetGroups: ['power-users'],
          schedule: {
            startDate: new Date(),
            increments: [
              { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), percentage: 50 },
              { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), percentage: 100 }
            ]
          },
          conditions: {
            devices: ['desktop', 'tablet']
          }
        },
        monitoring: {
          metrics: {
            errorRate: 0,
            performanceImpact: 0,
            userSatisfaction: 90,
            conversionRate: 15.2
          },
          thresholds: {
            errorRateMax: 1.0,
            performanceThreshold: 300,
            userSatisfactionMin: 85,
            conversionRateMin: 12.0
          },
          autoRollback: {
            enabled: true,
            triggers: [
              {
                metric: 'user_satisfaction',
                condition: 'lt',
                value: 80,
                duration: 10
              }
            ],
            cooldownMinutes: 60
          }
        }
      },

      // Feature flag pour optimisations performance
      {
        id: 'performance-optimizations',
        name: 'Performance Optimizations',
        description: 'Optimisations de performance pour le chargement des pages',
        type: 'json',
        value: {
          enablePrefetch: true,
          cacheStrategy: 'aggressive',
          imageOptimization: true,
          bundleSplitting: true
        },
        defaultValue: {
          enablePrefetch: false,
          cacheStrategy: 'normal',
          imageOptimization: false,
          bundleSplitting: false
        },
        enabled: true,
        rules: [],
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        environments: ['production'],
        rolloutStrategy: {
          type: 'ring',
          percentage: 100,
          targetGroups: ['all-users'],
          conditions: {}
        },
        monitoring: {
          metrics: {
            errorRate: 0,
            performanceImpact: -200, // Amélioration de 200ms
            userSatisfaction: 92,
            conversionRate: 14.8
          },
          thresholds: {
            errorRateMax: 0.5,
            performanceThreshold: -100, // Doit améliorer d'au moins 100ms
            userSatisfactionMin: 90,
            conversionRateMin: 14.0
          },
          autoRollback: {
            enabled: true,
            triggers: [
              {
                metric: 'performance_impact',
                condition: 'gt',
                value: 100, // Si ça ralentit de plus de 100ms
                duration: 5
              }
            ],
            cooldownMinutes: 15
          }
        }
      }
    ]

    // Charger flags depuis la configuration
    defaultFlags.forEach(flagData => {
      const flag: FeatureFlag = {
        ...flagData,
        created: new Date(),
        lastModified: new Date(),
        version: 1
      }
      this.flags.set(flag.id, flag)
    })

    this.isInitialized = true
    console.log(`🚩 Feature flags initialized: ${this.flags.size} flags loaded`)
  }

  /**
   * Obtenir la valeur d'un feature flag
   */
  getFlag<T = any>(
    flagId: string, 
    context: FeatureFlagContext,
    defaultValue?: T
  ): T {
    if (!this.isInitialized) {
      return defaultValue as T
    }

    // Vérifier cache
    const cacheKey = `${flagId}:${this.generateContextHash(context)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.value
    }

    const flag = this.flags.get(flagId)
    if (!flag || !flag.enabled) {
      return defaultValue || flag?.defaultValue
    }

    // Vérifier environnement
    if (!flag.environments.includes(this.environment)) {
      return flag.defaultValue
    }

    // Vérifier langue supportée
    if (!flag.languages.includes(context.language)) {
      return flag.defaultValue
    }

    // Évaluer les règles
    const value = this.evaluateFlag(flag, context)

    // Mettre en cache
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes
    })

    return value
  }

  /**
   * Vérifier si un feature flag est activé
   */
  isEnabled(flagId: string, context: FeatureFlagContext): boolean {
    const value = this.getFlag(flagId, context, false)
    
    // Gérer les différents types
    if (typeof value === 'boolean') {
      return value
    } else if (typeof value === 'number') {
      // Pour les pourcentages, générer un hash stable basé sur l'utilisateur
      const userHash = this.generateUserHash(context)
      return (userHash % 100) < value
    } else if (typeof value === 'string') {
      return value !== '' && value !== 'false' && value !== '0'
    }
    
    return false
  }

  /**
   * Évaluer un feature flag avec ses règles
   */
  private evaluateFlag(flag: FeatureFlag, context: FeatureFlagContext): any {
    // Trier les règles par priorité
    const sortedRules = flag.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority)

    // Évaluer chaque règle
    for (const rule of sortedRules) {
      if (this.evaluateRuleCondition(rule.condition, context)) {
        console.log(`🎯 Flag ${flag.id}: Rule ${rule.name} matched`)
        return rule.value
      }
    }

    // Vérifier stratégie de rollout
    if (this.evaluateRolloutStrategy(flag.rolloutStrategy, context)) {
      return flag.value
    }

    return flag.defaultValue
  }

  /**
   * Évaluer une condition de règle
   */
  private evaluateRuleCondition(condition: RuleCondition, context: FeatureFlagContext): boolean {
    let contextValue: any

    switch (condition.type) {
      case 'user':
        contextValue = context.userId
        break
      case 'language':
        contextValue = context.language
        break
      case 'country':
        contextValue = context.country
        break
      case 'device':
        contextValue = context.device
        break
      case 'custom':
        contextValue = context.customAttributes?.[condition.field]
        break
      case 'percentage':
        const userHash = this.generateUserHash(context)
        contextValue = userHash % 100
        break
      case 'time':
        contextValue = new Date()
        break
      default:
        return false
    }

    return this.evaluateOperator(condition.operator, contextValue, condition.value)
  }

  /**
   * Évaluer un opérateur
   */
  private evaluateOperator(operator: RuleCondition['operator'], contextValue: any, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return contextValue === conditionValue
      case 'not_equals':
        return contextValue !== conditionValue
      case 'contains':
        return String(contextValue).includes(String(conditionValue))
      case 'gt':
        return Number(contextValue) > Number(conditionValue)
      case 'lt':
        return Number(contextValue) < Number(conditionValue)
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(contextValue)
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(contextValue)
      case 'regex':
        return new RegExp(conditionValue).test(String(contextValue))
      default:
        return false
    }
  }

  /**
   * Évaluer stratégie de rollout
   */
  private evaluateRolloutStrategy(strategy: RolloutStrategy, context: FeatureFlagContext): boolean {
    // Vérifier conditions générales
    if (strategy.conditions.languages && !strategy.conditions.languages.includes(context.language)) {
      return false
    }

    if (strategy.conditions.countries && context.country && !strategy.conditions.countries.includes(context.country)) {
      return false
    }

    if (strategy.conditions.devices && !strategy.conditions.devices.includes(context.device)) {
      return false
    }

    // Évaluer selon le type de rollout
    switch (strategy.type) {
      case 'immediate':
        return true
      case 'gradual':
      case 'canary':
        const userHash = this.generateUserHash(context)
        return (userHash % 100) < strategy.percentage
      case 'blue_green':
        // Implémentation simplifiée
        return strategy.percentage >= 50
      case 'ring':
        return this.evaluateRingDeployment(strategy, context)
      default:
        return false
    }
  }

  /**
   * Évaluer déploiement par rings
   */
  private evaluateRingDeployment(strategy: RolloutStrategy, context: FeatureFlagContext): boolean {
    const userHash = this.generateUserHash(context)
    const rings = [10, 25, 50, 100] // Rings progressifs
    
    for (const ringPercentage of rings) {
      if (strategy.percentage >= ringPercentage && (userHash % 100) < ringPercentage) {
        return true
      }
    }
    
    return false
  }

  /**
   * Enregistrer métriques pour monitoring
   */
  recordMetric(flagId: string, metric: string, value: number, language?: SupportedLocale): void {
    const key = `${flagId}:${metric}:${language || 'global'}`
    
    if (!this.metricsCollector.has(key)) {
      this.metricsCollector.set(key, [])
    }
    
    const metrics = this.metricsCollector.get(key)!
    metrics.push({
      timestamp: new Date(),
      value
    })

    // Garder seulement les 100 dernières métriques
    if (metrics.length > 100) {
      metrics.shift()
    }

    // Vérifier les seuils pour auto-rollback
    this.checkAutoRollbackTriggers(flagId, metric, value, language)
  }

  /**
   * Vérifier les triggers d'auto-rollback
   */
  private checkAutoRollbackTriggers(
    flagId: string, 
    metric: string, 
    value: number, 
    language?: SupportedLocale
  ): void {
    const flag = this.flags.get(flagId)
    if (!flag || !flag.monitoring.autoRollback.enabled) {
      return
    }

    for (const trigger of flag.monitoring.autoRollback.triggers) {
      if (trigger.metric !== metric) continue
      
      // Vérifier langue si spécifiée
      if (trigger.languages && language && !trigger.languages.includes(language)) {
        continue
      }

      // Évaluer condition
      let shouldTrigger = false
      switch (trigger.condition) {
        case 'gt':
          shouldTrigger = value > trigger.value
          break
        case 'lt':
          shouldTrigger = value < trigger.value
          break
        case 'equals':
          shouldTrigger = value === trigger.value
          break
      }

      if (shouldTrigger) {
        this.performAutoRollback(flagId, trigger, metric, value, language)
      }
    }
  }

  /**
   * Effectuer rollback automatique
   */
  private performAutoRollback(
    flagId: string,
    trigger: AutoRollbackTrigger,
    metric: string,
    value: number,
    language?: SupportedLocale
  ): void {
    const flag = this.flags.get(flagId)
    if (!flag) return

    console.log(`🚨 Auto-rollback triggered for ${flagId}: ${metric} = ${value}`)

    // Créer événement de rollback
    const rollbackEvent: RollbackEvent = {
      id: `rollback-${Date.now()}`,
      featureFlagId: flagId,
      trigger: `${metric} ${trigger.condition} ${trigger.value}`,
      reason: `Metric threshold exceeded: ${metric} = ${value}`,
      language,
      affectedUsers: this.estimateAffectedUsers(flag, language),
      timestamp: new Date(),
      rollbackData: {
        previousValue: flag.value,
        newValue: flag.defaultValue,
        performanceImpact: value
      },
      automatic: true
    }

    this.rollbackEvents.push(rollbackEvent)

    // Effectuer le rollback
    if (language) {
      // Rollback spécifique à une langue
      this.disableFlagForLanguage(flagId, language)
    } else {
      // Rollback global
      flag.enabled = false
      flag.value = flag.defaultValue
    }

    // Invalider cache
    this.invalidateCache(flagId)

    // Notifier équipe
    this.notifyRollback(rollbackEvent)
  }

  /**
   * Désactiver flag pour une langue spécifique
   */
  private disableFlagForLanguage(flagId: string, language: SupportedLocale): void {
    const flag = this.flags.get(flagId)
    if (!flag) return

    // Ajouter règle pour désactiver cette langue
    flag.rules.push({
      id: `auto-rollback-${Date.now()}`,
      name: `Auto-rollback for ${language}`,
      condition: {
        type: 'language',
        operator: 'equals',
        field: 'language',
        value: language
      },
      value: flag.defaultValue,
      priority: 1000, // Priorité très haute
      enabled: true
    })
  }

  /**
   * Rollback manuel
   */
  rollbackFlag(flagId: string, reason: string, language?: SupportedLocale): boolean {
    const flag = this.flags.get(flagId)
    if (!flag) return false

    const rollbackEvent: RollbackEvent = {
      id: `manual-rollback-${Date.now()}`,
      featureFlagId: flagId,
      trigger: 'manual',
      reason,
      language,
      affectedUsers: this.estimateAffectedUsers(flag, language),
      timestamp: new Date(),
      rollbackData: {
        previousValue: flag.value,
        newValue: flag.defaultValue,
        performanceImpact: 0
      },
      automatic: false
    }

    this.rollbackEvents.push(rollbackEvent)

    if (language) {
      this.disableFlagForLanguage(flagId, language)
    } else {
      flag.enabled = false
      flag.value = flag.defaultValue
    }

    this.invalidateCache(flagId)
    console.log(`🔄 Manual rollback performed for ${flagId}: ${reason}`)
    
    return true
  }

  /**
   * Obtenir historique des rollbacks
   */
  getRollbackHistory(flagId?: string): RollbackEvent[] {
    if (flagId) {
      return this.rollbackEvents.filter(event => event.featureFlagId === flagId)
    }
    return [...this.rollbackEvents]
  }

  /**
   * Obtenir métriques d'un flag
   */
  getFlagMetrics(flagId: string): Record<string, Array<{ timestamp: Date; value: number }>> {
    const metrics: Record<string, Array<{ timestamp: Date; value: number }>> = {}
    
    for (const [key, values] of this.metricsCollector.entries()) {
      if (key.startsWith(`${flagId}:`)) {
        const metricName = key.replace(`${flagId}:`, '')
        metrics[metricName] = values
      }
    }
    
    return metrics
  }

  /**
   * Démarrer monitoring
   */
  private startMonitoring(): void {
    // Monitoring périodique des métriques
    setInterval(() => {
      this.collectSystemMetrics()
      this.cleanupOldMetrics()
    }, 60 * 1000) // Chaque minute

    // Nettoyage du cache
    setInterval(() => {
      this.cleanupCache()
    }, 5 * 60 * 1000) // Toutes les 5 minutes
  }

  /**
   * Collecter métriques système
   */
  private collectSystemMetrics(): void {
    // Simuler collecte de métriques système
    for (const [flagId, flag] of this.flags.entries()) {
      if (flag.enabled) {
        // Simuler métriques
        this.recordMetric(flagId, 'error_rate', Math.random() * 2)
        this.recordMetric(flagId, 'performance_impact', (Math.random() - 0.5) * 200)
        this.recordMetric(flagId, 'user_satisfaction', 80 + Math.random() * 20)
      }
    }
  }

  // Méthodes utilitaires privées
  private generateContextHash(context: FeatureFlagContext): string {
    const key = `${context.userId || 'anon'}-${context.language}-${context.device}`
    return this.simpleHash(key).toString()
  }

  private generateUserHash(context: FeatureFlagContext): number {
    const identifier = context.userId || context.sessionId || 'anonymous'
    return this.simpleHash(identifier)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private estimateAffectedUsers(flag: FeatureFlag, language?: SupportedLocale): number {
    // Simulation - en production, utiliser vraies métriques
    let base = 1000
    if (language) {
      base = base * 0.15 // ~15% des users par langue
    }
    return Math.round(base * (flag.rolloutStrategy.percentage / 100))
  }

  private invalidateCache(flagId?: string): void {
    if (flagId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${flagId}:`)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
    
    for (const [key, metrics] of this.metricsCollector.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoff)
      this.metricsCollector.set(key, filtered)
    }
  }

  private notifyRollback(event: RollbackEvent): void {
    // En production, envoyer vers Slack, email, etc.
    console.log(`🚨 Rollback notification: ${event.featureFlagId} - ${event.reason}`)
  }
}

/**
 * Instance singleton
 */
export const featureFlagManager = new FeatureFlagManager(
  (process.env.NODE_ENV as Environment) || 'production'
)

/**
 * Hook React pour feature flags
 */
export function useFeatureFlags() {
  const getContext = (): FeatureFlagContext => ({
    language: 'en', // À remplacer par vraie détection
    device: 'desktop',
    // Autres propriétés contextuelles
  })

  return {
    getFlag: <T = any>(flagId: string, defaultValue?: T): T =>
      featureFlagManager.getFlag(flagId, getContext(), defaultValue),
    
    isEnabled: (flagId: string): boolean =>
      featureFlagManager.isEnabled(flagId, getContext()),
    
    recordMetric: (flagId: string, metric: string, value: number, language?: SupportedLocale) =>
      featureFlagManager.recordMetric(flagId, metric, value, language),
    
    rollbackFlag: (flagId: string, reason: string, language?: SupportedLocale) =>
      featureFlagManager.rollbackFlag(flagId, reason, language),
    
    getRollbackHistory: (flagId?: string) =>
      featureFlagManager.getRollbackHistory(flagId),
    
    getFlagMetrics: (flagId: string) =>
      featureFlagManager.getFlagMetrics(flagId)
  }
}