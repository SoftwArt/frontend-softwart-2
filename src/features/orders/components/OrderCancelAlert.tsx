// src/features/orders/components/OrderCancelAlert.tsx
import type { PedidoCancelTarget } from '../types'
import { MSG_CANCELAR_BASE } from '../utils'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface OrderCancelAlertProps { target: PedidoCancelTarget | null; onOpenChange: (o: boolean) => void; onConfirm: () => void }

export function OrderCancelAlert({ target, onOpenChange, onConfirm }: OrderCancelAlertProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar este servicio?</AlertDialogTitle>
          <AlertDialogDescription>
            {target?.msg ?? MSG_CANCELAR_BASE}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CascadePreview lines={target?.lines ?? []} loading={target?.loading} />
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            disabled={target?.loading || target?.bloqueado}
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            {target?.bloqueado ? 'No se puede cancelar' : 'Sí, cancelar servicio'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
