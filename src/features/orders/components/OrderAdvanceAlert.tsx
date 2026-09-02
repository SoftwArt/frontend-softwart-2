// src/features/orders/components/OrderAdvanceAlert.tsx
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface OrderAdvanceAlertProps { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void }

export function OrderAdvanceAlert({ open, onOpenChange, onConfirm }: OrderAdvanceAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cambiar el estado sin el primer abono?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta venta todavía no tiene ningún abono <strong>Validado</strong> registrado. ¿Quieres
            continuar de todas formas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Sí, continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
