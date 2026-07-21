// src/shared/lib/tokenRefresh.ts
// Fuente única para renovar la sesión (sliding expiration) — usada tanto por
// el interceptor de 401 de apiClient.ts como por el scheduler proactivo de
// useSessionKeepAlive.ts, así ambos comparten la misma llamada en vuelo y no
// disparan dos refresh simultáneos dentro de la misma pestaña.
import { getRefreshToken, getAuthStorage } from '@/src/features/auth/utils'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

let refreshInFlight: Promise<boolean> | null = null

export function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = doRefresh().finally(() => { refreshInFlight = null })
  return refreshInFlight
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    // fetch crudo, deliberadamente sin pasar por apiRequest — si usara
    // apiClient, un 401 de esta misma llamada re-entraría en su propio
    // interceptor y produciría un loop infinito.
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false

    const body = await res.json()
    const storage = getAuthStorage()
    storage.setItem('token', body.token)
    storage.setItem('refreshToken', body.refreshToken)
    return true
  } catch {
    return false
  }
}
