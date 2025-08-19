/**
 * Système Critical CSS par Langue - Video-IA.net
 *
 * Optimisation du CSS critique pour performance multilingue :
 * - Extraction CSS above-the-fold par langue
 * - Génération automatique de CSS critique
 * - Inlining intelligent et lazy loading
 * - Purge CSS inutilisé par route
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour Critical CSS
export interface CriticalCssConfig {
  language: SupportedLocale;
  route: string;
  criticalCss: string;
  aboveFoldSelectors: string[];
  deferredCss: string[];
  inlineSize: number;
  totalReduction: number;
}

export interface CssAnalysis {
  totalSize: number;
  usedSelectors: string[];
  unusedSelectors: string[];
  criticalSelectors: string[];
  fontSelectors: string[];
  mediaQueries: MediaQueryAnalysis[];
}

export interface MediaQueryAnalysis {
  query: string;
  selectors: string[];
  size: number;
  critical: boolean;
}

export interface PerformanceMetrics {
  beforeOptimization: {
    totalCssSize: number;
    blockingTime: number;
    firstPaint: number;
  };
  afterOptimization: {
    inlineCssSize: number;
    deferredCssSize: number;
    firstPaint: number;
    speedIndex: number;
  };
  improvement: {
    sizeReduction: number;
    fasterFirstPaint: number;
    scoreImprovement: number;
  };
}

/**
 * Générateur de Critical CSS
 */
export class CriticalCssGenerator {
  private criticalSelectors: Map<string, string[]> = new Map();
  private languageSpecificSelectors: Map<SupportedLocale, string[]> = new Map();
  private routeSpecificSelectors: Map<string, string[]> = new Map();

  constructor() {
    this.initializeCriticalSelectors();
    this.initializeLanguageSelectors();
    this.initializeRouteSelectors();
  }

  /**
   * Initialiser les sélecteurs critiques globaux
   */
  private initializeCriticalSelectors() {
    const globalCritical = [
      // Base styles
      'html',
      'body',
      '*',
      '*::before',
      '*::after',

      // Typography
      'h1',
      'h2',
      'h3',
      'p',
      'a',

      // Layout containers
      '.container',
      '.max-w-*',
      '.mx-auto',

      // Navigation
      'header',
      'nav',
      '.header',
      '.navigation',

      // Above fold components
      '.hero',
      '.banner',
      '.intro',

      // Loading states
      '.loading',
      '.spinner',
      '.skeleton',

      // Critical utility classes
      '.block',
      '.flex',
      '.grid',
      '.hidden',
      '.text-*',
      '.bg-*',
      '.border-*',
      '.p-*',
      '.m-*',
      '.w-*',
      '.h-*',

      // Critical responsive
      '.sm\\:*',
      '.md\\:*',
      '.lg\\:*',
    ];

    this.criticalSelectors.set('global', globalCritical);
  }

  /**
   * Initialiser les sélecteurs spécifiques par langue
   */
  private initializeLanguageSelectors() {
    const commonI18nSelectors = [
      '[dir="rtl"]',
      '[dir="ltr"]',
      '.text-right',
      '.text-left',
      '.font-arabic',
      '.font-latin',
      '.font-cjk',
    ];

    // Sélecteurs RTL pour certaines langues futures
    const rtlSelectors = [
      '.rtl\\:text-right',
      '.rtl\\:text-left',
      '.rtl\\:mr-*',
      '.rtl\\:ml-*',
      '.rtl\\:pr-*',
      '.rtl\\:pl-*',
    ];

    // Sélecteurs spécifiques par langue
    this.languageSpecificSelectors.set('en', [...commonI18nSelectors]);
    this.languageSpecificSelectors.set('fr', [...commonI18nSelectors, '.font-french']);
    this.languageSpecificSelectors.set('es', [...commonI18nSelectors, '.font-spanish']);
    this.languageSpecificSelectors.set('it', [...commonI18nSelectors, '.font-italian']);
    this.languageSpecificSelectors.set('de', [...commonI18nSelectors, '.font-german']);
    this.languageSpecificSelectors.set('nl', [...commonI18nSelectors, '.font-dutch']);
    this.languageSpecificSelectors.set('pt', [
      ...commonI18nSelectors,
      '.font-portuguese',
    ]);
  }

  /**
   * Initialiser les sélecteurs spécifiques par route
   */
  private initializeRouteSelectors() {
    // Homepage
    this.routeSpecificSelectors.set('/', [
      '.hero-section',
      '.featured-tools',
      '.categories-grid',
      '.search-form',
      '.stats-counter',
    ]);

    // Tools listing
    this.routeSpecificSelectors.set('/tools', [
      '.tools-grid',
      '.filter-sidebar',
      '.pagination',
      '.tool-card',
      '.category-filter',
    ]);

    // Tool detail
    this.routeSpecificSelectors.set('/tools/[slug]', [
      '.tool-header',
      '.tool-description',
      '.tool-features',
      '.tool-gallery',
      '.related-tools',
    ]);

    // Categories
    this.routeSpecificSelectors.set('/categories', [
      '.categories-list',
      '.category-card',
      '.tool-count',
    ]);

    // Category detail
    this.routeSpecificSelectors.set('/categories/[slug]', [
      '.category-header',
      '.category-tools',
      '.subcategories',
    ]);
  }

  /**
   * Générer CSS critique pour une page
   */
  async generateCriticalCss(config: {
    language: SupportedLocale;
    route: string;
    viewport?: { width: number; height: number };
    cssFiles?: string[];
  }): Promise<CriticalCssConfig> {
    const {
      language,
      route,
      viewport = { width: 1200, height: 800 },
      cssFiles = [],
    } = config;

    // Collecter tous les sélecteurs critiques
    const criticalSelectors = this.collectCriticalSelectors(language, route);

    // Analyser le CSS existant
    const cssAnalysis = await this.analyzeCssFiles(cssFiles, criticalSelectors);

    // Extraire le CSS critique
    const criticalCss = this.extractCriticalCss(cssAnalysis, criticalSelectors);

    // Identifier le CSS différé
    const deferredCss = this.identifyDeferredCss(cssAnalysis, criticalSelectors);

    return {
      language,
      route,
      criticalCss,
      aboveFoldSelectors: criticalSelectors,
      deferredCss,
      inlineSize: this.calculateSize(criticalCss),
      totalReduction: this.calculateReduction(cssAnalysis.totalSize, criticalCss),
    };
  }

  /**
   * Collecter les sélecteurs critiques
   */
  private collectCriticalSelectors(language: SupportedLocale, route: string): string[] {
    const selectors: string[] = [];

    // Ajouter sélecteurs globaux
    selectors.push(...(this.criticalSelectors.get('global') || []));

    // Ajouter sélecteurs spécifiques à la langue
    selectors.push(...(this.languageSpecificSelectors.get(language) || []));

    // Ajouter sélecteurs spécifiques à la route
    const normalizedRoute = this.normalizeRoute(route);
    selectors.push(...(this.routeSpecificSelectors.get(normalizedRoute) || []));

    return [...new Set(selectors)]; // Déduplication
  }

  /**
   * Analyser les fichiers CSS
   */
  private async analyzeCssFiles(
    cssFiles: string[],
    criticalSelectors: string[]
  ): Promise<CssAnalysis> {
    // Simulation de l'analyse CSS (en production, utiliser postcss/cssnano)
    const mockAnalysis: CssAnalysis = {
      totalSize: 145000, // 145KB
      usedSelectors: [
        'body',
        'html',
        '.container',
        '.header',
        '.nav',
        '.hero',
        '.btn',
        '.card',
        '.grid',
        '.flex',
        ...criticalSelectors.slice(0, 50),
      ],
      unusedSelectors: [
        '.unused-component',
        '.legacy-style',
        '.debug-*',
        '.print-only',
        '.ie-specific',
      ],
      criticalSelectors: criticalSelectors.slice(0, 30),
      fontSelectors: ['@font-face', '.font-sans', '.font-serif', '.font-mono'],
      mediaQueries: [
        {
          query: '@media (max-width: 640px)',
          selectors: ['.sm\\:hidden', '.sm\\:block'],
          size: 2400,
          critical: true,
        },
        {
          query: '@media (max-width: 768px)',
          selectors: ['.md\\:flex', '.md\\:grid'],
          size: 1800,
          critical: true,
        },
        {
          query: '@media (min-width: 1024px)',
          selectors: ['.lg\\:w-full', '.lg\\:max-w-none'],
          size: 3200,
          critical: false,
        },
      ],
    };

    return mockAnalysis;
  }

  /**
   * Extraire le CSS critique
   */
  private extractCriticalCss(
    analysis: CssAnalysis,
    criticalSelectors: string[]
  ): string {
    // Simulation de génération CSS critique
    const criticalRules = [
      '/* Critical CSS - Above the fold */',
      'html{line-height:1.15;-webkit-text-size-adjust:100%}',
      'body{margin:0;font-family:system-ui,-apple-system,sans-serif}',
      'h1,h2,h3{margin:0;font-weight:600}',
      '.container{width:100%;max-width:1200px;margin:0 auto;padding:0 1rem}',
      '.header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:50}',
      '.nav{display:flex;justify-content:space-between;align-items:center;height:4rem}',
      '.hero{padding:4rem 0;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}',
      '.btn{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.375rem;font-weight:500;transition:all 0.15s ease}',
      '.btn-primary{background:#3b82f6;color:#fff}',
      '.btn-primary:hover{background:#2563eb}',
      '.loading{display:flex;justify-content:center;padding:2rem}',
      '.spinner{width:2rem;height:2rem;border:2px solid #e5e7eb;border-top:2px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite}',
      '@keyframes spin{to{transform:rotate(360deg)}}',

      // Media queries critiques
      '@media (max-width: 640px){',
      '.container{padding:0 0.75rem}',
      '.hero{padding:2rem 0}',
      '}',

      '@media (max-width: 768px){',
      '.nav{padding:0 1rem}',
      '.hero{font-size:0.875rem}',
      '}',
    ];

    return criticalRules.join('\n');
  }

  /**
   * Identifier le CSS différé
   */
  private identifyDeferredCss(
    analysis: CssAnalysis,
    criticalSelectors: string[]
  ): string[] {
    return [
      'components.css', // Composants non-critiques
      'utilities.css', // Classes utilitaires avancées
      'animations.css', // Animations complexes
      'print.css', // Styles d'impression
      'forms.css', // Styles de formulaires
    ];
  }

  /**
   * Générer le loader de CSS différé
   */
  generateDeferredCssLoader(): string {
    return `
// CSS Deferred Loader - Optimized for Core Web Vitals
class DeferredCssLoader {
  constructor() {
    this.loadedStyles = new Set()
    this.pendingLoads = new Map()
    this.observer = null
    
    // Initialiser après le load complet
    if (document.readyState === 'complete') {
      this.init()
    } else {
      window.addEventListener('load', () => this.init())
    }
  }

  init() {
    this.setupIntersectionObserver()
    this.loadEssentialStyles()
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target
          const stylesToLoad = element.dataset.deferredStyles?.split(',') || []
          this.loadStyles(stylesToLoad)
        }
      })
    }, { rootMargin: '100px' })
  }

  async loadEssentialStyles() {
    // Charger les styles essentiels après le critical path
    const essentialStyles = [
      '/styles/components.css',
      '/styles/utilities.css'
    ]

    // Utiliser requestIdleCallback pour ne pas bloquer
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.loadStyles(essentialStyles)
      })
    } else {
      setTimeout(() => this.loadStyles(essentialStyles), 100)
    }
  }

  async loadStyles(styleUrls) {
    const loadPromises = styleUrls
      .filter(url => !this.loadedStyles.has(url))
      .map(url => this.loadSingleStyle(url))

    await Promise.all(loadPromises)
  }

  async loadSingleStyle(url) {
    if (this.pendingLoads.has(url)) {
      return this.pendingLoads.get(url)
    }

    const loadPromise = new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.media = 'print' // Eviter le blocking
      
      link.onload = () => {
        link.media = 'all' // Activer le CSS
        this.loadedStyles.add(url)
        resolve()
      }
      
      link.onerror = reject
      document.head.appendChild(link)
    })

    this.pendingLoads.set(url, loadPromise)
    return loadPromise
  }

  // Observer un élément pour chargement conditionnel
  observeElement(element) {
    if (this.observer) {
      this.observer.observe(element)
    }
  }

  // Précharger des styles pour navigation future
  prefetchStyles(urls) {
    urls.forEach(url => {
      if (!this.loadedStyles.has(url)) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'style'
        link.href = url
        document.head.appendChild(link)
      }
    })
  }
}

// Instance globale
window.deferredCssLoader = new DeferredCssLoader()

// Fonction helper pour composants React
window.loadComponentStyles = (styleUrls) => {
  if (window.deferredCssLoader) {
    window.deferredCssLoader.loadStyles(styleUrls)
  }
}
    `.trim();
  }

