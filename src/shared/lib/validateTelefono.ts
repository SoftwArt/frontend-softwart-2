// src/shared/lib/validateTelefono.ts
// Espeja telefonoSchema (backend/src/schemas/auth.schemas.ts): vacío es válido
// (el campo sigue siendo opcional en los formularios que lo usan), pero si se
// escribe algo debe ser 10-15 dígitos numéricos.
export const TELEFONO_ERROR = 'El teléfono debe tener al menos 10 dígitos numéricos.'

export function isTelefonoValid(telefono: string): boolean {
  return telefono === '' || /^\d{10,15}$/.test(telefono)
}

// Filtra todo lo que no sea 0-9 del valor tecleado — se usa en el onChange de
// los inputs de teléfono para que sea imposible escribir letras/símbolos, en
// vez de solo marcarlo como error después de intentar guardar.
export function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '')
}
