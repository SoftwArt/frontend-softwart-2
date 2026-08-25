// src/features/account/components/ProfileModal.tsx
import { m } from 'framer-motion'
import { toast } from 'sonner'
import { inputCls, labelCls, modalBackdropVariants, modalPanelVariants } from '../utils'
import { stripDigits, NOMBRE_MAX_LENGTH, NOMBRE_MAX_ERROR } from '@/src/shared/lib/validateNombre'
import { onlyDigits } from '@/src/shared/lib/validateTelefono'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/src/shared/components/ui/alert-dialog'
import { User, Lock, AlertTriangle, X } from 'lucide-react'

interface FieldErrors {
  nombre?: string | null
  telefono?: string | null
  correo?: string | null
}

interface ProfileModalProps {
  isLoading: boolean
  onClose: () => void

  // Personal data form
  name: string
  onNameChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  errors: FieldErrors
  isSavingProfile: boolean
  onSubmitProfile: (e: React.FormEvent) => void

  // Password form
  currentPassword: string
  onCurrentPasswordChange: (value: string) => void
  newPassword: string
  onNewPasswordChange: (value: string) => void
  confirmPassword: string
  onConfirmPasswordChange: (value: string) => void
  isSavingPassword: boolean
  onSubmitPassword: (e: React.FormEvent) => void

  // Account deletion
  isDeleting: boolean
  onDeleteAccount: () => Promise<string>
}

export function ProfileModal({
  isLoading, onClose,
  name, onNameChange, phone, onPhoneChange, email, onEmailChange,
  errors, isSavingProfile, onSubmitProfile,
  currentPassword, onCurrentPasswordChange,
  newPassword, onNewPasswordChange,
  confirmPassword, onConfirmPasswordChange,
  isSavingPassword, onSubmitPassword,
  isDeleting, onDeleteAccount,
}: ProfileModalProps) {
  return (
    <m.div
      key="backdrop-profile"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      variants={modalBackdropVariants}
      initial="initial" animate="animate" exit="exit"
    >
      <m.div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col gap-6 p-6 relative max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        variants={modalPanelVariants}
        initial="initial" animate="animate" exit="exit"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-secondary">Mi perfil</h3>
          <button type="button" onClick={onClose} title="Cerrar" aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-serif text-secondary">Mis datos</h2>
            </div>
            {isLoading ? (
              <div className="space-y-5">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <form onSubmit={onSubmitProfile} className="space-y-5" noValidate>
                <div>
                  <label className={labelCls} htmlFor="perfil-nombre">Nombre completo</label>
                  <FieldErrorTooltip error={errors.nombre || (name.length >= NOMBRE_MAX_LENGTH ? NOMBRE_MAX_ERROR : null)}>
                    <input id="perfil-nombre" type="text" value={name}
                      onChange={e => onNameChange(stripDigits(e.target.value))} required
                      maxLength={NOMBRE_MAX_LENGTH} className={inputCls} />
                  </FieldErrorTooltip>
                </div>
                <div>
                  <label className={labelCls} htmlFor="perfil-telefono">Teléfono <span className="text-destructive">*</span></label>
                  <FieldErrorTooltip error={errors.telefono}>
                    <input id="perfil-telefono" type="tel" value={phone}
                      onChange={e => onPhoneChange(onlyDigits(e.target.value))} required className={inputCls} />
                  </FieldErrorTooltip>
                </div>
                <div>
                  <label className={labelCls} htmlFor="perfil-correo">Correo electrónico</label>
                  <FieldErrorTooltip error={errors.correo}>
                    <input id="perfil-correo" type="email" value={email}
                      onChange={e => onEmailChange(e.target.value)} required className={inputCls} />
                  </FieldErrorTooltip>
                </div>
                <div className="pt-1 flex items-center gap-4">
                  <button type="submit" disabled={isSavingProfile}
                    className="bg-secondary text-secondary-foreground py-2.5 px-6 rounded-lg font-medium hover:bg-secondary/90 transition-colors active:scale-95 disabled:opacity-60">
                    {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-serif text-secondary">Cambiar contraseña</h2>
            </div>
            <form onSubmit={onSubmitPassword} className="space-y-5">
              <div>
                <label className={labelCls} htmlFor="clave-actual">Contraseña actual</label>
                <input id="clave-actual" type="password" value={currentPassword}
                  onChange={e => onCurrentPasswordChange(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="clave-nueva">Nueva contraseña</label>
                <input id="clave-nueva" type="password" value={newPassword}
                  onChange={e => onNewPasswordChange(e.target.value)} className={inputCls} />
                <PasswordChecklist password={newPassword} confirmPassword={confirmPassword} />
              </div>
              <div>
                <label className={labelCls} htmlFor="clave-confirm">Confirmar contraseña</label>
                <input id="clave-confirm" type="password" value={confirmPassword}
                  onChange={e => onConfirmPasswordChange(e.target.value)} className={inputCls} />
              </div>
              <div className="pt-1">
                <button type="submit" disabled={isSavingPassword}
                  className="w-full border-2 border-primary/30 text-primary py-2.5 rounded-lg font-medium hover:bg-primary/5 transition-colors disabled:opacity-60">
                  {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </section>

        </div>

        <section className="border border-destructive/20 rounded-xl p-6 bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="font-serif text-lg text-destructive">Eliminar cuenta</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Esta acción es permanente. Si tienes historial activo, la cuenta se desactivará en su lugar.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button disabled={isDeleting}
                  className="text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shrink-0">
                  {isDeleting ? 'Procesando...' : 'Eliminar cuenta'}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card text-card-foreground border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-secondary">¿Eliminar tu cuenta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es permanente y eliminará toda tu información. Si tienes historial activo, la cuenta se desactivará en su lugar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border text-foreground">Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground"
                    onClick={async () => {
                      try {
                        const message = await onDeleteAccount()
                        toast.success(message)
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Error al eliminar la cuenta')
                      }
                    }}>
                    Sí, eliminar cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <button type="button" onClick={onClose}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors py-2 text-center w-full">
          Cancelar
        </button>
      </m.div>
    </m.div>
  )
}