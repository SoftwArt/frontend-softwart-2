// src/features/permissions/hooks/usePermissions.ts
import { useState, useEffect } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { Permiso, PermisoRolRaw } from '../types'

type Rol = { id_rol: number; nombre: string }
type ApiRes<T> = { success: boolean; data: T[]; meta?: unknown }

// Copia profunda de un Map<number, Set<number>> — necesaria para que el
// draft y el committed sean estructuras independientes (mutar una no afecta
// a la otra).
function cloneAsignaciones(mapa: Map<number, Set<number>>): Map<number, Set<number>> {
  const copia = new Map<number, Set<number>>()
  for (const [id_rol, ids] of mapa) copia.set(id_rol, new Set(ids))
  return copia
}

export function usePermissions() {
  const [permisos,   setPermisos]   = useState<Permiso[]>([])
  const [roles,      setRoles]      = useState<Rol[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  // "committed" = lo último confirmado por el backend. "draft" = lo que se
  // ve/edita en pantalla. Los toggles solo tocan el draft (sin red); un único
  // guardarCambios() calcula el diff draft vs. committed y lo envía de una
  // sola vez — evita que la cascada VER↔resto-del-módulo dispare N requests
  // en tiempo real que pueden dejar el permiso a medias si una falla a mitad
  // de camino (no idempotente).
  const [committed, setCommitted] = useState<Map<number, Set<number>>>(new Map())
  const [draft,     setDraft]     = useState<Map<number, Set<number>>>(new Map())

  const fetchAll = async () => {
    setIsLoading(true); setError(null)
    try {
      const [permisosRes, rolesRes, prRes] = await Promise.all([
        // limit=100 para traer todos, no solo los primeros 10
        apiRequest<ApiRes<Permiso>>('/api/permissions?limit=100'),
        apiRequest<ApiRes<Rol>>('/api/roles?limit=100'),
        apiRequest<ApiRes<PermisoRolRaw>>('/api/role-permissions?limit=200'),
      ])

      setPermisos(permisosRes.data ?? [])
      setRoles(rolesRes.data ?? [])

      // Construir mapa rol → Set<permisos>
      const mapa = new Map<number, Set<number>>()
      for (const raw of prRes.data ?? []) {
        const id_rol     = raw.role?.id_rol
        const id_permiso = raw.permission?.id_permiso
        if (!id_rol || !id_permiso) continue
        if (!mapa.has(id_rol)) mapa.set(id_rol, new Set())
        mapa.get(id_rol)!.add(id_permiso)
      }
      setCommitted(mapa)
      setDraft(cloneAsignaciones(mapa))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar permisos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const hasPermission = (id_rol: number, id_permiso: number): boolean =>
    draft.get(id_rol)?.has(id_permiso) ?? false

  const isDirty = (id_rol: number): boolean => {
    const a = committed.get(id_rol) ?? new Set()
    const b = draft.get(id_rol) ?? new Set()
    if (a.size !== b.size) return true
    for (const id of a) if (!b.has(id)) return true
    return false
  }

  // Toggle puramente local — sin red. Misma lógica de cascada que antes
  // (agregar algo distinto de VER garantiza VER; quitar VER quita todo el
  // módulo), pero aplicada sobre el draft en memoria.
  const onTogglePermission = (id_rol: number, id_permiso: number) => {
    const permiso = permisos.find(p => p.id_permiso === id_permiso)
    const [modulo, accion] = permiso?.nombre.split('.') ?? ['', '']
    const yaExiste = hasPermission(id_rol, id_permiso)

    setDraft(prev => {
      const next = cloneAsignaciones(prev)
      const rolePerms = new Set(next.get(id_rol) ?? [])

      if (!yaExiste) {
        rolePerms.add(id_permiso)
        if (accion && accion !== 'VER') {
          const verPermiso = permisos.find(p => p.nombre === `${modulo}.VER`)
          if (verPermiso) rolePerms.add(verPermiso.id_permiso)
        }
      } else if (accion === 'VER') {
        for (const p of permisos) {
          if (p.nombre.startsWith(`${modulo}.`) && rolePerms.has(p.id_permiso)) {
            rolePerms.delete(p.id_permiso)
          }
        }
      } else {
        rolePerms.delete(id_permiso)
      }

      next.set(id_rol, rolePerms)
      return next
    })
  }

  const onToggleAllPermissions = (id_rol: number, ids: number[], marcar: boolean) => {
    setDraft(prev => {
      const next = cloneAsignaciones(prev)
      const rolePerms = new Set(next.get(id_rol) ?? [])
      ids.forEach(id => { if (marcar) rolePerms.add(id); else rolePerms.delete(id) })
      next.set(id_rol, rolePerms)
      return next
    })
  }

  // Descarta el draft de un rol, volviendo a lo último confirmado por el backend.
  const descartarCambios = (id_rol: number) => {
    setDraft(prev => {
      const next = cloneAsignaciones(prev)
      next.set(id_rol, new Set(committed.get(id_rol) ?? []))
      return next
    })
  }

  // Envía el diff (altas/bajas) del draft de un rol contra lo confirmado —
  // una sola tanda de requests, no una por cada click.
  const guardarCambios = async (id_rol: number): Promise<void> => {
    const antes    = committed.get(id_rol) ?? new Set<number>()
    const despues  = draft.get(id_rol) ?? new Set<number>()
    const idsToAdd    = [...despues].filter(id => !antes.has(id))
    const idsToRemove = [...antes].filter(id => !despues.has(id))

    if (!idsToAdd.length && !idsToRemove.length) return

    await Promise.all([
      ...idsToAdd.map(id => apiRequest('/api/role-permissions', {
        method: 'POST',
        body: JSON.stringify({ id_permiso: id, id_rol }),
      })),
      ...idsToRemove.map(id => apiRequest('/api/role-permissions', {
        method: 'DELETE',
        body: JSON.stringify({ id_permiso: id, id_rol }),
      })),
    ])

    setCommitted(prev => {
      const next = cloneAsignaciones(prev)
      next.set(id_rol, new Set(despues))
      return next
    })
  }

  return {
    permisos, roles, isLoading, error,
    hasPermission, isDirty,
    onTogglePermission, onToggleAllPermissions,
    guardarCambios, descartarCambios,
  }
}
