// src/features/permissions/hooks/usePermissionsRoleEditor.ts
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { ADMIN_ROL_ID, MODULO_ORDER, getModulo } from '../utils'

type Permiso = { id_permiso: number; nombre: string; descripcion?: string }

type Params = {
  permisos: Permiso[]
  hasPermission: (id_rol: number, id_permiso: number) => boolean
  isDirty: (id_rol: number) => boolean
  onTogglePermission: (id_rol: number, id_permiso: number) => void
  onToggleAllPermissions: (id_rol: number, ids: number[], marcar: boolean) => void
  guardarCambios: (id_rol: number) => Promise<unknown>
  descartarCambios: (id_rol: number) => void
}

export function usePermissionsRoleEditor({
  permisos, hasPermission, isDirty,
  onTogglePermission, onToggleAllPermissions,
  guardarCambios, descartarCambios,
}: Params) {
  const [selectedRol,      setSelectedRol]      = useState<string>('')
  const [isSaving,         setIsSaving]         = useState(false)
  // Cambiar de rol con cambios sin guardar pide confirmación antes de
  // descartarlos — evita perder ediciones por un click accidental en el Select.
  const [pendingRolChange, setPendingRolChange] = useState<string | null>(null)

  const selectedRolId = selectedRol ? Number(selectedRol) : null
  const isAdmin = selectedRolId === ADMIN_ROL_ID
  const dirty = selectedRolId !== null && !isAdmin && isDirty(selectedRolId)

  const handleRolChange = (v: string) => {
    if (dirty) { setPendingRolChange(v); return }
    setSelectedRol(v)
  }

  const confirmDiscardAndSwitch = () => {
    if (selectedRolId) descartarCambios(selectedRolId)
    if (pendingRolChange !== null) setSelectedRol(pendingRolChange)
    setPendingRolChange(null)
  }
  const cancelDiscard = () => setPendingRolChange(null)

  const handleGuardarCambios = async () => {
    if (!selectedRolId) return
    setIsSaving(true)
    try {
      await guardarCambios(selectedRolId)
      toast.success('Permisos guardados')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar los permisos')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDescartar = () => { if (selectedRolId) descartarCambios(selectedRolId) }

  // Agrupar permisos por módulo, en orden fijo
  const modulosAgrupados = useMemo(() => {
    const grupos = new Map<string, Permiso[]>()
    for (const p of permisos) {
      const modulo = getModulo(p.nombre)
      if (!grupos.has(modulo)) grupos.set(modulo, [])
      grupos.get(modulo)!.push(p)
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => {
      const ai = MODULO_ORDER.indexOf(a)
      const bi = MODULO_ORDER.indexOf(b)
      const av = ai === -1 ? 999 : ai
      const bv = bi === -1 ? 999 : bi
      return av - bv
    })
  }, [permisos])

  const totalActivos = useMemo(() => {
    if (!selectedRolId) return 0
    return permisos.filter(p => hasPermission(selectedRolId, p.id_permiso)).length
  }, [permisos, selectedRolId, hasPermission])

  const handleToggle = (id_permiso: number) => {
    if (!selectedRolId || isAdmin) return
    onTogglePermission(selectedRolId, id_permiso)
  }

  // Marcar/desmarcar todos los permisos de un módulo de golpe — local, sin red.
  const handleToggleAll = (ids: number[], marcar: boolean) => {
    if (!selectedRolId || isAdmin) return
    onToggleAllPermissions(selectedRolId, ids, marcar)
  }

  return {
    selectedRol, selectedRolId, isAdmin, dirty, isSaving,
    pendingRolChange,
    handleRolChange, confirmDiscardAndSwitch, cancelDiscard,
    handleGuardarCambios, handleDescartar,
    modulosAgrupados, totalActivos,
    handleToggle, handleToggleAll,
  }
}
