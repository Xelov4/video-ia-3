/**
 * Card Component - Design System
 * 
 * Composant carte moderne avec variantes et animations
 */

import React from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  children: React.ReactNode
}

const cardVariants = {
  default: `
    bg-white border border-gray-200
    shadow-sm
  `,
  elevated: `
    bg-white border border-gray-200
    shadow-md hover:shadow-lg
  `,
  outlined: `
    bg-white border-2 border-gray-300
    shadow-none hover:border-gray-400
  `,
  glass: `
    bg-white/80 backdrop-blur-sm border border-white/20
    shadow-glass hover:shadow-glassHover
  `
}

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
  xl: 'p-10'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default',
    padding = 'md',
    hover = false,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl transition-all duration-200',
          
          // Variant styles
          cardVariants[variant],
          
          // Padding
          cardPadding[padding],
          
          // Hover effects
          hover && 'hover:scale-105 cursor-pointer',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
)

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900 mb-2', className)}
      {...props}
    />
  )
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600', className)}
      {...props}
    />
  )
)

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  )
)

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-gray-200', className)}
      {...props}
    />
  )
)