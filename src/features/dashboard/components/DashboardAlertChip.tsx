// src/features/dashboard/components/DashboardAlertChip.tsx
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/components/ui/popover'

interface DashboardAlertChipProps<T extends { href: string }> {
  items:      T[]
  label:      string
  baseHref:   string
  ignoredIds: number[]
  onIgnore:   (id: number) => void
  renderRow:  (item: T) => { id: number; primary: string; secondary: string; query: string }
}

export function DashboardAlertChip<T extends { href: string }>({
  items, label, baseHref, ignoredIds, onIgnore, renderRow,
}: DashboardAlertChipProps<T>) {
  const visible = items.filter(i => !ignoredIds.includes(renderRow(i).id))
  if (visible.length === 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 hover:bg-amber-100 transition-colors">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800">
            <strong>{visible.length}</strong> {label}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-amber-500 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <Link to={baseHref} className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <ul className="max-h-64 overflow-y-auto divide-y divide-border">
          {visible.map(item => {
            const { id, primary, secondary, query } = renderRow(item)
            return (
              <li key={id} className="flex items-center gap-2 px-3 py-2.5">
                <Link
                  to={`${baseHref}?q=${encodeURIComponent(query)}`}
                  className="flex-1 min-w-0 hover:opacity-70 transition-opacity"
                >
                  <p className="text-sm font-medium text-foreground truncate">{primary}</p>
                  <p className="text-xs text-muted-foreground">{secondary}</p>
                </Link>
                <button
                  onClick={() => onIgnore(id)}
                  title="Ignorar" aria-label="Ignorar registro"
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
