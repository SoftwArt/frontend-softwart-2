// src/shared/components/ToggleSwitch.tsx
import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/src/shared/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'

export interface ToggleOption<T extends string | number = string> {
  value:        T
  label:        string
  icon?:        React.ComponentType<{ className?: string }>
  indicatorCls?: string  // bg del indicador cuando esta opción está activa
  textActiveCls?: string  // color del texto cuando está activa
}

interface ToggleSwitchProps<T extends string | number> {
  value:    T
  onChange: (v: T) => void
  options:  ToggleOption<T>[]
  disabled?: boolean
  // Motivo del bloqueo — si se da, se muestra en un tooltip al pasar el mouse
  // o dar foco (accesibilidad: aria-disabled por botón, no pointer-events-none
  // en el contenedor, para que el hover del tooltip siga funcionando).
  disabledReason?: string
  // Clases por defecto si la opción no define las suyas
  defaultIndicatorCls?: string
  defaultTextActiveCls?: string
}

// Opciones pre-construidas para el patrón Activo / Inactivo
export const ACTIVO_OPTIONS: ToggleOption<number>[] = [
  { value: 1, label: 'Activo',   indicatorCls: 'bg-secondary',    textActiveCls: 'text-secondary-foreground' },
  { value: 0, label: 'Inactivo', indicatorCls: 'bg-destructive',   textActiveCls: 'text-destructive-foreground' },
]

export function ToggleSwitch<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  disabledReason,
  defaultIndicatorCls  = 'bg-secondary',
  defaultTextActiveCls = 'text-secondary-foreground',
}: ToggleSwitchProps<T>) {
  const uid = useId()

  const content = (
    <div className={cn(
      'inline-flex items-center h-8 rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5',
      disabled && 'opacity-50',
    )}>
      {options.map(opt => {
        const isActive      = opt.value === value
        const indicatorCls  = opt.indicatorCls  ?? defaultIndicatorCls
        const textActiveCls = opt.textActiveCls ?? defaultTextActiveCls

        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-disabled={disabled}
            onClick={() => { if (!disabled && !isActive) onChange(opt.value) }}
            className={cn(
              'relative flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              'outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              disabled
                ? 'cursor-not-allowed text-muted-foreground'
                : isActive
                  ? textActiveCls
                  : 'text-muted-foreground hover:text-foreground cursor-pointer',
            )}
          >
            {/* Indicador deslizante — siempre tiene el tamaño exacto del botón activo */}
            {isActive && (
              <motion.div
                layoutId={`${uid}-sw`}
                className={cn('absolute inset-0 rounded-md shadow-sm', indicatorCls)}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon && <opt.icon className="h-3.5 w-3.5 shrink-0" />}
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )

  if (disabled && disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    )
  }
  return content
}
