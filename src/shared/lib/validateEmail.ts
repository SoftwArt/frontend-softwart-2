// src/shared/lib/validateEmail.ts
// Espeja correoSchema (backend/src/schemas/auth.schemas.ts): vacío no se marca
// como error aquí (cada form ya controla el "required" con su propia regla),
// pero si se escribe algo debe tener forma de correo válida. El TLD final
// debe ser 2-24 letras (sin dígitos/símbolos) — atrapa typos obvios como
// "user@sitio.c" o "user@sitio.123", pero NO verifica que el dominio exista
// de verdad (eso requeriría una consulta DNS/MX real, con latencia y falsos
// rechazos que no valen la pena para un simple formulario de registro).
export const EMAIL_ERROR = 'Correo no válido.'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,24}$/

export function isEmailValid(correo: string): boolean {
  return correo === '' || EMAIL_REGEX.test(correo)
}
