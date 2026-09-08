// src/features/payments/components/PaymentStatusAlert.tsx
import type { PagoStatusAlert } from '../types'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface PaymentStatusAlertProps {
  state: PagoStatusAlert
  hasIdEstadoAnulado: boolean
  onOpenChange: (v: boolean) => void
  onConfirmAnular: () => void
}

export function PaymentStatusAlert({ state, hasIdEstadoAnulado, onOpenChange, onConfirmAnular }: PaymentStatusAlertProps) {
  return (
    <AlertDialog open={state.open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title ?? (state.showAnular ? '¿Anular esta venta?' : 'Estado no modificable')}</AlertDialogTitle>
          <AlertDialogDescription>{state.msg}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{state.showAnular ? 'Volver' : 'Cerrar'}</AlertDialogCancel>
          {state.showAnular && hasIdEstadoAnulado && (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onConfirmAnular}
            >
              Anular venta
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
