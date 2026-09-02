// src/features/users/hooks/useUserForm.ts
import { useState, useMemo } from 'react'
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types'
import { withToast } from '@/src/shared/lib/withToast'
import { validatePassword } from '@/src/shared/lib/passwordValidation'
import { isEmailValid, EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import type { RolOption } from '@/src/shared/hooks/useOptions'

type Params = {
  usuarios: Usuario[]
  rolesOptsActivos: ComboboxOption[]
  rawRoles: RolOption[]
  onCreate: (data: CreateUsuarioDto) => Promise<unknown>
  onEdit: (id: number, data: UpdateUsuarioDto) => Promise<unknown>
}

export function useUserForm({ usuarios, rolesOptsActivos, rawRoles, onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [correo, setCorreoRaw] = useState('')
  const [clave,  setClave]     = useState('')
  const [idRol,  setIdRolRaw]  = useState('')
  const [errors, setErrors]    = useState<Record<string, string>>({})

  const clearError = (field: string) => setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev))

  // Roles activos + el rol actualmente asignado (si se está editando y ese
  // rol pasó a inactivo después de asignado) — así no se pierde de vista
  // qué rol tiene hoy, sin permitir elegir otros roles inactivos.
  const rolesOptsForm = useMemo(() => {
    if (editingId && !rolesOptsActivos.some(r => r.value === idRol)) {
      const actual = rawRoles.find(r => String(r.id_rol) === idRol)
      if (actual) return [...rolesOptsActivos, { value: String(actual.id_rol), label: `${actual.nombre} (inactivo)` }]
    }
    return rolesOptsActivos
  }, [rolesOptsActivos, rawRoles, editingId, idRol])

  const resetForm  = () => { setCorreoRaw(''); setClave(''); setIdRolRaw(''); setErrors({}); setEditingId(null) }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (u: Usuario) => { setEditingId(u.id_usuario); setCorreoRaw(u.correo); setClave(''); setIdRolRaw(String(u.id_rol)); setErrors({}); setIsFormOpen(true) }

  // El admin base no puede cambiar de correo ni de rol (updateUser lo rechaza
  // con 403) — el form se lo deshabilita en vez de dejar que falle al guardar.
  const editingIsAdminBase = editingId !== null && usuarios.find(u => u.id_usuario === editingId)?.es_admin_base === true

  // Reactivo: igual que Register/Clientes, no espera al submit.
  const correoFormatoError = correo.length > 0 && !isEmailValid(correo) ? EMAIL_ERROR : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!correo.trim())              newErrors.correo = 'Campo requerido'
    else if (correoFormatoError)     newErrors.correo = correoFormatoError
    if (!editingId) {
      if (!clave.trim())             newErrors.clave  = 'Campo requerido'
      else {
        const pw = validatePassword(clave)
        if (!pw.valid)               newErrors.clave  = pw.firstError ?? 'Contraseña no válida'
      }
    }
    if (!idRol)                      newErrors.idRol  = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      await withToast(
        editingId
          ? onEdit(editingId, { correo, id_rol: Number(idRol) } as UpdateUsuarioDto)
          : onCreate({ correo, clave, id_rol: Number(idRol), estado: true } as CreateUsuarioDto),
        editingId ? 'Usuario actualizado' : 'Usuario registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    isSubmitting,
    correo, setCorreo: (v: string) => { setCorreoRaw(v); clearError('correo') },
    clave, setClave: (v: string) => { setClave(v); clearError('clave') },
    idRol, setIdRol: (v: string) => { setIdRolRaw(v); clearError('idRol') },
    errors,
    rolesOptsForm,
    editingIsAdminBase,
    correoFormatoError,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
