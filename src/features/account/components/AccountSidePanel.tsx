// src/features/account/components/AccountSidePanel.tsx
// Columna derecha de MyAccountPage: tarjeta "Mi cuenta" (dinámica) + "Contacto" (estática).
// Van juntas a propósito — siempre se renderizan como par en la misma columna, un solo
// componente evita un wrapper extra sin responsabilidad propia.
import { m } from 'framer-motion'
import { ArrowRight, Clock, MapPin, MessageCircle, Phone, User } from 'lucide-react'
import { Skeleton } from '@/src/shared/components/ui/skeleton'

const EASE = [0.22, 1, 0.36, 1] as const

interface AccountSidePanelProps {
  isLoading: boolean
  correo: string | undefined
  telefono: string | null | undefined
  onEditarDatos: () => void
}

export function AccountSidePanel({ isLoading, correo, telefono, onEditarDatos }: AccountSidePanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <m.section
        className="bg-card border border-border rounded-xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.21, ease: EASE }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mi cuenta</h2>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><span className="text-foreground font-medium">{correo}</span></p>
            {telefono && <p>{telefono}</p>}
            <button
              onClick={onEditarDatos}
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
            >
              Editar datos <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </m.section>

      <m.section
        className="bg-card border border-border rounded-xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28, ease: EASE }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contacto</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 items-start">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Cra. 74 #50, Los Colores – Estadio, Medellín</span>
          </div>
          <div className="flex gap-3 items-start">
            <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="text-muted-foreground">
              <p>Lun – Vie: 09:00 – 18:00</p>
              <p>Sábado: 10:00 – 14:00</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <a
              href="https://wa.me/573005414130"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              +57 300 5414130
            </a>
          </div>
        </div>
      </m.section>
    </div>
  )
}
