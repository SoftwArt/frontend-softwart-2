// src/features/clients/components/ClientDeleteAction.tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/src/shared/components/ui/alert-dialog'

interface ClientDeleteActionProps {
  nombre: string
  onConfirm: () => Promise<unknown>
}

export function ClientDeleteAction({ nombre, onConfirm }: ClientDeleteActionProps) {
  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Eliminar cliente">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <AlertDialogContent className="bg-card text-card-foreground border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-secondary">¿Eliminar a {nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el cliente y su usuario asociado. Si <strong>{nombre}</strong> tiene
            citas o ventas asociadas, no podrá eliminarse. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => onConfirm()}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
