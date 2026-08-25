// src/features/account/components/MyAccountPage.tsx
import { useEffect, useState } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAccount } from '../hooks/useAccount'
import { estadoServicioBadgeClasses } from '../utils'
import { getAuthToken, getAuthRol } from '@/src/features/auth/utils'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { formatDate } from '@/src/shared/lib/formatDate'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu'
import {
  CalendarDays, LogOut, User, Wrench, ChevronDown, Clock,
  ClipboardList, ArrowRight, MapPin, MessageCircle, Phone,
} from 'lucide-react'
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

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0">
          <img src="/softwart-logo.png" alt="SoftwArt" className="h-8 w-8 object-contain" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                <div className="h-7 w-7 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-secondary">{initial}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-foreground leading-tight truncate max-w-[160px]">{perfil?.nombre ?? ''}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Cliente</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-foreground truncate">{perfil?.nombre ?? ''}</p>
                <p className="text-[10px] text-muted-foreground">Cliente</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2 shrink-0" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ── Content ───────────────────────────────────────────────────── */}
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

              {/* Chips de acceso rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <m.div
                  onClick={() => proximaCita || isLoading ? setShowCitasModal(true) : setShowCitaForm(true)}
                  className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setShowCitasModal(true) }}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0 mt-1"
                    >
                      Ver todos <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Próxima cita</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-36" />
                    ) : proximaCita ? (
                      <p className="font-semibold text-foreground">
                        {formatDate(proximaCita.fecha)} · {proximaCita.hora?.slice(0, 5)}
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">Sin citas próximas</p>
                        <p className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                          Agendar cita <ArrowRight className="h-3 w-3" />
                        </p>
                      </div>
                    )}
                  </div>
                </m.div>

                <m.button
                  onClick={() => setShowServiciosModal(true)}
                  className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:shadow-sm transition-all group"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Wrench className="h-5 w-5 text-secondary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Servicios activos</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-24" />
                    ) : serviciosActivos > 0 ? (
                      <p className="font-semibold text-foreground">
                        {serviciosActivos} {serviciosActivos === 1 ? 'servicio' : 'servicios'} en curso
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin servicios activos</p>
                    )}
                  </div>
                </m.button>

              </div>

              {/* Asymmetric grid: left 2/3 · right 1/3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT col-span-2: services area */}
                <m.section
                  className="md:col-span-2 bg-card border border-border rounded-xl p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Servicios recientes</h2>
                    </div>
                    {servicios.length > 0 && (
                      <button
                        onClick={() => setShowServiciosModal(true)}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                    </div>
                  ) : serviciosRecientes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aún no tienes servicios registrados.</p>
                  ) : (
                    <div className="space-y-3">
                      {serviciosRecientes.map(s => (
                        <div key={s.id_detalle} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{s.servicio}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(s.fecha)} · {formatCurrency(s.precio)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${estadoServicioBadgeClasses(s.estado)}`}>
                            {s.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </m.section>

                {/* RIGHT col: account info */}
                <div className="flex flex-col gap-6">
                  <m.section
                    className="bg-card border border-border rounded-xl p-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.21, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mi cuenta</h2>
                    </div>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-52" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="text-foreground font-medium">{perfil?.correo}</span></p>
                        {perfil?.telefono && <p>{perfil.telefono}</p>}
                        <button
                          onClick={() => setShowPerfilModal(true)}
                          className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                        >
                          Editar datos <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </m.section>
                  <m.section
                    className="bg-card border border-border rounded-xl p-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contacto</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-3 items-start">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Cra. 74 #50, Los Colores – Estadio, Medellín</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="text-muted-foreground">
                          <p>Lun – Vie: 09:00 – 18:00</p>
                          <p>Sábado: 10:00 – 14:00</p>
                        </div>
                      </div>
                       <div className="flex gap-3 items-start">
                      <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <a
                        href="https://wa.me/573005414130"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        +57 300 5414130
                      </a>
                    </div>
                    </div>
                  </m.section>
                </div>

              </div>

            </div>
          </div>
        </main>

        <footer className="bg-secondary border-t border-secondary-foreground/10 py-6 shrink-0">
          <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-1 text-center">
            <span className="font-serif text-base font-bold italic text-secondary-foreground">Arte Café</span>
            <span className="text-xs text-secondary-foreground/50">
              © {new Date().getFullYear()} SoftwArt · Todos los derechos reservados
            </span>
          </div>
        </footer>

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