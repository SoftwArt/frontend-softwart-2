// src/features/auth/components/RecoveryFormFields.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/src/shared/components/ui/button'
import { Input }  from '@/src/shared/components/ui/input'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { ArrowLeft, ArrowRight, LockKeyhole, Loader2 } from 'lucide-react'

const labelCls = 'block text-xs font-medium capitalize tracking-widest text-foreground/70 mb-2'
const fieldCls =
  'bg-[#f5f3ef] border-0 border-b border-border rounded-none ' +
  'focus-visible:ring-0 focus-visible:ring-offset-0 ' +
  'px-4 py-4 h-auto transition-all text-foreground placeholder:text-muted-foreground/50'

interface RecoveryFormFieldsProps {
  correo: string; onCorreoChange: (v: string) => void
  localError: string
  hookError: string | null
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function RecoveryFormFields({ correo, onCorreoChange, localError, hookError, isLoading, onSubmit }: RecoveryFormFieldsProps) {
  return (
    <>
      {/* Ícono */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#efeeea] flex items-center justify-center">
          <LockKeyhole className="h-7 w-7 text-[#805533]" />
        </div>
      </div>

      {/* Título */}
      <h1 className="font-serif italic text-3xl md:text-4xl text-center text-[#002926] tracking-tight mb-4">
        Recuperar contraseña
      </h1>
      <p className="text-muted-foreground text-center text-sm mb-10 px-4 leading-relaxed">
        Ingresa tu correo para enviarte un enlace de recuperación
      </p>

      <form onSubmit={onSubmit} className="space-y-8" noValidate>

        {/* Campo correo con subrayado animado */}
        <div className="relative group">
          <label className={labelCls} htmlFor="correo">Correo electrónico</label>
          <FieldErrorTooltip error={localError}>
            <Input
              id="correo" type="email"
              value={correo}
              onChange={e => onCorreoChange(e.target.value)}
              placeholder="ejemplo@artecafe.com" required
              className={fieldCls}
            />
          </FieldErrorTooltip>
          {/* Barra animada de focus */}
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#002926] transition-all duration-500 group-focus-within:w-full" />
        </div>

        {/* Error de submit (ya salió, ej. rate-limit) anclado al botón —
            mismo patrón que RegisterPage/LoginPage/ResetPasswordPage. */}
        <FieldErrorTooltip error={hookError} side="top">
        <Button
          type="submit" disabled={isLoading}
          className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-6 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98] gap-2"
        >
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
            : <>Enviar enlace <ArrowRight className="h-4 w-4" /></>
          }
        </Button>
        </FieldErrorTooltip>
      </form>

      <div className="mt-12 text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[#805533] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </>
  )
}
