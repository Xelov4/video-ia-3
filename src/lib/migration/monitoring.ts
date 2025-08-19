/**
 * Système de Monitoring 404 et Correction Automatique - Video-IA.net
 *
 * Monitoring intelligent des erreurs 404 et correction automatique :
 * - Détection temps réel des 404
 * - Analyse patterns et suggestions automatiques
 * - Correction automatique avec ML
 * - Dashboard de monitoring et alertes
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';
import { urlMapper } from './url-mapper';
import { redirectManager } from './redirects';

// Types pour le monitoring
export interface NotFoundEntry {
  id: string;
  url: string;
  referer?: string;
  userAgent: string;
  timestamp: Date;
  language: SupportedLocale;
  count: number;
  lastSeen: Date;
  status: '404' | 'resolved' | 'ignored';
  suggestedRedirect?: string;
  autoFixed: boolean;
  source: 'crawler' | 'user' | 'internal';
  metadata: {
    ip?: string;
    country?: string;
    sessionId?: string;
  };
}

export interface NotFoundPattern {
  pattern: string;
  regex: RegExp;
  count: number;
  examples: string[];
  suggestedFix: string;
  confidence: number;
  category: 'typo' | 'migration' | 'deleted' | 'structure_change' | 'other';
}

export interface MonitoringStats {
  total404s: number;
  unique404s: number;
  autoFixed: number;
  manuallyFixed: number;
  ignored: number;
  recentTrend: number; // % change over last period
  topSources: Array<{ url: string; count: number }>;
  topReferers: Array<{ referer: string; count: number }>;
  languageDistribution: Record<SupportedLocale, number>;
  hourlyDistribution: number[];
}

export interface AutoFixSuggestion {
  url: string;
  suggestions: Array<{
    type: 'redirect' | 'similar_page' | 'category' | 'search';
    target: string;
    confidence: number;
    reason: string;
    action: 'create_redirect' | 'suggest_alternative' | 'show_search';
  }>;
}

/**
 * Gestionnaire de monitoring 404
 */
export class NotFoundMonitor {
  private notFoundEntries: Map<string, NotFoundEntry> = new Map();
  private patterns: NotFoundPattern[] = [];
  private autoFixEnabled = true;
  private mlThreshold = 0.7; // Seuil de confiance pour auto-fix

  constructor() {
    this.initializePatternDetection();
    this.startPeriodicAnalysis();
  }

  /**
   * Enregistrer une erreur 404
   */
  record404(data: {
    url: string;
    referer?: string;
    userAgent: string;
    language: SupportedLocale;
    ip?: string;
    country?: string;
    sessionId?: string;
    source?: 'crawler' | 'user' | 'internal';
  }): void {
    const {
      url,
      referer,
      userAgent,
      language,
      ip,
      country,
      sessionId,
      source = 'user',
    } = data;

    const normalizedUrl = this.normalizeUrl(url);
    const entryId = this.generateEntryId(normalizedUrl);

    const existing = this.notFoundEntries.get(entryId);

    if (existing) {
      // Mettre à jour entrée existante
      existing.count++;
      existing.lastSeen = new Date();

      // Mise à jour des métadonnées si nouvelles infos
      if (ip && !existing.metadata.ip) existing.metadata.ip = ip;
      if (country && !existing.metadata.country) existing.metadata.country = country;
    } else {
      // Nouvelle entrée
      const newEntry: NotFoundEntry = {
        id: entryId,
        url: normalizedUrl,
        referer,
        userAgent,
        timestamp: new Date(),
        language,
        count: 1,
        lastSeen: new Date(),
        status: '404',
        autoFixed: false,
        source,
        metadata: { ip, country, sessionId },
      };

      this.notFoundEntries.set(entryId, newEntry);

      // Tentative de correction automatique immédiate
      if (this.autoFixEnabled) {
        this.attemptAutoFix(newEntry);
      }
    }

    // Mettre à jour les patterns
    this.updatePatterns(normalizedUrl);

    // Analytics tracking
    this.trackAnalytics(data);
  }

  /**
   * Tentative de correction automatique
   */
  private async attemptAutoFix(entry: NotFoundEntry): Promise<boolean> {
    const suggestions = await this.generateAutoFixSuggestions(entry.url);

    // Prendre la suggestion avec la plus haute confiance
    const bestSuggestion = suggestions.suggestions.sort(
      (a, b) => b.confidence - a.confidence
    )[0];

    if (bestSuggestion && bestSuggestion.confidence >= this.mlThreshold) {
      switch (bestSuggestion.action) {
        case 'create_redirect':
          const redirectId = redirectManager.addRedirectRule({
            source: entry.url,
            destination: bestSuggestion.target,
            statusCode: 301,
            priority: 50,
            metadata: {
              reason: `Auto-fix 404: ${bestSuggestion.reason}`,
              category: 'optimization',
              impact: 'medium',
              tags: ['auto-fix', '404-resolution'],
            },
            active: true,
          });

          if (redirectId) {
            entry.status = 'resolved';
            entry.suggestedRedirect = bestSuggestion.target;
            entry.autoFixed = true;

            console.log(`Auto-fixed 404: ${entry.url} → ${bestSuggestion.target}`);
            return true;
          }
          break;

        default:
          // Pour les autres actions, juste marquer la suggestion
          entry.suggestedRedirect = bestSuggestion.target;
          break;
      }
    }

    return false;
  }

