import { useState } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { useRecovery } from '../hooks/useRecovery'
import { AuthMinimalHeader } from './AuthMinimalHeader'
import { RecoverySuccess } from './RecoverySuccess'
import { RecoveryFormFields } from './RecoveryFormFields'

const EASE = [0.22, 1, 0.36, 1] as const

export function RecoveryPage() {
  const { onSubmit, isLoading, error: hookError } = useRecovery()
  const [correo,     setCorreo]     = useState('')
  const [localError, setLocalError] = useState('')
  const [success,    setSuccess]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (!correo.trim()) { setLocalError('Campo requerido'); return }
    try {
      await onSubmit(correo)
      setSuccess(true)
    } catch { /* hookError lo muestra */ }
  }

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
                <RecoverySuccess correo={correo} />
              ) : (
                <m.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <RecoveryFormFields
                    correo={correo} onCorreoChange={v => { setCorreo(v); if (localError) setLocalError('') }}
                    localError={localError}
                    hookError={hookError}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                  />
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
