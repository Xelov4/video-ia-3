/**
 * Combined Middleware pour Video-IA.net
 * Gère l'authentification admin ET le routing multilingue
 */

import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Configuration i18n
export const SUPPORTED_LOCALES = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'] as const
export const DEFAULT_LOCALE = 'en' as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// Routes protégées qui ne doivent pas être préfixées par la langue
const PROTECTED_ROUTES = [
  '/api',
  '/admin',
  '/favicon',
  '/_next',
  '/images',
  '/robots.txt',
  '/sitemap',
  '/manifest',
  '/.well-known'
]

/**
 * Détection langue simple mais efficace
 */
function detectLanguage(request: NextRequest): SupportedLocale {
  // 1. Langue dans URL
  const urlLang = extractLanguageFromUrl(request.nextUrl.pathname)
  if (urlLang) return urlLang
  
  // 2. Cookie utilisateur
  const cookieLang = request.cookies.get('preferred-language')?.value
  if (cookieLang && SUPPORTED_LOCALES.includes(cookieLang as SupportedLocale)) {
    return cookieLang as SupportedLocale
  }
  
  // 3. Accept-Language (simple)
  const acceptLanguage = request.headers.get('accept-language') || ''
  for (const locale of SUPPORTED_LOCALES) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      return locale
    }
  }
  
  return DEFAULT_LOCALE
}

function extractLanguageFromUrl(pathname: string): SupportedLocale | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  return SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale) 
    ? firstSegment as SupportedLocale 
    : null
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function buildLocalizedUrl(url: URL, locale: SupportedLocale): URL {
  const newUrl = new URL(url)
  const segments = newUrl.pathname.split('/').filter(Boolean)
  
  // Supprimer langue existante
  if (SUPPORTED_LOCALES.includes(segments[0] as SupportedLocale)) {
    segments.shift()
  }
  
  // Ajouter nouvelle langue (sauf pour langue par défaut)
  if (locale !== DEFAULT_LOCALE) {
    newUrl.pathname = `/${locale}/${segments.join('/')}`
  } else {
    newUrl.pathname = `/${segments.join('/')}`
  }
  
  return newUrl
}

/**
 * Middleware i18n (pour routes publiques)
 */
function handleI18nRouting(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Bypass pour routes protégées
  if (isProtectedRoute(pathname)) {
    return null // Continue vers middleware suivant
  }
  
  const currentLang = extractLanguageFromUrl(pathname)
  const preferredLang = detectLanguage(request)
  
  // Si pas de langue dans URL, rediriger avec langue détectée
  if (!currentLang) {
    const redirectUrl = buildLocalizedUrl(request.nextUrl, preferredLang)
    const response = NextResponse.redirect(redirectUrl, 302)
    
    // Set cookie préférence
    response.cookies.set('preferred-language', preferredLang, {
      maxAge: 365 * 24 * 60 * 60, // 1 an
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
  
  // Headers pour debugging
  const response = NextResponse.next()
  response.headers.set('x-current-locale', currentLang)
  response.headers.set('x-preferred-locale', preferredLang)
  
  return response
}

/**
 * Middleware combiné avec gestion d'ordre
 */
export default withAuth(
  function middleware(req) {
    // 1. D'abord traiter l'i18n pour routes publiques
    const i18nResponse = handleI18nRouting(req)
    if (i18nResponse && i18nResponse.status !== 200) {
      return i18nResponse // Redirection i18n
    }
    
    // 2. Ensuite traiter l'auth pour routes admin
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Allow access to login page
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next()
      }

      // Check if user is authenticated
      if (!req.nextauth.token) {
        const loginUrl = new URL('/admin/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check user role for admin access
      const userRole = req.nextauth.token.role as string
      const allowedRoles = ['super_admin', 'admin', 'editor']
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }

    // 3. Retourner réponse avec headers i18n si applicable
    return i18nResponse || NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes (géré par i18n)
        if (!req.nextUrl.pathname.startsWith('/admin')) {
          return true
        }
        
        // Allow access to login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        
        // Require authentication for admin routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api routes (/api)
     * - _next/static (static files) 
     * - _next/image (image optimization)
     * - favicon.ico et autres assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots|manifest|images|.*\\.[^/]+$).*)',
  ]
}

// Export pour usage dans l'app
export { 
  SUPPORTED_LOCALES as supportedLocales,
  DEFAULT_LOCALE as defaultLocale,
  type SupportedLocale
}