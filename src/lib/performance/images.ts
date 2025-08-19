/**
 * Système d'Optimisation d'Images Avancé - Video-IA.net
 *
 * Optimisation d'images multilingue et multi-format :
 * - WebP/AVIF avec fallbacks intelligents
 * - Responsive images par device
 * - Lazy loading avec intersection observer
 * - Compression et redimensionnement automatique
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour l'optimisation d'images
export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface OptimizedImage extends ImageConfig {
  webp?: string;
  avif?: string;
  fallback: string;
  responsive: ResponsiveImage[];
  metadata: ImageMetadata;
}

export interface ResponsiveImage {
  src: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpg' | 'png';
  descriptor: string; // e.g., "1x", "2x", "768w"
}

export interface ImageMetadata {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
  hasTransparency: boolean;
  colorProfile: string;
  generatedAt: Date;
}

export interface LazyLoadingConfig {
  rootMargin: string;
  threshold: number;
  placeholderType: 'blur' | 'skeleton' | 'gradient';
  fadeInDuration: number;
  retryAttempts: number;
}

/**
 * Gestionnaire d'optimisation d'images
 */
export class ImageOptimizer {
  private supportedFormats: string[];
  private deviceSizes: number[];
  private imageSizes: number[];
  private lazyLoadingConfig: LazyLoadingConfig;

  constructor() {
    this.supportedFormats = ['image/avif', 'image/webp', 'image/jpeg', 'image/png'];
    this.deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    this.imageSizes = [16, 32, 48, 64, 96, 128, 256, 384];

    this.lazyLoadingConfig = {
      rootMargin: '50px',
      threshold: 0.1,
      placeholderType: 'blur',
      fadeInDuration: 300,
      retryAttempts: 3,
    };
  }

  /**
   * Optimiser une image avec formats multiples
   */
  optimizeImage(config: ImageConfig): OptimizedImage {
    const { src, alt, width, height, quality = 75, sizes, priority = false } = config;

    // Générer les URLs optimisées
    const baseParams = new URLSearchParams({
      w: width?.toString() || 'auto',
      h: height?.toString() || 'auto',
      q: quality.toString(),
      f: 'auto',
    });

    const optimized: OptimizedImage = {
      ...config,
      fallback: this.generateOptimizedUrl(src, { format: 'jpg', quality }),
      webp: this.generateOptimizedUrl(src, { format: 'webp', quality }),
      avif: this.generateOptimizedUrl(src, { format: 'avif', quality }),
      responsive: this.generateResponsiveImages(src, { width, height, quality }),
      metadata: this.generateMetadata(src, { width, height, quality }),
    };

    return optimized;
  }

  /**
   * Générer images responsive
   */
  private generateResponsiveImages(
    src: string,
    options: { width?: number; height?: number; quality?: number }
  ): ResponsiveImage[] {
    const { width, height, quality = 75 } = options;
    const images: ResponsiveImage[] = [];

    // Générer pour différentes tailles d'écran
    const relevantSizes = this.deviceSizes.filter(
      size => !width || size <= width * 2 // Éviter les images trop grandes
    );

    relevantSizes.forEach(deviceWidth => {
      const aspectRatio = width && height ? height / width : 1;
      const targetHeight = Math.round(deviceWidth * aspectRatio);

      // Format AVIF (meilleure compression)
      images.push({
        src: this.generateOptimizedUrl(src, {
          format: 'avif',
          width: deviceWidth,
          height: targetHeight,
          quality,
        }),
        width: deviceWidth,
        height: targetHeight,
        format: 'avif',
        descriptor: `${deviceWidth}w`,
      });

      // Format WebP (fallback)
      images.push({
        src: this.generateOptimizedUrl(src, {
          format: 'webp',
          width: deviceWidth,
          height: targetHeight,
          quality,
        }),
        width: deviceWidth,
        height: targetHeight,
        format: 'webp',
        descriptor: `${deviceWidth}w`,
      });

      // Format JPEG (fallback ultime)
      images.push({
        src: this.generateOptimizedUrl(src, {
          format: 'jpg',
          width: deviceWidth,
          height: targetHeight,
          quality,
        }),
        width: deviceWidth,
        height: targetHeight,
        format: 'jpg',
        descriptor: `${deviceWidth}w`,
      });
    });

    // Retina versions (2x)
    if (width && height && width <= 1920) {
      images.push({
        src: this.generateOptimizedUrl(src, {
          format: 'webp',
          width: width * 2,
          height: height * 2,
          quality: Math.max(60, quality - 15), // Réduire qualité pour 2x
        }),
        width: width * 2,
        height: height * 2,
        format: 'webp',
        descriptor: '2x',
      });
    }

    return images;
  }