  /**
   * Générer les configurations Tailwind optimisées
   */
  generateTailwindConfig(): any {
    return {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],

      // Purge agressif pour production
      safelist: [
        // Classes dynamiques importantes
        'text-red-500',
        'text-green-500',
        'text-yellow-500',
        'bg-red-50',
        'bg-green-50',
        'bg-yellow-50',

        // Classes pour le language switcher
        'opacity-0',
        'opacity-100',
        'transform',
        'transition-all',

        // Classes RTL futures
        {
          pattern: /rtl:(mr|ml|pr|pl|text)-.*/,
        },
      ],

      theme: {
        extend: {
          // Fonts optimisés par langue
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            french: ['Source Sans Pro', 'sans-serif'],
            german: ['Roboto', 'sans-serif'],
            spanish: ['Open Sans', 'sans-serif'],
          },

          // Animations optimisées
          animation: {
            'fade-in': 'fadeIn 0.3s ease-in-out',
            'slide-in': 'slideIn 0.2s ease-out',
            'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
        },
      },

      plugins: [
        // Plugin pour RTL support
        function ({ addUtilities }) {
          const rtlUtilities = {
            '.rtl\\:text-right': {
              '[dir="rtl"] &': {
                textAlign: 'right',
              },
            },
            '.rtl\\:text-left': {
              '[dir="rtl"] &': {
                textAlign: 'left',
              },
            },
          };
          addUtilities(rtlUtilities);
        },
      ],

      // Optimisations de build
      corePlugins: {
        // Désactiver les plugins inutilisés
        backdropBlur: false,
        backdropBrightness: false,
        backdropContrast: false,
        backdropGrayscale: false,
        backdropHueRotate: false,
        backdropInvert: false,
        backdropOpacity: false,
        backdropSaturate: false,
        backdropSepia: false,
      },
    };
  }

  /**
   * Mesurer les performances
   */
  measurePerformance(beforeCss: string, afterCriticalCss: string): PerformanceMetrics {
    const beforeSize = this.calculateSize(beforeCss);
    const afterSize = this.calculateSize(afterCriticalCss);

    // Simulation des métriques de performance
    return {
      beforeOptimization: {
        totalCssSize: beforeSize,
        blockingTime: beforeSize * 0.01, // ~1ms per KB
        firstPaint: 1200 + beforeSize * 0.01,
      },
      afterOptimization: {
        inlineCssSize: afterSize,
        deferredCssSize: beforeSize - afterSize,
        firstPaint: 800 + afterSize * 0.005,
        speedIndex: 1500,
      },
      improvement: {
        sizeReduction: ((beforeSize - afterSize) / beforeSize) * 100,
        fasterFirstPaint: 400,
        scoreImprovement: 15,
      },
    };
  }

  // Méthodes utilitaires privées
  private normalizeRoute(route: string): string {
    // Normaliser les routes dynamiques
    return route
      .replace(/\/[a-z]{2}\//, '/') // Retirer préfixe langue
      .replace(/\/[^/]+$/, '/[slug]'); // Remplacer segments dynamiques
  }

  private calculateSize(css: string): number {
    return new Blob([css]).size;
  }

  private calculateReduction(originalSize: number, optimizedCss: string): number {
    const newSize = this.calculateSize(optimizedCss);
    return ((originalSize - newSize) / originalSize) * 100;
  }
}

/**
 * Instance singleton
 */
export const criticalCssGenerator = new CriticalCssGenerator();

/**
 * Hook React pour Critical CSS
 */
export function useCriticalCss() {
  return {
    generateCriticalCss: (
      config: Parameters<typeof criticalCssGenerator.generateCriticalCss>[0]
    ) => criticalCssGenerator.generateCriticalCss(config),

    measurePerformance: (beforeCss: string, afterCriticalCss: string) =>
      criticalCssGenerator.measurePerformance(beforeCss, afterCriticalCss),
  };
}
