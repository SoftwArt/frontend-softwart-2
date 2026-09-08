import type { Marco } from '../types'
import { matchesMonto } from '@/src/shared/lib/formatCurrency'

export const inputCls = 'w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm'
export const labelCls = 'block text-xs font-bold capitalize tracking-widest text-muted-foreground mb-2'

export function filterMarcos(marcos: Marco[], q: string, filterEstado: string): Marco[] {
  const s = q.toLowerCase()
  return marcos.filter(m => {
    const matchQ      = !s ||
      m.codigo.toLowerCase().includes(s) ||
      String(m.colilla).includes(s) ||
      matchesMonto(m.precio_ensamblado, s)
    const matchEstado = !filterEstado || (filterEstado === 'activo' ? m.estado : !m.estado)
    return matchQ && matchEstado
  })
}
