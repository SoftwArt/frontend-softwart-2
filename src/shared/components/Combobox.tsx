// ============================================================
// src/shared/components/Combobox.tsx
// Searchable select usando Command + Popover de shadcn/ui
// ============================================================
import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/shared/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/shared/components/ui/popover'
import { cn } from '@/src/shared/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string // texto secundario (ej: correo, documento)
}

interface ComboboxProps {
  options:           ComboboxOption[]
  value:             string
  onValueChange:     (value: string) => void
  placeholder?:      string
  searchPlaceholder?: string
  emptyText?:        string
  disabled?:         boolean
  className?:        string
  id?:               string
  // Muestra un botón "×" para volver a value='' sin tener que reabrir la
  // lista y reencontrar la misma opción ya seleccionada. Opt-in porque no
  // tiene sentido en combos de selección obligatoria (Venta, Cliente, etc).
  clearable?:        boolean
}

let _comboboxId = 0

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder      = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText        = 'Sin resultados',
  disabled         = false,
  className,
  id,
  clearable        = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [listId] = useState(() => `combobox-list-${++_comboboxId}`)

  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className={cn(
            'w-full bg-muted border-0 border-b-2 rounded-t-lg px-4 py-3 text-sm text-left flex items-center justify-between gap-2 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all',
            open ? 'border-secondary' : 'border-transparent',
            selected ? 'text-foreground' : 'text-muted-foreground/60',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {clearable && selected && (
              <span
                role="button"
                aria-label="Quitar selección"
                onClick={(e) => { e.stopPropagation(); onValueChange('') }}
                className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-card border-border" align="start">
        <Command id={listId} className="bg-card">
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-foreground placeholder:text-muted-foreground"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.sublabel ?? ''}`}
                  onSelect={() => {
                    onValueChange(option.value === value ? '' : option.value)
                    setOpen(false)
                  }}
                  className="cursor-pointer text-foreground aria-selected:bg-primary/10"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 text-primary',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}