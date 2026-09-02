// src/features/appointments/hooks/useAppointmentForm.ts
import { useState, useMemo } from 'react'
import type { Cita, EstadoCita } from '../types'
import { todayStr, validateFecha } from '../utils'
import { isWithinBusinessHours } from '@/src/shared/lib/businessHours'
import { withToast } from '@/src/shared/lib/withToast'
import type { BookedSlot } from '@/src/shared/components/TimePicker'

type CreateEditData = { id_cliente: number; fecha: string; hora: string; id_estado_cita: number }

type Params = {
  citas: Cita[]
  estadosCita: EstadoCita[]
  onCreate: (data: CreateEditData) => Promise<unknown>
  onEdit: (id: number, data: CreateEditData) => Promise<unknown>
}

export function useAppointmentForm({ citas, estadosCita, onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idCliente,    setIdCliente]    = useState('')
  const [fecha,        setFecha]        = useState('')
  const [hora,         setHora]         = useState('')
  const [idEstado,     setIdEstado]     = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  const clearError = (field: string) => setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev))

  const resetForm  = () => { setIdCliente(''); setFecha(''); setHora(''); setIdEstado(''); setErrors({}); setEditingId(null) }

  const openCreate = () => {
    resetForm()
    const confirmada = estadosCita.find(e => e.nombre.toLowerCase() === 'confirmada')
    setIdEstado(String(confirmada?.id_estado_cita ?? 5))
    setFecha(todayStr())
    setIsFormOpen(true)
  }

  const openEdit = (c: Cita) => {
    setEditingId(c.id_cita)
    setIdCliente(String(c.id_cliente))
    setFecha(c.fecha)
    setHora(c.hora)
    setIdEstado(String(c.id_estado_cita))
    setErrors({})
    setIsFormOpen(true)
  }

  const bookedSlots: BookedSlot[] = useMemo(() => {
    if (!fecha) return []
    return citas
      .filter(c => c.fecha === fecha && c.id_cita !== editingId)
      .map((c): BookedSlot => ({ hora: c.hora, clienteNombre: c.clienteNombre, id_cita: c.id_cita }))
  }, [citas, fecha, editingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!idCliente)    newErrors.idCliente = 'Campo requerido'
    if (!fecha.trim()) newErrors.fecha = 'Campo requerido'
    else if (!validateFecha(fecha)) newErrors.fecha = 'La fecha no puede ser en el pasado'
    if (!hora.trim()) {
      newErrors.hora = 'Campo requerido'
    } else if (!isWithinBusinessHours(hora)) {
      newErrors.hora = 'La hora debe estar entre 13:00 y 18:00'
    }
    if (!idEstado) newErrors.idEstado = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      const data = { id_cliente: Number(idCliente), fecha, hora, id_estado_cita: Number(idEstado) }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Cita actualizada' : 'Cita registrada'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    idCliente,    setIdCliente:    (v: string) => { setIdCliente(v); clearError('idCliente') },
    fecha,        setFecha:        (v: string) => { setFecha(v); clearError('fecha') },
    hora,         setHora:         (v: string) => { setHora(v); clearError('hora') },
    idEstado,     setIdEstado:     (v: string) => { setIdEstado(v); clearError('idEstado') },
    errors,
    isSubmitting,
    bookedSlots,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
