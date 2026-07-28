// src/shared/lib/formatCurrency.ts
/**
 * Formatea un número como moneda COP sin decimales.
 * Ej: 50268 → "$ 50.268"
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  const n = Number(value ?? 0)
  if (isNaN(n)) return '$ 0'
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Formatea un número como moneda COP con los decimales que traiga el valor
 * (a diferencia de formatCurrency, que siempre trunca a 0 decimales) — para
 * precios que sí pueden traer centavos (ej. detalle_venta.precio).
 * Ej: 50268.5 → "$ 50.268,50"
 */
export const fmtCOP = (v: number) => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })