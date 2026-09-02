import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useLogin, getSavedCredentials } from '../hooks/useLogin'
import { Button } from '@/src/shared/components/ui/button'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { CalendarPlus } from 'lucide-react'
import { LoginHeader } from './LoginHeader'
import { LoginFormFields } from './LoginFormFields'

const EASE = [0.22, 1, 0.36, 1] as const

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectCita   = searchParams.get('redirect') === 'cita'
  const { login, isLoading, error, clearError } = useLogin(redirectCita)

  const [correo,   setCorreo]   = useState(() => getSavedCredentials()?.correo   ?? '')
  const [password, setPassword] = useState(() => getSavedCredentials()?.password ?? '')
  const [remember, setRemember] = useState(() => getSavedCredentials() !== null)
  const [showPass, setShowPass] = useState(false)
  // El botón queda siempre habilitado (accesibilidad: un botón disabled no
  // explica por qué al foco/lector de pantalla) — si faltan campos, se
  // muestra el mismo tooltip flotante indicándolo, en vez de bloquear el click.
  // "submitted" solo dispara el aviso tras un intento; se recalcula en cada
  // render contra los valores actuales, así desaparece solo al completarse.
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!correo || !password) return
    await login(correo, password, remember)
  }

  const submitError = error ?? (submitted && (!correo || !password)
    ? 'Completa el correo y la contraseña para continuar'
    : null)

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen flex flex-col bg-[#002926] selection:bg-[#805533]/30">

      <LoginHeader />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">

        {/* Blobs decorativos de fondo */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#805533] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#06403d] blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg">

          {/* Card */}
          <m.div
            className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/10"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          >

            <div className="text-center mb-10">
              <h1 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#002926] tracking-tight mb-2">
                Bienvenido
              </h1>
              <p className="text-muted-foreground text-sm">
                Ingrese sus credenciales para acceder.
              </p>
            </div>

            {/* Banner contextual — solo cuando viene desde "Agenda tu cita" */}
            {redirectCita && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <CalendarPlus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Inicia sesión para agendar tu cita.{' '}
                  <Link to="/register" className="text-[#805533] font-medium hover:underline">
                    ¿No tienes cuenta?
                  </Link>
                </p>
              </div>
            )}

            {/* noValidate: sin esto, el `required` de los inputs dispara la validación
                nativa del navegador ANTES del evento submit y el submitError de abajo
                (mensaje anti-enumeración propio) nunca llega a mostrarse — mismo patrón
                que RegisterPage/ResetPasswordPage, que ya usan noValidate + validación propia. */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <LoginFormFields
                correo={correo} onCorreoChange={v => { setCorreo(v); clearError() }}
                password={password} onPasswordChange={v => { setPassword(v); clearError() }}
                showPass={showPass} onToggleShowPass={() => setShowPass(v => !v)}
                remember={remember} onRememberChange={setRemember}
              />

              {/* CTA */}
              {/* Mensaje genérico a propósito (no se atribuye a correo o clave): evita que un
                  atacante infiera cuál de los dos falló (anti-enumeración, OWASP A01). Se ancla
                  acá, neutral entre ambos campos, en vez de en contraseña, para no insinuar
                  visualmente cuál de los dos fue el que falló. Tooltip flotante, no <p>, para no
                  empujar el resto del formulario. */}
              <div className="pt-2">
                <FieldErrorTooltip error={submitError} side="top">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-6 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
                  </Button>
                </FieldErrorTooltip>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link
                  to={redirectCita ? '/registro?redirect=appointment' : '/register'}
                  className="text-[#002926] font-semibold hover:underline decoration-[#805533] underline-offset-4 ml-1 transition-all"
                >
                  Regístrate
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
