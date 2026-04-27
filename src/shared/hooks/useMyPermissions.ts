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

  // Si aún no cargó o falló → muestra todo (backend protege los datos)
  const can = (permiso: string) => !ready || failed || !permiso || permisos.has(permiso)
  return { can, isLoading: !ready }
}
