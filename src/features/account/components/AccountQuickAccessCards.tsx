// src/features/account/components/AccountQuickAccessCards.tsx
import { m } from 'framer-motion'
import { ArrowRight, CalendarDays, Wrench } from 'lucide-react'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { formatDate } from '@/src/shared/lib/formatDate'
import type { Cita } from '../types'

const EASE = [0.22, 1, 0.36, 1] as const

interface AccountQuickAccessCardsProps {
  isLoading: boolean
  proximaCita: Cita | null | undefined
  serviciosActivos: number
  onOpenAppointmentPrimary: () => void
  onOpenAppointmentsModal: () => void
  onOpenServicesModal: () => void
}

export function AccountQuickAccessCards({
  isLoading, proximaCita, serviciosActivos,
  onOpenAppointmentPrimary, onOpenAppointmentsModal, onOpenServicesModal,
}: AccountQuickAccessCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <m.div
        onClick={onOpenAppointmentPrimary}
        className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <button
            onClick={e => { e.stopPropagation(); onOpenAppointmentsModal() }}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0 mt-1"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Próxima cita</p>
          {isLoading ? (
            <Skeleton className="h-5 w-36" />
          ) : proximaCita ? (
            <p className="font-semibold text-foreground">
              {formatDate(proximaCita.fecha)} · {proximaCita.hora?.slice(0, 5)}
            </p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Sin citas próximas</p>
              <p className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                Agendar cita <ArrowRight className="h-3 w-3" />
              </p>
            </div>
          )}
        </div>
      </m.div>

      <m.button
        onClick={onOpenServicesModal}
        className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:shadow-sm transition-all group"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.07, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <Wrench className="h-5 w-5 text-secondary" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Servicios activos</p>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : serviciosActivos > 0 ? (
            <p className="font-semibold text-foreground">
              {serviciosActivos} {serviciosActivos === 1 ? 'servicio' : 'servicios'} en curso
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin servicios activos</p>
          )}
        </div>
      </m.button>

    </div>
  )
}
