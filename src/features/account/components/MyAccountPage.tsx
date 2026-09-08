// src/features/account/components/MyAccountPage.tsx
import { useEffect, useState } from 'react'
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAccount } from '../hooks/useAccount'
import { getAuthToken, getAuthRol } from '@/src/features/auth/utils'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { AccountHeader } from './AccountHeader'
import { AccountQuickAccessCards } from './AccountQuickAccessCards'
import { AccountRecentServices } from './AccountRecentServices'
import { AccountSidePanel } from './AccountSidePanel'
import { AccountFooter } from './AccountFooter'
import { AppointmentsModal } from './AppointmentsModal'
import { ServicesModal } from './ServicesModal'
import { ProfileModal } from './ProfileModal'
import { NewAppointmentModal } from './NewAppointmentModal'

export function MyAccountPage() {
  const [searchParams] = useSearchParams()

  const [showCitaForm,       setShowCitaForm]       = useState(false)
  const [showCitasModal,     setShowCitasModal]     = useState(false)
  const [showServiciosModal, setShowServiciosModal] = useState(false)
  const [showPerfilModal,    setShowPerfilModal]    = useState(false)

  const {
    perfil, citas, servicios, isLoading, error,
    primerNombre, proximaCita, serviciosActivos, serviciosRecientes,
    perfilNombre, setPerfilNombre, perfilTelefono, setPerfilTelefono,
    perfilCorreo, setPerfilCorreo, perfilErrors, isSavingPerfil, submitPerfil,
    claveActual, setClaveActual, claveNueva, setClaveNueva, claveConfirm, setClaveConfirm,
    isSavingClave, submitClave,
    citaFecha, citaHora, citaObs, setCitaObs,
    citaErrors, isAgendando, disponibilidad,
    onCitaFechaChange, onCitaHoraChange, submitCita, resetCitaForm,
    onCancelAppointment, isDeleting, onDeleteAccount, handleLogout,
  } = useAccount()

  const closeCitaForm = () => { setShowCitaForm(false); resetCitaForm() }

  useEffect(() => {
    if (searchParams.get('new-appointment') === 'true') setShowCitaForm(true)
  }, [searchParams])

  useEffect(() => {
    if (showCitaForm) onCitaFechaChange(citaFecha)
  }, [showCitaForm])

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!getAuthToken() || !getAuthRol()) return <Navigate to="/login" replace />
  if (getAuthRol() !== 'Cliente')       return <Navigate to="/"      replace />

  const handleSubmitCita = async (e: React.FormEvent) => {
    const ok = await submitCita(e)
    if (ok) closeCitaForm()
  }

  const initial = primerNombre ? primerNombre.charAt(0).toUpperCase() : '?'

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background flex flex-col">

        <AccountHeader initial={initial} nombre={perfil?.nombre} onLogout={handleLogout} />

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">

            <h1 className="font-serif text-3xl text-secondary mb-6">
              {isLoading ? <Skeleton className="h-9 w-56" /> : `Hola, ${primerNombre} 👋`}
            </h1>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive p-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">

              <AccountQuickAccessCards
                isLoading={isLoading}
                proximaCita={proximaCita}
                serviciosActivos={serviciosActivos}
                onOpenAppointmentPrimary={() => (proximaCita || isLoading) ? setShowCitasModal(true) : setShowCitaForm(true)}
                onOpenAppointmentsModal={() => setShowCitasModal(true)}
                onOpenServicesModal={() => setShowServiciosModal(true)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AccountRecentServices
                  isLoading={isLoading}
                  hasServicios={servicios.length > 0}
                  serviciosRecientes={serviciosRecientes}
                  onVerTodos={() => setShowServiciosModal(true)}
                />
                <AccountSidePanel
                  isLoading={isLoading}
                  correo={perfil?.correo}
                  telefono={perfil?.telefono}
                  onEditarDatos={() => setShowPerfilModal(true)}
                />
              </div>

            </div>
          </div>
        </main>

        <AccountFooter />

        {/* ── Modals ────────────────────────────────────────────────────── */}

        <AnimatePresence>
          {showCitasModal && (
            <AppointmentsModal
              appointments={citas}
              isLoading={isLoading}
              onClose={() => setShowCitasModal(false)}
              onNewAppointment={() => { setShowCitasModal(false); setShowCitaForm(true) }}
              onCancelAppointment={onCancelAppointment}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showServiciosModal && (
            <ServicesModal
              services={servicios}
              isLoading={isLoading}
              onClose={() => setShowServiciosModal(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPerfilModal && (
            <ProfileModal
              isLoading={isLoading}
              onClose={() => setShowPerfilModal(false)}
              name={perfilNombre}
              onNameChange={setPerfilNombre}
              phone={perfilTelefono}
              onPhoneChange={setPerfilTelefono}
              email={perfilCorreo}
              onEmailChange={setPerfilCorreo}
              errors={perfilErrors}
              isSavingProfile={isSavingPerfil}
              onSubmitProfile={submitPerfil}
              currentPassword={claveActual}
              onCurrentPasswordChange={setClaveActual}
              newPassword={claveNueva}
              onNewPasswordChange={setClaveNueva}
              confirmPassword={claveConfirm}
              onConfirmPasswordChange={setClaveConfirm}
              isSavingPassword={isSavingClave}
              onSubmitPassword={submitClave}
              isDeleting={isDeleting}
              onDeleteAccount={onDeleteAccount}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCitaForm && (
            <NewAppointmentModal
              date={citaFecha}
              time={citaHora}
              notes={citaObs}
              onNotesChange={setCitaObs}
              errors={citaErrors}
              isSubmitting={isAgendando}
              bookedSlots={disponibilidad}
              onDateChange={onCitaFechaChange}
              onTimeChange={onCitaHoraChange}
              onSubmit={handleSubmitCita}
              onClose={closeCitaForm}
            />
          )}
        </AnimatePresence>

      </div>
    </LazyMotion>
  )
}
