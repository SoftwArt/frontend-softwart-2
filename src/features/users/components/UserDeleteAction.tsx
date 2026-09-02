// src/features/users/components/UserDeleteAction.tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'

interface UserDeleteActionProps {
  correo: string
  isCliente: boolean
  esAdminBase: boolean
  onConfirm: () => void
}

export function UserDeleteAction({ correo, isCliente, esAdminBase, onConfirm }: UserDeleteActionProps) {
  if (esAdminBase) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" size="icon"
            aria-label="Eliminar usuario"
            aria-disabled
            onClick={() => {}}
            className="opacity-40 cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>El usuario administrador base no puede eliminarse</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Eliminar usuario">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el acceso de <strong>{correo}</strong>. Esta acción no se puede deshacer.
            {isCliente && (
              <>
                {' '}Como su rol es <strong>Cliente</strong>, perderá el acceso al portal y
                deberá registrarse de nuevo para recuperarlo — su historial como cliente
                (citas, ventas, pagos) no se ve afectado.
              </>
            )}
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
