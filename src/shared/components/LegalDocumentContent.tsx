// src/shared/components/LegalDocumentContent.tsx
// Contenido formateado de un documento legal (ToS/PyP) — lo usan tanto la
// modal (LegalDocumentModal, desde el checkbox de registro) como la página
// pública de lectura (features/legal). El endpoint solo devuelve el JSON
// crudo (LegalController.ts) — el formateo vive acá, no en el backend.
import { useLegalDocument } from '@/src/shared/hooks/useLegalDocument'
import { formatFechaLegal, renderParrafoLegal } from '@/src/shared/lib/legalFormatting'
import type { LegalDocTipo } from '@/src/shared/types/legal'

export function LegalDocumentContent({ tipo, enabled = true }: { tipo: LegalDocTipo; enabled?: boolean }) {
  const { documento, isLoading, error } = useLegalDocument(tipo, enabled)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!documento) return null

  const esBorrador = documento.version.toUpperCase().includes('BORRADOR')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Versión {documento.version}</span>
        <span aria-hidden>·</span>
        <span>{formatFechaLegal(documento.fecha)}</span>
        {esBorrador && (
          <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Borrador
          </span>
        )}
      </div>

      {documento.secciones.map((seccion, i) => (
        <section key={i} className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-foreground">{seccion.titulo}</h2>
          {seccion.parrafos.map((parrafo, j) => (
            <p key={j} className="text-sm text-muted-foreground leading-relaxed">
              {renderParrafoLegal(parrafo)}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
