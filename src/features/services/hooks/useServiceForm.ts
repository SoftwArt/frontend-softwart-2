// src/features/services/hooks/useServiceForm.ts
import { useState } from 'react'
import type { Servicio } from '../types'
import { withToast } from '@/src/shared/lib/withToast'

type Data = { nombre: string; descripcion: string; duracion: number; estado: boolean }

type Params = {
  onCreate: (data: Data) => Promise<unknown>
  onEdit: (id: number, data: Data) => Promise<unknown>
}

export function useServiceForm({ onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nombre,       setNombreRaw]    = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [duracionStr,  setDuracionStr]  = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const resetForm  = () => { setNombreRaw(''); setDescripcion(''); setDuracionStr(''); setErrors({}); setEditingId(null) }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (s: Servicio) => {
    setEditingId(s.id_servicio); setNombreRaw(s.nombre)
    setDescripcion(s.descripcion ?? ''); setDuracionStr(String(s.duracion))
    setErrors({}); setIsFormOpen(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nombre.trim())      e.nombre   = 'Campo requerido'
    if (!duracionStr.trim()) e.duracion = 'Campo requerido'
    else if (Number(duracionStr) <= 0) e.duracion = 'Debe ser mayor a 0'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
    setIsSubmitting(true)
    try {
      const data = { nombre, descripcion, duracion: Number(duracionStr), estado: true }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Servicio actualizado' : 'Servicio registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    isSubmitting,
    nombre, setNombre: (v: string) => { setNombreRaw(v); if (errors.nombre) setErrors(p => ({...p, nombre:''})) },
    descripcion, setDescripcion,
    duracionStr, setDuracionStr: (v: string) => { setDuracionStr(v); if (errors.duracion) setErrors(p => ({...p, duracion:''})) },
    errors,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
