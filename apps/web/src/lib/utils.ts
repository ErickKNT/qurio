import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina condicionalmente clases CSS de Tailwind evitando colisiones de especificidad.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
