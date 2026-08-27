import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/apiClient'

export function useMyPermissions() {
  const [permisos, setPermisos] = useState<Set<string>>(new Set())
  const [ready,    setReady]    = useState(false)
  const [failed,   setFailed]   = useState(false)

  useEffect(() => {
    apiRequest<{ success: boolean; data: string[] }>('/api/auth/me/permissions')
      .then(res => setPermisos(new Set(res.data ?? [])))
      .catch(() => setFailed(true))
      .finally(() => setReady(true))
  }, [])

  // Mientras carga se permite renderizar para evitar parpadeos; las rutas
  // esperan isLoading. Si la consulta falla, se deniega por seguridad.
  const can = (permiso: string) => !ready || (!failed && !!permiso && permisos.has(permiso))
  return { can, permisos, isLoading: !ready }
}
