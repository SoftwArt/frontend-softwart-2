// src/features/account/hooks/usePasswordForm.ts
import { useState } from 'react'
import { toast } from 'sonner'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { validatePassword } from '@/src/shared/lib/passwordValidation'

export function usePasswordForm() {
  const [claveActual,   setClaveActual]   = useState('')
  const [claveNueva,    setClaveNueva]    = useState('')
  const [claveConfirm,  setClaveConfirm]  = useState('')
  const [isSavingClave, setIsSavingClave] = useState(false)

  const submitClave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claveActual.trim()) { toast.error('Ingresa tu contraseña actual'); return }
    const pwCheck = validatePassword(claveNueva)
    if (!pwCheck.valid) { toast.error(pwCheck.firstError!); return }
    if (claveNueva !== claveConfirm) { toast.error('Las contraseñas no coinciden'); return }
    setIsSavingClave(true)
    try {
      await apiRequest('/api/account/perfil', {
        method: 'PUT',
        body: JSON.stringify({ clave_actual: claveActual, clave: claveNueva }),
      })
      toast.success('Contraseña actualizada correctamente')
      setClaveActual(''); setClaveNueva(''); setClaveConfirm('')
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Error al cambiar contraseña')
    } finally { setIsSavingClave(false) }
  }

  return {
    claveActual,  setClaveActual,
    claveNueva,   setClaveNueva,
    claveConfirm, setClaveConfirm,
    isSavingClave, submitClave,
  }
}
