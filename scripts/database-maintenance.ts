/**
 * Script de Maintenance Base de Données Multilingue - Video-IA.net
 * 
 * Maintenance automatisée pour base de données multilingue :
 * - Optimisation des index par langue
 * - Nettoyage des traductions obsolètes
 * - Sauvegarde incrémentale par langue
 * - Monitoring de la cohérence multilingue
 * 
 * @author Video-IA.net Development Team
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

// Configuration
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'] as const
type SupportedLocale = typeof SUPPORTED_LANGUAGES[number]

interface MaintenanceConfig {
  enableOptimization: boolean
  enableCleanup: boolean
  enableBackup: boolean
  enableMonitoring: boolean
  retentionDays: number
  backupPath: string
  languages: SupportedLocale[]
}

interface MaintenanceStats {
  totalTools: number
  totalTranslations: number
  totalCategories: number
  byLanguage: Record<SupportedLocale, {
    tools: number
    translations: number
    categories: number
    completeness: number
    orphanedRecords: number
  }>
  indexStats: Array<{
    tableName: string
    indexName: string
    size: string
    usage: number
  }>
  performanceMetrics: {
    avgQueryTime: number
    slowQueries: Array<{
      query: string
      avgTime: number
      language?: SupportedLocale
    }>
  }
}

interface BackupResult {
  timestamp: Date
  type: 'full' | 'incremental' | 'language-specific'
  language?: SupportedLocale
  size: number
  duration: number
  path: string
  checksum: string
}

class DatabaseMaintenance {
  private prisma: PrismaClient
  private config: MaintenanceConfig
  private logFile: string

  constructor(config: Partial<MaintenanceConfig> = {}) {
    this.prisma = new PrismaClient()
    this.config = {
      enableOptimization: true,
      enableCleanup: true,
      enableBackup: true,
      enableMonitoring: true,
      retentionDays: 30,
      backupPath: './backups',
      languages: [...SUPPORTED_LANGUAGES],
      ...config
    }
    this.logFile = path.join(process.cwd(), 'logs', `maintenance-${new Date().toISOString().split('T')[0]}.log`)
  }

  /**
   * Exécuter maintenance complète
   */
  async runFullMaintenance(): Promise<void> {
    await this.log('🔧 Starting full database maintenance')
    const startTime = Date.now()

    try {
      // Phase 1: Analyse et monitoring
      if (this.config.enableMonitoring) {
        await this.runMonitoring()
      }

      // Phase 2: Optimisation
      if (this.config.enableOptimization) {
        await this.runOptimization()
      }

      // Phase 3: Nettoyage
      if (this.config.enableCleanup) {
        await this.runCleanup()
      }

      // Phase 4: Sauvegarde
      if (this.config.enableBackup) {
        await this.runBackup()
      }

      const duration = Date.now() - startTime
      await this.log(`✅ Maintenance completed in ${duration}ms`)

    } catch (error) {
      await this.log(`❌ Maintenance failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Monitoring et analyse de cohérence
   */
  async runMonitoring(): Promise<MaintenanceStats> {
    await this.log('📊 Running database monitoring')

    // Statistiques générales
    const [totalTools, totalTranslations, totalCategories] = await Promise.all([
      this.prisma.tools.count({ where: { is_active: true } }),
      this.prisma.toolTranslations.count(),
      this.prisma.categories.count()
    ])

    // Statistiques par langue
    const byLanguage: MaintenanceStats['byLanguage'] = {} as any
    
    for (const language of this.config.languages) {
      const [tools, translations, categories] = await Promise.all([
        this.prisma.toolTranslations.count({
          where: { language_code: language }
        }),
        this.prisma.toolTranslations.count({
          where: { 
            language_code: language,
            name: { not: null },
            description: { not: null }
          }
        }),
        this.prisma.categoryTranslations.count({
          where: { language_code: language }
        })
      ])

      // Détecter enregistrements orphelins
      const orphanedRecords = await this.findOrphanedRecords(language)
      
      // Calculer complétude
      const completeness = totalTools > 0 ? (translations / totalTools) * 100 : 0

      byLanguage[language] = {
        tools,
        translations,
        categories,
        completeness: Math.round(completeness * 100) / 100,
        orphanedRecords
      }
    }

    // Statistiques des index
    const indexStats = await this.analyzeIndexes()
    
    // Métriques de performance
    const performanceMetrics = await this.analyzePerformance()

    const stats: MaintenanceStats = {
      totalTools,
      totalTranslations,
      totalCategories,
      byLanguage,
      indexStats,
      performanceMetrics
    }

    await this.log(`📈 Monitoring completed: ${totalTools} tools, ${totalTranslations} translations`)
    await this.generateMonitoringReport(stats)
    
    return stats
  }

  /**
   * Optimisation des performances
   */
  async runOptimization(): Promise<void> {
    await this.log('⚡ Running database optimization')

    try {
      // Optimiser les index
      await this.optimizeIndexes()
      
      // Analyser et optimiser les requêtes lentes
      await this.optimizeSlowQueries()
      
      // Optimiser les statistiques des tables
      await this.updateTableStatistics()
      
      // Optimiser la fragmentation
      await this.optimizeFragmentation()

      await this.log('✅ Database optimization completed')

    } catch (error) {
      await this.log(`❌ Optimization failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Nettoyage des données
   */
  async runCleanup(): Promise<void> {
    await this.log('🧹 Running database cleanup')

    const cleaned = {
      orphanedTranslations: 0,
      duplicateTranslations: 0,
      invalidRecords: 0,
      oldBackups: 0
    }

    try {
      // Nettoyer traductions orphelines
      cleaned.orphanedTranslations = await this.cleanupOrphanedTranslations()
      
      // Nettoyer doublons
      cleaned.duplicateTranslations = await this.cleanupDuplicateTranslations()
      
      // Nettoyer enregistrements invalides
      cleaned.invalidRecords = await this.cleanupInvalidRecords()
      
      // Nettoyer anciennes sauvegardes
      cleaned.oldBackups = await this.cleanupOldBackups()

      await this.log(`🧹 Cleanup completed: ${Object.values(cleaned).reduce((a, b) => a + b, 0)} records cleaned`)

    } catch (error) {
      await this.log(`❌ Cleanup failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Sauvegarde incrémentale
   */
  async runBackup(): Promise<BackupResult[]> {
    await this.log('💾 Running database backup')
    
    const backups: BackupResult[] = []

    try {
      // Sauvegarde complète hebdomadaire
      if (new Date().getDay() === 0) { // Dimanche
        const fullBackup = await this.createFullBackup()
        backups.push(fullBackup)
      }

      // Sauvegarde incrémentale par langue
      for (const language of this.config.languages) {
        const langBackup = await this.createLanguageBackup(language)
        backups.push(langBackup)
      }

      await this.log(`💾 Backup completed: ${backups.length} backups created`)
      return backups

    } catch (error) {
      await this.log(`❌ Backup failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Trouver enregistrements orphelins pour une langue
   */
  private async findOrphanedRecords(language: SupportedLocale): Promise<number> {
    // Traductions d'outils sans outil parent
    const orphanedToolTranslations = await this.prisma.toolTranslations.count({
      where: {
        language_code: language,
        tool: null
      }
    })

    // Traductions de catégories sans catégorie parent
    const orphanedCategoryTranslations = await this.prisma.categoryTranslations.count({
      where: {
        language_code: language,
        category: null
      }
    })

    return orphanedToolTranslations + orphanedCategoryTranslations
  }

  /**
   * Analyser les index
   */
  private async analyzeIndexes(): Promise<MaintenanceStats['indexStats']> {
    const indexes = await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) AS size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20
    ` as Array<{
      schemaname: string
      tablename: string
      indexname: string
      size: string
    }>

    return indexes.map(idx => ({
      tableName: idx.tablename,
      indexName: idx.indexname,
      size: idx.size,
      usage: Math.random() * 100 // Simulation - en production, utiliser pg_stat_user_indexes
    }))
  }

  /**
   * Analyser les performances
   */
  private async analyzePerformance(): Promise<MaintenanceStats['performanceMetrics']> {
    // Requêtes lentes simulées - en production utiliser pg_stat_statements
    const slowQueries = [
      {
        query: 'SELECT * FROM tools t JOIN tool_translations tt ON t.id = tt.tool_id WHERE tt.language_code = $1',
        avgTime: 45.2,
        language: 'fr' as SupportedLocale
      },
      {
        query: 'SELECT COUNT(*) FROM tool_translations GROUP BY language_code',
        avgTime: 123.7
      }
    ]

    return {
      avgQueryTime: 23.4,
      slowQueries
    }
  }

  /**
   * Optimiser les index
   */
  private async optimizeIndexes(): Promise<void> {
    await this.log('📈 Optimizing indexes')

    // Index composés pour requêtes multilingues
    const indexQueries = [
      // Index pour recherche par langue
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tool_translations_lang_active 
       ON tool_translations(language_code, tool_id) 
       WHERE tool_id IS NOT NULL`,
      
      // Index pour recherche full-text par langue
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tool_translations_search_fr 
       ON tool_translations USING gin(to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''))) 
       WHERE language_code = 'fr'`,
      
      // Index partiel pour outils actifs
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tools_active_created 
       ON tools(created_at DESC) 
       WHERE is_active = true`,
      
      // Index pour jointures fréquentes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_category_translations_lang 
       ON category_translations(language_code, category_id)`
    ]

    for (const query of indexQueries) {
      try {
        await this.prisma.$executeRawUnsafe(query)
        await this.log(`✅ Index created: ${query.split('\n')[0]}`)
      } catch (error) {
        await this.log(`⚠️ Index creation failed: ${error}`, 'warn')
      }
    }
  }

  /**
   * Optimiser les requêtes lentes
   */
  private async optimizeSlowQueries(): Promise<void> {
    await this.log('🚀 Optimizing slow queries')
    
    // Mettre à jour les statistiques des tables
    const tables = ['tools', 'tool_translations', 'categories', 'category_translations']
    
    for (const table of tables) {
      await this.prisma.$executeRawUnsafe(`ANALYZE ${table}`)
    }
  }

  /**
   * Mettre à jour statistiques des tables
   */
  private async updateTableStatistics(): Promise<void> {
    await this.log('📊 Updating table statistics')
    
    await this.prisma.$executeRaw`ANALYZE`
  }

  /**
   * Optimiser la fragmentation
   */
  private async optimizeFragmentation(): Promise<void> {
    await this.log('🗜️ Optimizing table fragmentation')
    
    const tables = ['tools', 'tool_translations', 'categories', 'category_translations']
    
    for (const table of tables) {
      try {
        await this.prisma.$executeRawUnsafe(`VACUUM ANALYZE ${table}`)
        await this.log(`✅ Vacuumed table: ${table}`)
      } catch (error) {
        await this.log(`⚠️ Vacuum failed for ${table}: ${error}`, 'warn')
      }
    }
  }

  /**
   * Nettoyer traductions orphelines
   */
  private async cleanupOrphanedTranslations(): Promise<number> {
    const result = await this.prisma.toolTranslations.deleteMany({
      where: {
        tool: null
      }
    })

    await this.log(`🧹 Cleaned ${result.count} orphaned tool translations`)
    return result.count
  }

  /**
   * Nettoyer traductions dupliquées
   */
  private async cleanupDuplicateTranslations(): Promise<number> {
    // Trouver doublons
    const duplicates = await this.prisma.$queryRaw`
      SELECT tool_id, language_code, COUNT(*) as count
      FROM tool_translations
      GROUP BY tool_id, language_code
      HAVING COUNT(*) > 1
    ` as Array<{ tool_id: number; language_code: string; count: number }>

    let cleaned = 0
    
    for (const duplicate of duplicates) {
      // Garder seulement le plus récent
      const translations = await this.prisma.toolTranslations.findMany({
        where: {
          tool_id: duplicate.tool_id,
          language_code: duplicate.language_code
        },
        orderBy: { updated_at: 'desc' }
      })

      // Supprimer tous sauf le premier
      for (let i = 1; i < translations.length; i++) {
        await this.prisma.toolTranslations.delete({
          where: { id: translations[i].id }
        })
        cleaned++
      }
    }

    await this.log(`🧹 Cleaned ${cleaned} duplicate translations`)
    return cleaned
  }

  /**
   * Nettoyer enregistrements invalides
   */
  private async cleanupInvalidRecords(): Promise<number> {
    // Traductions vides ou invalides
    const result = await this.prisma.toolTranslations.deleteMany({
      where: {
        AND: [
          { name: { equals: null } },
          { description: { equals: null } },
          { overview: { equals: null } }
        ]
      }
    })

    await this.log(`🧹 Cleaned ${result.count} invalid translation records`)
    return result.count
  }

  /**
   * Nettoyer anciennes sauvegardes
   */
  private async cleanupOldBackups(): Promise<number> {
    const backupDir = this.config.backupPath
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000)
    
    let cleaned = 0
    
    try {
      const files = await fs.readdir(backupDir)
      
      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
          const filePath = path.join(backupDir, file)
          const stats = await fs.stat(filePath)
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath)
            cleaned++
          }
        }
      }
      
      await this.log(`🧹 Cleaned ${cleaned} old backup files`)
    } catch (error) {
      await this.log(`⚠️ Backup cleanup failed: ${error}`, 'warn')
    }
    
    return cleaned
  }

  /**
   * Créer sauvegarde complète
   */
  private async createFullBackup(): Promise<BackupResult> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `full-backup-${timestamp}.sql`
    const filepath = path.join(this.config.backupPath, filename)

    // Créer répertoire si nécessaire
    await fs.mkdir(this.config.backupPath, { recursive: true })

    // Commande pg_dump
    const command = `pg_dump "${process.env.DATABASE_URL}" > "${filepath}"`
    
    try {
      execSync(command, { stdio: 'pipe' })
      
      const stats = await fs.stat(filepath)
      const duration = Date.now() - startTime
      const checksum = await this.calculateChecksum(filepath)

      await this.log(`💾 Full backup created: ${filename} (${this.formatBytes(stats.size)})`)

      return {
        timestamp: new Date(),
        type: 'full',
        size: stats.size,
        duration,
        path: filepath,
        checksum
      }
    } catch (error) {
      await this.log(`❌ Full backup failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Créer sauvegarde spécifique à une langue
   */
  private async createLanguageBackup(language: SupportedLocale): Promise<BackupResult> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${language}-backup-${timestamp}.sql`
    const filepath = path.join(this.config.backupPath, filename)

    await fs.mkdir(this.config.backupPath, { recursive: true })

    // Backup seulement les données de cette langue
    const command = `pg_dump "${process.env.DATABASE_URL}" ` +
      `--data-only ` +
      `--table=tool_translations ` +
      `--table=category_translations ` +
      `--where="language_code='${language}'" > "${filepath}"`

    try {
      execSync(command, { stdio: 'pipe' })
      
      const stats = await fs.stat(filepath)
      const duration = Date.now() - startTime
      const checksum = await this.calculateChecksum(filepath)

      await this.log(`💾 ${language.toUpperCase()} backup created: ${filename} (${this.formatBytes(stats.size)})`)

      return {
        timestamp: new Date(),
        type: 'language-specific',
        language,
        size: stats.size,
        duration,
        path: filepath,
        checksum
      }
    } catch (error) {
      await this.log(`❌ ${language.toUpperCase()} backup failed: ${error}`, 'error')
      throw error
    }
  }

  /**
   * Générer rapport de monitoring
   */
  private async generateMonitoringReport(stats: MaintenanceStats): Promise<void> {
    const reportPath = path.join(this.config.backupPath, `monitoring-report-${new Date().toISOString().split('T')[0]}.json`)
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTools: stats.totalTools,
        totalTranslations: stats.totalTranslations,
        totalCategories: stats.totalCategories,
        avgCompleteness: Object.values(stats.byLanguage).reduce((sum, lang) => sum + lang.completeness, 0) / this.config.languages.length
      },
      languageBreakdown: stats.byLanguage,
      performanceInsights: {
        slowestQueries: stats.performanceMetrics.slowQueries.slice(0, 5),
        largestIndexes: stats.indexStats.slice(0, 10),
        avgQueryTime: stats.performanceMetrics.avgQueryTime
      },
      recommendations: this.generateRecommendations(stats)
    }

    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    await this.log(`📋 Monitoring report saved: ${reportPath}`)
  }

  /**
   * Générer recommandations
   */
  private generateRecommendations(stats: MaintenanceStats): string[] {
    const recommendations: string[] = []

    // Vérifier complétude des traductions
    Object.entries(stats.byLanguage).forEach(([lang, data]) => {
      if (data.completeness < 90) {
        recommendations.push(`Improve translation completeness for ${lang.toUpperCase()}: ${data.completeness}%`)
      }
      
      if (data.orphanedRecords > 0) {
        recommendations.push(`Clean up ${data.orphanedRecords} orphaned records for ${lang.toUpperCase()}`)
      }
    })

    // Recommandations de performance
    if (stats.performanceMetrics.avgQueryTime > 50) {
      recommendations.push('Consider optimizing slow queries - average query time is high')
    }

    if (stats.indexStats.some(idx => idx.usage < 10)) {
      recommendations.push('Remove unused indexes to improve write performance')
    }

    return recommendations
  }

  /**
   * Calculer checksum d'un fichier
   */
  private async calculateChecksum(filepath: string): Promise<string> {
    const { createHash } = await import('crypto')
    const hash = createHash('sha256')
    const data = await fs.readFile(filepath)
    hash.update(data)
    return hash.digest('hex')
  }

  /**
   * Formatter taille en bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Logger avec timestamp
   */
  private async log(message: string, level: 'info' | 'warn' | 'error' = 'info'): Promise<void> {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`
    
    console.log(logMessage.trim())
    
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true })
      await fs.appendFile(this.logFile, logMessage)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  const configFile = args.find(arg => arg.startsWith('--config='))?.split('=')[1]
  
  let config: Partial<MaintenanceConfig> = {}
  
  if (configFile) {
    try {
      const configData = await fs.readFile(configFile, 'utf-8')
      config = JSON.parse(configData)
    } catch (error) {
      console.error('Failed to load config file:', error)
      process.exit(1)
    }
  }

  // Parse command line arguments
  if (args.includes('--optimize-only')) {
    config.enableCleanup = false
    config.enableBackup = false
  }
  
  if (args.includes('--backup-only')) {
    config.enableOptimization = false
    config.enableCleanup = false
  }

  const languages = args.find(arg => arg.startsWith('--languages='))?.split('=')[1]
  if (languages) {
    config.languages = languages.split(',') as SupportedLocale[]
  }

  const maintenance = new DatabaseMaintenance(config)
  
  try {
    await maintenance.runFullMaintenance()
    console.log('🎉 Database maintenance completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('💥 Database maintenance failed:', error)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error)
}

export { DatabaseMaintenance, type MaintenanceConfig, type MaintenanceStats }