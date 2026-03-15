// src/shared/lib/formatCOP.ts
/**
 * Formatea un número como moneda COP sin decimales.
 * Ej: 50268 → "$ 50.268"
 */
export const formatCOP = (value: number | string | undefined | null): string => {
  const n = Number(value ?? 0)
  if (isNaN(n)) return '$ 0'
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}