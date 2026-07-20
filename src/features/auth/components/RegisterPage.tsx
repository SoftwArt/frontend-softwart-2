import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { toast } from 'sonner'
import { useRegister } from '../hooks/useRegister'
import { Button }   from '@/src/shared/components/ui/button'
import { Input }    from '@/src/shared/components/ui/input'
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { LegalDocumentModal } from '@/src/shared/components/LegalDocumentModal'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import type { LegalDocTipo } from '@/src/shared/types/legal'
import { validatePassword } from '@/src/shared/lib/passwordValidation'
import { isTelefonoValid, onlyDigits, TELEFONO_ERROR } from '@/src/shared/lib/validateTelefono'
import { isEmailValid, EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import { isNombreLongitudValida, stripDigits, NOMBRE_MIN_ERROR } from '@/src/shared/lib/validateNombre'
import { validarDocumentoPorTipo } from '@/src/shared/lib/validateDocumento'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/src/shared/components/ui/select'

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' },
]

// Los errores de campo son tooltips flotantes (FieldErrorTooltip), no <p>
// en el flujo, así que ya no empujan el layout — el ajuste de tamaño que
// sigue es solo para entrar en 1366×768 sin scroll, deliberadamente leve
// (la primera pasada fue demasiado agresiva y acható el formulario).
const fieldCls =
  'w-full bg-[#f5f3ef] border-0 border-b border-border rounded-none rounded-t-lg ' +
  'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#002926] ' +
  'py-2.5 px-4 !h-10 text-foreground placeholder:text-muted-foreground/50 transition-colors'
const labelCls = 'block text-xs font-medium capitalize tracking-widest text-foreground/70 mb-1'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? undefined
  const { onSubmit, isLoading, error } = useRegister(redirect)

  const [tipoDocumento,  setTipoDocumento]  = useState('')
  const [documento,      setDocumento]      = useState('')
  const [nombre,         setNombre]         = useState('')
  const [correo,         setCorreo]         = useState('')
  const [telefono,       setTelefono]       = useState('')
  const [clave,          setClave]          = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [showClave,      setShowClave]      = useState(false)
  const [showConfirmar,  setShowConfirmar]  = useState(false)
  // Dos casillas separadas porque en BD son dos constancias independientes
  // (una fila en aceptacion_legal por documento — ADR-007) — el titular debe
  // aceptar cada una explícitamente, no un "acepto todo" genérico.
  const [acceptToS,      setAcceptToS]      = useState(false)
  const [acceptPrivacy,  setAcceptPrivacy]  = useState(false)
  const [legalModal,     setLegalModal]     = useState<LegalDocTipo | null>(null)
  const acceptTerms = acceptToS && acceptPrivacy

  const passwordsMatch    = clave === confirmarClave
  const showMismatchError = confirmarClave.length > 0 && !passwordsMatch
  const passwordValid     = validatePassword(clave).valid
  const telefonoValido    = telefono.length > 0 && isTelefonoValid(telefono)
  const showTelefonoError = telefono.length > 0 && !telefonoValido
  const nombreValido      = isNombreLongitudValida(nombre)
  const showNombreError   = nombre.length > 0 && !nombreValido
  const correoValido      = correo.length > 0 && isEmailValid(correo)
  const showCorreoError   = correo.length > 0 && !correoValido
  const documentoError    = validarDocumentoPorTipo(tipoDocumento, documento)
  const isFormValid =
    tipoDocumento && documento && !documentoError && nombreValido && correoValido &&
    telefonoValido && clave && confirmarClave && passwordsMatch && passwordValid && acceptTerms

  // El error de submit (ej. "correo ya registrado") no pertenece a ningún
  // campo puntual — se muestra como toast, no como texto en el flujo, por la
  // misma razón que los errores de campo son tooltips: nunca debe empujar el
  // formulario ni generar scroll.
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch || !passwordValid || !telefonoValido || !nombreValido || !correoValido || !acceptTerms || documentoError) return
    await onSubmit({ tipoDocumento, documento, nombre, correo, telefono, clave, acceptTerms })
  }

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen flex flex-col bg-[#002926] selection:bg-[#805533]/30">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <m.header
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/">
            <img src="/softwart-logo.png" alt="SoftwArt" className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <LogIn className="h-3.5 w-3.5" />
              Iniciar sesión
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </m.header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-6 relative overflow-hidden">

        {/* Blobs decorativos de fondo */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#805533] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#06403d] blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <m.div
          className="bg-white rounded-xl border border-white/10 p-6 sm:p-7 md:p-8 shadow-2xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
        >

          {/* Cabecera */}
          <div className="text-center mb-4">
            <h1 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#002926] tracking-tight mb-1">
              Crear cuenta
            </h1>
            <p className="text-muted-foreground text-sm">
              Únase a nuestra comunidad de artesanos y amantes del café.
            </p>
          </div>

          {/* noValidate: sin esto, el navegador muestra su propio globo nativo
              ("Escribe una parte después de '@.'...") para type="email"/
              required ANTES de que corra nuestro JS — duplica al
              FieldErrorTooltip de abajo con un estilo que no controlamos.
              La validación real sigue siendo la misma (showCorreoError, etc.),
              solo cambia quién la muestra. */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Tipo + Número de documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="reg-tipo-doc">Tipo de documento</label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger id="reg-tipo-doc" className={fieldCls}>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls} htmlFor="documento">Número de documento</label>
                <FieldErrorTooltip error={documento.length > 0 ? documentoError : null}>
                  <Input
                    id="documento" type="text"
                    value={documento} onChange={e => setDocumento(e.target.value)}
                    placeholder="Ej: 1023456789" required
                    className={fieldCls}
                  />
                </FieldErrorTooltip>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className={labelCls} htmlFor="nombre">Nombre completo</label>
              <FieldErrorTooltip error={showNombreError ? NOMBRE_MIN_ERROR : null}>
                <Input
                  id="nombre" type="text"
                  value={nombre} onChange={e => setNombre(stripDigits(e.target.value))}
                  placeholder="Su nombre como aparece en el documento" required
                  className={fieldCls}
                />
              </FieldErrorTooltip>
            </div>

            {/* Correo + Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="correo">Correo electrónico</label>
                <FieldErrorTooltip error={showCorreoError ? EMAIL_ERROR : null}>
                  <Input
                    id="correo" type="email"
                    value={correo} onChange={e => setCorreo(e.target.value)}
                    placeholder="nombre@ejemplo.com" required
                    className={fieldCls}
                  />
                </FieldErrorTooltip>
              </div>
              <div>
                <label className={labelCls} htmlFor="telefono">Teléfono <span className="text-destructive">*</span></label>
                <FieldErrorTooltip error={showTelefonoError ? TELEFONO_ERROR : null}>
                  <Input
                    id="telefono" type="tel"
                    value={telefono} onChange={e => setTelefono(onlyDigits(e.target.value))}
                    placeholder="300 000 0000" required
                    className={fieldCls}
                  />
                </FieldErrorTooltip>
              </div>
            </div>

            {/* Contraseña + Confirmar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="clave">Contraseña</label>
                <div className="relative">
                  <Input
                    id="clave"
                    type={showClave ? 'text' : 'password'}
                    value={clave} onChange={e => setClave(e.target.value)}
                    placeholder="••••••••" required
                    className={`${fieldCls} pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    onClick={() => setShowClave(v => !v)}
                    title={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="confirmarClave">Confirmar contraseña</label>
                <FieldErrorTooltip error={showMismatchError ? 'Las contraseñas no coinciden' : null}>
                  <div className="relative">
                    <Input
                      id="confirmarClave"
                      type={showConfirmar ? 'text' : 'password'}
                      value={confirmarClave} onChange={e => setConfirmarClave(e.target.value)}
                      placeholder="••••••••" required
                      className={`${fieldCls} pr-10`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      onClick={() => setShowConfirmar(v => !v)}
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

            {/* Términos — dos casillas, una por documento (ver aceptacion_legal) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-tos"
                  checked={acceptToS}
                  onCheckedChange={v => setAcceptToS(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="accept-tos" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  He leído y acepto los{' '}
                  <span
                    className="text-foreground font-semibold underline underline-offset-2 cursor-pointer hover:text-primary"
                    onClick={e => { e.preventDefault(); setLegalModal('terminos-servicio') }}
                  >
                    Términos de Servicio
                  </span>
                  .
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={v => setAcceptPrivacy(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="accept-privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  He leído y autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <span
                    className="text-foreground font-semibold underline underline-offset-2 cursor-pointer hover:text-primary"
                    onClick={e => { e.preventDefault(); setLegalModal('politica-privacidad') }}
                  >
                    Política de Privacidad
                  </span>
                  .
                </label>
              </div>
            </div>

            <LegalDocumentModal
              tipo={legalModal}
              open={legalModal !== null}
              onOpenChange={v => { if (!v) setLegalModal(null) }}
              onAccept={() => {
                if (legalModal === 'terminos-servicio') setAcceptToS(true)
                if (legalModal === 'politica-privacidad') setAcceptPrivacy(true)
              }}
            />

            {/* CTA */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-3.5 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </div>
          </form>

          {/* Enlace login */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className="text-[#002926] font-semibold ml-1 hover:underline decoration-[#805533] underline-offset-4 transition-all"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </m.div>
        </div>
      </main>

    </div>
    </LazyMotion>
  )
}
