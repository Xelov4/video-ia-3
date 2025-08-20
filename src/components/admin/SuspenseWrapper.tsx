/**
 * Suspense Wrapper for useSearchParams in admin pages
 */

'use client'

import { Suspense, ReactNode } from 'react'

interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {children}
    </Suspense>
  )
}

export default SuspenseWrapper