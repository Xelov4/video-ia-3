/**
 * Système de Log Aggregation Multilingue - Video-IA.net
 *
 * Agrégation et analyse de logs centralisée par langue :
 * - Log structuré avec contexte multilingue
 * - Parsing et indexation intelligente
 * - Recherche et filtrage avancé par langue
 * - Intégration ELK Stack / Loki / DataDog
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour le logging
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  language: SupportedLocale;
  context: LogContext;
  source: LogSource;
  tags: string[];
  metadata: LogMetadata;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  component: string;
  function: string;
  file?: string;
  line?: number;
  url?: string;
  method?: string;
  userAgent?: string;
  country?: string;
  device: string;
}

export interface LogSource {
  service: 'frontend' | 'api' | 'database' | 'cache' | 'cdn' | 'migration';
  instance: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

export interface LogMetadata {
  duration?: number;
  responseCode?: number;
  requestSize?: number;
  responseSize?: number;
  error?: {
    name: string;
    message: string;
    code?: string | number;
  };
  performance?: {
    cpuUsage: number;
    memoryUsage: number;
    dbQueries: number;
  };
  translation?: {
    fallbackUsed: boolean;
    translationSource: 'cache' | 'db' | 'api' | 'fallback';
    quality: number;
  };
}

export interface LogQuery {
  levels?: LogLevel[];
  languages?: SupportedLocale[];
  sources?: LogSource['service'][];
  components?: string[];
  tags?: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  searchText?: string;
  userId?: string;
  traceId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'level' | 'language';
  sortOrder?: 'asc' | 'desc';
}

export interface LogAggregation {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byLanguage: Record<SupportedLocale, number>;
  bySource: Record<string, number>;
  byComponent: Record<string, number>;
  errorRate: number;
  averageResponseTime?: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen: Date;
    languages: SupportedLocale[];
  }>;
  trends: {
    hourly: Array<{ hour: number; count: number }>;
    daily: Array<{ day: string; count: number }>;
  };
}

export interface LogPattern {
  id: string;
  pattern: RegExp | string;
  name: string;
  description: string;
  severity: LogLevel;
  languages: SupportedLocale[];
  matchCount: number;
  examples: LogEntry[];
  suggestedActions: string[];
  alertThreshold?: number;
}

export interface LogStream {
  id: string;
  name: string;
  query: LogQuery;
  subscribers: Array<{
    id: string;
    callback: (entries: LogEntry[]) => void;
    active: boolean;
  }>;
  bufferSize: number;
  buffer: LogEntry[];
}

/**
 * Gestionnaire de logs centralisé
 */
export class LogAggregator {
  private logs: Map<string, LogEntry> = new Map();
  private patterns: Map<string, LogPattern> = new Map();
  private streams: Map<string, LogStream> = new Map();
  private indexedFields: Map<string, Set<string>> = new Map();
  private maxLogRetention = 7 * 24 * 60 * 60 * 1000; // 7 days
  private batchSize = 1000;

  constructor() {
    this.initializePatterns();
    this.startPeriodicMaintenance();
  }

  /**
   * Enregistrer une entrée de log
   */
  log(
    level: LogLevel,
    message: string,
    language: SupportedLocale,
    context: Partial<LogContext>,
    metadata: Partial<LogMetadata> = {}
  ): string {
    const logId = this.generateLogId();
    const timestamp = new Date();

    const entry: LogEntry = {
      id: logId,
      timestamp,
      level,
      message,
      language,
      context: {
        component: 'unknown',
        function: 'unknown',
        device: 'unknown',
        ...context,
      },
      source: {
        service: 'frontend',
        instance: this.getInstanceId(),
        version: this.getVersion(),
        environment: this.getEnvironment(),
      },
      tags: this.extractTags(message, context),
      metadata: {
        ...metadata,
      },
      sessionId: this.getSessionId(),
      traceId: this.getTraceId(),
    };

    // Ajouter stack trace pour erreurs
    if (level === 'error' || level === 'fatal') {
      entry.stackTrace = this.captureStackTrace();
    }

    // Stocker le log
    this.logs.set(logId, entry);

    // Indexer pour recherche rapide
    this.indexLogEntry(entry);

    // Vérifier patterns
    this.checkPatterns(entry);

    // Notifier streams
    this.notifyStreams(entry);

    // Envoyer vers services externes
    this.forwardToExternalServices(entry);

    return logId;
  }

