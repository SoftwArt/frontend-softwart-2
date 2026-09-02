// src/features/auth/components/LoginFormFields.tsx
import { Link } from 'react-router-dom'
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { Input }    from '@/src/shared/components/ui/input'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

const labelCls =
  'block text-xs font-medium capitalize tracking-widest text-foreground/70'
const fieldCls =
  'bg-[#f5f3ef] border-0 border-b-2 border-transparent ' +
  'focus-visible:border-[#002926] focus-visible:ring-0 focus-visible:ring-offset-0 ' +
  'rounded-lg py-4 h-auto transition-all text-foreground placeholder:text-muted-foreground/50'

interface LoginFormFieldsProps {
  correo: string; onCorreoChange: (v: string) => void
  password: string; onPasswordChange: (v: string) => void
  showPass: boolean; onToggleShowPass: () => void
  remember: boolean; onRememberChange: (v: boolean) => void
}

export function LoginFormFields({
  correo, onCorreoChange,
  password, onPasswordChange,
  showPass, onToggleShowPass,
  remember, onRememberChange,
}: LoginFormFieldsProps) {
  return (
    <>
      {/* Correo */}
      <div className="space-y-2">
        <label className={labelCls} htmlFor="correo">Correo electrónico</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
          <Input
            id="correo" type="email" autoComplete="email"
            value={correo} onChange={e => onCorreoChange(e.target.value)}
            placeholder="ejemplo@artecafe.com" required
            className={`${fieldCls} pl-12`}
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className={labelCls} htmlFor="password">Contraseña</label>
          <Link
            to="/recover"
            className="text-xs text-[#805533] hover:text-[#a6714a] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
          <Input
            id="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            value={password} onChange={e => onPasswordChange(e.target.value)}
            placeholder="••••••••" required
            className={`${fieldCls} pl-12 pr-12`}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            onClick={onToggleShowPass}
            title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Recordarme */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={v => onRememberChange(v === true)}
        />
        <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
          Recordarme en este dispositivo
        </label>
      </div>
    </>
  )
}
