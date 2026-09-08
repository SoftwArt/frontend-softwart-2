// src/features/sales/components/SaleDeleteAlert.tsx
import type { VentaCascadeTarget } from '../types'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/shared/components/ui/alert-dialog'

interface SaleDeleteAlertProps { target: VentaCascadeTarget | null; onOpenChange: (o: boolean) => void; onConfirm: () => void }

export function SaleDeleteAlert({ target, onOpenChange, onConfirm }: SaleDeleteAlertProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este pedido?</AlertDialogTitle>
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
            {target?.bloqueado ? 'No se puede eliminar' : 'Sí, eliminar pedido'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
