// src/features/auth/components/RegisterFormFields.tsx
import { Input } from '@/src/shared/components/ui/input'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { TELEFONO_ERROR, TELEFONO_MAX_LENGTH, onlyDigits } from '@/src/shared/lib/validateTelefono'
import { EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import { NOMBRE_MIN_ERROR, NOMBRE_MAX_ERROR, NOMBRE_MAX_LENGTH, stripDigits } from '@/src/shared/lib/validateNombre'
import { Eye, EyeOff } from 'lucide-react'

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' },
]

const REQUIRED_ERROR = 'Este campo es obligatorio.'

const fieldCls =
  'w-full bg-[#f5f3ef] border-0 border-b border-border rounded-none rounded-t-lg ' +
  'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#002926] ' +
  'py-2.5 px-4 !h-10 text-foreground placeholder:text-muted-foreground/50 transition-colors'
const labelCls = 'block text-xs font-medium capitalize tracking-widest text-foreground/70 mb-1'

interface RegisterFormFieldsProps {
  tipoDocumento: string; onTipoDocumentoChange: (v: string) => void
  documento: string; onDocumentoChange: (v: string) => void
  nombre: string; onNombreChange: (v: string) => void
  correo: string; onCorreoChange: (v: string) => void
  telefono: string; onTelefonoChange: (v: string) => void
  clave: string; onClaveChange: (v: string) => void
  confirmarClave: string; onConfirmarClaveChange: (v: string) => void
  showClave: boolean; onToggleShowClave: () => void
  showConfirmar: boolean; onToggleShowConfirmar: () => void
  submitted: boolean
  documentoError: string | null
  showNombreError: boolean; showNombreMaxAviso: boolean
  showCorreoError: boolean; showTelefonoError: boolean
  showMismatchError: boolean; passwordValid: boolean
}

export function RegisterFormFields({
  tipoDocumento, onTipoDocumentoChange,
  documento, onDocumentoChange,
  nombre, onNombreChange,
  correo, onCorreoChange,
  telefono, onTelefonoChange,
  clave, onClaveChange,
  confirmarClave, onConfirmarClaveChange,
  showClave, onToggleShowClave,
  showConfirmar, onToggleShowConfirmar,
  submitted, documentoError,
  showNombreError, showNombreMaxAviso,
  showCorreoError, showTelefonoError,
  showMismatchError, passwordValid,
}: RegisterFormFieldsProps) {
  return (
    <>
      {/* Tipo + Número de documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="reg-tipo-doc">Tipo de documento <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={submitted && !tipoDocumento ? REQUIRED_ERROR : null}>
            <Select value={tipoDocumento} onValueChange={onTipoDocumentoChange}>
              <SelectTrigger id="reg-tipo-doc" className={fieldCls}>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldErrorTooltip>
        </div>
        <div>
          <label className={labelCls} htmlFor="documento">Número de documento <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={documento.length > 0 ? documentoError : (submitted ? REQUIRED_ERROR : null)}>
            <Input
              id="documento" type="text"
              value={documento} onChange={e => onDocumentoChange(e.target.value)}
              placeholder="Ej: 1023456789" required
              className={fieldCls}
            />
          </FieldErrorTooltip>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className={labelCls} htmlFor="nombre">Nombre completo <span className="text-destructive">*</span></label>
        <FieldErrorTooltip error={
          showNombreError ? NOMBRE_MIN_ERROR :
          showNombreMaxAviso ? NOMBRE_MAX_ERROR :
          (submitted && !nombre ? REQUIRED_ERROR : null)
        }>
          <Input
            id="nombre" type="text"
            value={nombre} onChange={e => onNombreChange(stripDigits(e.target.value))}
            placeholder="Su nombre como aparece en el documento" required
            maxLength={NOMBRE_MAX_LENGTH}
            className={fieldCls}
          />
        </FieldErrorTooltip>
      </div>

      {/* Correo + Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="correo">Correo electrónico <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={showCorreoError ? EMAIL_ERROR : (submitted && !correo ? REQUIRED_ERROR : null)}>
            <Input
              id="correo" type="email"
              value={correo} onChange={e => onCorreoChange(e.target.value)}
              placeholder="nombre@ejemplo.com" required
              className={fieldCls}
            />
          </FieldErrorTooltip>
        </div>
        <div>
          <label className={labelCls} htmlFor="telefono">Teléfono <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={showTelefonoError ? TELEFONO_ERROR : (submitted && !telefono ? REQUIRED_ERROR : null)}>
            <Input
              id="telefono" type="tel"
              value={telefono} onChange={e => onTelefonoChange(onlyDigits(e.target.value))}
              placeholder="300 000 0000" required
              maxLength={TELEFONO_MAX_LENGTH}
              className={fieldCls}
            />
          </FieldErrorTooltip>
        </div>
      </div>

      {/* Contraseña + Confirmar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="clave">Contraseña <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={submitted && !clave ? REQUIRED_ERROR : (submitted && clave && !passwordValid ? 'La contraseña no cumple los requisitos.' : null)}>
            <div className="relative">
              <Input
                id="clave"
                type={showClave ? 'text' : 'password'}
                value={clave} onChange={e => onClaveChange(e.target.value)}
                placeholder="••••••••" required
                className={`${fieldCls} pr-10`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                onClick={onToggleShowClave}
                title={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldErrorTooltip>
        </div>
        <div>
          <label className={labelCls} htmlFor="confirmarClave">Confirmar contraseña <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={showMismatchError ? 'Las contraseñas no coinciden' : (submitted && !confirmarClave ? REQUIRED_ERROR : null)}>
            <div className="relative">
              <Input
                id="confirmarClave"
                type={showConfirmar ? 'text' : 'password'}
                value={confirmarClave} onChange={e => onConfirmarClaveChange(e.target.value)}
                placeholder="••••••••" required
                className={`${fieldCls} pr-10`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
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

      <PasswordChecklist password={clave} confirmPassword={confirmarClave} />
    </>
  )
}
