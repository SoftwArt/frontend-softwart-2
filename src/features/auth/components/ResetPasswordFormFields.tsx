// src/features/auth/components/ResetPasswordFormFields.tsx
import { Button } from '@/src/shared/components/ui/button'
import { Input }  from '@/src/shared/components/ui/input'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Eye, EyeOff, Lock, LockKeyhole } from 'lucide-react'

const labelCls = 'block text-xs font-medium capitalize tracking-widest text-foreground/70 mb-2'

// Inputs de contraseña — mismo estilo que Login/Register (fondo suave, borde inferior, rounded-lg)
const fieldCls =
  'bg-[#f5f3ef] border-0 border-b-2 border-transparent ' +
  'focus-visible:border-[#002926] focus-visible:ring-0 focus-visible:ring-offset-0 ' +
  'rounded-lg py-4 h-auto transition-all text-foreground placeholder:text-muted-foreground/50'

interface ResetPasswordFormFieldsProps {
  nuevaClave: string; onNuevaClaveChange: (v: string) => void
  confirmarClave: string; onConfirmarClaveChange: (v: string) => void
  showNueva: boolean; onToggleShowNueva: () => void
  showConfirmar: boolean; onToggleShowConfirmar: () => void
  errorNueva: string
  errorConfirmar: string
  submitError: string | null
  canSubmit: boolean
  isLoading: boolean
}

export function ResetPasswordFormFields({
  nuevaClave, onNuevaClaveChange,
  confirmarClave, onConfirmarClaveChange,
  showNueva, onToggleShowNueva,
  showConfirmar, onToggleShowConfirmar,
  errorNueva, errorConfirmar, submitError, canSubmit, isLoading,
}: ResetPasswordFormFieldsProps) {
  return (
    <>
      <div className="space-y-6">
        <div>
          <label className={labelCls} htmlFor="nueva-clave">Nueva contraseña</label>
          <FieldErrorTooltip error={errorNueva}>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
              <Input
                id="nueva-clave"
                type={showNueva ? 'text' : 'password'}
                value={nuevaClave}
                onChange={e => onNuevaClaveChange(e.target.value)}
                placeholder="••••••••"
                className={`${fieldCls} pl-12 pr-12`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                onClick={onToggleShowNueva}
                title={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldErrorTooltip>
          <PasswordChecklist password={nuevaClave} confirmPassword={confirmarClave} />
        </div>

        <div>
          <label className={labelCls} htmlFor="confirmar-clave">Confirmar contraseña</label>
          <FieldErrorTooltip error={errorConfirmar}>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
              <Input
                id="confirmar-clave"
                type={showConfirmar ? 'text' : 'password'}
                value={confirmarClave}
                onChange={e => onConfirmarClaveChange(e.target.value)}
                placeholder="••••••••"
                className={`${fieldCls} pl-12 pr-12`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                onClick={onToggleShowConfirmar}
                title={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldErrorTooltip>
        </div>
      </div>

      {/* Submit — el error de un submit que ya salió (token inválido/expirado
          reportado por el backend) va anclado acá, mismo patrón que
          RegisterPage/LoginPage: tooltip flotante, no un banner que empuje el layout. */}
      <div className="pt-2">
        <FieldErrorTooltip error={submitError} side="top">
          <Button
            type="submit" disabled={!canSubmit}
            className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-6 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98] gap-2"
          >
            {isLoading
              ? 'Guardando...'
              : <><LockKeyhole className="h-4 w-4" />Guardar nueva contraseña</>
            }
          </Button>
        </FieldErrorTooltip>
      </div>
    </>
  )
}
