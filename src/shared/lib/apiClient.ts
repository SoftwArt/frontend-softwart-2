// src/shared/lib/apiClient.ts
// CAMBIO: lee token de localStorage (recordarme) o sessionStorage (sesión temporal)
 
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
 
function getToken(): string | null {
  return localStorage.getItem('token') ?? sessionStorage.getItem('token')
}
 
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
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
 
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Error ${res.status}`)
  }
 
  return res.json() as Promise<T>
}
 