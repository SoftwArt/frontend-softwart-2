import { Link } from 'react-router-dom'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { useResetPasswordFlow } from '../hooks/useResetPasswordFlow'
import { AuthMinimalHeader } from './AuthMinimalHeader'
import { ResetPasswordSuccess } from './ResetPasswordSuccess'
import { ResetPasswordFormFields } from './ResetPasswordFormFields'
import { ResendLinkForm } from './ResendLinkForm'

const EASE = [0.22, 1, 0.36, 1] as const

export function ResetPasswordPage() {
  const {
    token, isLoading, error, success,
    nuevaClave, setNuevaClave,
    confirmarClave, setConfirmarClave,
    showNueva, setShowNueva,
    showConfirmar, setShowConfirmar,
    errorNueva, errorConfirmar,
    tokenInvalido, checkingToken,
    correoReenvio, setCorreoReenvio,
    isResending, resendError,
    showFields, showResend,
    canSubmit,
    handleSubmit, handleReenviar,
  } = useResetPasswordFlow()

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen flex flex-col bg-[#002926] selection:bg-[#805533]/30">

      <AuthMinimalHeader />

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

                <ResetPasswordSuccess />

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

                  <form onSubmit={handleSubmit} className="space-y-8" noValidate>

                    {/* Aviso si se llega sin token (link inválido/incompleto) */}
                    {!token && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">
                          Enlace inválido o incompleto. Abre el botón desde tu correo o{' '}
                          <Link to="/recover" className="underline font-medium">solicita uno nuevo</Link>.
                        </p>
                      </div>
                    )}

                    {/* Aviso proactivo: el token ya expiró o nunca existió (link mal copiado,
                        ya usado, etc.) — se detecta al cargar la página, no hay que esperar
                        a que el usuario le dé submit para descubrirlo. */}
                    {token && !checkingToken && tokenInvalido && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">
                          Este enlace ya no es válido o expiró. Pide uno nuevo con tu correo en
                          "¿No recibiste el enlace?" más abajo.
                        </p>
                      </div>
                    )}

                    {/* Contraseñas — solo si hay token: sin él son campos inútiles que
                        solo inflan la altura de la card sin aportar nada */}
                    {showFields && (
                      <ResetPasswordFormFields
                        nuevaClave={nuevaClave} onNuevaClaveChange={setNuevaClave}
                        confirmarClave={confirmarClave} onConfirmarClaveChange={setConfirmarClave}
                        showNueva={showNueva} onToggleShowNueva={() => setShowNueva(v => !v)}
                        showConfirmar={showConfirmar} onToggleShowConfirmar={() => setShowConfirmar(v => !v)}
                        errorNueva={errorNueva}
                        errorConfirmar={errorConfirmar}
                        submitError={error}
                        canSubmit={canSubmit}
                        isLoading={isLoading}
                      />
                    )}

                    {/* Reenviar enlace — solo existe cuando no hay campos de contraseña
                        que mostrar (sin token o vencido). Nunca conviven ambos bloques,
                        así la card no crece más de lo que un estado a la vez necesita. */}
                    {showResend && (
                      <ResendLinkForm
                        correo={correoReenvio} onCorreoChange={setCorreoReenvio}
                        isResending={isResending}
                        resendError={resendError}
                        onResend={handleReenviar}
                      />
                    )}

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
