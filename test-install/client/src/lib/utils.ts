import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'USD' | 'IQD' = 'USD'): string {
  const formatter = new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    notation: value > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(value);
}