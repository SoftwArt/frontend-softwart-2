// src/shared/lib/formatDate.ts
// Convierte "2025-03-15" o Date a "15 mar 2025"
// Uso: formatDate(venta.fecha) → "15 mar 2025"
//      formatDate(cita.fecha, 'long') → "sábado, 15 de marzo de 2025"

export function formatDate(
  fecha: string | Date | null | undefined,
  style: 'short' | 'long' = 'short'
): string {
  if (!fecha) return '—'
  // Parseo manual de las partes en vez de `new Date(fecha + 'T00:00:00')`
  // (TZ del navegador, no forzado) — mismo criterio que ya usa correctamente
  // DatePicker.tsx ("Parseo local para evitar desfases UTC").
  const d = typeof fecha === 'string'
    ? (() => { const [y, m, dd] = fecha.split('-').map(Number); return new Date(y, m - 1, dd) })()
    : fecha
  if (isNaN(d.getTime())) return String(fecha)

  if (style === 'long') {
    return d.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  // "15 mar 2025"
  const day   = d.getDate()
  const month = d.toLocaleDateString('es-CO', { month: 'short' })
    .replace('.', '')           // quitar punto si lo hay
  const year  = d.getFullYear()
  return `${day} ${month} ${year}`
}

// Para horas: "14:00:00" → "2:00 PM"
export function formatTime(hora: string | null | undefined): string {
  if (!hora) return '—'
  const [h, m] = hora.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

// Quita tildes/diacríticos ("á" -> "a") vía normalización Unicode + la
// propiedad Unicode \p{Diacritic} (soportada nativamente por todo motor JS
// moderno, sin depender de tipear a mano el rango de puntos de código), para
// comparar texto sin depender de que el usuario escriba los acentos.
// Exportada porque otros buscadores (ej. filterClientes, tipo de documento
// "Cédula de Ciudadanía") también comparan contra texto con tildes.
export const stripAccents = (s: string): string => s.normalize('NFD').replace(/\p{Diacritic}/gu, '')

// Buscador de fecha "natural": los buscadores de los CRUD hacían
// `fecha.includes(q)` directo contra el ISO ("2026-09-02"), así que escribir
// "2 de septiembre" nunca coincidía con nada — solo servía tecleando el ISO
// literal. Esta función compara la query contra todas las representaciones
// razonables de la misma fecha (ISO, "2 sep 2026", "miércoles, 2 de
// septiembre de 2026", "02/09/2026", "02/09") sin distinguir mayúsculas ni
// tildes, para que cualquiera de esas formas de escribir la fecha funcione.
// Uso: matchesFecha(cita.fecha, q) en vez de cita.fecha.includes(q).
export function matchesFecha(fecha: string | null | undefined, query: string): boolean {
  const q = stripAccents(query.trim().toLowerCase())
  if (!q) return true
  if (!fecha) return false

  if (fecha.toLowerCase().includes(q)) return true

  const corto = stripAccents(formatDate(fecha, 'short').toLowerCase())
  const largo = stripAccents(formatDate(fecha, 'long').toLowerCase())
  if (corto.includes(q) || largo.includes(q)) return true

  const [y, m, dd] = fecha.split('-')
  if (y && m && dd) {
    if (`${dd}/${m}/${y}`.includes(q)) return true
    if (`${dd}/${m}`.includes(q)) return true
    if (`${dd}-${m}`.includes(q)) return true
  }

  return false
}
