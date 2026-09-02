// src/features/payments/hooks/usePaymentStatusFlow.ts
import { useState } from 'react'
import type { Pago, EstadoPago, PagoStatusAlert } from '../types'
import { estadoLabel } from '../utils'
import { withToast } from '@/src/shared/lib/withToast'
import { undoableAction } from '@/src/shared/lib/undoableAction'

type Params = {
  estadosPago: EstadoPago[]
  onChangeStatus: (id: number, id_estado: number) => Promise<unknown>
}

export function usePaymentStatusFlow({ estadosPago, onChangeStatus }: Params) {
  const [alertEstado, setAlertEstado] = useState<PagoStatusAlert>({ open: false, msg: '' })
  const closeAlertEstado = () => setAlertEstado({ open: false, msg: '' })

  const idEstadoAnulado = estadosPago.find(e => e.nombre.toLowerCase().includes('anulado'))?.id_estado_pago

  const handleChangeStatus = (pago: Pago, nuevoIdEstado: number) => {
    const estadoActual = estadoLabel(estadosPago, pago.id_estado_pago).toLowerCase()
    const estadoNuevo  = estadoLabel(estadosPago, nuevoIdEstado).toLowerCase()

    if (estadoActual.includes('anulado')) {
      setAlertEstado({ open: true, msg: 'Este pago fue anulado y su estado no puede modificarse.' })
      return
    }
    if (estadoActual.includes('validado') && !estadoNuevo.includes('anulado')) {
      setAlertEstado({ open: true, msg: 'Un pago validado no puede cambiar de estado. Si es necesario, solo se puede anular.', pagoId: pago.id_pago, showAnular: true })
      return
    }
    // Anular es terminal e irreversible → pedir confirmación antes de aplicar
    if (estadoNuevo.includes('anulado')) {
      setAlertEstado({ open: true, msg: 'Anular un pago es definitivo: no podrá modificarse ni reactivarse después.', pagoId: pago.id_pago, showAnular: true })
      return
    }
    withToast(onChangeStatus(pago.id_pago, nuevoIdEstado), 'Estado actualizado')
  }

  const confirmAnular = () => {
    if (alertEstado.pagoId && idEstadoAnulado) {
      const { pagoId } = alertEstado
      undoableAction({
        message: 'Anulando pago...',
        successMsg: 'Pago anulado',
        onCommit: () => onChangeStatus(pagoId, idEstadoAnulado),
      })
    }
    closeAlertEstado()
  }

  return { alertEstado, setAlertEstado, closeAlertEstado, handleChangeStatus, confirmAnular, idEstadoAnulado }
}
