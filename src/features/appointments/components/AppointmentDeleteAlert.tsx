// src/features/appointments/components/AppointmentDeleteAlert.tsx
import type { CitaCascadeTarget } from '../types'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface AppointmentDeleteAlertProps {
  target: CitaCascadeTarget | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function AppointmentDeleteAlert({ target, onOpenChange, onConfirm }: AppointmentDeleteAlertProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
          <AlertDialogDescription>
            {target?.label}. {target?.bloqueado ? target.msg : 'Esta acción no se puede deshacer.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CascadePreview lines={target?.lines ?? []} loading={target?.loading} />
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            disabled={target?.loading || target?.bloqueado}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {target?.bloqueado ? 'No se puede eliminar' : 'Sí, eliminar cita'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
