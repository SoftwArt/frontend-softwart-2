// src/features/calculator/hooks/useMarcoForm.ts
import { useState } from 'react'
import type { Marco, CreateMarcoDto, UpdateMarcoDto } from '../types'
import { withToast } from '@/src/shared/lib/withToast'

type Params = {
  onCreate: (data: CreateMarcoDto) => Promise<unknown>
  onEdit: (id: number, data: UpdateMarcoDto) => Promise<unknown>
}

export function useMarcoForm({ onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codigo,       setCodigo]       = useState('')
  const [colillaStr,   setColillaStr]   = useState('')
  const [precioStr,    setPrecioStr]    = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const resetForm  = () => { setCodigo(''); setColillaStr(''); setPrecioStr(''); setErrors({}); setEditingId(null) }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (m: Marco) => { setEditingId(m.id_marco); setCodigo(m.codigo); setColillaStr(String(m.colilla)); setPrecioStr(String(m.precio_ensamblado)); setErrors({}); setIsFormOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!codigo.trim())     newErrors.codigo  = 'Campo requerido'
    if (!colillaStr.trim()) newErrors.colilla = 'Campo requerido'
    else if (!Number.isInteger(Number(colillaStr)) || Number(colillaStr) <= 0) newErrors.colilla = 'Debe ser un número entero mayor a 0'
    if (!precioStr.trim())  newErrors.precio  = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      const data = { codigo, colilla: Number(colillaStr), precio_ensamblado: Number(precioStr), estado: true }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Marco actualizado' : 'Marco registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    isSubmitting,
    codigo, setCodigo: (v: string) => { setCodigo(v); if (errors.codigo) setErrors({}) },
    colillaStr, setColillaStr: (v: string) => { setColillaStr(v); if (errors.colilla) setErrors({}) },
    precioStr, setPrecioStr: (v: string) => { setPrecioStr(v); if (errors.precio) setErrors({}) },
    errors,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
