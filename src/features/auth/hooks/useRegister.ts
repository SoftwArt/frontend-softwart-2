// ================================================================
// src/features/auth/hooks/useRegister.ts
// ================================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@/src/shared/lib/apiClient'

type RegisterDto = {
  tipoDocumento: string
  documento: string
  nombre: string
  correo: string
  clave: string
  telefono: string // FIX: era opcional — en el backend es NOT NULL
  acceptTerms: boolean // el backend re-valida que sea true (z.literal(true))
}

export function useRegister(loginRedirect?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (data: RegisterDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      navigate(loginRedirect ? `/login?redirect=${loginRedirect}` : '/login')
    } catch (err) {
      // fetch() lanza TypeError("Failed to fetch") cuando no hay red o el backend
      // no responde — no es un mensaje pensado para el usuario final.
      if (err instanceof TypeError) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      } else {
        setError(err instanceof Error ? err.message : 'Error al registrar')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { onSubmit, isLoading, error, clearError: () => setError(null) }
}