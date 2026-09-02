// src/features/account/hooks/useDeleteAccount.ts
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { clearAuth } from '@/src/features/auth/utils'

export function useDeleteAccount() {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  // Devuelve el message real del backend — distingue "desactivada" (con
  // historial) de "eliminada permanentemente" (sin historial), así el toast
  // no asume cuál de los dos pasó.
  const onDeleteAccount = async (): Promise<string> => {
    setIsDeleting(true)
    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/api/account', { method: 'DELETE' })
      clearAuth()
      navigate('/', { replace: true })
      return res.message
    } catch (e2) {
      setIsDeleting(false)
      throw e2
    }
  }

  return { isDeleting, onDeleteAccount }
}