  /**
   * Générer suggestions de correction automatique
   */
  async generateAutoFixSuggestions(url: string): Promise<AutoFixSuggestion> {
    const suggestions: AutoFixSuggestion['suggestions'] = [];

    // 1. Vérifier mapping direct via URL mapper
    const mapping = urlMapper.mapUrl(url);
    if (mapping) {
      suggestions.push({
        type: 'redirect',
        target: mapping.newUrl,
        confidence: 0.95,
        reason: 'Direct URL mapping found',
        action: 'create_redirect',
      });
    }

    // 2. Recherche de pages similaires
    const similarPages = await this.findSimilarPages(url);
    similarPages.forEach(page => {
      suggestions.push({
        type: 'similar_page',
        target: page.url,
        confidence: page.similarity,
        reason: `Similar page found (${Math.round(page.similarity * 100)}% match)`,
        action: page.similarity > 0.8 ? 'create_redirect' : 'suggest_alternative',
      });
    });

    // 3. Détection de typos courantes
    const typoFix = this.detectTypoFix(url);
    if (typoFix) {
      suggestions.push({
        type: 'redirect',
        target: typoFix.correctedUrl,
        confidence: typoFix.confidence,
        reason: `Typo correction: ${typoFix.typo}`,
        action: 'create_redirect',
      });
    }

    // 4. Suggestion de catégorie basée sur l'URL
    const categorySuggestion = this.suggestCategory(url);
    if (categorySuggestion) {
      suggestions.push({
        type: 'category',
        target: categorySuggestion.url,
        confidence: categorySuggestion.confidence,
        reason: 'Related category found',
        action: 'suggest_alternative',
      });
    }

    // 5. Fallback vers recherche
    if (suggestions.length === 0 || suggestions.every(s => s.confidence < 0.5)) {
      const searchTerm = this.extractSearchTerm(url);
      suggestions.push({
        type: 'search',
        target: `/search?q=${encodeURIComponent(searchTerm)}`,
        confidence: 0.3,
        reason: 'Fallback to search',
        action: 'show_search',
      });
    }

    return { url, suggestions };
  }

