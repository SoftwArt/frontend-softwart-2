// ============================================================
// src/shared/components/Combobox.tsx
// Searchable select usando Command + Popover de shadcn/ui
// ============================================================
import { useEffect, useState } from 'react'
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
import { useDebouncedValue } from '@/src/shared/hooks/useDebouncedValue'

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
  // Opt-in: cuando se pasa, cada búsqueda (debounced) dispara este callback
  // además del filtro local de cmdk — pensado para que `options` se enriquezca
  // en vivo desde el servidor (ver useOptions.ts `search()`) en vez de quedar
  // limitado al catálogo cargado al montar. Ver Combobox de Cliente/Venta en
  // Citas/Ventas/Pagos/Pedidos.
  onSearchChange?:   (query: string) => void
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
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [listId] = useState(() => `combobox-list-${++_comboboxId}`)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    if (onSearchChange && debouncedQuery.trim()) onSearchChange(debouncedQuery.trim())
  }, [debouncedQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mientras hay una búsqueda remota activa, no se re-filtra localmente lo
  // que ya validó el backend (ILike) — el fuzzy-match de cmdk puede no
  // reconocer un match parcial (ej. un fragmento de documento) y ocultarlo,
  // mostrando "sin resultados" para algo que el servidor sí encontró.
  const remoteFiltering = Boolean(onSearchChange) && debouncedQuery.trim().length > 0

  const selected = options.find((o) => o.value === value)

  // Antes CommandInput era no-controlado y se remontaba entero al cerrar el
  // Popover (Radix desmonta el contenido), así que cada apertura arrancaba
  // con el buscador vacío. Ahora que `query` vive en Combobox (fuera del
  // contenido que se desmonta) para poder debouncear onSearchChange, hay que
  // limpiarlo a mano al cerrar para no cambiar ese comportamiento.
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery('')
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
                title="Quitar selección"
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
        <Command id={listId} className="bg-card" shouldFilter={!remoteFiltering}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-foreground placeholder:text-muted-foreground"
            value={query}
            onValueChange={setQuery}
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