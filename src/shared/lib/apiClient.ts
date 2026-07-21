// src/shared/lib/apiClient.ts
// CAMBIO: lee token de localStorage (recordarme) o sessionStorage (sesión temporal)
import { clearAuth } from '@/src/features/auth/utils'
import { refreshAccessToken } from './tokenRefresh'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function getToken(): string | null {
  return localStorage.getItem('token') ?? sessionStorage.getItem('token')
}

// Rutas públicas de auth — nunca requieren un access token válido, así que un
// 401 ahí es un error de negocio normal ("credenciales inválidas", etc.), no
// una sesión expirada. Intentar refrescar+reintentar acá sería incorrecto:
// podría desloguear a alguien que solo escribió mal su clave en /login
// mientras tenía otra sesión válida abierta en otra pestaña.
const PUBLIC_AUTH_ENDPOINTS = [
  '/api/auth/login', '/api/auth/register', '/api/auth/register-guest',
  '/api/auth/recover', '/api/auth/reset-password', '/api/auth/reenviar-codigo',
  '/api/auth/guest-appointment', '/api/auth/validate-reset-token', '/api/auth/refresh',
]

// Se lanza cuando un 401 no pudo resolverse ni con refresh — señal para que
// el nivel de ruta redirija a /login (la sesión ya no es válida).
export class SessionExpiredError extends Error {
  constructor() { super('Sesión expirada') }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const esPublicaDeAuth = PUBLIC_AUTH_ENDPOINTS.some(p => endpoint.startsWith(p))
  if (res.status === 401 && !_isRetry && !esPublicaDeAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiRequest<T>(endpoint, options, true)
    clearAuth()
    throw new SessionExpiredError()
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Error ${res.status}`)
  }

  return res.json() as Promise<T>
}
