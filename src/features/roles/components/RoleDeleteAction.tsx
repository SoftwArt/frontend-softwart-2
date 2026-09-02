// src/features/roles/components/RoleDeleteAction.tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/src/shared/components/ui/alert-dialog'

interface RoleDeleteActionProps {
  nombre: string
  esRolEstructural: boolean
  onConfirm: () => void
}

export function RoleDeleteAction({ nombre, esRolEstructural, onConfirm }: RoleDeleteActionProps) {
  if (esRolEstructural) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" size="icon"
            aria-label="Eliminar rol"
            aria-disabled
            onClick={() => {}}
            className="opacity-40 cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>El rol {nombre} no puede eliminarse — es necesario para el funcionamiento del sistema</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Eliminar rol"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <AlertDialogContent className="bg-card text-card-foreground border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-secondary">¿Eliminar rol "{nombre}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Si este rol tiene usuarios asignados no podrá eliminarse. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
