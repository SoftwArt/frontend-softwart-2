// src/features/appointments/components/AppointmentCancelAlert.tsx
import type { CitaEstadoAlert } from '../types'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface AppointmentCancelAlertProps {
  state: CitaEstadoAlert
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function AppointmentCancelAlert({ state, onOpenChange, onConfirm }: AppointmentCancelAlertProps) {
  return (
    <AlertDialog open={state.open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
          <AlertDialogDescription>{state.msg}</AlertDialogDescription>
        </AlertDialogHeader>
        <CascadePreview lines={state.lines} loading={state.loading} />
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            disabled={state.loading || state.bloqueado}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {state.bloqueado ? 'No se puede cancelar' : 'Cancelar cita'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
