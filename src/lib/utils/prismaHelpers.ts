/**
 * Helper functions for working with Prisma data
 * 
 * Utilities for handling Prisma-specific data types and formatting
 */

import { Prisma } from '@prisma/client'

/**
 * Convertit un objet Prisma contenant des Decimal en objet JavaScript simple
 * pour résoudre le problème de sérialisation entre Server et Client components
 */
export function serializePrismaObject<T>(obj: T): T {
  if (!obj) return obj
  
  // Si c'est un tableau, on traite chaque élément
  if (Array.isArray(obj)) {
    return obj.map(item => serializePrismaObject(item)) as unknown as T
  }

  // Si c'est un objet, on parcourt ses propriétés
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // Cas spécial pour les objets Decimal
      if (value instanceof Prisma.Decimal) {
        result[key] = value.toNumber()
      } 
      // Cas spécial pour les dates
      else if (value instanceof Date) {
        result[key] = value.toISOString()
      } 
      // Récursivité pour les objets imbriqués
      else if (value !== null && typeof value === 'object') {
        result[key] = serializePrismaObject(value)
      } 
      // Valeur simple
      else {
        result[key] = value
      }
    }
    
    return result as T
  }
  
  // Valeur non-objet (primitive)
  return obj
}

/**
 * Fonction utilitaire pour paginer les résultats
 */
export function createPagination(
  page: number,
  limit: number,
  totalCount: number
) {
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}
