/**
 * Admin Authentication Middleware
 * 
 * Protects admin routes and ensures proper authentication
 * for administrative features.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_PROTECTED_ROUTES = [
  '/admin/tools',
  '/admin/categories', 
  '/admin/users',
  '/admin/settings',
  '/admin/scraper',
]

const PUBLIC_ADMIN_ROUTES = [
  '/admin/login',
]

/**
 * Check if the user has admin privileges
 */
function hasAdminAccess(token: any): boolean {
  return token && (
    token.role === 'admin' || 
    token.role === 'super_admin' || 
    token.role === 'moderator'
  )
}

/**
 * Admin authentication middleware
 */
export async function adminAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip non-admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow public admin routes (login page)
  if (PUBLIC_ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For all other admin routes, check authentication
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin privileges
    if (!hasAdminAccess(token)) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'insufficient_privileges')
      return NextResponse.redirect(loginUrl)
    }

    // Allow access to /admin root (it's the main dashboard)
    // No redirection needed as /admin is the main dashboard page

    // Add user info to headers for downstream components
    const response = NextResponse.next()
    response.headers.set('x-admin-user-id', token.sub || '')
    response.headers.set('x-admin-user-role', token.role as string || '')
    response.headers.set('x-admin-user-email', token.email || '')
    
    return response

  } catch (error) {
    console.error('Admin middleware error:', error)
    
    // On error, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}