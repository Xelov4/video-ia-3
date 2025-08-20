/**
 * Admin Login Page
 * Authentication interface for admin users
 */

'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { LoginContent } from './LoginContent'

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

export default LoginPage