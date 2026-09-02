import { Link } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useRegisterForm } from '../hooks/useRegisterForm'
import { Button } from '@/src/shared/components/ui/button'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { RegisterHeader } from './RegisterHeader'
import { RegisterFormFields } from './RegisterFormFields'
import { RegisterLegalAcceptance } from './RegisterLegalAcceptance'

const EASE = [0.22, 1, 0.36, 1] as const

export function RegisterPage() {
  const {
    redirect, isLoading, error,
    tipoDocumento, setTipoDocumento,
    documento, setDocumento,
    nombre, setNombre,
    correo, setCorreo,
    telefono, setTelefono,
    clave, setClave,
    confirmarClave, setConfirmarClave,
    showClave, setShowClave,
    showConfirmar, setShowConfirmar,
    acceptToS, setAcceptToS,
    acceptPrivacy, setAcceptPrivacy,
    legalModal, setLegalModal,
    submitted,
    documentoError,
    showNombreError, showNombreMaxAviso,
    showCorreoError, showTelefonoError,
    showMismatchError, passwordValid,
    showAcceptTosError, showAcceptPrivacyError,
    handleSubmit,
  } = useRegisterForm()

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen flex flex-col bg-[#002926] selection:bg-[#805533]/30">

      <RegisterHeader />

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

            <RegisterFormFields
              tipoDocumento={tipoDocumento} onTipoDocumentoChange={setTipoDocumento}
              documento={documento} onDocumentoChange={setDocumento}
              nombre={nombre} onNombreChange={setNombre}
              correo={correo} onCorreoChange={setCorreo}
              telefono={telefono} onTelefonoChange={setTelefono}
              clave={clave} onClaveChange={setClave}
              confirmarClave={confirmarClave} onConfirmarClaveChange={setConfirmarClave}
              showClave={showClave} onToggleShowClave={() => setShowClave(v => !v)}
              showConfirmar={showConfirmar} onToggleShowConfirmar={() => setShowConfirmar(v => !v)}
              submitted={submitted}
              documentoError={documentoError}
              showNombreError={showNombreError} showNombreMaxAviso={showNombreMaxAviso}
              showCorreoError={showCorreoError} showTelefonoError={showTelefonoError}
              showMismatchError={showMismatchError} passwordValid={passwordValid}
            />

            <RegisterLegalAcceptance
              acceptToS={acceptToS} onAcceptToSChange={setAcceptToS}
              acceptPrivacy={acceptPrivacy} onAcceptPrivacyChange={setAcceptPrivacy}
              legalModal={legalModal} onLegalModalChange={setLegalModal}
              showAcceptTosError={showAcceptTosError}
              showAcceptPrivacyError={showAcceptPrivacyError}
            />

            {/* CTA */}
            {/* El error de submit (ej. "correo ya registrado") no pertenece a ningún
                campo puntual y ya llegó del backend después de enviar el formulario —
                mismo patrón que LoginPage: tooltip flotante anclado acá, no un toast,
                para no romper el estándar de "nunca empuja el layout" del resto del form. */}
            <div className="pt-1">
              <FieldErrorTooltip error={error} side="top">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#805533] hover:bg-[#a6714a] text-white font-serif italic text-xl py-3.5 rounded-lg shadow-lg shadow-[#805533]/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                </Button>
              </FieldErrorTooltip>
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
