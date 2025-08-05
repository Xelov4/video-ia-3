/**
 * Database Client Configuration
 * 
 * Singleton Prisma client instance with optimized configuration for
 * production use. Handles connection pooling, query optimization,
 * and error handling.
 * 
 * Features:
 * - Connection pooling for performance
 * - Query logging in development
 * - Error handling and monitoring
 * - Type-safe database operations
 * 
 * @author Video-IA.net Development Team
 */

import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple instances in development
  var prisma: PrismaClient | undefined
}

/**
 * Prisma Client Configuration
 * 
 * Optimized for both development and production environments.
 * Includes query logging, error handling, and connection management.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })
}

// Singleton pattern to prevent multiple instances
const prisma = globalThis.prisma ?? prismaClientSingleton()

// Set global instance in development
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

/**
 * Database connection health check
 * 
 * Verifies database connectivity and returns connection status.
 * Used for application health monitoring and debugging.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  error?: string
  stats?: {
    toolCount: number
    categoryCount: number
    tagCount: number
  }
}> {
  try {
    // Get basic statistics (this also tests connectivity)
    const [toolCount, categoryCount, tagCount] = await Promise.all([
      prisma.tool.count(),
      prisma.category.count(), 
      prisma.tag.count()
    ])

    return {
      connected: true,
      stats: {
        toolCount,
        categoryCount,
        tagCount
      }
    }
  } catch (error) {
    console.error('Database connection failed:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Graceful shutdown handler
 * 
 * Properly closes database connections when the application shuts down.
 * Prevents connection leaks and ensures clean termination.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

// Handle process termination
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await disconnectDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

export { prisma }
export default prisma