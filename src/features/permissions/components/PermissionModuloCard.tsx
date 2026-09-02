// src/features/permissions/components/PermissionModuloCard.tsx
import { useState } from 'react'
import { ShieldCheck, ShieldOff, ChevronDown, CheckSquare, Square, HelpCircle } from 'lucide-react'
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { Badge } from '@/src/shared/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { MODULO_LABELS, MODULO_ICONS, getAccion } from '../utils'

interface PermissionModuloCardProps {
  moduloKey: string
  permisos: { id_permiso: number; nombre: string; descripcion?: string }[]
  id_rol: number
  isAdmin: boolean
  hasPermission: (id_rol: number, id_permiso: number) => boolean
  onToggle: (id_permiso: number) => void
  onToggleAll: (ids: number[], marcar: boolean) => void
}

export function PermissionModuloCard({ moduloKey, permisos, id_rol, isAdmin, hasPermission, onToggle, onToggleAll }: PermissionModuloCardProps) {
  const [open, setOpen] = useState(false)

  const activos   = permisos.filter(p => hasPermission(id_rol, p.id_permiso)).length
  const total     = permisos.length
  const todosOn   = activos === total
  const algunoOn  = activos > 0 && activos < total

  const handleToggleAll = () => {
    if (isAdmin) return
    const ids = permisos.map(p => p.id_permiso)
    onToggleAll(ids, !todosOn)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header del módulo */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            {(() => {
              const Icon = MODULO_ICONS[moduloKey] ?? HelpCircle
              return <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            })()}
            {MODULO_LABELS[moduloKey] ?? moduloKey}
          </span>
          <Badge
            variant="secondary"
            className={activos === total ? 'bg-primary/15 text-primary' : activos > 0 ? 'bg-amber-100 text-amber-800' : ''}
          >
            {activos}/{total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Checkbox "seleccionar todo el módulo" */}
          {!isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={todosOn ? true : algunoOn ? 'mixed' : false}
                  aria-label={todosOn ? 'Desmarcar todos' : 'Marcar todos'}
                  onClick={e => { e.stopPropagation(); handleToggleAll() }}
                  onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); handleToggleAll() } }}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {todosOn
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : algunoOn
                      ? <CheckSquare className="h-4 w-4 text-amber-500" />
                      : <Square className="h-4 w-4" />
                  }
                  <span className="hidden sm:inline">{todosOn ? 'Todos' : 'Marcar todos'}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{todosOn ? 'Desmarcar todos' : 'Marcar todos'}</TooltipContent>
            </Tooltip>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Grid de permisos del módulo */}
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2.5 border-t border-border bg-background/40">
          {permisos.map(permiso => {
            const asignado = hasPermission(id_rol, permiso.id_permiso)
            // Extraer la acción: "CLIENTES.VER" → "VER" | "CUENTA.VER_PERFIL" → "VER PERFIL"
            const accionLabel = getAccion(permiso.nombre).replace(/_/g, ' ')
            return (
              <label
                key={permiso.id_permiso}
                htmlFor={`perm-${permiso.id_permiso}`}
                title={isAdmin ? 'El Admin siempre tiene todos los permisos' : undefined}
                className={[
                  'flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer select-none transition-colors',
                  isAdmin
                    ? 'cursor-default opacity-75 border-border bg-muted/50'
                    : asignado
                      ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                      : 'border-border hover:bg-accent/50',
                ].join(' ')}
              >
                <Checkbox
                  id={`perm-${permiso.id_permiso}`}
                  checked={asignado}
                  onCheckedChange={() => !isAdmin && onToggle(permiso.id_permiso)}
                  disabled={isAdmin}
                  className="shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    {accionLabel}
                  </span>
                  {permiso.descripcion && (
                    <span className="text-[10px] text-muted-foreground truncate">{permiso.descripcion}</span>
                  )}
                </div>
                {asignado
                  ? <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                  : <ShieldOff className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-auto" />
                }
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
