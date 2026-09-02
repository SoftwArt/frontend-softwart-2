// src/features/orders/components/OrderDeleteAlert.tsx
import type { PedidoDeleteTarget } from '../types'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface OrderDeleteAlertProps { target: PedidoDeleteTarget | null; onOpenChange: (o: boolean) => void; onConfirm: () => void }

export function OrderDeleteAlert({ target, onOpenChange, onConfirm }: OrderDeleteAlertProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este servicio?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará <strong>{target?.label}</strong> por completo — pensado para corregir un
            error de captura, no para el flujo normal (ahí corresponde cancelar). Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
