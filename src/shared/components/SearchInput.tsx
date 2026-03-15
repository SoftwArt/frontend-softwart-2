// src/shared/components/SearchInput.tsx
// Input de búsqueda reutilizable con debounce de 200ms
// Uso: <SearchInput value={q} onChange={setQ} placeholder="Buscar cliente..." />
import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/src/shared/lib/utils'

interface SearchInputProps {
  value:        string
  onChange:     (val: string) => void
  placeholder?: string
  className?:   string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-md border border-border bg-card pl-9 pr-8',
          'text-sm text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'transition-colors'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); inputRef.current?.focus() }}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}