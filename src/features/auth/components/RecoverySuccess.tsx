// src/features/auth/components/RecoverySuccess.tsx
import { m } from 'framer-motion'
import { MailCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

export function RecoverySuccess({ correo }: { correo: string }) {
  return (
    <m.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="text-center space-y-5"
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <MailCheck className="h-8 w-8 text-emerald-600" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">¡Solicitud enviada!</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Si el correo <span className="font-medium text-foreground">{correo}</span> está registrado,
          te llegará un enlace para restablecer tu contraseña. Expira en 15 minutos.
        </p>
      </div>
    </m.div>
  )
}
