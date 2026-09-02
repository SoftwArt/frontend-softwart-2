// src/features/auth/components/ResendLinkForm.tsx
import { Button } from '@/src/shared/components/ui/button'
import { Input }  from '@/src/shared/components/ui/input'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface ResendLinkFormProps {
  correo: string; onCorreoChange: (v: string) => void
  isResending: boolean
  resendError: string
  onResend: () => void
}

export function ResendLinkForm({ correo, onCorreoChange, isResending, resendError, onResend }: ResendLinkFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">¿No recibiste el enlace?</p>
      <div className="flex gap-2">
        <FieldErrorTooltip error={resendError}>
          <Input
            type="email"
            placeholder="Tu correo"
            value={correo}
            onChange={e => onCorreoChange(e.target.value)}
            className="bg-[#f5f3ef] border-0 border-b border-border focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-3 text-sm rounded-none flex-1"
          />
        </FieldErrorTooltip>
        <Button
          type="button"
          disabled={isResending || !correo.trim()}
          onClick={onResend}
          variant="outline"
          className="text-xs px-3 h-9 border-[#805533] text-[#805533] hover:bg-[#805533] hover:text-white shrink-0"
        >
          {isResending ? 'Enviando...' : 'Reenviar'}
        </Button>
      </div>
    </div>
  )
}