  /**
   * Méthodes de logging par niveau
   */
  debug(
    message: string,
    language: SupportedLocale,
    context?: Partial<LogContext>,
    metadata?: Partial<LogMetadata>
  ): string {
    return this.log('debug', message, language, context || {}, metadata);
  }

  info(
    message: string,
    language: SupportedLocale,
    context?: Partial<LogContext>,
    metadata?: Partial<LogMetadata>
  ): string {
    return this.log('info', message, language, context || {}, metadata);
  }

  warn(
    message: string,
    language: SupportedLocale,
    context?: Partial<LogContext>,
    metadata?: Partial<LogMetadata>
  ): string {
    return this.log('warn', message, language, context || {}, metadata);
  }

  error(
    message: string,
    language: SupportedLocale,
    context?: Partial<LogContext>,
    metadata?: Partial<LogMetadata>
  ): string {
    return this.log('error', message, language, context || {}, metadata);
  }

  fatal(
    message: string,
    language: SupportedLocale,
    context?: Partial<LogContext>,
    metadata?: Partial<LogMetadata>
  ): string {
    return this.log('fatal', message, language, context || {}, metadata);
  }

  /**
   * Rechercher dans les logs
   */
  search(query: LogQuery): {
    entries: LogEntry[];
    total: number;
    aggregations: LogAggregation;
  } {
    let filteredLogs = Array.from(this.logs.values());

    // Filtrer par niveau
    if (query.levels && query.levels.length > 0) {
      filteredLogs = filteredLogs.filter(log => query.levels!.includes(log.level));
    }

    // Filtrer par langue
    if (query.languages && query.languages.length > 0) {
      filteredLogs = filteredLogs.filter(log =>
        query.languages!.includes(log.language)
      );
    }

    // Filtrer par source
    if (query.sources && query.sources.length > 0) {
      filteredLogs = filteredLogs.filter(log =>
        query.sources!.includes(log.source.service)
      );
    }

    // Filtrer par composant
    if (query.components && query.components.length > 0) {
      filteredLogs = filteredLogs.filter(log =>
        query.components!.includes(log.context.component)
      );
    }

    // Filtrer par tags
    if (query.tags && query.tags.length > 0) {
      filteredLogs = filteredLogs.filter(log =>
        query.tags!.some(tag => log.tags.includes(tag))
      );
    }

    // Filtrer par plage de temps
    filteredLogs = filteredLogs.filter(
      log =>
        log.timestamp >= query.timeRange.start && log.timestamp <= query.timeRange.end
    );

    // Recherche textuelle
    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      filteredLogs = filteredLogs.filter(
        log =>
          log.message.toLowerCase().includes(searchLower) ||
          log.context.component.toLowerCase().includes(searchLower) ||
          log.context.function.toLowerCase().includes(searchLower) ||
          log.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrer par utilisateur
    if (query.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
    }

    // Filtrer par trace
    if (query.traceId) {
      filteredLogs = filteredLogs.filter(log => log.traceId === query.traceId);
    }

    // Trier
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';

    filteredLogs.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'timestamp':
          compareResult = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'level':
          const levelOrder = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
          compareResult = levelOrder[a.level] - levelOrder[b.level];
          break;
        case 'language':
          compareResult = a.language.localeCompare(b.language);
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    const total = filteredLogs.length;

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    const entries = filteredLogs.slice(offset, offset + limit);

    // Agrégations
    const aggregations = this.generateAggregations(filteredLogs);

    return { entries, total, aggregations };
  }

  /**
   * Créer un stream de logs temps réel
   */
  createStream(name: string, query: LogQuery, bufferSize = 100): string {
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const stream: LogStream = {
      id: streamId,
      name,
      query,
      subscribers: [],
      bufferSize,
      buffer: [],
    };

    this.streams.set(streamId, stream);
    return streamId;
  }

  /**
   * S'abonner à un stream de logs
   */
  subscribeToStream(streamId: string, callback: (entries: LogEntry[]) => void): string {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    const subscriberId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    stream.subscribers.push({
      id: subscriberId,
      callback,
      active: true,
    });

    return subscriberId;
  }

  /**
   * Exporter logs vers format externe
   */
  exportLogs(query: LogQuery, format: 'json' | 'csv' | 'elk'): string {
    const { entries } = this.search(query);

    switch (format) {
      case 'json':
        return JSON.stringify(entries, null, 2);
      case 'csv':
        return this.convertToCSV(entries);
      case 'elk':
        return this.convertToELKFormat(entries);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Générer configuration pour ELK Stack
   */
  generateELKConfiguration(): {
    logstash: string;
    elasticsearch: string;
    kibana: string;
  } {
    return {
      logstash: this.generateLogstashConfig(),
      elasticsearch: this.generateElasticsearchMapping(),
      kibana: this.generateKibanaVisualization(),
    };
  }

  // Méthodes privées
  private initializePatterns() {
    const defaultPatterns: Omit<LogPattern, 'id' | 'matchCount' | 'examples'>[] = [
      {
        pattern: /translation.*fallback/i,
        name: 'Translation Fallback',
        description: 'Translation fallback to default language',
        severity: 'warn',
        languages: ['fr', 'es', 'it', 'de', 'nl', 'pt'],
        suggestedActions: [
          'Check translation completeness',
          'Update translation database',
          'Verify translation API connectivity',
        ],
        alertThreshold: 50,
      },
      {
        pattern: /database.*timeout/i,
        name: 'Database Timeout',
        description: 'Database query timeout detected',
        severity: 'error',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        suggestedActions: [
          'Check database performance',
          'Optimize slow queries',
          'Scale database resources',
        ],
        alertThreshold: 5,
      },
      {
        pattern: /404.*not.*found/i,
        name: '404 Not Found',
        description: '404 errors detected',
        severity: 'warn',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        suggestedActions: [
          'Check URL redirections',
          'Update internal links',
          'Review recent content changes',
        ],
        alertThreshold: 20,
      },
      {
        pattern: /memory.*usage.*high/i,
        name: 'High Memory Usage',
        description: 'High memory usage detected',
        severity: 'warn',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        suggestedActions: [
          'Check for memory leaks',
          'Optimize caching strategies',
          'Scale application resources',
        ],
        alertThreshold: 10,
      },
    ];

    defaultPatterns.forEach((patternData, index) => {
      const pattern: LogPattern = {
        ...patternData,
        id: `pattern-${index + 1}`,
        matchCount: 0,
        examples: [],
      };
      this.patterns.set(pattern.id, pattern);
    });
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getInstanceId(): string {
    if (typeof window !== 'undefined') {
      return `browser-${window.location.hostname}`;
    }
    return `server-${process.pid || 'unknown'}`;
  }

  private getVersion(): string {
    // En production, lire depuis package.json ou variable d'environnement
    return process.env.VERSION || '1.0.0';
  }

  private getEnvironment(): LogSource['environment'] {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('localhost')) return 'development';
      if (window.location.hostname.includes('staging')) return 'staging';
      return 'production';
    }

    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'development') return 'development';
    if (nodeEnv === 'staging') return 'staging';
    return 'production';
  }

  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('session-id') || undefined;
    }
    return undefined;
  }

  private getTraceId(): string | undefined {
    // En production, intégrer avec système de tracing (OpenTelemetry, Jaeger)
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractTags(message: string, context: Partial<LogContext>): string[] {
    const tags: string[] = [];

    // Tags basés sur le message
    if (message.includes('translation')) tags.push('translation');
    if (message.includes('database')) tags.push('database');
    if (message.includes('cache')) tags.push('cache');
    if (message.includes('api')) tags.push('api');
    if (message.includes('404')) tags.push('404');
    if (message.includes('error')) tags.push('error');

    // Tags basés sur le contexte
    if (context.component) tags.push(`component:${context.component}`);
    if (context.url) {
      const pathSegments = context.url.split('/').filter(Boolean);
      pathSegments.forEach(segment => tags.push(`url:${segment}`));
    }

    return tags;
  }

  private captureStackTrace(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(3).join('\n') : '';
  }

  private indexLogEntry(entry: LogEntry) {
    // Indexer par niveau
    this.addToIndex('level', entry.level, entry.id);

    // Indexer par langue
    this.addToIndex('language', entry.language, entry.id);

    // Indexer par composant
    this.addToIndex('component', entry.context.component, entry.id);

    // Indexer par tags
    entry.tags.forEach(tag => this.addToIndex('tag', tag, entry.id));
  }

  private addToIndex(field: string, value: string, logId: string) {
    const key = `${field}:${value}`;
    if (!this.indexedFields.has(key)) {
      this.indexedFields.set(key, new Set());
    }
    this.indexedFields.get(key)!.add(logId);
  }

  private checkPatterns(entry: LogEntry) {
    for (const pattern of this.patterns.values()) {
      let matches = false;

      if (pattern.pattern instanceof RegExp) {
        matches = pattern.pattern.test(entry.message);
      } else {
        matches = entry.message.includes(pattern.pattern);
      }

      if (matches && pattern.languages.includes(entry.language)) {
        pattern.matchCount++;

        if (pattern.examples.length < 5) {
          pattern.examples.push(entry);
        }

        // Vérifier seuil d'alerte
        if (pattern.alertThreshold && pattern.matchCount >= pattern.alertThreshold) {
          this.triggerPatternAlert(pattern, entry);
        }
      }
    }
  }

  private triggerPatternAlert(pattern: LogPattern, entry: LogEntry) {
    console.log(
      `🚨 Log pattern alert: ${pattern.name} (${pattern.matchCount} matches)`
    );

    // En production, intégrer avec le système d'alerting
    // alertingManager.evaluateMetric('log_pattern_match', pattern.matchCount, entry.language)
  }

  private notifyStreams(entry: LogEntry) {
    for (const stream of this.streams.values()) {
      if (this.matchesQuery(entry, stream.query)) {
        // Ajouter au buffer
        stream.buffer.push(entry);
        if (stream.buffer.length > stream.bufferSize) {
          stream.buffer.shift();
        }

        // Notifier abonnés
        stream.subscribers
          .filter(sub => sub.active)
          .forEach(subscriber => {
            try {
              subscriber.callback([entry]);
            } catch (error) {
              console.error(`Error notifying stream subscriber:`, error);
            }
          });
      }
    }
  }

  private matchesQuery(entry: LogEntry, query: LogQuery): boolean {
    // Vérification simplifiée pour le streaming
    if (query.levels && !query.levels.includes(entry.level)) return false;
    if (query.languages && !query.languages.includes(entry.language)) return false;
    if (query.components && !query.components.includes(entry.context.component))
      return false;

    return true;
  }

  private forwardToExternalServices(entry: LogEntry) {
    // Envoyer vers services externes (DataDog, Splunk, etc.)
    if (this.getEnvironment() === 'production') {
      this.sendToDataDog(entry);
      this.sendToElasticsearch(entry);
    }
  }

  private sendToDataDog(entry: LogEntry) {
    // Integration DataDog
    if (typeof window !== 'undefined' && window.DD_LOGS) {
      window.DD_LOGS.logger.log(entry.level, entry.message, {
        language: entry.language,
        component: entry.context.component,
        tags: entry.tags,
        ...entry.metadata,
      });
    }
  }

  private sendToElasticsearch(entry: LogEntry) {
    // Integration Elasticsearch
    const elkEntry = this.convertToELKFormat([entry]);

    // En production, envoyer via HTTP vers Elasticsearch
    console.log('ELK Entry:', elkEntry);
  }

  private generateAggregations(logs: LogEntry[]): LogAggregation {
    const totalLogs = logs.length;

    const byLevel = logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<LogLevel, number>
    );

    const byLanguage = logs.reduce(
      (acc, log) => {
        acc[log.language] = (acc[log.language] || 0) + 1;
        return acc;
      },
      {} as Record<SupportedLocale, number>
    );

    const bySource = logs.reduce(
      (acc, log) => {
        acc[log.source.service] = (acc[log.source.service] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byComponent = logs.reduce(
      (acc, log) => {
        acc[log.context.component] = (acc[log.context.component] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const errorRate =
      totalLogs > 0
        ? (((byLevel.error || 0) + (byLevel.fatal || 0)) / totalLogs) * 100
        : 0;

    return {
      totalLogs,
      byLevel,
      byLanguage,
      bySource,
      byComponent,
      errorRate,
      averageResponseTime: this.calculateAverageResponseTime(logs),
      topErrors: this.getTopErrors(logs),
      trends: this.calculateTrends(logs),
    };
  }

  private calculateAverageResponseTime(logs: LogEntry[]): number {
    const logsWithDuration = logs.filter(log => log.metadata.duration);
    if (logsWithDuration.length === 0) return 0;

    const totalDuration = logsWithDuration.reduce(
      (sum, log) => sum + (log.metadata.duration || 0),
      0
    );
    return totalDuration / logsWithDuration.length;
  }

  private getTopErrors(logs: LogEntry[]): LogAggregation['topErrors'] {
    const errorLogs = logs.filter(
      log => log.level === 'error' || log.level === 'fatal'
    );
    const errorMessages = new Map<
      string,
      { count: number; lastSeen: Date; languages: Set<SupportedLocale> }
    >();

    errorLogs.forEach(log => {
      const key = log.message.substring(0, 100); // Premiers 100 chars comme clé
      if (!errorMessages.has(key)) {
        errorMessages.set(key, {
          count: 0,
          lastSeen: log.timestamp,
          languages: new Set(),
        });
      }

      const errorData = errorMessages.get(key)!;
      errorData.count++;
      errorData.languages.add(log.language);
      if (log.timestamp > errorData.lastSeen) {
        errorData.lastSeen = log.timestamp;
      }
    });

    return Array.from(errorMessages.entries())
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastSeen: data.lastSeen,
        languages: Array.from(data.languages),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateTrends(logs: LogEntry[]): LogAggregation['trends'] {
    const hourlyData = new Array(24).fill(0).map((_, hour) => ({ hour, count: 0 }));
    const dailyData = new Map<string, number>();

    logs.forEach(log => {
      const hour = log.timestamp.getHours();
      hourlyData[hour].count++;

      const day = log.timestamp.toISOString().split('T')[0];
      dailyData.set(day, (dailyData.get(day) || 0) + 1);
    });

    return {
      hourly: hourlyData,
      daily: Array.from(dailyData.entries()).map(([day, count]) => ({ day, count })),
    };
  }

  private convertToCSV(entries: LogEntry[]): string {
    const headers = ['timestamp', 'level', 'language', 'component', 'message', 'tags'];
    const rows = entries.map(entry => [
      entry.timestamp.toISOString(),
      entry.level,
      entry.language,
      entry.context.component,
      `"${entry.message.replace(/"/g, '""')}"`,
      entry.tags.join(','),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToELKFormat(entries: LogEntry[]): string {
    return entries
      .map(entry =>
        JSON.stringify({
          '@timestamp': entry.timestamp.toISOString(),
          level: entry.level,
          message: entry.message,
          language: entry.language,
          component: entry.context.component,
          function: entry.context.function,
          service: entry.source.service,
          instance: entry.source.instance,
          version: entry.source.version,
          environment: entry.source.environment,
          tags: entry.tags,
          metadata: entry.metadata,
          userId: entry.userId,
          sessionId: entry.sessionId,
          traceId: entry.traceId,
        })
      )
      .join('\n');
  }

  private generateLogstashConfig(): string {
    return `
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "video-ia-net" {
    json {
      source => "message"
    }
    
    if [language] {
      mutate {
        add_tag => [ "lang_%{language}" ]
      }
    }
    
    if [level] == "error" or [level] == "fatal" {
      mutate {
        add_tag => [ "error" ]
      }
    }
    
    if [metadata][translation][fallbackUsed] == true {
      mutate {
        add_tag => [ "translation_fallback" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "video-ia-logs-%{+YYYY.MM.dd}"
    template_name => "video-ia-logs"
  }
}
    `.trim();
  }

  private generateElasticsearchMapping(): string {
    return JSON.stringify(
      {
        mappings: {
          properties: {
            '@timestamp': { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text', analyzer: 'standard' },
            language: { type: 'keyword' },
            component: { type: 'keyword' },
            function: { type: 'keyword' },
            service: { type: 'keyword' },
            instance: { type: 'keyword' },
            version: { type: 'keyword' },
            environment: { type: 'keyword' },
            tags: { type: 'keyword' },
            userId: { type: 'keyword' },
            sessionId: { type: 'keyword' },
            traceId: { type: 'keyword' },
            'metadata.duration': { type: 'float' },
            'metadata.responseCode': { type: 'integer' },
            'metadata.translation.fallbackUsed': { type: 'boolean' },
            'metadata.translation.quality': { type: 'float' },
          },
        },
      },
      null,
      2
    );
  }

  private generateKibanaVisualization(): string {
    return JSON.stringify(
      {
        version: '8.0.0',
        objects: [
          {
            id: 'video-ia-logs-dashboard',
            type: 'dashboard',
            attributes: {
              title: 'Video-IA.net - Multilingual Logs Dashboard',
              description: 'Overview of application logs by language and component',
              panelsJSON: JSON.stringify([
                {
                  id: 'logs-by-language-pie',
                  type: 'visualization',
                  gridData: { x: 0, y: 0, w: 24, h: 15 },
                },
                {
                  id: 'error-rate-timeline',
                  type: 'visualization',
                  gridData: { x: 24, y: 0, w: 24, h: 15 },
                },
              ]),
            },
          },
        ],
      },
      null,
      2
    );
  }

  private startPeriodicMaintenance() {
    // Nettoyage périodique des vieux logs
    setInterval(
      () => {
        this.cleanupOldLogs();
      },
      60 * 60 * 1000
    ); // Toutes les heures
  }

  private cleanupOldLogs() {
    const cutoffTime = Date.now() - this.maxLogRetention;

    for (const [id, log] of this.logs) {
      if (log.timestamp.getTime() < cutoffTime) {
        this.logs.delete(id);

        // Nettoyer les index
        this.removeFromIndexes(id);
      }
    }
  }

  private removeFromIndexes(logId: string) {
    for (const indexSet of this.indexedFields.values()) {
      indexSet.delete(logId);
    }
  }
}

/**
 * Instance singleton
 */
export const logAggregator = new LogAggregator();

/**
 * Hook React pour logging
 */
export function useLogging() {
  return {
    debug: (
      message: string,
      language: SupportedLocale,
      context?: Partial<LogContext>,
      metadata?: Partial<LogMetadata>
    ) => logAggregator.debug(message, language, context, metadata),

    info: (
      message: string,
      language: SupportedLocale,
      context?: Partial<LogContext>,
      metadata?: Partial<LogMetadata>
    ) => logAggregator.info(message, language, context, metadata),

    warn: (
      message: string,
      language: SupportedLocale,
      context?: Partial<LogContext>,
      metadata?: Partial<LogMetadata>
    ) => logAggregator.warn(message, language, context, metadata),

    error: (
      message: string,
      language: SupportedLocale,
      context?: Partial<LogContext>,
      metadata?: Partial<LogMetadata>
    ) => logAggregator.error(message, language, context, metadata),

    fatal: (
      message: string,
      language: SupportedLocale,
      context?: Partial<LogContext>,
      metadata?: Partial<LogMetadata>
    ) => logAggregator.fatal(message, language, context, metadata),

    search: (query: LogQuery) => logAggregator.search(query),

    createStream: (name: string, query: LogQuery, bufferSize?: number) =>
      logAggregator.createStream(name, query, bufferSize),

    subscribeToStream: (streamId: string, callback: (entries: LogEntry[]) => void) =>
      logAggregator.subscribeToStream(streamId, callback),

    exportLogs: (query: LogQuery, format: 'json' | 'csv' | 'elk') =>
      logAggregator.exportLogs(query, format),
  };
}
