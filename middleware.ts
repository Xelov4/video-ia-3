/**
 * Middleware for NextAuth.js
 * Protects admin routes and handles authentication
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and public routes
        if (req.nextUrl.pathname === '/admin/login' || !req.nextUrl.pathname.startsWith('/admin')) {
          return true
        }
        
        // Require authentication for admin routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}