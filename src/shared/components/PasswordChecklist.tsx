// ================================================================
// src/shared/components/PasswordChecklist.tsx
//
// Checklist visual de fuerza de contraseña. Presentacional: toda la
// lógica vive en validatePassword (shared/lib/passwordValidation).
// ================================================================
import { Check, X } from 'lucide-react'
import { validatePassword } from '@/src/shared/lib/passwordValidation'

interface Props {
  password: string
  confirmPassword?: string
  className?: string
}

export function PasswordChecklist({ password, confirmPassword, className = '' }: Props) {
  if (!password) return null
  const { checks: baseChecks } = validatePassword(password)
  // Se agrega solo si el caller pasa confirmPassword (forms con campo de
  // confirmación) — omitido no aparece, ej. UsersPage que solo pide una clave.
  const checks = confirmPassword === undefined
    ? baseChecks
    : [...baseChecks, { label: 'Las contraseñas coinciden', ok: confirmPassword.length > 0 && confirmPassword === password }]

  return (
    <ul className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ${className}`}>
      {checks.map(c => (
        <li
          key={c.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            c.ok ? 'text-emerald-600' : 'text-muted-foreground/70'
          }`}
        >
          {c.ok
            ? <Check className="h-3.5 w-3.5 shrink-0" />
            : <X     className="h-3.5 w-3.5 shrink-0" />}
          {c.label}
        </li>
      ))}
    </ul>
  )
}
