// src/features/roles/hooks/useRoleForm.ts
import { useState } from 'react'
import type { Rol } from '../types'
import { withToast } from '@/src/shared/lib/withToast'

type Params = {
  onCreate: (data: { nombre: string; descripcion: string; estado: boolean }) => Promise<unknown>
  onEdit: (id: number, data: { nombre: string; descripcion: string }) => Promise<unknown>
}

export function useRoleForm({ onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nombre,       setNombreRaw]    = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const resetForm  = () => { setNombreRaw(''); setDescripcion(''); setErrors({}); setEditingId(null) }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (r: Rol) => { setEditingId(r.id_rol); setNombreRaw(r.nombre); setDescripcion(r.descripcion ?? ''); setErrors({}); setIsFormOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setErrors({ nombre: 'Campo requerido' }); return }
    setIsSubmitting(true)
    try {
      await withToast(
        editingId ? onEdit(editingId, { nombre, descripcion }) : onCreate({ nombre, descripcion, estado: true }),
        editingId ? 'Rol actualizado' : 'Rol registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    isSubmitting,
    nombre, setNombre: (v: string) => { setNombreRaw(v); if (errors.nombre) setErrors({}) },
    descripcion, setDescripcion,
    errors,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
