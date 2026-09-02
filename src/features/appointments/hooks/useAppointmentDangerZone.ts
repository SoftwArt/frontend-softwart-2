// src/features/appointments/hooks/useAppointmentDangerZone.ts
import { useState } from 'react'
import type { Cita, CitaDetalle, CitaCascadeTarget, CitaEstadoAlert, EstadoCita } from '../types'
import { estadoLabel, isCitaCompletada, hasValidatedPayments, buildDeleteCitaLines, buildCancelCitaLines } from '../utils'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { withToast } from '@/src/shared/lib/withToast'
import { undoableAction } from '@/src/shared/lib/undoableAction'
import type { ComboboxOption } from '@/src/shared/components/Combobox'

// Protección de estado Cancelada — terminal e irreversible, igual que Anulado en Pagos
const MSG_BASE = 'Cancelar una cita es definitivo: no podrá modificarse ni volver a cambiar de estado.'

type Params = {
  estadosCita: EstadoCita[]
  clientesOpts: ComboboxOption[]
  onDelete: (id: number) => Promise<unknown>
  onChangeStatus: (id: number, nuevoIdEstado: number) => Promise<unknown>
}

export function useAppointmentDangerZone({ estadosCita, clientesOpts, onDelete, onChangeStatus }: Params) {
  const estadoCancelada = estadosCita.find(e => e.nombre.toLowerCase().includes('cancelada'))

  // ── Eliminar cita ──────────────────────────────────────────────
  const [eliminarTarget, setEliminarTarget] = useState<CitaCascadeTarget | null>(null)

  const openEliminarCita = (cita: Cita) => {
    const label = clientesOpts.find(o => o.value === String(cita.id_cliente))?.label ?? `Cita #${cita.id_cita}`
    setEliminarTarget({ id: cita.id_cita, label, loading: true, lines: [] })
    apiRequest<{ success: boolean; data: CitaDetalle }>(`/api/appointments/${cita.id_cita}`)
      .then((res) => {
        const sale = res.data?.sale
        if (!sale) {
          setEliminarTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines: [] } : prev)
          return
        }
        if (hasValidatedPayments(sale.payments)) {
          setEliminarTarget(prev => prev && prev.id === cita.id_cita
            ? { ...prev, loading: false, bloqueado: true, msg: `Tiene la Venta #${sale.id_venta} con abonos validados. No se puede eliminar, solo anular.`, lines: [] }
            : prev)
          return
        }
        setEliminarTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines: buildDeleteCitaLines(sale) } : prev)
      })
      .catch(() => setEliminarTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines: [] } : prev))
  }

  const closeEliminarTarget = () => setEliminarTarget(null)

  const confirmEliminarCita = () => {
    if (!eliminarTarget || eliminarTarget.loading || eliminarTarget.bloqueado) return
    const { id, label } = eliminarTarget
    setEliminarTarget(null)
    undoableAction({
      message: `Eliminando cita de ${label}...`,
      successMsg: 'Cita eliminada',
      onCommit: () => onDelete(id),
    })
  }

  // ── Cambiar estado (cancelación) ──────────────────────────────
  const [alertEstado, setAlertEstado] = useState<CitaEstadoAlert>({ open: false, msg: '', lines: [] })
  const closeAlertEstado = () => setAlertEstado({ open: false, msg: '', lines: [] })

  const handleChangeStatus = (cita: Cita, nuevoIdEstadoSeleccionado: number) => {
    // Una cita Completada ya ocurrió — el único cambio de estado válido a
    // partir de acá es anularla (Cancelada), no "retroceder" a otro estado.
    // En vez de solo bloquear con un error, se redirige a la misma
    // confirmación de anular (igual que un pago Validado en Pagos).
    const bloqueadoDesdeCompletada = isCitaCompletada(estadosCita, cita.id_estado_cita)
      && !estadoLabel(estadosCita, nuevoIdEstadoSeleccionado).toLowerCase().includes('cancelada')
    const nuevoIdEstado = bloqueadoDesdeCompletada && estadoCancelada
      ? estadoCancelada.id_estado_cita
      : nuevoIdEstadoSeleccionado

    if (!estadoLabel(estadosCita, nuevoIdEstado).toLowerCase().includes('cancelada')) {
      withToast(onChangeStatus(cita.id_cita, nuevoIdEstado), 'Estado actualizado')
      return
    }

    setAlertEstado({
      open: true,
      loading: true,
      msg: bloqueadoDesdeCompletada
        ? `Esta cita ya está Completada — no puede cambiar a otro estado, solo anularse. ${MSG_BASE}`
        : MSG_BASE,
      lines: [],
      citaId: cita.id_cita,
      nuevoEstado: nuevoIdEstado,
    })

    apiRequest<{ success: boolean; data: CitaDetalle }>(`/api/appointments/${cita.id_cita}`)
      .then((res) => {
        const sale = res.data?.sale
        if (!sale) {
          setAlertEstado(prev => ({ ...prev, loading: false, lines: [] }))
          return
        }
        if (hasValidatedPayments(sale.payments)) {
          setAlertEstado(prev => ({
            ...prev,
            loading: false,
            bloqueado: true,
            msg: `No se puede cancelar: la Venta #${sale.id_venta} asociada tiene pagos validados. Registra la devolución antes de cancelar la cita.`,
            lines: [],
          }))
          return
        }
        setAlertEstado(prev => ({ ...prev, loading: false, lines: buildCancelCitaLines(sale) }))
      })
      .catch(() => {
        setAlertEstado(prev => ({ ...prev, loading: false, lines: [] }))
      })
  }

  const confirmCancelarCita = () => {
    if (alertEstado.citaId && alertEstado.nuevoEstado) {
      const { citaId, nuevoEstado } = alertEstado
      undoableAction({
        message: 'Cancelando cita...',
        successMsg: 'Cita cancelada',
        onCommit: () => onChangeStatus(citaId, nuevoEstado),
      })
    }
    closeAlertEstado()
  }

  return {
    eliminarTarget, openEliminarCita, closeEliminarTarget, confirmEliminarCita,
    alertEstado, handleChangeStatus, closeAlertEstado, confirmCancelarCita,
  }
}
