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

// Compara una query de búsqueda contra un monto, sin importar si el usuario
// escribe separadores de miles ("150.268"), comas ("150,268") o el número
// pelado ("150268") — mismo problema que ya se corrigió para fechas
// (ver matchesFecha en shared/lib/formatDate.ts), aplicado a dinero: el dato
// crudo de una columna `decimal` de Postgres llega como string sin separar
// ("150268.00"), pero el usuario busca lo que ve en pantalla (con puntos).
// Un query sin dígitos (el usuario está buscando otro campo en la misma
// cadena de ||) no puede describir un monto, así que devuelve false y no
// aporta falsos positivos — a diferencia de matchesFecha, acá "" no es "sin filtro".
export function matchesMonto(monto: number | string | null | undefined, query: string): boolean {
  const qDigits = query.replace(/\D/g, '')
  if (!qDigits) return false
  if (monto == null) return false
  const valor = Math.round(Number(monto))
  if (isNaN(valor)) return false
  return String(valor).includes(qDigits)
}