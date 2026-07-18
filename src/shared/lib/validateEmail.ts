// src/shared/lib/validateEmail.ts
// Espeja z.string().email() (backend/src/schemas/auth.schemas.ts): vacío no
// se marca como error aquí (cada form ya controla el "required" con su propia
// regla), pero si se escribe algo debe tener forma de correo válida.
export const EMAIL_ERROR = 'Correo no válido.'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmailValid(correo: string): boolean {
  return correo === '' || EMAIL_REGEX.test(correo)
}
