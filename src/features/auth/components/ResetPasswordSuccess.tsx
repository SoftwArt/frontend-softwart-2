// src/features/auth/components/ResetPasswordSuccess.tsx
import { m } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

export function ResetPasswordSuccess() {
  return (
    <m.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="text-center space-y-5"
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">¡Contraseña actualizada!</h2>
        <p className="text-muted-foreground text-sm mt-2">Redirigiendo al inicio de sesión...</p>
      </div>
    </m.div>
  )
}
