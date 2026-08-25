// src/features/account/components/AppointmentsModal.tsx
import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import {
  inputCls, labelCls, parseFechaBloque,
  estadoBadgeClasses, filterCitasCuenta,
  modalBackdropVariants, modalPanelVariants,
  canCancelCita,
} from '../utils'
import { withToast } from '@/src/shared/lib/withToast'
import { SearchInput } from '@/src/shared/components/SearchInput'
import { Pagination } from '@/src/shared/components/Pagination'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/src/shared/components/ui/alert-dialog'
import { CalendarDays, Plus, Clock, CalendarPlus, X } from 'lucide-react'
import type { Cita } from '../types'
// Minimal shape actually used by this modal.
// Replace with the real `Cita` type from '../types' if one already exists.


interface AppointmentsModalProps {
  appointments: Cita[]
  isLoading: boolean
  onClose: () => void
  onNewAppointment: () => void
  onCancelAppointment: (id: number, motivo: string) => Promise<unknown>
}

export function AppointmentsModal({
  appointments, isLoading, onClose, onNewAppointment, onCancelAppointment,
}: AppointmentsModalProps) {
  // Local-only UI state: search query, pagination and the cancel dialog's
  // transient state. None of this needs to live in the parent page.
  const [query, setQuery] = useState('')
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const [cancelMotivo, setCancelMotivo] = useState('')

  const filtered = useMemo(
    () => filterCitasCuenta(
      [...appointments].sort((a, b) => b.fecha.localeCompare(a.fecha)),
      query,
    ),
    [appointments, query],
  )

  const pagination = usePagination(filtered)

  return (
    <m.div
      key="backdrop-appointments"
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
          <h3 className="font-serif text-xl text-secondary">Mis citas</h3>
          <button type="button" onClick={onClose} title="Cerrar" aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar por ID, fecha o estado..." className="w-full sm:w-72" />
            <button
              onClick={onNewAppointment}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Nueva cita
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-5">Aún no tienes citas agendadas.</p>
              <button
                onClick={onNewAppointment}
                className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 text-sm"
              >
                <CalendarPlus className="h-4 w-4" />
                Agendar mi primera cita
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Sin resultados para "{query}".</p>
          ) : (
            <>
              <div className="space-y-3">
                {pagination.paginated.map(c => {
                  const { mes, dia } = parseFechaBloque(c.fecha)
                  const estadoLower   = c.appointmentStatus?.nombre?.toLowerCase() ?? ''
                  const esCancelable  = estadoLower.includes('pend') || estadoLower.includes('confirmada')
                  const puedeCancelar = esCancelable && canCancelCita(c.fecha, c.hora)
                  return (
                    <div key={c.id_cita}
                      className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-3 flex flex-col items-center min-w-[56px] shrink-0">
                          <span className="text-[10px] uppercase font-bold text-secondary/60 tracking-wider">{mes}</span>
                          <span className="text-2xl font-bold text-secondary leading-none">{dia}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">Cita #{c.id_cita}</p>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {c.hora?.slice(0, 5)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${estadoBadgeClasses(c.appointmentStatus?.nombre)}`}>
                          {c.appointmentStatus?.nombre ?? 'Sin estado'}
                        </span>
                        {esCancelable && !puedeCancelar && (
                          <span className="text-muted-foreground text-xs italic" title="Solo se puede cancelar hasta 6 horas antes de la cita">
                            No cancelable (faltan &lt;6h)
                          </span>
                        )}
                        {puedeCancelar && (
                          <AlertDialog onOpenChange={(open) => { if (!open) setCancelMotivo('') }}>
                            <AlertDialogTrigger asChild>
                              <button disabled={cancelingId === c.id_cita}
                                className="text-destructive text-xs font-medium hover:underline disabled:opacity-50 transition-all">
                                {cancelingId === c.id_cita ? 'Cancelando...' : 'Cancelar'}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card text-card-foreground border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-serif text-secondary">¿Cancelar esta cita?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  La cita del {parseFechaBloque(c.fecha).dia} de {parseFechaBloque(c.fecha).mes} a las {c.hora?.slice(0, 5)} será cancelada. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div>
                                <label className={labelCls} htmlFor={`cancel-motivo-${c.id_cita}`}>
                                  Motivo{' '}
                                  <span className="text-muted-foreground font-normal normal-case tracking-normal">(opcional)</span>
                                </label>
                                <textarea id={`cancel-motivo-${c.id_cita}`} value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)}
                                  placeholder="Cuéntanos por qué cancelas, nos ayuda a mejorar..."
                                  rows={3} maxLength={500} className={`${inputCls} resize-none`} />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border text-foreground">Volver</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground"
                                  onClick={async () => {
                                    const motivo = cancelMotivo
                                    setCancelingId(c.id_cita)
                                    try { await withToast(onCancelAppointment(c.id_cita, motivo), 'Cita cancelada') }
                                    finally { setCancelingId(null); setCancelMotivo('') }
                                  }}>
                                  Sí, cancelar cita
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Pagination
                page={pagination.page} totalPages={pagination.totalPages}
                total={pagination.total} pageSize={pagination.pageSize}
                onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
              />
            </>
          )}
        </div>

        <button type="button" onClick={onClose}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors py-2 text-center w-full">
          Cerrar
        </button>
      </m.div>
    </m.div>
  )
}