  /**
   * Générer URL d'image optimisée
   */
  private generateOptimizedUrl(
    src: string,
    params: {
      format?: 'avif' | 'webp' | 'jpg' | 'png';
      width?: number;
      height?: number;
      quality?: number;
    }
  ): string {
    const { format, width, height, quality = 75 } = params;

    // Si c'est déjà une URL externe, utiliser un proxy d'optimisation
    if (src.startsWith('http')) {
      return this.generateProxyUrl(src, params);
    }

    // Utiliser Next.js Image Optimization API
    const urlParams = new URLSearchParams();
    if (width) urlParams.append('w', width.toString());
    if (height) urlParams.append('h', height.toString());
    if (quality) urlParams.append('q', quality.toString());
    if (format) urlParams.append('f', format);

    return `/_next/image?url=${encodeURIComponent(src)}&${urlParams.toString()}`;
  }

  /**
   * Générer URL de proxy pour images externes
   */
  private generateProxyUrl(src: string, params: any): string {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlParams.append(key, value.toString());
      }
    });

    return `/api/image-proxy?url=${encodeURIComponent(src)}&${urlParams.toString()}`;
  }

  /**
   * Générer métadonnées d'image
   */
  private generateMetadata(
    src: string,
    options: { width?: number; height?: number; quality?: number }
  ): ImageMetadata {
    // Simulation des métadonnées (en production, analyser la vraie image)
    const { width = 800, height = 600, quality = 75 } = options;
    const estimatedOriginalSize = width * height * 3; // RGB
    const compressionRatio = (100 - quality) / 100;
    const optimizedSize = estimatedOriginalSize * (1 - compressionRatio * 0.8);

    return {
      originalSize: estimatedOriginalSize,
      optimizedSize,
      compressionRatio,
      format: this.detectImageFormat(src),
      dimensions: { width, height },
      hasTransparency: src.includes('.png') || src.includes('.gif'),
      colorProfile: 'sRGB',
      generatedAt: new Date(),
    };
  }

  /**
   * Créer composant Image optimisé
   */
  createOptimizedImageComponent(): string {
    return `
import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/src/hooks/useIntersectionObserver'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  sizes?: string
  className?: string
  placeholder?: 'blur' | 'skeleton' | 'gradient'
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  sizes,
  className = '',
  placeholder = 'blur',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  
  // Lazy loading avec intersection observer
  const { isIntersecting } = useIntersectionObserver(imgRef, {
    rootMargin: '50px',
    threshold: 0.1,
    triggerOnce: true,
    skip: priority
  })

  const shouldLoad = priority || isIntersecting

  useEffect(() => {
    if (!shouldLoad) return

    // Détecter le support des formats modernes
    const supportsWebP = () => {
      const canvas = document.createElement('canvas')
      return canvas.toDataURL('image/webp').indexOf('webp') !== -1
    }

    const supportsAVIF = () => {
      const canvas = document.createElement('canvas')
      return canvas.toDataURL('image/avif').indexOf('avif') !== -1
    }

    // Choisir le meilleur format
    let optimizedSrc = src
    if (supportsAVIF()) {
      optimizedSrc = generateOptimizedUrl(src, { format: 'avif', width, height, quality })
    } else if (supportsWebP()) {
      optimizedSrc = generateOptimizedUrl(src, { format: 'webp', width, height, quality })
    } else {
      optimizedSrc = generateOptimizedUrl(src, { format: 'jpg', width, height, quality })
    }

    setCurrentSrc(optimizedSrc)
  }, [shouldLoad, src, width, height, quality])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    // Fallback vers l'image originale
    setCurrentSrc(src)
    onError?.()
  }

  const generateSrcSet = () => {
    if (!currentSrc) return ''
    
    const srcSet = []
    
    // Générer différentes résolutions
    if (width) {
      ;[1, 1.5, 2].forEach(multiplier => {
        const scaledWidth = Math.round(width * multiplier)
        const scaledHeight = height ? Math.round(height * multiplier) : undefined
        const scaledSrc = generateOptimizedUrl(src, {
          format: currentSrc.includes('avif') ? 'avif' : currentSrc.includes('webp') ? 'webp' : 'jpg',
          width: scaledWidth,
          height: scaledHeight,
          quality: Math.max(50, quality - (multiplier - 1) * 10)
        })
        srcSet.push(\`\${scaledSrc} \${multiplier}x\`)
      })
    }
    
    return srcSet.join(', ')
  }

  const placeholderElement = () => {
    if (placeholder === 'blur') {
      return (
        <div
          className={\`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse \${className}\`}
          style={{ width, height }}
        />
      )
    }
    
    if (placeholder === 'skeleton') {
      return (
        <div
          className={\`absolute inset-0 bg-gray-200 animate-pulse rounded \${className}\`}
          style={{ width, height }}
        />
      )
    }
    
    if (placeholder === 'gradient') {
      return (
        <div
          className={\`absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse \${className}\`}
          style={{ width, height }}
        />
      )
    }
    
    return null
  }

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {!isLoaded && !hasError && placeholderElement()}
      
      {shouldLoad && (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={\`transition-opacity duration-300 \${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } \${className}\`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  )
}

function generateOptimizedUrl(src: string, params: any): string {
  // Logique d'optimisation URL (identique à la classe principale)
  return '/_next/image?url=' + encodeURIComponent(src) + '&' + new URLSearchParams(params).toString()
}
    `.trim();
  }

  /**
   * Générer API route pour proxy d'images
   */
  generateImageProxyApi(): string {
    return `
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'webp'
  const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined
  const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined
  const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : 75

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    // Validation sécurité
    const imageUrl = new URL(url)
    const allowedDomains = ['images.unsplash.com', 'cdn.example.com', 'assets.video-ia.net']
    
    if (!allowedDomains.some(domain => imageUrl.hostname.includes(domain))) {
      return new NextResponse('Domain not allowed', { status: 403 })
    }

    // Récupérer l'image
    const response = await fetch(url)
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const buffer = await response.arrayBuffer()
    let sharpImage = sharp(Buffer.from(buffer))

    // Appliquer les transformations
    if (width || height) {
      sharpImage = sharpImage.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    // Conversion de format
    let outputBuffer: Buffer
    let contentType: string

    switch (format) {
      case 'avif':
        outputBuffer = await sharpImage.avif({ quality }).toBuffer()
        contentType = 'image/avif'
        break
      case 'webp':
        outputBuffer = await sharpImage.webp({ quality }).toBuffer()
        contentType = 'image/webp'
        break
      case 'jpg':
      case 'jpeg':
        outputBuffer = await sharpImage.jpeg({ quality }).toBuffer()
        contentType = 'image/jpeg'
        break
      case 'png':
        outputBuffer = await sharpImage.png({ quality }).toBuffer()
        contentType = 'image/png'
        break
      default:
        outputBuffer = await sharpImage.webp({ quality }).toBuffer()
        contentType = 'image/webp'
    }

    // Headers de cache
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Content-Length', outputBuffer.length.toString())

    return new NextResponse(outputBuffer, { headers })

  } catch (error) {
    console.error('Image optimization error:', error)
    return new NextResponse('Image optimization failed', { status: 500 })
  }
}
    `.trim();
  }

  /**
   * Configuration Next.js pour les images
   */
  generateNextImageConfig(): any {
    return {
      images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: this.deviceSizes,
        imageSizes: this.imageSizes,
        minimumCacheTTL: 31536000, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        domains: ['images.unsplash.com', 'cdn.example.com', 'assets.video-ia.net'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**.video-ia.net',
          },
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
          },
        ],
        loader: 'default',
      },
    };
  }

  /**
   * Analyser les performances d'images
   */
  analyzeImagePerformance(): {
    summary: {
      totalImages: number;
      averageSize: number;
      formatDistribution: Record<string, number>;
      lazyLoadedPercentage: number;
    };
    issues: Array<{
      type: 'size' | 'format' | 'loading' | 'accessibility';
      severity: 'error' | 'warning' | 'info';
      message: string;
      recommendation: string;
    }>;
    recommendations: string[];
  } {
    // Simulation d'analyse (en production, analyser les vraies images)
    return {
      summary: {
        totalImages: 150,
        averageSize: 85, // KB
        formatDistribution: {
          avif: 45,
          webp: 75,
          jpg: 25,
          png: 5,
        },
        lazyLoadedPercentage: 85,
      },
      issues: [
        {
          type: 'size',
          severity: 'warning',
          message: '12 images are larger than 200KB',
          recommendation: 'Increase compression or reduce dimensions',
        },
        {
          type: 'accessibility',
          severity: 'error',
          message: '3 images missing alt text',
          recommendation: 'Add descriptive alt text for screen readers',
        },
      ],
      recommendations: [
        'Implement AVIF format for 20% better compression',
        'Add blur placeholders for better perceived performance',
        'Configure service worker for image caching strategy',
      ],
    };
  }

  // Méthodes utilitaires privées
  private detectImageFormat(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    const formatMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };
    return formatMap[extension || ''] || 'image/jpeg';
  }
}

/**
 * Instance singleton
 */
export const imageOptimizer = new ImageOptimizer();

/**
 * Hook React pour optimisation d'images
 */
export function useImageOptimization() {
  return {
    optimizeImage: (config: ImageConfig) => imageOptimizer.optimizeImage(config),

    analyzeImagePerformance: () => imageOptimizer.analyzeImagePerformance(),
  };
}
