import type { Usuario } from '../types'
import type { RolOption } from '@/src/shared/hooks/useOptions'

export const inputCls  = 'w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm'
export const labelCls  = 'block text-xs font-bold capitalize tracking-widest text-muted-foreground mb-2'
export const selectCls = 'w-full bg-muted border-0 border-b-2 border-transparent data-[state=open]:border-secondary !h-auto rounded-t-lg px-4 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:border-secondary'

// El id de cada rol depende del orden de inserción de la BD (seedRoles) —
// no es fijo (ej. "Cliente" tenía id 3 mientras existía el rol "Empleado",
// y pasa a id 2 en una BD reseedeada sin él). Se resuelve el nombre real
// desde /api/roles (rawRoles) en vez de hardcodear ids.
export function getRolLabel(rawRoles: RolOption[], id_rol: number): string {
  return rawRoles.find(r => r.id_rol === id_rol)?.nombre ?? `Rol ${id_rol}`
}

export function getRolBadgeClass(rawRoles: RolOption[], id_rol: number): string {
  const nombre = rawRoles.find(r => r.id_rol === id_rol)?.nombre?.toLowerCase()
  if (nombre === 'admin') return 'border-violet-300 bg-violet-100 text-violet-800'
  if (nombre === 'cliente') return 'border-emerald-300 bg-emerald-100 text-emerald-800'
  return 'border-border bg-muted text-muted-foreground'
}

export function filterUsuarios(usuarios: Usuario[], rawRoles: RolOption[], q: string, filterRol: string, filterEstado: string): Usuario[] {
  const s = q.toLowerCase()
  return usuarios.filter(u => {
    const matchQ      = !s || u.correo.toLowerCase().includes(s) || getRolLabel(rawRoles, u.id_rol).toLowerCase().includes(s)
    const matchRol    = !filterRol    || String(u.id_rol) === filterRol
    const matchEstado = !filterEstado || (filterEstado === 'activo' ? u.estado : !u.estado)
    return matchQ && matchRol && matchEstado
  })
}
