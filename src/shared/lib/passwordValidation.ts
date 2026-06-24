// ================================================================
// src/shared/lib/passwordValidation.ts
//
// Política de contraseña compartida (registro, reset y cambio de
// clave). Espeja exactamente el `claveSchema` de Zod del backend
// (backend-softwart-mvc/src/schemas/auth.schemas.ts).
// ================================================================

export interface PasswordCheck {
  label: string
  ok: boolean
}

export interface PasswordValidation {
  valid: boolean
  checks: PasswordCheck[]
  firstError: string | null
}

export function validatePassword(password: string): PasswordValidation {
  const checks: PasswordCheck[] = [
    { label: 'Al menos 8 caracteres',     ok: password.length >= 8 },
    { label: 'Una letra mayúscula',       ok: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula',       ok: /[a-z]/.test(password) },
    { label: 'Un número',                 ok: /[0-9]/.test(password) },
    { label: 'Un carácter especial',      ok: /[^A-Za-z0-9]/.test(password) },
  ]

  const tooLong = password.length > 64
  const valid = checks.every(c => c.ok) && !tooLong

  let firstError: string | null = null
  if (tooLong) {
    firstError = 'La contraseña no puede superar los 64 caracteres'
  } else {
    const failed = checks.find(c => !c.ok)
    if (failed) firstError = `La contraseña debe incluir: ${failed.label.toLowerCase()}`
  }

  return { valid, checks, firstError }
}
