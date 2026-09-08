// src/features/sales/components/SaleAnnulAlert.tsx
import type { VentaCascadeTarget } from '../types'
import { MSG_ANULAR_BASE } from '../utils'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/shared/components/ui/alert-dialog'

interface SaleAnnulAlertProps { target: VentaCascadeTarget | null; onOpenChange: (o: boolean) => void; onConfirm: () => void }

export function SaleAnnulAlert({ target, onOpenChange, onConfirm }: SaleAnnulAlertProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular este pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            {target?.label}. {target?.bloqueado ? target.msg : MSG_ANULAR_BASE}
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
            {target?.bloqueado ? 'No se puede anular' : 'Sí, anular pedido'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
