// src/features/sales/hooks/useSaleForm.ts
import { useState, useMemo } from 'react'
import type { Venta } from '../types'
import { withToast } from '@/src/shared/lib/withToast'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import type { CitaOption } from '@/src/shared/hooks/useOptions'

type CreateEditData = { id_cliente: number; id_cita: number | null; fecha: string; total: number; observacion: string; estado: boolean }

type Params = {
  citasOpts: ComboboxOption[]
  rawCitas: CitaOption[]
  onCreate: (data: CreateEditData) => Promise<unknown>
  onEdit: (id: number, data: CreateEditData) => Promise<unknown>
}

export function useSaleForm({ citasOpts, rawCitas, onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [idCliente,   setIdClienteRaw] = useState('')
  const [idCita,      setIdCitaRaw]    = useState('')
  const [fecha,       setFecha]        = useState('')
  const [total,       setTotal]        = useState('')
  const [observacion, setObservacion]  = useState('')
  const [errors,      setErrors]       = useState<Record<string, string>>({})

  const clearError = (field: string) => setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev))

  // Citas filtradas por el cliente seleccionado — últimas 5
  const citasFormOpts = useMemo(() => {
    if (!idCliente) return []
    const delCliente = citasOpts.filter(opt =>
      rawCitas.find(c => String(c.id_cita) === opt.value)?.client?.id_cliente === Number(idCliente)
    )
    return delCliente.slice(-5)
  }, [idCliente, citasOpts, rawCitas])

  const setIdCliente = (v: string) => { setIdClienteRaw(v); setIdCitaRaw(''); clearError('idCliente') }
  const setIdCita = (v: string) => {
    setIdCitaRaw(v)
    const citaFecha = rawCitas.find(c => String(c.id_cita) === v)?.fecha
    if (citaFecha) setFecha(citaFecha)
  }

  const resetForm = () => { setIdClienteRaw(''); setIdCitaRaw(''); setFecha(''); setTotal(''); setObservacion(''); setErrors({}); setEditingId(null) }
  const openCreate = () => { resetForm(); setFecha(new Date().toISOString().slice(0, 10)); setIsFormOpen(true) }
  const openEdit = (v: Venta) => {
    setEditingId(v.id_venta); setIdClienteRaw(String(v.id_cliente))
    setIdCitaRaw(v.id_cita ? String(v.id_cita) : ''); setFecha(v.fecha)
    setTotal(String(v.total)); setObservacion(v.observacion ?? '')
    setErrors({}); setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!idCliente)    errs.idCliente = 'Campo requerido'
    if (!fecha.trim()) errs.fecha = 'Campo requerido'
    if (!total.trim()) errs.total = 'Campo requerido'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      const data = { id_cliente: Number(idCliente), id_cita: idCita ? Number(idCita) : null, fecha, total: Number(total), observacion, estado: true }
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
    idCliente, setIdCliente,
    idCita, setIdCita,
    citasFormOpts,
    fecha, setFecha: (v: string) => { setFecha(v); clearError('fecha') },
    total, setTotal: (v: string) => { setTotal(v); clearError('total') },
    observacion, setObservacion,
    errors,
    isSubmitting,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
