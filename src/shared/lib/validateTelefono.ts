// src/shared/lib/validateTelefono.ts
// Espeja telefonoSchema (backend/src/schemas/auth.schemas.ts): vacío es válido
// (el campo sigue siendo opcional en los formularios que lo usan), pero si se
// escribe algo debe ser exactamente 10 dígitos y empezar en 3 (celular
// colombiano — el número se usa para contacto directo/WhatsApp con el cliente).
export const TELEFONO_ERROR = 'El teléfono debe tener 10 dígitos y empezar en 3 (celular).'
export const TELEFONO_MAX_LENGTH = 10

export function isTelefonoValid(telefono: string): boolean {
  return telefono === '' || /^3\d{9}$/.test(telefono)
}

// Filtra todo lo que no sea 0-9 del valor tecleado — se usa en el onChange de
// los inputs de teléfono para que sea imposible escribir letras/símbolos, en
// vez de solo marcarlo como error después de intentar guardar.
export function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '')
}
