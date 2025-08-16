/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration i18n et SEO
  trailingSlash: false,
  compress: true,
  
  // Configuration images optimisées + domaines multilingues
  images: {
    domains: [
      'localhost',
      'video-ia.net',
      'images.unsplash.com',
      'via.placeholder.com',
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
  
  // Redirections pour migration SEO
  async redirects() {
    return [
      // Anciennes URLs vers nouvelles URLs multilingues
      {
        source: '/tool/:slug*',
        destination: '/en/tools/:slug*',
        permanent: true
      },
      {
        source: '/category/:slug*', 
        destination: '/en/categories/:slug*',
        permanent: true
      },
      // Rediriger les routes API problématiques vers une page d'erreur
      {
        source: '/api/tools/:id/translations/:path*',
        destination: '/api/error/legacy-system',
        permanent: false,
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
        }
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
    typedRoutes: false // Désactivé pour compatibilité middleware
  },
  
  // Configuration pour éviter les erreurs de prerendering
  // output: 'standalone', // Disabled for now
  
  // TypeScript checking activé pour un build propre
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig 