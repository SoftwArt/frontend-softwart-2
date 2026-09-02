// src/features/account/hooks/useAppointmentBooking.ts
import { useState } from 'react'
import type { MutableRefObject } from 'react'
import { toast } from 'sonner'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { bogotaTomorrowStr } from '@/src/shared/lib/bogotaTime'
import { BookedSlot } from '@/src/shared/components/TimePicker'

type Params = {
  fetchMyAppointments: () => Promise<void>
  isMutatingRef: MutableRefObject<boolean>
}

export function useAppointmentBooking({ fetchMyAppointments, isMutatingRef }: Params) {
  // ── Form nueva cita ─────────────────────────────────────────────────────────
  const [citaFecha,      setCitaFecha]      = useState(bogotaTomorrowStr)
  const [citaHora,       setCitaHora]       = useState('')
  const [citaObs,        setCitaObs]        = useState('')
  const [disponibilidad, setDisponibilidad] = useState<BookedSlot[]>([])
  const [citaErrors,     setCitaErrors]     = useState<Record<string, string>>({})
  const [isAgendando,    setIsAgendando]    = useState(false)

  const onCitaFechaChange = async (fecha: string) => {
    setCitaFecha(fecha)
    setCitaHora('')
    setCitaErrors(p => ({ ...p, fecha: '', hora: '' }))
    try {
      const res = await apiRequest<{ success: boolean; data: { id_cita: number; hora: string }[] }>(
        `/api/account/availability?fecha=${fecha}`
      )
      setDisponibilidad(
        (res.data ?? []).map(d => ({ hora: d.hora, id_cita: d.id_cita, clienteNombre: 'Ocupado' }))
      )
    } catch { setDisponibilidad([]) }
  }

  const onCitaHoraChange = (hora: string) => {
    setCitaHora(hora)
    setCitaErrors(p => ({ ...p, hora: '' }))
  }

  // Retorna true si el agendamiento fue exitoso (para que el componente cierre el modal)
  const submitCita = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!citaFecha) errs.fecha = 'Selecciona una fecha'
    if (!citaHora)  errs.hora  = 'Selecciona una hora'
    if (citaFecha < bogotaTomorrowStr()) errs.fecha = 'Solo puedes agendar desde mañana'
    if (Object.keys(errs).length) { setCitaErrors(errs); return false }
    setIsAgendando(true); setCitaErrors({})
    isMutatingRef.current = true
    try {
      await apiRequest('/api/account/citas', {
        method: 'POST',
        body: JSON.stringify({ fecha: citaFecha, hora: citaHora, observacion: citaObs || undefined }),
      })
      toast.success('¡Cita agendada! Te contactaremos para confirmarla.')
      setCitaFecha(bogotaTomorrowStr()); setCitaHora(''); setCitaObs('')
      await fetchMyAppointments()
      return true
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Error al agendar la cita')
      return false
    } finally { setIsAgendando(false); isMutatingRef.current = false }
  }

  const resetCitaForm = () => {
    setCitaErrors({})
  }

  // ── Cancelar cita ───────────────────────────────────────────────────────────
  const onCancelAppointment = async (id_cita: number, motivo?: string) => {
    isMutatingRef.current = true
    try {
      await apiRequest(`/api/account/citas/${id_cita}/cancelar`, {
        method: 'PATCH',
        body: JSON.stringify({ motivo: motivo?.trim() || undefined }),
      })
      // Refetch en vez de quitarla del estado local — la cita sigue
      // existiendo (ahora en estado Cancelada), no debe desaparecer de la
      // lista hasta el próximo poll de 15s.
      await fetchMyAppointments()
    } finally {
      isMutatingRef.current = false
    }
  }

  return {
    citaFecha, citaHora, citaObs, setCitaObs,
    citaErrors,
    isAgendando, disponibilidad,
    onCitaFechaChange, onCitaHoraChange,
    submitCita, resetCitaForm,
    onCancelAppointment,
  }
}
