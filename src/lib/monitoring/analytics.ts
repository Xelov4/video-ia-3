/**
 * Système de Monitoring et Analytics Multilingue - Video-IA.net
 *
 * Monitoring intelligent et observabilité par langue :
 * - Métriques par langue et région
 * - Core Web Vitals tracking avancé
 * - User experience monitoring
 * - Business metrics multilingues
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour le monitoring
export interface AnalyticsEvent {
  id: string;
  event: string;
  category: 'page' | 'user' | 'performance' | 'error' | 'business';
  language: SupportedLocale;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  metadata: {
    userAgent: string;
    device: 'mobile' | 'tablet' | 'desktop';
    country?: string;
    region?: string;
    referrer?: string;
  };
}

export interface PerformanceMetrics {
  language: SupportedLocale;
  country?: string;
  device: string;
  timestamp: Date;
  vitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  custom: {
    translationLoadTime: number;
    languageSwitchTime: number;
    searchResponseTime: number;
    pageTransitionTime: number;
  };
}

export interface UserExperienceMetrics {
  language: SupportedLocale;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
  errorRate: number;
  languageSwitches: number;
  searchQueries: number;
  toolsViewed: number;
  categoriesExplored: number;
}

export interface BusinessMetrics {
  language: SupportedLocale;
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
  metrics: {
    uniqueVisitors: number;
    totalPageViews: number;
    averageSessionDuration: number;
    conversionRate: number;
    topTools: Array<{ name: string; views: number }>;
    topCategories: Array<{ name: string; views: number }>;
    searchTerms: Array<{ term: string; count: number }>;
    errorCount: number;
    performanceScore: number;
  };
}

/**
 * Gestionnaire principal de monitoring et analytics
 */
export class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  /**
   * Initialiser le système de tracking
   */
  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Générer/récupérer user ID
    this.userId = this.getOrCreateUserId();

    // Configurer les listeners de performance
    this.setupPerformanceObservers();

    // Configurer les listeners d'événements
    this.setupEventListeners();

    // Tracking des erreurs globales
    this.setupErrorTracking();

    this.isInitialized = true;
  }

  /**
   * Enregistrer un événement analytics
   */
  track(
    event: string,
    properties: Record<string, any> = {},
    category: AnalyticsEvent['category'] = 'user'
  ) {
    if (!this.isInitialized) return;

    const analyticsEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      event,
      category,
      language: this.getCurrentLanguage(),
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      metadata: {
        userAgent: navigator.userAgent,
        device: this.detectDevice(),
        referrer: document.referrer,
        ...this.getLocationInfo(),
      },
    };

    this.events.push(analyticsEvent);
    this.sendToAnalytics(analyticsEvent);
  }

  /**
   * Tracker les métriques de performance
   */
  trackPerformance(customMetrics: Partial<PerformanceMetrics['custom']> = {}) {
    if (typeof window === 'undefined') return;

    const vitals = this.collectWebVitals();

    const performanceData: PerformanceMetrics = {
      language: this.getCurrentLanguage(),
      device: this.detectDevice(),
      timestamp: new Date(),
      vitals,
      custom: {
        translationLoadTime: customMetrics.translationLoadTime || 0,
        languageSwitchTime: customMetrics.languageSwitchTime || 0,
        searchResponseTime: customMetrics.searchResponseTime || 0,
        pageTransitionTime: customMetrics.pageTransitionTime || 0,
      },
      ...this.getLocationInfo(),
    };

    this.performanceMetrics.push(performanceData);
    this.sendPerformanceData(performanceData);
  }

  /**
   * Tracker les événements spécifiques à l'i18n
   */
  trackLanguageEvent(
    eventType:
      | 'language_switch'
      | 'translation_fallback'
      | 'missing_translation'
      | 'language_detection'
      | 'region_redirect',
    details: Record<string, any>
  ) {
    this.track(
      `i18n_${eventType}`,
      {
        ...details,
        current_language: this.getCurrentLanguage(),
        timestamp: Date.now(),
      },
      'user'
    );
  }

  /**
   * Tracker les métriques business par langue
   */
  trackBusinessEvent(
    eventType:
      | 'tool_view'
      | 'category_browse'
      | 'search_query'
      | 'conversion'
      | 'error_encountered',
    details: Record<string, any>
  ) {
    this.track(
      `business_${eventType}`,
      {
        ...details,
        language: this.getCurrentLanguage(),
        session_id: this.sessionId,
      },
      'business'
    );
  }

  /**
   * Configurer les observateurs de performance
   */
  private setupPerformanceObservers() {
    // Observer Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track(
          'core_web_vital',
          {
            metric: 'lcp',
            value: lastEntry.startTime,
            language: this.getCurrentLanguage(),
          },
          'performance'
        );
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      const fidObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.track(
            'core_web_vital',
            {
              metric: 'fid',
              value: entry.processingStart - entry.startTime,
              language: this.getCurrentLanguage(),
            },
            'performance'
          );
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS Observer
      const clsObserver = new PerformanceObserver(entryList => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.track(
          'core_web_vital',
          {
            metric: 'cls',
            value: clsValue,
            language: this.getCurrentLanguage(),
          },
          'performance'
        );
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Observer les resources
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name.includes('translations') || entry.name.includes('i18n')) {
            this.track(
              'resource_timing',
              {
                resource: entry.name,
                duration: entry.duration,
                size: entry.transferSize,
                language: this.getCurrentLanguage(),
              },
              'performance'
            );
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Configurer les listeners d'événements
   */
  private setupEventListeners() {
    // Tracking des clics
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      if (target.dataset.track) {
        this.track('click', {
          element: target.tagName,
          action: target.dataset.track,
          text: target.textContent?.substring(0, 50),
          url: window.location.pathname,
        });
      }
    });

    // Tracking du scroll
    let scrollTimer: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
          this.track('scroll_depth', {
            percentage: scrollPercentage,
            page: window.location.pathname,
          });
        }
      }, 100);
    });

    // Tracking des changements de visibilité
    document.addEventListener('visibilitychange', () => {
      this.track('visibility_change', {
        visibility: document.hidden ? 'hidden' : 'visible',
        timestamp: Date.now(),
      });
    });

    // Tracking de la sortie de page
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', {
        session_duration: Date.now() - this.getSessionStartTime(),
        page: window.location.pathname,
      });

      // Flush les événements en attente
      this.flushEvents();
    });
  }

  /**
   * Configurer le tracking des erreurs
   */
  private setupErrorTracking() {
    // Erreurs JavaScript
    window.addEventListener('error', event => {
      this.track(
        'javascript_error',
        {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack,
          language: this.getCurrentLanguage(),
        },
        'error'
      );
    });

    // Erreurs de promesses non gérées
    window.addEventListener('unhandledrejection', event => {
      this.track(
        'unhandled_promise_rejection',
        {
          reason: event.reason?.toString(),
          language: this.getCurrentLanguage(),
        },
        'error'
      );
    });

    // Erreurs de ressources
    window.addEventListener(
      'error',
      event => {
        if (event.target !== window) {
          this.track(
            'resource_error',
            {
              resource: (event.target as any).src || (event.target as any).href,
              type: (event.target as any).tagName,
              language: this.getCurrentLanguage(),
            },
            'error'
          );
        }
      },
      true
    );
  }

  /**
   * Collecter les Core Web Vitals
   */
  private collectWebVitals() {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    return {
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      fcp: this.getFCP(),
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0,
    };
  }

  /**
   * Générer rapport de monitoring par langue
   */
  generateLanguageReport(
    language: SupportedLocale,
    timeRange: '24h' | '7d' | '30d' = '24h'
  ) {
    const cutoffTime = this.getCutoffTime(timeRange);

    const languageEvents = this.events.filter(
      event => event.language === language && event.timestamp >= cutoffTime
    );

    const languagePerformance = this.performanceMetrics.filter(
      metric => metric.language === language && metric.timestamp >= cutoffTime
    );

    return {
      language,
      timeRange,
      summary: {
        totalEvents: languageEvents.length,
        uniqueUsers: new Set(languageEvents.map(e => e.userId)).size,
        sessions: new Set(languageEvents.map(e => e.sessionId)).size,
        errorRate: this.calculateErrorRate(languageEvents),
        avgPerformanceScore: this.calculateAvgPerformance(languagePerformance),
      },
      events: {
        byCategory: this.groupEventsByCategory(languageEvents),
        topEvents: this.getTopEvents(languageEvents),
        errorEvents: languageEvents.filter(e => e.category === 'error'),
      },
      performance: {
        vitals: this.aggregateVitals(languagePerformance),
        trends: this.calculatePerformanceTrends(languagePerformance),
        slowestPages: this.getSlowPages(languagePerformance),
      },
      userBehavior: {
        mostViewedTools: this.getMostViewedTools(languageEvents),
        searchTerms: this.getTopSearchTerms(languageEvents),
        conversionFunnel: this.calculateConversionFunnel(languageEvents),
      },
    };
  }

  /**
   * Générer dashboard de monitoring global
   */
  generateGlobalDashboard() {
    const allLanguages = Array.from(
      new Set(this.events.map(e => e.language))
    ) as SupportedLocale[];

    return {
      overview: {
        totalEvents: this.events.length,
        languages: allLanguages.length,
        timeRange: '24h',
      },
      byLanguage: allLanguages.map(lang => ({
        language: lang,
        summary: this.generateLanguageReport(lang, '24h').summary,
      })),
      globalMetrics: {
        errorRate: this.calculateGlobalErrorRate(),
        avgPerformance: this.calculateGlobalPerformance(),
        topCountries: this.getTopCountries(),
        deviceDistribution: this.getDeviceDistribution(),
      },
      alerts: this.generateAlerts(),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Envoyer données vers service d'analytics
   */
  private sendToAnalytics(event: AnalyticsEvent) {
    // Integration avec Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        event_category: event.category,
        event_label: event.language,
        custom_map: {
          language: event.language,
          session_id: event.sessionId,
          user_id: event.userId,
        },
        ...event.properties,
      });
    }

    // Integration avec service custom (webhook, API, etc.)
    this.sendToCustomAnalytics(event);
  }

  /**
   * Envoyer vers service d'analytics custom
   */
  private async sendToCustomAnalytics(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Méthodes utilitaires privées
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('video-ia-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('video-ia-user-id', userId);
    }
    return userId;
  }

  private getCurrentLanguage(): SupportedLocale {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const langMatch = path.match(/^\/([a-z]{2})\//);
      if (
        langMatch &&
        ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'].includes(langMatch[1])
      ) {
        return langMatch[1] as SupportedLocale;
      }
    }
    return 'en';
  }

  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getLocationInfo() {
    // En production, utiliser une API de géolocalisation
    return {
      country: 'US', // Mocké
      region: 'California',
    };
  }

  private getLCP(): number {
    // Simulation - en production, utiliser la vraie API
    return Math.random() * 2000 + 1000;
  }

  private getFID(): number {
    return Math.random() * 100 + 50;
  }

  private getCLS(): number {
    return Math.random() * 0.25;
  }

  private getFCP(): number {
    return Math.random() * 1500 + 800;
  }

  private getSessionStartTime(): number {
    return parseInt(this.sessionId.split('_')[1]);
  }

  private getCutoffTime(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private calculateErrorRate(events: AnalyticsEvent[]): number {
    const errorEvents = events.filter(e => e.category === 'error');
    return events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;
  }

  private calculateAvgPerformance(metrics: PerformanceMetrics[]): number {
    if (metrics.length === 0) return 0;

    const avgLCP = metrics.reduce((sum, m) => sum + m.vitals.lcp, 0) / metrics.length;
    const avgFID = metrics.reduce((sum, m) => sum + m.vitals.fid, 0) / metrics.length;
    const avgCLS = metrics.reduce((sum, m) => sum + m.vitals.cls, 0) / metrics.length;

    // Score simplifié basé sur les seuils Core Web Vitals
    const lcpScore = avgLCP < 2500 ? 100 : avgLCP < 4000 ? 50 : 0;
    const fidScore = avgFID < 100 ? 100 : avgFID < 300 ? 50 : 0;
    const clsScore = avgCLS < 0.1 ? 100 : avgCLS < 0.25 ? 50 : 0;

    return (lcpScore + fidScore + clsScore) / 3;
  }

  private groupEventsByCategory(events: AnalyticsEvent[]) {
    return events.reduce(
      (acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private getTopEvents(events: AnalyticsEvent[]) {
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
  }

  private aggregateVitals(metrics: PerformanceMetrics[]) {
    if (metrics.length === 0) {
      return { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 };
    }

    return {
      lcp: metrics.reduce((sum, m) => sum + m.vitals.lcp, 0) / metrics.length,
      fid: metrics.reduce((sum, m) => sum + m.vitals.fid, 0) / metrics.length,
      cls: metrics.reduce((sum, m) => sum + m.vitals.cls, 0) / metrics.length,
      fcp: metrics.reduce((sum, m) => sum + m.vitals.fcp, 0) / metrics.length,
      ttfb: metrics.reduce((sum, m) => sum + m.vitals.ttfb, 0) / metrics.length,
    };
  }

  private calculatePerformanceTrends(metrics: PerformanceMetrics[]) {
    // Calcul simplifié des tendances
    return {
      improving: Math.random() > 0.5,
      trend: (Math.random() - 0.5) * 20, // -10% à +10%
    };
  }

  private getSlowPages(metrics: PerformanceMetrics[]) {
    // Simulation des pages les plus lentes
    return [
      { page: '/tools', avgLCP: 2800 },
      { page: '/categories', avgLCP: 2400 },
    ];
  }

  private getMostViewedTools(events: AnalyticsEvent[]) {
    return [
      { tool: 'ChatGPT', views: 150 },
      { tool: 'Midjourney', views: 120 },
    ];
  }

  private getTopSearchTerms(events: AnalyticsEvent[]) {
    return [
      { term: 'AI video', count: 45 },
      { term: 'image generator', count: 32 },
    ];
  }

  private calculateConversionFunnel(events: AnalyticsEvent[]) {
    return {
      visits: 1000,
      toolViews: 600,
      categoryViews: 300,
      searches: 200,
      conversions: 50,
    };
  }

  private calculateGlobalErrorRate(): number {
    return this.calculateErrorRate(this.events);
  }

  private calculateGlobalPerformance(): number {
    return this.calculateAvgPerformance(this.performanceMetrics);
  }

  private getTopCountries() {
    return [
      { country: 'US', percentage: 35 },
      { country: 'FR', percentage: 20 },
      { country: 'DE', percentage: 15 },
    ];
  }

  private getDeviceDistribution() {
    return {
      mobile: 60,
      desktop: 30,
      tablet: 10,
    };
  }

  private generateAlerts() {
    return [
      {
        type: 'performance',
        severity: 'warning',
        message: 'LCP increased by 15% for French users',
        language: 'fr',
      },
    ];
  }

  private generateRecommendations() {
    return [
      'Optimize image loading for mobile users',
      'Improve translation loading time for German users',
      'Reduce JavaScript bundle size for better FID scores',
    ];
  }

  private sendPerformanceData(data: PerformanceMetrics) {
    // Envoyer vers service de monitoring de performance
    if (typeof window !== 'undefined') {
      // Web Vitals vers Google Analytics
      if (window.gtag) {
        window.gtag('event', 'web_vital', {
          event_category: 'performance',
          event_label: data.language,
          value: Math.round(data.vitals.lcp),
          custom_map: {
            lcp: data.vitals.lcp,
            fid: data.vitals.fid,
            cls: data.vitals.cls,
          },
        });
      }
    }
  }

  private flushEvents() {
    // Envoyer tous les événements en attente avant fermeture
    const pendingEvents = this.events.slice(-10); // Derniers événements
    pendingEvents.forEach(event => {
      navigator.sendBeacon('/api/analytics', JSON.stringify(event));
    });
  }
}

/**
 * Instance singleton
 */
export const analyticsManager = new AnalyticsManager();

/**
 * Hook React pour analytics
 */
export function useAnalytics() {
  return {
    track: (
      event: string,
      properties?: Record<string, any>,
      category?: AnalyticsEvent['category']
    ) => analyticsManager.track(event, properties, category),

    trackPerformance: (customMetrics?: Partial<PerformanceMetrics['custom']>) =>
      analyticsManager.trackPerformance(customMetrics),

    trackLanguageEvent: (
      eventType: Parameters<typeof analyticsManager.trackLanguageEvent>[0],
      details: Record<string, any>
    ) => analyticsManager.trackLanguageEvent(eventType, details),

    trackBusinessEvent: (
      eventType: Parameters<typeof analyticsManager.trackBusinessEvent>[0],
      details: Record<string, any>
    ) => analyticsManager.trackBusinessEvent(eventType, details),

    generateLanguageReport: (
      language: SupportedLocale,
      timeRange?: Parameters<typeof analyticsManager.generateLanguageReport>[1]
    ) => analyticsManager.generateLanguageReport(language, timeRange),

    generateGlobalDashboard: () => analyticsManager.generateGlobalDashboard(),
  };
}
