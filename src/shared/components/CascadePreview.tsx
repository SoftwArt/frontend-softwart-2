// src/shared/components/CascadePreview.tsx
// Lista itemizada de lo que se va a anular/cancelar en cascada, para usar
// dentro de un AlertDialog de confirmación (Nielsen: visibilidad del estado
// antes de una acción irreversible). No usar dentro de AlertDialogDescription
// (renderiza <p>, no admite <ul> anidado) — colocar como hermano, después del header.
export function CascadePreview({ lines, loading }: { lines: string[]; loading?: boolean }) {
  if (loading) {
    return <p className="mt-2 text-sm text-muted-foreground italic">Verificando qué se va a anular en cascada...</p>
  }
  if (lines.length === 0) return null
  return (
    <ul className="mt-2 list-disc list-inside space-y-1 rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
      {lines.map((l, i) => <li key={i}>{l}</li>)}
    </ul>
  )
}
