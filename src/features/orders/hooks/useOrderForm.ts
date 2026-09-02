// src/features/orders/hooks/useOrderForm.ts
import { useState } from 'react'
import type { Pedido, EstadoServicio } from '../types'
import { withToast } from '@/src/shared/lib/withToast'
import type { VentaOption } from '@/src/shared/hooks/useOptions'

type CreateEditData = {
  id_venta: number; id_servicio: number; id_marco: number | null
  id_estado: number; fecha: string; precio: number; observacion: string; estado: boolean
}

type Params = {
  estados: EstadoServicio[]
  rawVentas: VentaOption[]
  onCreate: (data: CreateEditData) => Promise<unknown>
  onEdit: (id: number, data: CreateEditData) => Promise<unknown>
}

export function useOrderForm({ estados, rawVentas, onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [idVenta,      setIdVenta]      = useState('')
  const [idServicio,   setIdServicio]   = useState('')
  const [idMarco,      setIdMarco]      = useState('')
  const [idEstado,     setIdEstado]     = useState('')
  const [fecha,        setFecha]        = useState('')
  const [precio,       setPrecio]       = useState('')
  const [observacion,  setObservacion]  = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const clearError = (field: string) => setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev))

  const resetForm = () => {
    setIdVenta(''); setIdServicio(''); setIdMarco(''); setIdEstado('')
    setFecha(''); setPrecio(''); setObservacion(''); setErrors({}); setEditingId(null)
  }
  const openCreate = () => { resetForm(); setFecha(new Date().toISOString().slice(0, 10)); setIsFormOpen(true) }
  const openEdit   = (p: Pedido) => {
    setEditingId(p.id_detalle); setIdVenta(String(p.id_venta))
    setIdServicio(String(p.id_servicio)); setIdMarco(p.id_marco ? String(p.id_marco) : '')
    setIdEstado(String(p.id_estado)); setFecha(p.fecha)
    setPrecio(String(p.precio)); setObservacion(p.observacion ?? '')
    setErrors({}); setIsFormOpen(true)
  }

  const handleVentaChange = (v: string) => {
    setIdVenta(v)
    clearError('idVenta')
    if (!editingId) {
      const total = rawVentas.find(rv => String(rv.id_venta) === v)?.total
      if (total != null) setPrecio(String(total))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!idVenta)      newErrors.idVenta    = 'Campo requerido'
    if (!idServicio)   newErrors.idServicio = 'Campo requerido'
    if (!fecha.trim()) newErrors.fecha      = 'Campo requerido'
    if (!precio)       newErrors.precio     = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      const data = {
        id_venta: Number(idVenta), id_servicio: Number(idServicio),
        id_marco: idMarco ? Number(idMarco) : null,
        id_estado: idEstado ? Number(idEstado) : (estados[0]?.id_estado ?? 1), fecha,
        precio: Number(precio), observacion, estado: true,
      }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Pedido actualizado' : 'Pedido registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    idVenta, onIdVentaChange: handleVentaChange,
    idServicio, setIdServicio: (v: string) => { setIdServicio(v); clearError('idServicio') },
    idMarco, setIdMarco,
    fecha, setFecha: (v: string) => { setFecha(v); clearError('fecha') },
    precio,
    observacion, setObservacion,
    errors,
    isSubmitting,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
