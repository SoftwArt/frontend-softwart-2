// src/features/sales/hooks/useSaleDangerZone.ts
import { useState } from 'react'
import type { VentaDetalle, VentaCascadeTarget } from '../types'
import { hasValidatedPayments, buildEliminarLines, buildAnularLines } from '../utils'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { undoableAction } from '@/src/shared/lib/undoableAction'

type Params = {
  onToggleStatus: (id: number) => Promise<unknown>
  onDelete: (id: number) => Promise<unknown>
  refetch: () => Promise<unknown>
}

export function useSaleDangerZone({ onToggleStatus, onDelete, refetch }: Params) {
  // Confirmación de anulación (desactivar es definitivo: no se puede reactivar)
  const [anularTarget, setAnularTarget] = useState<VentaCascadeTarget | null>(null)
  // Confirmación de eliminar (hard-delete: cascadea SaleDetail + Payment no
  // validados) — mismo patrón que openAnular: previsualizar qué se borra
  // antes de confirmar, en vez de un texto genérico fijo.
  const [eliminarTarget, setEliminarTarget] = useState<VentaCascadeTarget | null>(null)

  const openEliminar = (id: number, label: string) => {
    setEliminarTarget({ id, label, loading: true, lines: [] })
    apiRequest<{ success: boolean; data: VentaDetalle }>(`/api/sales/${id}`)
      .then((res) => {
        const sale = res.data
        if (hasValidatedPayments(sale)) {
          setEliminarTarget(prev => prev && prev.id === id
            ? { ...prev, loading: false, bloqueado: true, msg: 'Tiene abonos validados. No se puede eliminar, solo anular.', lines: [] }
            : prev)
          return
        }
        setEliminarTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: buildEliminarLines(sale) } : prev)
      })
      .catch(() => setEliminarTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: [] } : prev))
  }

  const confirmEliminar = () => {
    if (!eliminarTarget || eliminarTarget.loading || eliminarTarget.bloqueado) return
    const { id, label } = eliminarTarget
    setEliminarTarget(null)
    undoableAction({
      message: `Eliminando ${label}...`,
      successMsg: 'Pedido eliminado',
      onCommit: () => onDelete(id),
    })
  }

  const openAnular = (id: number, label: string) => {
    setAnularTarget({ id, label, loading: true, lines: [] })
    apiRequest<{ success: boolean; data: VentaDetalle }>(`/api/sales/${id}`)
      .then((res) => {
        const sale = res.data
        if (hasValidatedPayments(sale)) {
          setAnularTarget(prev => prev && prev.id === id
            ? { ...prev, loading: false, bloqueado: true, msg: 'Tiene pagos validados. Registra la devolución antes de anularla.', lines: [] }
            : prev)
          return
        }
        setAnularTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: buildAnularLines(sale) } : prev)
      })
      .catch(() => setAnularTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: [] } : prev))
  }

  const confirmAnular = () => {
    if (!anularTarget || anularTarget.loading || anularTarget.bloqueado) return
    const { id, label } = anularTarget
    setAnularTarget(null)
    undoableAction({
      message: `Anulando ${label}...`,
      successMsg: 'Pedido anulado',
      onCommit: async () => {
        await onToggleStatus(id)
        await refetch() // refrescar: la anulación cambió abonos/servicios en cascada
      },
    })
  }

  return {
    anularTarget, setAnularTarget, openAnular, confirmAnular,
    eliminarTarget, setEliminarTarget, openEliminar, confirmEliminar,
  }
}