  /**
   * Rechercher des pages similaires
   */
  private async findSimilarPages(
    targetUrl: string
  ): Promise<Array<{ url: string; similarity: number }>> {
    // Simulation de recherche de pages similaires
    const mockPages = [
      '/en/tools/chatgpt',
      '/en/tools/midjourney',
      '/en/tools/stable-diffusion',
      '/en/categories/ai-writing',
      '/en/categories/image-generation',
    ];

    return mockPages
      .map(url => ({
        url,
        similarity: this.calculateSimilarity(targetUrl, url),
      }))
      .filter(page => page.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  /**
   * Calculer similarité entre URLs
   */
  private calculateSimilarity(url1: string, url2: string): number {
    // Algorithme simple de Levenshtein distance
    const tokens1 = url1.split(/[\/\-_]/).filter(Boolean);
    const tokens2 = url2.split(/[\/\-_]/).filter(Boolean);

    let matches = 0;
    const totalTokens = Math.max(tokens1.length, tokens2.length);

    tokens1.forEach(token1 => {
      const bestMatch = tokens2.find(
        token2 =>
          token2.toLowerCase().includes(token1.toLowerCase()) ||
          token1.toLowerCase().includes(token2.toLowerCase()) ||
          this.levenshteinDistance(token1, token2) <= 2
      );
      if (bestMatch) matches++;
    });

    return matches / totalTokens;
  }

  /**
   * Distance de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Détecter correction de typo
   */
  private detectTypoFix(
    url: string
  ): { correctedUrl: string; confidence: number; typo: string } | null {
    const commonTypos = [
      { typo: 'toos', correct: 'tools' },
      { typo: 'categores', correct: 'categories' },
      { typo: 'chatgtp', correct: 'chatgpt' },
      { typo: 'midjorney', correct: 'midjourney' },
      { typo: 'stabel', correct: 'stable' },
    ];

    for (const { typo, correct } of commonTypos) {
      if (url.includes(typo)) {
        return {
          correctedUrl: url.replace(typo, correct),
          confidence: 0.9,
          typo,
        };
      }
    }

    return null;
  }

  /**
   * Suggérer catégorie basée sur l'URL
   */
  private suggestCategory(url: string): { url: string; confidence: number } | null {
    const categoryMapping = [
      { keywords: ['video', 'movie', 'film'], category: 'video-generation' },
      { keywords: ['image', 'photo', 'picture'], category: 'image-generation' },
      { keywords: ['write', 'text', 'article'], category: 'ai-writing' },
      { keywords: ['chat', 'conversation'], category: 'conversational-ai' },
    ];

    const urlLower = url.toLowerCase();

    for (const mapping of categoryMapping) {
      const matchCount = mapping.keywords.filter(keyword =>
        urlLower.includes(keyword)
      ).length;

      if (matchCount > 0) {
        return {
          url: `/en/categories/${mapping.category}`,
          confidence: matchCount / mapping.keywords.length,
        };
      }
    }

    return null;
  }

  /**
   * Extraire terme de recherche depuis URL
   */
  private extractSearchTerm(url: string): string {
    // Extraire des mots-clés significatifs de l'URL
    return url
      .split(/[\/\-_]/)
      .filter(segment => segment.length > 2 && !/^\d+$/.test(segment))
      .join(' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();
  }

  /**
   * Initialiser la détection de patterns
   */
  private initializePatternDetection() {
    // Patterns courants à détecter
    this.patterns = [
      {
        pattern: '/tool/{slug}',
        regex: /^\/tool\/([^\/]+)\/?$/,
        count: 0,
        examples: [],
        suggestedFix: '/en/tools/{slug}',
        confidence: 0.95,
        category: 'migration',
      },
      {
        pattern: '/category/{slug}',
        regex: /^\/category\/([^\/]+)\/?$/,
        count: 0,
        examples: [],
        suggestedFix: '/en/categories/{slug}',
        confidence: 0.95,
        category: 'migration',
      },
      {
        pattern: '/api/v1/*',
        regex: /^\/api\/v1\/(.+)$/,
        count: 0,
        examples: [],
        suggestedFix: '/api/v2/{path}',
        confidence: 0.8,
        category: 'migration',
      },
    ];
  }

  /**
   * Mettre à jour les patterns détectés
   */
  private updatePatterns(url: string) {
    this.patterns.forEach(pattern => {
      if (pattern.regex.test(url)) {
        pattern.count++;
        if (pattern.examples.length < 5) {
          pattern.examples.push(url);
        }
      }
    });
  }

  /**
   * Analyser périodiquement les 404s
   */
  private startPeriodicAnalysis() {
    setInterval(
      () => {
        this.analyzePatterns();
        this.cleanupOldEntries();
      },
      60 * 60 * 1000
    ); // Toutes les heures
  }

  /**
   * Analyser les patterns pour détection automatique
   */
  private analyzePatterns() {
    // Créer des redirections automatiques pour les patterns fréquents
    this.patterns.forEach(pattern => {
      if (pattern.count >= 10 && pattern.confidence > 0.8) {
        console.log(
          `High-frequency pattern detected: ${pattern.pattern} (${pattern.count} occurrences)`
        );

        // Proposer création de règle de redirection automatique
        this.suggestPatternRedirection(pattern);
      }
    });
  }

  /**
   * Suggérer redirection pour pattern
   */
  private suggestPatternRedirection(pattern: NotFoundPattern) {
    // En production, ceci pourrait créer une alerte ou notification admin
    console.log(
      `Suggestion: Create redirect rule for pattern ${pattern.pattern} → ${pattern.suggestedFix}`
    );
  }

  /**
   * Nettoyer les anciennes entrées
   */
  private cleanupOldEntries() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours

    for (const [id, entry] of this.notFoundEntries) {
      if (entry.lastSeen < cutoffDate && entry.count < 5) {
        this.notFoundEntries.delete(id);
      }
    }
  }

  /**
   * Obtenir statistiques de monitoring
   */
  getMonitoringStats(): MonitoringStats {
    const entries = Array.from(this.notFoundEntries.values());
    const total404s = entries.reduce((sum, entry) => sum + entry.count, 0);

    return {
      total404s,
      unique404s: entries.length,
      autoFixed: entries.filter(e => e.autoFixed).length,
      manuallyFixed: entries.filter(e => e.status === 'resolved' && !e.autoFixed)
        .length,
      ignored: entries.filter(e => e.status === 'ignored').length,
      recentTrend: this.calculateRecentTrend(),
      topSources: this.getTopSources(),
      topReferers: this.getTopReferers(),
      languageDistribution: this.getLanguageDistribution(),
      hourlyDistribution: this.getHourlyDistribution(),
    };
  }

  /**
   * Générer rapport détaillé
   */
  generateDetailedReport(): {
    summary: MonitoringStats;
    recentEntries: NotFoundEntry[];
    topPatterns: NotFoundPattern[];
    suggestions: AutoFixSuggestion[];
    recommendations: string[];
  } {
    const summary = this.getMonitoringStats();
    const entries = Array.from(this.notFoundEntries.values());

    const recentEntries = entries
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, 20);

    const topPatterns = this.patterns
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const suggestions = entries
      .filter(e => e.status === '404' && !e.autoFixed)
      .slice(0, 10)
      .map(entry => ({
        url: entry.url,
        suggestions: [
          {
            // Simulation
            type: 'redirect' as const,
            target: '/en/tools/suggestion',
            confidence: 0.7,
            reason: 'Similar page found',
            action: 'create_redirect' as const,
          },
        ],
      }));

    const recommendations = this.generateRecommendations(summary, topPatterns);

    return {
      summary,
      recentEntries,
      topPatterns,
      suggestions,
      recommendations,
    };
  }

  // Méthodes utilitaires privées
  private normalizeUrl(url: string): string {
    return url.toLowerCase().replace(/\/+$/, '').replace(/\/+/g, '/');
  }

  private generateEntryId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16);
  }

  private trackAnalytics(data: any) {
    // Tracking analytics pour 404s
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', '404_error', {
        page_location: data.url,
        page_referrer: data.referer,
        language: data.language,
        source: data.source,
      });
    }
  }

  private calculateRecentTrend(): number {
    // Calculer tendance des 7 derniers jours vs 7 jours précédents
    const now = new Date();
    const week1Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const week2Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const entries = Array.from(this.notFoundEntries.values());

    const week1Count = entries.filter(
      e => e.timestamp >= week1Start && e.timestamp < week2Start
    ).length;

    const week2Count = entries.filter(e => e.timestamp >= week2Start).length;

    if (week1Count === 0) return week2Count > 0 ? 100 : 0;

    return ((week2Count - week1Count) / week1Count) * 100;
  }

  private getTopSources(): Array<{ url: string; count: number }> {
    const sources = new Map<string, number>();

    for (const entry of this.notFoundEntries.values()) {
      sources.set(entry.url, (sources.get(entry.url) || 0) + entry.count);
    }

    return Array.from(sources.entries())
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopReferers(): Array<{ referer: string; count: number }> {
    const referers = new Map<string, number>();

    for (const entry of this.notFoundEntries.values()) {
      if (entry.referer) {
        referers.set(entry.referer, (referers.get(entry.referer) || 0) + entry.count);
      }
    }

    return Array.from(referers.entries())
      .map(([referer, count]) => ({ referer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getLanguageDistribution(): Record<SupportedLocale, number> {
    const distribution = {} as Record<SupportedLocale, number>;

    for (const entry of this.notFoundEntries.values()) {
      distribution[entry.language] = (distribution[entry.language] || 0) + entry.count;
    }

    return distribution;
  }

  private getHourlyDistribution(): number[] {
    const hours = new Array(24).fill(0);

    for (const entry of this.notFoundEntries.values()) {
      const hour = entry.timestamp.getHours();
      hours[hour] += entry.count;
    }

    return hours;
  }

  private generateRecommendations(
    stats: MonitoringStats,
    patterns: NotFoundPattern[]
  ): string[] {
    const recommendations: string[] = [];

    if (stats.total404s > 1000) {
      recommendations.push(
        'High volume of 404 errors detected. Consider implementing bulk redirect rules.'
      );
    }

    if (stats.autoFixed / stats.total404s < 0.5) {
      recommendations.push(
        'Low auto-fix rate. Consider adjusting ML threshold or improving suggestion algorithms.'
      );
    }

    if (patterns.some(p => p.count > 50)) {
      recommendations.push(
        'Frequent patterns detected. Create generic redirect rules for common URL patterns.'
      );
    }

    const recentTrend = stats.recentTrend;
    if (recentTrend > 50) {
      recommendations.push(
        'Significant increase in 404 errors. Investigate recent deployments or content changes.'
      );
    }

    return recommendations;
  }
}

/**
 * Instance singleton
 */
export const notFoundMonitor = new NotFoundMonitor();

/**
 * Hook React pour monitoring 404
 */
export function useNotFoundMonitoring() {
  return {
    record404: (data: Parameters<typeof notFoundMonitor.record404>[0]) =>
      notFoundMonitor.record404(data),

    getMonitoringStats: () => notFoundMonitor.getMonitoringStats(),

    generateDetailedReport: () => notFoundMonitor.generateDetailedReport(),
  };
}
