/**
 * Container Component - Design System
 * 
 * Conteneur principal pour le layout responsive
 */

import React from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

const containerSizes = {
  sm: 'max-w-3xl',      // ~768px
  md: 'max-w-5xl',      // ~1024px  
  lg: 'max-w-7xl',      // ~1280px
  xl: 'max-w-screen-2xl', // ~1536px
  full: 'max-w-none'     // No limit
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    size = 'lg',
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'mx-auto px-4 sm:px-6 lg:px-8',
          
          // Size constraints
          containerSizes[size],
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'