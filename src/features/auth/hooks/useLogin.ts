// src/features/auth/hooks/useLogin.ts
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { LoginResponse } from '../types'
import { saveAuth, saveCredentials, clearCredentials } from '../utils'

export { clearAuth, saveCredentials, clearCredentials, getSavedCredentials } from '../utils'

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLogin(redirectCita = false) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const login = async (correo: string, password: string, remember: boolean) => {
    setIsLoading(true); setError(null)
    try {
      const res = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, clave: password }),
      })

      if (!res.success || !res.token) {
        setError('Credenciales incorrectas')
        return
      }

      if (remember) saveCredentials(correo, password)
      else          clearCredentials()

      saveAuth({
        token:        res.token,
        refreshToken: res.refreshToken,
        rol:          res.data.rol,
        id_usuario:   res.data.id_usuario,
        correo:       res.data.correo,
        id_cliente:   res.data.id_cliente,
      }, remember)

      // Redirigir según rol — el acceso real al panel lo valida RequireAuth
      // por permiso (PANEL.ACCESO), acá solo se decide "portal cliente vs.
      // intentar el panel admin" para no duplicar esa fuente de verdad.
      if (res.data.rol === 'Cliente') {
        navigate(redirectCita ? '/my-account?new-appointment=true' : '/my-account', { replace: true })
      } else {
        navigate('/admin/dashboard', { replace: true })
      }
    } catch (e) {
      // fetch() lanza TypeError("Failed to fetch") cuando no hay red o el backend
      // no responde — no es un mensaje pensado para el usuario final.
      if (e instanceof TypeError) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      } else {
        setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error, clearError: () => setError(null) }
}