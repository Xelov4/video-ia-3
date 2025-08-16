/**
 * Grid Component - Design System
 * 
 * Système de grille flexible et responsive
 */

import React from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12  
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
  children: React.ReactNode
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2', 
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
  auto: 'grid-cols-auto'
}

const gridResponsive = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3', 
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4', 
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5', 
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6', 
    12: 'xl:grid-cols-12'
  }
}

const gridGaps = {
  none: 'gap-0',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8', 
  xl: 'gap-12'
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    cols = 1,
    gap = 'md',
    responsive,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base grid
          'grid',
          
          // Columns
          gridCols[cols],
          
          // Gap
          gridGaps[gap],
          
          // Responsive columns
          responsive?.sm && gridResponsive.sm[responsive.sm],
          responsive?.md && gridResponsive.md[responsive.md],
          responsive?.lg && gridResponsive.lg[responsive.lg], 
          responsive?.xl && gridResponsive.xl[responsive.xl],
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'