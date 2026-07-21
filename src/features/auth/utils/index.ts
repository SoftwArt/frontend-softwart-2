import type { AuthData } from '../types'

export function saveAuth(data: AuthData, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('token',        data.token)
  storage.setItem('refreshToken', data.refreshToken)
  storage.setItem('rol',          data.rol)
  storage.setItem('id_usuario',   String(data.id_usuario))
  storage.setItem('correo',       data.correo)
  if (data.id_cliente != null)
    storage.setItem('id_cliente', String(data.id_cliente))
}

export function clearAuth(): void {
  ;['token', 'refreshToken', 'rol', 'id_usuario', 'correo', 'id_cliente'].forEach(k => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

const CRED_KEY = 'saved_creds'

export function saveCredentials(correo: string, password: string): void {
  localStorage.setItem(CRED_KEY, JSON.stringify({ correo, p: btoa(password) }))
}

export function clearCredentials(): void {
  localStorage.removeItem(CRED_KEY)
}

export function getSavedCredentials(): { correo: string; password: string } | null {
  try {
    const raw = localStorage.getItem(CRED_KEY)
    if (!raw) return null
    const { correo, p } = JSON.parse(raw)
    return { correo, password: atob(p) }
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token') ?? sessionStorage.getItem('token')
}

export function getAuthRol(): string | null {
  return localStorage.getItem('rol') ?? sessionStorage.getItem('rol')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken') ?? sessionStorage.getItem('refreshToken')
}

// Devuelve el storage ("recordarme" u no) donde vive la sesión actual, para
// que la rotación silenciosa del refresh token escriba el par nuevo en el
// mismo lugar sin tener que conocer el estado del checkbox en ese punto.
export function getAuthStorage(): Storage {
  return localStorage.getItem('token') ? localStorage : sessionStorage
}

// BASE_URL propio, deliberadamente no importado de apiClient — evita un
// ciclo de imports (apiClient necesita clearAuth de este archivo para su
// interceptor de 401).
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// Cierra sesión: intenta invalidar el refresh token del lado del servidor
// (nunca bloquea el logout si la red falla) y siempre limpia el storage local.
// Fuente única — la usan tanto AdminLayout como el portal cliente.
export async function performLogout(): Promise<void> {
  const token = getAuthToken()
  if (token) {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* red caída — igual limpiamos localmente */ }
  }
  clearAuth()
}
