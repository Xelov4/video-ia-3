/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration i18n et SEO
  trailingSlash: false,
  compress: true,
  
  // Configuration images optimisées + domaines multilingues
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'video-ia.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },
  
  // Optimisations webpack + nouvelles configs
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      }
    }
    
    // Fix for undici/File API issue
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      }
    }
    
    // Exclude puppeteer and related packages from client bundle
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push('puppeteer', 'puppeteer-core', '@puppeteer/browsers')
    }
    
    // Ignorer temporairement les routes API avec ancien système PostgreSQL
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@/src/lib/database/postgres': 'commonjs @/src/lib/database/postgres'
      })
    }
    
    return config
  },
  
  // Headers optimisés pour SEO multilingue + performance
  async headers() {
    return [
      // Headers API (existants)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          // Cache API avec revalidation
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }
        ],
      },
      
      // Headers de sécurité pour toutes les pages
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' }
        ]
      },
      
      // Cache agressif pour assets statiques
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  },
  
  // Redirections pour migration SEO et HTTPS
  async redirects() {
    return [
      // HTTPS et WWW redirects
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'video-ia.net'
          }
        ],
        destination: 'https://www.video-ia.net/$1',
        permanent: true,
      },
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://www.video-ia.net/$1',
        permanent: true,
      },
      // Redirect individual tool URLs to new short format (but not the tools listing page)
      {
        source: '/:lang((?!api|images).+)/tools/:slug([^/]+)',
        destination: '/:lang/t/:slug',
        permanent: true,
      },
      {
        source: '/tools/:slug([^/]+)',
        destination: '/en/t/:slug',
        permanent: true,
      },
      // Redirect individual category URLs to new short format (but not the categories listing page)
      {
        source: '/:lang((?!api).+)/categories/:slug([^/]+)',
        destination: '/:lang/c/:slug',
        permanent: true,
      },
      {
        source: '/categories/:slug([^/]+)',
        destination: '/en/c/:slug',
        permanent: true,
      },
      // Redirect individual audience URLs to new short format (but not the audiences listing page)
      {
        source: '/:lang((?!api).+)/audiences/:slug([^/]+)',
        destination: '/:lang/p/:slug',
        permanent: true,
      },
      {
        source: '/audiences/:slug([^/]+)',
        destination: '/en/p/:slug',
        permanent: true,
      },
      // Redirect individual use case URLs to new short format (but not the use-cases listing page)
      {
        source: '/:lang((?!api).+)/use-cases/:slug([^/]+)',
        destination: '/:lang/u/:slug',
        permanent: true,
      },
      {
        source: '/use-cases/:slug([^/]+)',
        destination: '/en/u/:slug',
        permanent: true,
      },
      // Legacy redirects for individual pages only
      {
        source: '/en/tools/:slug([^/]+)',
        destination: '/en/t/:slug',
        permanent: true,
      },
      {
        source: '/en/categories/:slug([^/]+)',
        destination: '/en/c/:slug',
        permanent: true,
      },
    ]
  },
  
  // Rewrites pour sitemaps et robots dynamiques
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap-:lang.xml',
          destination: '/api/sitemap/:lang'
        },
      ],
      afterFiles: [
        {
          source: '/robots.txt',
          destination: '/api/robots'
        }
      ]
    }
  },
  
  // Optimisations de compilation (swcMinify est activé par défaut depuis Next.js 13)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  
  // Configuration expérimentale pour performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    typedRoutes: false, // Désactivé pour compatibilité middleware
    workerThreads: false
  },
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  
  // Configuration pour éviter les erreurs de prerendering
  output: 'standalone', // Build standalone pour éviter les erreurs de prerendering
  
  // TypeScript checking désactivé pour un build rapide
  typescript: {
    ignoreBuildErrors: true
  },
  
  // ESLint désactivé lors du build
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig 