// src/shared/lib/checkAuth.ts
// Verifica si el token guardado está expirado antes de usarlo
// Se llama en App.tsx al montar, antes de que los guards evalúen

import { clearAuth } from '@/src/features/auth/hooks/useLogin'

function getToken(): string | null {
  return localStorage.getItem('token') ?? sessionStorage.getItem('token')
}

function decodeJwtExp(token: string): number | null {
  try {
    // JWT = header.payload.signature — solo necesitamos el payload
    const payload = token.split('.')[1]
    if (!payload) return null
    // Base64url → Base64 normal → decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json    = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    const parsed = JSON.parse(json)
    return typeof parsed.exp === 'number' ? parsed.exp : null
  } catch {
    return null
  }
}

/**
 * Verifica si el token existe y no ha expirado.
 * Si expiró → limpia el storage y retorna false.
 * Llamar una vez al iniciar la app (en App.tsx).
 */
export function checkAuthValidity(): boolean {
  const token = getToken()
  if (!token) return false

  const exp = decodeJwtExp(token)
  if (exp === null) {
    // Token malformado — limpiar por seguridad
    clearAuth()
    return false
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (exp < nowSeconds) {
    // Token expirado
    clearAuth()
    return false
  }

  return true
}