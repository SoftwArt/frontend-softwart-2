import type { Cliente } from '../types'
import { stripAccents } from '@/src/shared/lib/formatDate'

export const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'PP', label: 'Pasaporte (PP)' },
]

export const inputCls  = 'w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm'
export const labelCls  = 'block text-xs font-bold capitalize tracking-widest text-muted-foreground mb-2'
export const selectCls = 'w-full bg-muted border-0 border-b-2 border-transparent data-[state=open]:border-secondary !h-auto rounded-t-lg px-4 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:border-secondary'

export function filterClientes(clientes: Cliente[], q: string, filterEstado: string): Cliente[] {
  const s = stripAccents(q.toLowerCase())
  return clientes.filter(c => {
    // Tipo de documento visible junto al número en la tabla ("CC · 123..."):
    // se busca tanto la sigla cruda como el nombre completo ("Cédula de
    // Ciudadanía") sin tildes, para que "cedula" o "ciudadania" (sin acento,
    // como suele teclearse) también encuentren resultados.
    const tipoDocLabel = stripAccents((DOCUMENT_TYPES.find(t => t.value === c.tipoDocumento)?.label ?? '').toLowerCase())
    const matchQ = !s ||
      c.nombre.toLowerCase().includes(s) ||
      c.documento.includes(s) ||
      c.correo.toLowerCase().includes(s) ||
      (c.telefono ?? '').includes(s) ||
      c.tipoDocumento.toLowerCase().includes(s) ||
      tipoDocLabel.includes(s)
    const matchEstado = !filterEstado || (filterEstado === 'activo' ? c.estado : !c.estado)
    return matchQ && matchEstado
  })
}
