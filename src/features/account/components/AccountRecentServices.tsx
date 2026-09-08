// src/features/account/components/AccountRecentServices.tsx
import { m } from 'framer-motion'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { formatDate } from '@/src/shared/lib/formatDate'
import { estadoServicioBadgeClasses } from '../utils'
import type { Servicio } from '../types'

const EASE = [0.22, 1, 0.36, 1] as const

interface AccountRecentServicesProps {
  isLoading: boolean
  hasServicios: boolean
  serviciosRecientes: Servicio[]
  onVerTodos: () => void
}

export function AccountRecentServices({ isLoading, hasServicios, serviciosRecientes, onVerTodos }: AccountRecentServicesProps) {
  return (
    <m.section
      className="md:col-span-2 bg-card border border-border rounded-xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.14, ease: EASE }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Servicios recientes</h2>
        </div>
        {hasServicios && (
          <button
            onClick={onVerTodos}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : serviciosRecientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no tienes servicios registrados.</p>
      ) : (
        <div className="space-y-3">
          {serviciosRecientes.map(s => (
            <div key={s.id_detalle} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{s.servicio}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(s.fecha)} · {formatCurrency(s.precio)}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${estadoServicioBadgeClasses(s.estado)}`}>
                {s.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </m.section>
  )
}
