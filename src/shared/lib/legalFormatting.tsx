// Helpers puros de presentación para el contenido legal (ToS/PyP) — el
// backend entrega texto plano, acá solo se formatea para lectura.
import type { ReactNode } from 'react'

// Las fechas placeholder vienen como '__19_DE_JULIO_DE_2026__' o
// '__DD_DE_MES_DE_AAAA__' (terminosServicio.ts, mientras sigue en borrador) —
// se muestran legibles quitando los guiones bajos, no se ocultan.
export function formatFechaLegal(fecha: string): string {
  return fecha.replace(/_/g, ' ').trim()
}

// Los párrafos de terminosServicio.ts pueden traer marcadores
// `[[PENDIENTE: ...]]` (ver PENDIENTES_TOS) — se resaltan en vez de mostrarse
// como texto plano indistinguible del resto, para que quede claro que esa
// parte del borrador todavía no es definitiva.
export function renderParrafoLegal(texto: string): ReactNode {
  const partes = texto.split(/(\[\[.*?\]\])/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('[[') && parte.endsWith(']]')) {
      return (
        <mark key={i} className="bg-accent/30 text-foreground rounded px-1 py-0.5 not-italic">
          {parte.slice(2, -2)}
        </mark>
      )
    }
    return <span key={i}>{parte}</span>
  })
}
