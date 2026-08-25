// src/features/account/components/ServicesModal.tsx
import { useCallback, useState, useMemo } from 'react'
import { m } from 'framer-motion'
import {
  filterServiciosCuenta, estadoServicioBadgeClasses,
  modalBackdropVariants, modalPanelVariants,
} from '../utils'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { usePolling } from '@/src/shared/hooks/usePolling'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { formatDate } from '@/src/shared/lib/formatDate'
import { SearchInput } from '@/src/shared/components/SearchInput'
import { Pagination } from '@/src/shared/components/Pagination'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { Wrench, ChevronDown, X } from 'lucide-react'
import type { HistorialEstado } from '../types'


import type { Servicio } from '../types'


interface ServicesModalProps {
  services: Servicio[]
  isLoading: boolean
  onClose: () => void
}

export function ServicesModal({ services, isLoading, onClose }: ServicesModalProps) {
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [historyById, setHistoryById] = useState<Record<number, HistorialEstado[]>>({})
  const [historyLoadingId, setHistoryLoadingId] = useState<number | null>(null)

  // silent=true (polling) doesn't touch the loading spinner nor overwrite
  // state if the content hasn't changed.
  const fetchHistory = useCallback(async (id_detalle: number, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setHistoryLoadingId(id_detalle)
    try {
      const res = await apiRequest<{ success: boolean; data: HistorialEstado[] }>(`/api/account/servicios/${id_detalle}/historial`)
      const next = res.data ?? []
      setHistoryById(prev =>
        JSON.stringify(prev[id_detalle]) === JSON.stringify(next) ? prev : { ...prev, [id_detalle]: next }
      )
    } catch {
      if (!opts?.silent) setHistoryById(prev => ({ ...prev, [id_detalle]: [] }))
    } finally {
      if (!opts?.silent) setHistoryLoadingId(null)
    }
  }, [])

  const toggleHistory = (id_detalle: number) => {
    if (expandedId === id_detalle) { setExpandedId(null); return }
    setExpandedId(id_detalle)
    if (!historyById[id_detalle]) fetchHistory(id_detalle)
  }

  // This modal only exists in the tree while it's open, so polling just needs
  // to check "is a row expanded" — no separate "is modal open" check needed
  // (that check lived in the parent before, guarding a shared state).
  const pollHistory = useCallback(() => {
    if (expandedId != null) fetchHistory(expandedId, { silent: true })
  }, [expandedId, fetchHistory])

  usePolling(pollHistory, 15000)

  const filtered = useMemo(() => filterServiciosCuenta(services, query), [services, query])
  const pagination = usePagination(filtered)

  return (
    <m.div
      key="backdrop-services"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      variants={modalBackdropVariants}
      initial="initial" animate="animate" exit="exit"
    >
      <m.div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col gap-4 p-6 relative max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        variants={modalPanelVariants}
        initial="initial" animate="animate" exit="exit"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-secondary">Mis servicios</h3>
          <button type="button" onClick={onClose} title="Cerrar" aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por servicio o estado..." className="w-full sm:w-72" />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aún no tienes servicios registrados.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Sin resultados para "{query}".</p>
        ) : (
          <>
            <div className="space-y-3">
              {pagination.paginated.map(s => (
                <div key={s.id_detalle}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{s.servicio}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(s.fecha)}</span>
                        <span className="text-xs font-medium text-primary">{formatCurrency(s.precio)}</span>
                      </div>
                      {s.observacion && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.observacion}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${estadoServicioBadgeClasses(s.estado)}`}>
                      {s.estado}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleHistory(s.id_detalle)}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedId === s.id_detalle ? 'rotate-180' : ''}`} />
                    {expandedId === s.id_detalle ? 'Ocultar historial' : 'Ver historial'}
                  </button>

                  {expandedId === s.id_detalle && (
                    <div className="mt-3 pl-2 border-l-2 border-border space-y-2">
                      {historyLoadingId === s.id_detalle ? (
                        <p className="text-xs text-muted-foreground">Cargando...</p>
                      ) : (historyById[s.id_detalle]?.length ?? 0) === 0 ? (
                        <p className="text-xs text-muted-foreground">Sin historial disponible.</p>
                      ) : (
                        historyById[s.id_detalle]!.map(h => (
                          <div key={h.id_historial} className="text-xs">
                            <span className="font-medium text-foreground">{h.estado}</span>
                            <span className="text-muted-foreground"> — {new Date(h.fecha).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              page={pagination.page} totalPages={pagination.totalPages}
              total={pagination.total} pageSize={pagination.pageSize}
              onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
            />
          </>
        )}

        <button type="button" onClick={onClose}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors py-2 text-center w-full">
          Cerrar
        </button>
      </m.div>
    </m.div>
  )
}