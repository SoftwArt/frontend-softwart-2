// src/shared/components/FieldErrorTooltip.tsx
// Estándar del proyecto para errores de validación en formularios densos:
// el error se muestra flotando (Tooltip forzado a abierto) en vez de un
// <p> en el flujo normal — así N errores simultáneos nunca empujan el resto
// del formulario ni generan scroll. Trade-off consciente: el error puede
// tapar visualmente el campo siguiente en formularios muy comprimidos.
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'

export function FieldErrorTooltip({
  error, children, side = 'bottom',
}: {
  error?: string | null
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <Tooltip open={!!error}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {error && (
        <TooltipContent
          side={side}
          className="bg-destructive text-destructive-foreground"
          arrowClassName="bg-destructive fill-destructive"
        >
          {error}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
