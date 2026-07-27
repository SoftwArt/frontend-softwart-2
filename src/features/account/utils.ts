// src/features/account/utils.ts
import type { Cita, Servicio } from './types'
import { bogotaNowMs, bogotaCitaMs } from '@/src/shared/lib/bogotaTime'

export const inputCls = 'w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all'
export const labelCls = 'block text-xs font-bold capitalize tracking-widest text-muted-foreground mb-2'

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
} as const

export const modalPanelVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } },
} as const

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function filterCitasCuenta(citas: Cita[], q: string): Cita[] {
  const s = q.toLowerCase()
  if (!s) return citas
  return citas.filter(c =>
    String(c.id_cita).includes(s) ||
    c.fecha.includes(s) ||
    (c.appointmentStatus?.nombre ?? '').toLowerCase().includes(s)
  )
}

export function filterServiciosCuenta(servicios: Servicio[], q: string): Servicio[] {
  const s = q.toLowerCase()
  if (!s) return servicios
  return servicios.filter(sv =>
    sv.servicio.toLowerCase().includes(s) ||
    sv.fecha.includes(s) ||
    sv.estado.toLowerCase().includes(s) ||
    (sv.observacion ?? '').toLowerCase().includes(s)
  )
}

// Espeja la ventana mínima de 6h antes de la cita que valida el backend
// (ClientAccountController.cancelMyAppointment) — evita ofrecer un botón que
// siempre fallaría al confirmar. fecha/hora son naive-Bogotá, igual que en el
// backend, así que ambos lados del guard usan la misma aritmética
// (bogotaCitaMs/bogotaNowMs en shared/lib/bogotaTime.ts).
export function canCancelCita(fecha: string, hora: string): boolean {
  const horaNormalizada = hora.length === 5 ? `${hora}:00` : hora
  const SEIS_HORAS_MS = 6 * 60 * 60 * 1000
  return bogotaCitaMs(fecha, horaNormalizada) - bogotaNowMs() >= SEIS_HORAS_MS
}

export function parseFechaBloque(fecha: string): { mes: string; dia: string } {
  const parts = fecha.split(/[-T]/)
  if (parts.length >= 3) {
    return { mes: MESES[parseInt(parts[1]) - 1] ?? '', dia: String(parseInt(parts[2])) }
  }
  return { mes: '', dia: fecha }
}

export function estadoBadgeClasses(nombre?: string): string {
  if (!nombre) return 'bg-muted text-muted-foreground'
  const s = nombre.toLowerCase()
  if (s.includes('pend'))     return 'bg-orange-100 text-orange-800'
  if (s.includes('confirmada')) return 'bg-blue-100 text-blue-800'
  if (s.includes('complet') || s.includes('val'))
    return 'bg-emerald-100 text-emerald-800'
  if (s.includes('cancel'))  return 'bg-destructive/15 text-destructive'
  return 'bg-muted text-muted-foreground'
}

export function estadoServicioBadgeClasses(estado: string): string {
  const s = estado.toLowerCase()
  if (s.includes('cancel'))   return 'bg-red-100 text-red-800'
  if (s.includes('finaliz'))  return 'bg-emerald-100 text-emerald-800'
  if (s.includes('preparac')) return 'bg-amber-100 text-amber-800'
  return 'bg-muted text-muted-foreground'
}
