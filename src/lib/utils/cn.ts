/**
 * Class Name Utility
 *
 * Utility pour merger les classes CSS de manière conditionnelle
 * Compatible avec Tailwind CSS et clsx
 */

import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
