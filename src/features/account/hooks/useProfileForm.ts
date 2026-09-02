// src/features/account/hooks/useProfileForm.ts
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { isTelefonoValid, TELEFONO_ERROR } from '@/src/shared/lib/validateTelefono'
import { isNombreLongitudValida, NOMBRE_MIN_ERROR } from '@/src/shared/lib/validateNombre'
import { isEmailValid, EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import type { PerfilCliente } from '../types'

type ApiResponse<T> = { success: boolean; message?: string; data: T }

export function useProfileForm(perfil: PerfilCliente | null, setPerfil: (p: PerfilCliente) => void) {
  const [perfilNombre,   setPerfilNombre]   = useState('')
  const [perfilTelefono, setPerfilTelefono] = useState('')
  const [perfilCorreo,   setPerfilCorreo]   = useState('')
  const [perfilErrors,   setPerfilErrors]   = useState<{ nombre?: string; telefono?: string; correo?: string }>({})
  const [isSavingPerfil, setIsSavingPerfil] = useState(false)

  useEffect(() => {
    if (!perfil) return
    setPerfilNombre(perfil.nombre ?? '')
    setPerfilTelefono(perfil.telefono ?? '')
    setPerfilCorreo(perfil.correo ?? '')
  }, [perfil])

  const submitPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrors: { nombre?: string; telefono?: string; correo?: string } = {}
    if (!isNombreLongitudValida(perfilNombre)) fieldErrors.nombre = NOMBRE_MIN_ERROR
    if (!perfilTelefono.trim())                fieldErrors.telefono = 'El teléfono es obligatorio.'
    else if (!isTelefonoValid(perfilTelefono))  fieldErrors.telefono = TELEFONO_ERROR
    if (!perfilCorreo.trim())                   fieldErrors.correo = 'Campo requerido'
    else if (!isEmailValid(perfilCorreo))       fieldErrors.correo = EMAIL_ERROR
    setPerfilErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return
    setIsSavingPerfil(true)
    try {
      const res = await apiRequest<ApiResponse<PerfilCliente>>('/api/account/perfil', {
        method: 'PUT',
        body: JSON.stringify({ nombre: perfilNombre, telefono: perfilTelefono || null, correo: perfilCorreo }),
      })
      setPerfil(res.data)
      toast.success('Datos actualizados correctamente')
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Error al actualizar')
    } finally { setIsSavingPerfil(false) }
  }

  return {
    perfilNombre,   setPerfilNombre,
    perfilTelefono, setPerfilTelefono,
    perfilCorreo,   setPerfilCorreo,
    perfilErrors, isSavingPerfil, submitPerfil,
  }
}
