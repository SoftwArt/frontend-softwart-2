import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { useResetPassword } from '../hooks/useResetPassword'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { Button } from '@/src/shared/components/ui/button'
import { Input }  from '@/src/shared/components/ui/input'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { validatePassword } from '@/src/shared/lib/passwordValidation'
import { ArrowLeft, Eye, EyeOff, Lock, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const labelCls = 'block text-xs font-medium capitalize tracking-widest text-foreground/70 mb-2'

// Inputs de contraseña — mismo estilo que Login/Register (fondo suave, borde inferior, rounded-lg)
const fieldCls =
  'bg-[#f5f3ef] border-0 border-b-2 border-transparent ' +
  'focus-visible:border-[#002926] focus-visible:ring-0 focus-visible:ring-offset-0 ' +
  'rounded-lg py-4 h-auto transition-all text-foreground placeholder:text-muted-foreground/50'

export function ResetPasswordPage() {
  const { onSubmit, isLoading, error } = useResetPassword()

  // El token de recuperación viaja en el link del email: /reset?token=...
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [nuevaClave,     setNuevaClave]     = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [showNueva,      setShowNueva]      = useState(false)
  const [showConfirmar,  setShowConfirmar]  = useState(false)
  const [errorNueva,     setErrorNueva]     = useState('')
  const [errorConfirmar, setErrorConfirmar] = useState('')
  const [success,        setSuccess]        = useState(false)
  const [tokenExpired,   setTokenExpired]   = useState(false)
  const [checkingToken,  setCheckingToken]  = useState(!!token)

  // Reenviar enlace
  const [correoReenvio, setCorreoReenvio] = useState('')
  const [isResending,   setIsResending]   = useState(false)
  const [resendOk,      setResendOk]      = useState(false)
  const [resendError,   setResendError]   = useState('')

  const passwordsMatch = nuevaClave === confirmarClave
  const passwordValid  = validatePassword(nuevaClave).valid
  const canSubmit =
    token.trim() !== '' &&
    !tokenExpired &&
    nuevaClave.trim() !== '' &&
    confirmarClave.trim() !== '' &&
    passwordsMatch &&
    passwordValid &&
    !isLoading

  useEffect(() => {
    if (confirmarClave && !passwordsMatch) setErrorConfirmar('Las contraseñas no coinciden')
    else setErrorConfirmar('')
  }, [nuevaClave, confirmarClave, passwordsMatch])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => { window.location.href = '/login' }, 2000)
    return () => clearTimeout(t)
  }, [success])

  // Chequeo proactivo: si el link ya expiró, avisar de inmediato en vez de que
  // el usuario lo descubra recién al llenar el formulario y darle submit.
  useEffect(() => {
    if (!token) { setCheckingToken(false); return }
    let cancelled = false
    apiRequest<{ success: boolean; data: { valid: boolean; expired: boolean } }>(
      `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`
    )
      .then(res => { if (!cancelled) setTokenExpired(res.data.expired) })
      .catch(() => { /* si falla el chequeo, se deja que el submit lo valide igual */ })
      .finally(() => { if (!cancelled) setCheckingToken(false) })
    return () => { cancelled = true }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorNueva(''); setErrorConfirmar('')
    if (!nuevaClave.trim())     { setErrorNueva('Campo requerido'); return }
    const pwCheck = validatePassword(nuevaClave)
    if (!pwCheck.valid)         { setErrorNueva(pwCheck.firstError!); return }
    if (!confirmarClave.trim()) { setErrorConfirmar('Campo requerido'); return }
    if (!passwordsMatch)        { setErrorConfirmar('Las contraseñas no coinciden'); return }
    try {
      await onSubmit(token, nuevaClave)
      setSuccess(true)
    } catch { /* error lo muestra el hook */ }
  }

  const handleReenviar = async () => {
    if (!correoReenvio.trim()) return
    setIsResending(true)
    setResendError('')
    setResendOk(false)
    try {
      await apiRequest('/api/auth/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ correo: correoReenvio }),
      })
      setResendOk(true)
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Error al reenviar el enlace')
    } finally {
      setIsResending(false)
    }
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src="/softwart-logo.png" alt="SoftwArt" className="h-9 w-auto object-contain" />
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
      <main className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">

        {/* Blobs decorativos de fondo */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#805533] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#06403d] blur-[100px]" />
        </div>

        <div className="w-full max-w-md relative z-10">

          {/* Card */}
          <m.div
            className="bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-white/10"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          >
            <AnimatePresence mode="wait">
              {success ? (

                /* ── Estado: contraseña actualizada ── */
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

              ) : (

                /* ── Formulario ── */
                <m.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {/* Título */}
                  <h1 className="font-serif italic text-3xl md:text-4xl text-center text-[#002926] tracking-tight mb-4">
                    Nueva contraseña
                  </h1>
                  <p className="text-muted-foreground text-center text-sm mb-10 px-4 leading-relaxed">
                    Establece tu nueva clave de acceso.
                  </p>

                  {error && (
                    <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Aviso si se llega sin token (link inválido/incompleto) */}
                    {!token && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">
                          Enlace inválido o incompleto. Abre el botón desde tu correo o{' '}
                          <Link to="/recover" className="underline font-medium">solicita uno nuevo</Link>.
                        </p>
                      </div>
                    )}

                    {/* Aviso proactivo: el token existe pero ya expiró — se detecta al
                        cargar la página, no hay que esperar a que el usuario le dé submit */}
                    {token && !checkingToken && tokenExpired && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">
                          Este enlace ya expiró. Pide uno nuevo con tu correo en "¿No recibiste el enlace?"
                          más abajo.
                        </p>
                      </div>
                    )}

                    {/* Contraseñas */}
                    <div className="space-y-6">

                      <div>
                        <label className={labelCls} htmlFor="nueva-clave">Nueva contraseña</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
                          <Input
                            id="nueva-clave"
                            type={showNueva ? 'text' : 'password'}
                            value={nuevaClave}
                            onChange={e => { setNuevaClave(e.target.value); if (errorNueva) setErrorNueva('') }}
                            placeholder="••••••••"
                            className={`${fieldCls} pl-12 pr-12`}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            onClick={() => setShowNueva(v => !v)}
                            title={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            aria-label={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errorNueva && <p className="text-sm text-destructive mt-1">{errorNueva}</p>}
                        <PasswordChecklist password={nuevaClave} confirmPassword={confirmarClave} />
                      </div>

                      <div>
                        <label className={labelCls} htmlFor="confirmar-clave">Confirmar contraseña</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#002926] transition-colors" />
                          <Input
                            id="confirmar-clave"
                            type={showConfirmar ? 'text' : 'password'}
                            value={confirmarClave}
                            onChange={e => setConfirmarClave(e.target.value)}
                            placeholder="••••••••"
                            className={`${fieldCls} pl-12 pr-12`}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            onClick={() => setShowConfirmar(v => !v)}
                            title={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errorConfirmar && <p className="text-sm text-destructive mt-1">{errorConfirmar}</p>}
                      </div>

                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <Button
                        type="submit" disabled={!canSubmit}
                        className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-6 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98] gap-2"
                      >
                        {isLoading
                          ? 'Guardando...'
                          : <><LockKeyhole className="h-4 w-4" />Guardar nueva contraseña</>
                        }
                      </Button>
                    </div>

                    {/* Reenviar enlace */}
                    <div className="border-t border-border/30 pt-6 space-y-3">
                      <p className="text-xs text-muted-foreground text-center">¿No recibiste el enlace?</p>
                      {resendOk ? (
                        <p className="text-xs text-emerald-600 text-center">Enlace reenviado correctamente.</p>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Tu correo"
                            value={correoReenvio}
                            onChange={e => { setCorreoReenvio(e.target.value); if (resendError) setResendError('') }}
                            className="bg-[#f5f3ef] border-0 border-b border-border focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-3 text-sm rounded-none flex-1"
                          />
                          <Button
                            type="button"
                            disabled={isResending || !correoReenvio.trim()}
                            onClick={handleReenviar}
                            variant="outline"
                            className="text-xs px-3 h-9 border-[#805533] text-[#805533] hover:bg-[#805533] hover:text-white shrink-0"
                          >
                            {isResending ? 'Enviando...' : 'Reenviar'}
                          </Button>
                        </div>
                      )}
                      {resendError && <p className="text-xs text-destructive">{resendError}</p>}
                    </div>

                  </form>
                </m.div>

              )}
            </AnimatePresence>
          </m.div>

        </div>
      </main>

    </div>
    </LazyMotion>
  )
}
