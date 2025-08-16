/**
 * Middleware pour Video-IA.net
 * Gère le routing multilingue pour les routes publiques
 * et l'authentification admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from './src/lib/auth/adminMiddleware'

// Import des types et constantes i18n centralisés
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './src/lib/i18n/types'
import type { SupportedLanguage } from './src/lib/i18n/types'

// Exports pour la compatibilité avec le reste du code
export const supportedLocales = SUPPORTED_LANGUAGES
export const defaultLocale = DEFAULT_LANGUAGE
export type SupportedLocale = SupportedLanguage

// Exports de compatibilité additionnels
export const SUPPORTED_LOCALES = supportedLocales
export const DEFAULT_LOCALE = defaultLocale

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
  if (cookieLang && supportedLocales.includes(cookieLang as SupportedLocale)) {
    return cookieLang as SupportedLocale
  }
  
  // 3. Accept-Language (simple)
  const acceptLanguage = request.headers.get('accept-language') || ''
  for (const locale of supportedLocales) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      return locale
    }
  }
  
  return defaultLocale
}

function extractLanguageFromUrl(pathname: string): SupportedLocale | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  return supportedLocales.includes(firstSegment as SupportedLocale) 
    ? firstSegment as SupportedLocale 
    : null
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function buildLocalizedUrl(url: URL, locale: SupportedLocale): URL {
  const newUrl = new URL(url)
  const segments = newUrl.pathname.split('/').filter(Boolean)
  
  // Supprimer langue existante si présente
  if (supportedLocales.includes(segments[0] as SupportedLocale)) {
    segments.shift()
  }
  
  // Construire le nouveau pathname - toujours avec préfixe de langue
  newUrl.pathname = `/${locale}${segments.length > 0 ? `/${segments.join('/')}` : ''}`
  
  return newUrl
}

/**
 * Main middleware combining i18n and admin authentication
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle admin routes first (authentication)
  if (pathname.startsWith('/admin')) {
    return await adminAuthMiddleware(request)
  }
  
  // Bypass pour autres routes protégées (API, assets, etc.)
  if (isProtectedRoute(pathname)) {
    return NextResponse.next()
  }
  
  const currentLang = extractLanguageFromUrl(pathname)
  const preferredLang = detectLanguage(request)
  
  // Si pas de langue dans URL, rediriger avec langue détectée
  if (!currentLang) {
    // Pour la racine, toujours rediriger vers une langue spécifique
    if (pathname === '/') {
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
    
    // Pour les autres routes sans langue, rediriger
    const redirectUrl = buildLocalizedUrl(request.nextUrl, preferredLang)
    
    // Éviter la boucle : vérifier que l'URL de redirection est différente
    if (redirectUrl.pathname === pathname) {
      console.warn('Potential redirect loop detected, skipping redirect')
      const response = NextResponse.next()
      response.headers.set('x-current-locale', preferredLang)
      response.headers.set('x-preferred-locale', preferredLang)
      return response
    }
    
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
  
  // Si la langue est déjà dans l'URL, pas de redirection nécessaire
  // Headers pour debugging
  const response = NextResponse.next()
  response.headers.set('x-current-locale', currentLang)
  response.headers.set('x-preferred-locale', preferredLang)
  
  return response
}

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

