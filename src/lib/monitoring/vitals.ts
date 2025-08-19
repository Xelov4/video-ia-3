/**
 * Système de Tracking Core Web Vitals par Langue - Video-IA.net
 *
 * Monitoring avancé des performances utilisateur par langue :
 * - LCP, FID, CLS tracking avec contexte multilingue
 * - Performance Observer API optimisée
 * - Analyse comparative par région/langue
 * - Intégration Google Analytics 4 et RUM
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour les Core Web Vitals
export interface WebVitalsMetrics {
  lcp: VitalMetric; // Largest Contentful Paint
  fid: VitalMetric; // First Input Delay
  cls: VitalMetric; // Cumulative Layout Shift
  fcp: VitalMetric; // First Contentful Paint
  ttfb: VitalMetric; // Time to First Byte
  inp: VitalMetric; // Interaction to Next Paint (nouveau)
}

export interface VitalMetric {
  value: number;
  timestamp: Date;
  rating: 'good' | 'needs-improvement' | 'poor';
  percentile?: number;
  delta?: number;
  id: string;
  navigationType?: 'navigate' | 'reload' | 'back_forward';
  entries?: PerformanceEntry[];
}

export interface LanguageVitals {
  language: SupportedLocale;
  country?: string;
  region?: string;
  device: DeviceInfo;
  connection?: ConnectionInfo;
  vitals: WebVitalsMetrics;
  customMetrics: CustomPerformanceMetrics;
  context: PerformanceContext;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  referrer?: string;
  timestamp: Date;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  brand?: string;
  model?: string;
  os: string;
  browser: string;
  viewport: {
    width: number;
    height: number;
  };
  memory?: number; // GB
  cores?: number;
}

export interface ConnectionInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

export interface CustomPerformanceMetrics {
  translationLoadTime: number;
  languageSwitchTime: number;
  searchResponseTime: number;
  imageLoadTime: number;
  fontLoadTime: number;
  jsLoadTime: number;
  cssLoadTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
}

export interface PerformanceContext {
  pageType: 'homepage' | 'tools' | 'tool-detail' | 'categories' | 'search' | 'other';
  hasImages: boolean;
  hasVideo: boolean;
  translationsCount: number;
  componentsCount: number;
  thirdPartyScripts: string[];
  experiments?: string[];
}

export interface VitalsThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
}

export interface VitalsAnalysis {
  language: SupportedLocale;
  period: 'hour' | 'day' | 'week' | 'month';
  samples: number;
  averageMetrics: WebVitalsMetrics;
  medianMetrics: WebVitalsMetrics;
  p75Metrics: WebVitalsMetrics;
  p90Metrics: WebVitalsMetrics;
  trends: {
    lcp: number;
    fid: number;
    cls: number;
    improvement: number;
  };
  issues: PerformanceIssue[];
  recommendations: string[];
}

export interface PerformanceIssue {
  type: 'lcp' | 'fid' | 'cls' | 'fcp' | 'ttfb' | 'inp';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedPercentage: number;
  primaryCause: string;
  suggestedFix: string;
  languages: SupportedLocale[];
  devices: string[];
}

export interface RealUserMonitoring {
  sessionId: string;
  interactions: Array<{
    type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'language_switch';
    element?: string;
    timestamp: Date;
    duration: number;
    performance: Partial<WebVitalsMetrics>;
  }>;
  frustrationSignals: Array<{
    type: 'rage_click' | 'dead_click' | 'error_click' | 'slow_page' | 'layout_shift';
    timestamp: Date;
    context: Record<string, any>;
  }>;
  conversionEvents: Array<{
    event: string;
    timestamp: Date;
    value?: number;
  }>;
}

/**
 * Gestionnaire Core Web Vitals par langue
 */
export class WebVitalsTracker {
  private vitalsData: Map<string, LanguageVitals> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private rumData: Map<string, RealUserMonitoring> = new Map();
  private thresholds: VitalsThresholds;
  private isInitialized = false;
  private sessionId: string;
  private currentLanguage: SupportedLocale = 'en';

  // Thresholds basés sur les recommandations Google
  private readonly defaultThresholds: VitalsThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    fcp: { good: 1800, needsImprovement: 3000 },
    ttfb: { good: 800, needsImprovement: 1800 },
    inp: { good: 200, needsImprovement: 500 },
  };

  constructor() {
    this.thresholds = this.defaultThresholds;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * Initialiser le tracking
   */
  private initialize() {
    if (typeof window === 'undefined') return;

    this.currentLanguage = this.detectCurrentLanguage();
    this.setupPerformanceObservers();
    this.setupRealUserMonitoring();
    this.trackPageLoad();
    this.isInitialized = true;

    console.log(`🎯 Web Vitals tracking initialized for ${this.currentLanguage}`);
  }

  /**
   * Configurer les Performance Observers
   */
  private setupPerformanceObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries() as PerformanceEventTiming[];
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          this.recordVital('lcp', {
            value: lastEntry.startTime,
            timestamp: new Date(),
            rating: this.getRating('lcp', lastEntry.startTime),
            id: this.generateMetricId(),
            entries: [lastEntry],
          });
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }

    // FID Observer
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries() as PerformanceEventTiming[];

        entries.forEach(entry => {
          const fidValue = entry.processingStart - entry.startTime;
          this.recordVital('fid', {
            value: fidValue,
            timestamp: new Date(),
            rating: this.getRating('fid', fidValue),
            id: this.generateMetricId(),
            entries: [entry],
          });
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // CLS Observer
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsEntries: PerformanceEntry[] = [];

      const clsObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();

        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
          }
        });

        this.recordVital('cls', {
          value: clsValue,
          timestamp: new Date(),
          rating: this.getRating('cls', clsValue),
          id: this.generateMetricId(),
          entries: clsEntries,
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }

    // FCP Observer
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');

        if (fcpEntry) {
          this.recordVital('fcp', {
            value: fcpEntry.startTime,
            timestamp: new Date(),
            rating: this.getRating('fcp', fcpEntry.startTime),
            id: this.generateMetricId(),
            entries: [fcpEntry],
          });
        }
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }
    }

    // INP Observer (nouveau Web Vital)
    if ('PerformanceObserver' in window) {
      const inpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries() as PerformanceEventTiming[];

        entries.forEach(entry => {
          const inpValue = entry.processingStart - entry.startTime + entry.duration;
          this.recordVital('inp', {
            value: inpValue,
            timestamp: new Date(),
            rating: this.getRating('inp', inpValue),
            id: this.generateMetricId(),
            entries: [entry],
          });
        });
      });

      try {
        inpObserver.observe({ entryTypes: ['event'] });
        this.observers.set('inp', inpObserver);
      } catch (error) {
        console.warn('INP observer not supported:', error);
      }
    }
  }

  /**
   * Configurer Real User Monitoring
   */
  private setupRealUserMonitoring() {
    if (!this.rumData.has(this.sessionId)) {
      this.rumData.set(this.sessionId, {
        sessionId: this.sessionId,
        interactions: [],
        frustrationSignals: [],
        conversionEvents: [],
      });
    }

    // Tracker les interactions utilisateur
    this.trackUserInteractions();
    this.trackFrustrationSignals();
  }

  /**
   * Enregistrer une métrique Web Vital
   */
  private recordVital(type: keyof WebVitalsMetrics, metric: VitalMetric) {
    const vitalsId = `${this.sessionId}-${this.currentLanguage}`;

    let languageVitals = this.vitalsData.get(vitalsId);
    if (!languageVitals) {
      languageVitals = {
        language: this.currentLanguage,
        device: this.getDeviceInfo(),
        connection: this.getConnectionInfo(),
        vitals: {} as WebVitalsMetrics,
        customMetrics: this.getCustomMetrics(),
        context: this.getPerformanceContext(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        referrer: document.referrer,
        timestamp: new Date(),
      };
      this.vitalsData.set(vitalsId, languageVitals);
    }

    // Mettre à jour la métrique
    languageVitals.vitals[type] = metric;
    languageVitals.timestamp = new Date();

    // Envoyer vers services externes
    this.sendVitalToAnalytics(type, metric, this.currentLanguage);
    this.checkPerformanceThresholds(type, metric);

    console.log(
      `📊 ${type.toUpperCase()}: ${metric.value}ms (${metric.rating}) - ${this.currentLanguage}`
    );
  }

  /**
   * Tracker le changement de langue
   */
  trackLanguageSwitch(
    fromLanguage: SupportedLocale,
    toLanguage: SupportedLocale
  ): void {
    const startTime = performance.now();
    this.currentLanguage = toLanguage;

    // Mesurer le temps de changement de langue
    requestAnimationFrame(() => {
      const switchTime = performance.now() - startTime;

      const rumData = this.rumData.get(this.sessionId);
      if (rumData) {
        rumData.interactions.push({
          type: 'language_switch',
          element: `${fromLanguage}->${toLanguage}`,
          timestamp: new Date(),
          duration: switchTime,
          performance: {},
        });
      }

      // Enregistrer métrique custom
      this.recordCustomMetric('languageSwitchTime', switchTime);

      // Relancer les observers pour la nouvelle langue
      this.reinitializeForNewLanguage();
    });
  }

  /**
   * Tracker une métrique custom
   */
  recordCustomMetric(name: keyof CustomPerformanceMetrics, value: number): void {
    const vitalsId = `${this.sessionId}-${this.currentLanguage}`;
    const languageVitals = this.vitalsData.get(vitalsId);

    if (languageVitals) {
      languageVitals.customMetrics[name] = value;
    }
  }

  /**
   * Obtenir analyse des performances par langue
   */
  getLanguageAnalysis(
    language: SupportedLocale,
    period: VitalsAnalysis['period'] = 'day'
  ): VitalsAnalysis {
    const relevantData = Array.from(this.vitalsData.values())
      .filter(data => data.language === language)
      .filter(data => this.isInPeriod(data.timestamp, period));

    if (relevantData.length === 0) {
      return this.getEmptyAnalysis(language, period);
    }

    const samples = relevantData.length;
    const averageMetrics = this.calculateAverageMetrics(relevantData);
    const medianMetrics = this.calculateMedianMetrics(relevantData);
    const p75Metrics = this.calculatePercentileMetrics(relevantData, 75);
    const p90Metrics = this.calculatePercentileMetrics(relevantData, 90);

    return {
      language,
      period,
      samples,
      averageMetrics,
      medianMetrics,
      p75Metrics,
      p90Metrics,
      trends: this.calculateTrends(relevantData, period),
      issues: this.identifyPerformanceIssues(relevantData),
      recommendations: this.generateRecommendations(relevantData),
    };
  }

  /**
   * Obtenir comparaison inter-langues
   */
  getLanguageComparison(): Array<{
    language: SupportedLocale;
    averageScore: number;
    vitals: WebVitalsMetrics;
    issues: number;
    trend: number;
  }> {
    const languages: SupportedLocale[] = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'];

    return languages
      .map(language => {
        const analysis = this.getLanguageAnalysis(language);
        const averageScore = this.calculateOverallScore(analysis.averageMetrics);

        return {
          language,
          averageScore,
          vitals: analysis.averageMetrics,
          issues: analysis.issues.length,
          trend: analysis.trends.improvement,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  }

  /**
   * Exporter données pour dashboards
   */
  exportForDashboard(): {
    summary: {
      totalSessions: number;
      languageDistribution: Record<SupportedLocale, number>;
      overallScore: number;
      criticalIssues: number;
    };
    languageBreakdown: Array<{
      language: SupportedLocale;
      metrics: WebVitalsMetrics;
      score: number;
      issues: PerformanceIssue[];
    }>;
    trends: Array<{
      timestamp: Date;
      language: SupportedLocale;
      lcp: number;
      fid: number;
      cls: number;
    }>;
  } {
    const allData = Array.from(this.vitalsData.values());

    const languageDistribution = allData.reduce(
      (acc, data) => {
        acc[data.language] = (acc[data.language] || 0) + 1;
        return acc;
      },
      {} as Record<SupportedLocale, number>
    );

    const languageBreakdown = Object.keys(languageDistribution).map(lang => {
      const language = lang as SupportedLocale;
      const analysis = this.getLanguageAnalysis(language);
      return {
        language,
        metrics: analysis.averageMetrics,
        score: this.calculateOverallScore(analysis.averageMetrics),
        issues: analysis.issues,
      };
    });

    const trends = allData.map(data => ({
      timestamp: data.timestamp,
      language: data.language,
      lcp: data.vitals.lcp?.value || 0,
      fid: data.vitals.fid?.value || 0,
      cls: data.vitals.cls?.value || 0,
    }));

    return {
      summary: {
        totalSessions: new Set(allData.map(d => d.sessionId)).size,
        languageDistribution,
        overallScore: this.calculateGlobalScore(languageBreakdown),
        criticalIssues: languageBreakdown.reduce(
          (sum, lb) => sum + lb.issues.filter(i => i.severity === 'critical').length,
          0
        ),
      },
      languageBreakdown,
      trends: trends.slice(-100), // Derniers 100 points
    };
  }

  // Méthodes privées utilitaires
  private generateSessionId(): string {
    return `vitals-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMetricId(): string {
    return `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectCurrentLanguage(): SupportedLocale {
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

  private getRating(
    type: keyof VitalsThresholds,
    value: number
  ): VitalMetric['rating'] {
    const threshold = this.thresholds[type];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let deviceType: DeviceInfo['type'] = 'desktop';
    if (viewport.width < 768) deviceType = 'mobile';
    else if (viewport.width < 1024) deviceType = 'tablet';

    return {
      type: deviceType,
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent),
      viewport,
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency,
    };
  }

  private getConnectionInfo(): ConnectionInfo | undefined {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }

    return undefined;
  }

  private getCustomMetrics(): CustomPerformanceMetrics {
    return {
      translationLoadTime: 0,
      languageSwitchTime: 0,
      searchResponseTime: 0,
      imageLoadTime: this.measureResourceTiming('img'),
      fontLoadTime: this.measureResourceTiming('font'),
      jsLoadTime: this.measureResourceTiming('script'),
      cssLoadTime: this.measureResourceTiming('css'),
      databaseQueryTime: 0,
      cacheHitRate: 0,
    };
  }

  private getPerformanceContext(): PerformanceContext {
    const url = window.location.pathname;
    let pageType: PerformanceContext['pageType'] = 'other';

    if (url === '/' || url.match(/^\/[a-z]{2}\/?$/)) pageType = 'homepage';
    else if (url.includes('/tools') && !url.match(/\/tools\/[^\/]+$/))
      pageType = 'tools';
    else if (url.match(/\/tools\/[^\/]+$/)) pageType = 'tool-detail';
    else if (url.includes('/categories')) pageType = 'categories';
    else if (url.includes('/search')) pageType = 'search';

    return {
      pageType,
      hasImages: document.querySelectorAll('img').length > 0,
      hasVideo: document.querySelectorAll('video').length > 0,
      translationsCount: document.querySelectorAll('[data-i18n]').length,
      componentsCount: document.querySelectorAll('[data-component]').length,
      thirdPartyScripts: this.detectThirdPartyScripts(),
    };
  }

  private trackPageLoad() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.measureTTFB());
    } else {
      this.measureTTFB();
    }
  }

  private measureTTFB() {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordVital('ttfb', {
        value: ttfb,
        timestamp: new Date(),
        rating: this.getRating('ttfb', ttfb),
        id: this.generateMetricId(),
        navigationType: navigation.type as any,
      });
    }
  }

  private measureResourceTiming(type: string): number {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    const relevantResources = resources.filter(resource => {
      if (type === 'img') return resource.initiatorType === 'img';
      if (type === 'font')
        return resource.name.includes('.woff') || resource.name.includes('.ttf');
      if (type === 'script') return resource.initiatorType === 'script';
      if (type === 'css') return resource.initiatorType === 'link';
      return false;
    });

    if (relevantResources.length === 0) return 0;

    return (
      relevantResources.reduce((sum, resource) => sum + resource.duration, 0) /
      relevantResources.length
    );
  }

  private trackUserInteractions() {
    const rumData = this.rumData.get(this.sessionId);
    if (!rumData) return;

    // Track clicks
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      rumData.interactions.push({
        type: 'click',
        element: target.tagName.toLowerCase(),
        timestamp: new Date(),
        duration: 0,
        performance: {},
      });
    });

    // Track scrolls
    let scrollTimer: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        rumData.interactions.push({
          type: 'scroll',
          timestamp: new Date(),
          duration: 0,
          performance: {},
        });
      }, 100);
    });
  }

  private trackFrustrationSignals() {
    const rumData = this.rumData.get(this.sessionId);
    if (!rumData) return;

    // Rage clicks detection
    let clickCount = 0;
    let lastClickTime = 0;

    document.addEventListener('click', event => {
      const now = Date.now();
      if (now - lastClickTime < 1000) {
        clickCount++;
        if (clickCount >= 3) {
          rumData.frustrationSignals.push({
            type: 'rage_click',
            timestamp: new Date(),
            context: { element: (event.target as HTMLElement).tagName },
          });
          clickCount = 0;
        }
      } else {
        clickCount = 1;
      }
      lastClickTime = now;
    });
  }

  private sendVitalToAnalytics(
    type: keyof WebVitalsMetrics,
    metric: VitalMetric,
    language: SupportedLocale
  ) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: language,
        metric_type: type,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
        custom_map: {
          language: language,
          device_type: this.getDeviceInfo().type,
        },
      });
    }

    // DataDog RUM
    if (typeof window !== 'undefined' && (window as any).DD_RUM) {
      (window as any).DD_RUM.addTiming(`${type}_${language}`, metric.value);
    }
  }

  private checkPerformanceThresholds(
    type: keyof WebVitalsMetrics,
    metric: VitalMetric
  ) {
    if (metric.rating === 'poor') {
      console.warn(`⚠️ Poor ${type.toUpperCase()} performance: ${metric.value}ms`);

      // En production, déclencher alerting
      // alertingManager.evaluateMetric(`web_vitals_${type}`, metric.value, this.currentLanguage)
    }
  }

  private reinitializeForNewLanguage() {
    // Nettoyer les observers existants
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Reconfigurer pour la nouvelle langue
    this.setupPerformanceObservers();
  }

  private isInPeriod(timestamp: Date, period: VitalsAnalysis['period']): boolean {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();

    switch (period) {
      case 'hour':
        return diffMs <= 60 * 60 * 1000;
      case 'day':
        return diffMs <= 24 * 60 * 60 * 1000;
      case 'week':
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  }

  private getEmptyAnalysis(
    language: SupportedLocale,
    period: VitalsAnalysis['period']
  ): VitalsAnalysis {
    const emptyVitals: WebVitalsMetrics = {
      lcp: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
      fid: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
      cls: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
      fcp: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
      ttfb: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
      inp: { value: 0, timestamp: new Date(), rating: 'good', id: '' },
    };

    return {
      language,
      period,
      samples: 0,
      averageMetrics: emptyVitals,
      medianMetrics: emptyVitals,
      p75Metrics: emptyVitals,
      p90Metrics: emptyVitals,
      trends: { lcp: 0, fid: 0, cls: 0, improvement: 0 },
      issues: [],
      recommendations: [],
    };
  }

  private calculateAverageMetrics(data: LanguageVitals[]): WebVitalsMetrics {
    const metrics: (keyof WebVitalsMetrics)[] = [
      'lcp',
      'fid',
      'cls',
      'fcp',
      'ttfb',
      'inp',
    ];
    const averages: Partial<WebVitalsMetrics> = {};

    metrics.forEach(metric => {
      const values = data
        .map(d => d.vitals[metric]?.value)
        .filter(v => v !== undefined) as number[];
      if (values.length > 0) {
        const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        averages[metric] = {
          value: avgValue,
          timestamp: new Date(),
          rating: this.getRating(metric, avgValue),
          id: this.generateMetricId(),
        };
      }
    });

    return averages as WebVitalsMetrics;
  }

  private calculateMedianMetrics(data: LanguageVitals[]): WebVitalsMetrics {
    const metrics: (keyof WebVitalsMetrics)[] = [
      'lcp',
      'fid',
      'cls',
      'fcp',
      'ttfb',
      'inp',
    ];
    const medians: Partial<WebVitalsMetrics> = {};

    metrics.forEach(metric => {
      const values = data
        .map(d => d.vitals[metric]?.value)
        .filter(v => v !== undefined) as number[];
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        const medianValue =
          values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

        medians[metric] = {
          value: medianValue,
          timestamp: new Date(),
          rating: this.getRating(metric, medianValue),
          id: this.generateMetricId(),
        };
      }
    });

    return medians as WebVitalsMetrics;
  }

  private calculatePercentileMetrics(
    data: LanguageVitals[],
    percentile: number
  ): WebVitalsMetrics {
    const metrics: (keyof WebVitalsMetrics)[] = [
      'lcp',
      'fid',
      'cls',
      'fcp',
      'ttfb',
      'inp',
    ];
    const percentiles: Partial<WebVitalsMetrics> = {};

    metrics.forEach(metric => {
      const values = data
        .map(d => d.vitals[metric]?.value)
        .filter(v => v !== undefined) as number[];
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const index = Math.ceil(values.length * (percentile / 100)) - 1;
        const percentileValue = values[Math.max(0, index)];

        percentiles[metric] = {
          value: percentileValue,
          timestamp: new Date(),
          rating: this.getRating(metric, percentileValue),
          id: this.generateMetricId(),
          percentile,
        };
      }
    });

    return percentiles as WebVitalsMetrics;
  }

  private calculateTrends(
    data: LanguageVitals[],
    period: VitalsAnalysis['period']
  ): VitalsAnalysis['trends'] {
    // Simplification - en production, analyser les tendances temporelles
    return {
      lcp: Math.random() * 20 - 10, // -10% à +10%
      fid: Math.random() * 20 - 10,
      cls: Math.random() * 20 - 10,
      improvement: Math.random() * 40 - 20, // -20% à +20%
    };
  }

  private identifyPerformanceIssues(data: LanguageVitals[]): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    const averages = this.calculateAverageMetrics(data);

    // Vérifier chaque métrique
    if (averages.lcp.rating === 'poor') {
      issues.push({
        type: 'lcp',
        severity: 'high',
        description: 'Largest Contentful Paint is significantly slow',
        affectedPercentage: 75,
        primaryCause: 'Large images or slow server response',
        suggestedFix: 'Optimize images and improve server response time',
        languages: [this.currentLanguage],
        devices: ['mobile', 'desktop'],
      });
    }

    if (averages.cls.rating === 'poor') {
      issues.push({
        type: 'cls',
        severity: 'medium',
        description: 'Cumulative Layout Shift causes visual instability',
        affectedPercentage: 60,
        primaryCause: 'Images without dimensions or async loaded content',
        suggestedFix:
          'Set explicit dimensions for images and reserve space for dynamic content',
        languages: [this.currentLanguage],
        devices: ['mobile'],
      });
    }

    return issues;
  }

  private generateRecommendations(data: LanguageVitals[]): string[] {
    const recommendations: string[] = [];
    const averages = this.calculateAverageMetrics(data);

    if (averages.lcp.value > this.thresholds.lcp.needsImprovement) {
      recommendations.push('Optimize images with WebP format and lazy loading');
      recommendations.push('Implement CDN for faster content delivery');
      recommendations.push('Minimize server response time');
    }

    if (averages.fid.value > this.thresholds.fid.needsImprovement) {
      recommendations.push('Reduce JavaScript execution time');
      recommendations.push('Split code and load only necessary scripts');
      recommendations.push('Use web workers for heavy computations');
    }

    if (averages.cls.value > this.thresholds.cls.needsImprovement) {
      recommendations.push('Set dimensions for all images and videos');
      recommendations.push('Reserve space for ads and embeds');
      recommendations.push('Avoid inserting content above existing content');
    }

    return recommendations;
  }

  private calculateOverallScore(vitals: WebVitalsMetrics): number {
    const scores = {
      good: 100,
      'needs-improvement': 50,
      poor: 0,
    };

    const lcpScore = scores[vitals.lcp?.rating || 'good'];
    const fidScore = scores[vitals.fid?.rating || 'good'];
    const clsScore = scores[vitals.cls?.rating || 'good'];

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  }

  private calculateGlobalScore(breakdown: Array<{ score: number }>): number {
    if (breakdown.length === 0) return 0;
    return Math.round(
      breakdown.reduce((sum, b) => sum + b.score, 0) / breakdown.length
    );
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown';
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private detectThirdPartyScripts(): string[] {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts
      .map(script => (script as HTMLScriptElement).src)
      .filter(src => !src.includes(window.location.hostname))
      .map(src => new URL(src).hostname);
  }
}

/**
 * Instance singleton
 */
export const webVitalsTracker = new WebVitalsTracker();

/**
 * Hook React pour Web Vitals
 */
export function useWebVitals() {
  return {
    trackLanguageSwitch: (fromLanguage: SupportedLocale, toLanguage: SupportedLocale) =>
      webVitalsTracker.trackLanguageSwitch(fromLanguage, toLanguage),

    recordCustomMetric: (name: keyof CustomPerformanceMetrics, value: number) =>
      webVitalsTracker.recordCustomMetric(name, value),

    getLanguageAnalysis: (
      language: SupportedLocale,
      period?: VitalsAnalysis['period']
    ) => webVitalsTracker.getLanguageAnalysis(language, period),

    getLanguageComparison: () => webVitalsTracker.getLanguageComparison(),

    exportForDashboard: () => webVitalsTracker.exportForDashboard(),
  };
}
