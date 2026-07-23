// src/shared/lib/validateNombre.ts
// Espeja nombreSchema (backend/src/schemas/auth.schemas.ts): mínimo 5
// caracteres, sin dígitos.
export const NOMBRE_MIN_ERROR     = 'El nombre debe tener al menos 5 caracteres.'
export const NOMBRE_NUMEROS_ERROR = 'El nombre no puede contener números.'

export function isNombreLongitudValida(nombre: string): boolean {
  return nombre.trim().length >= 5
}

// Filtra los dígitos 0-9 del valor tecleado — se usa en el onChange de los
// inputs "Nombre completo" para que sea imposible escribir un número, en vez
// de solo marcarlo como error después de intentar guardar.
export function stripDigits(value: string): string {
  return value.replace(/[0-9]/g, '')
}
