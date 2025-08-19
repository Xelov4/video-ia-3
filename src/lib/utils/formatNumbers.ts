/**
 * Utilities for consistent number formatting across client and server
 */

/**
 * Formats a number with consistent locale formatting for both client and server
 * Uses French locale (fr-FR) to match the application language
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formats large numbers with abbreviated suffixes (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Formats currency values
 */
export function formatCurrency(num: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(num);
}

/**
 * Formats percentages
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
}
