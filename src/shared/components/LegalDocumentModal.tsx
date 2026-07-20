// src/shared/components/LegalDocumentModal.tsx
// Modal de lectura de un documento legal — se abre desde los checkboxes de
// aceptación del registro. Consume el mismo endpoint público que la página
// de lectura (GET /api/legal/:tipo) vía LegalDocumentContent.
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/components/ui/dialog'
import { Button } from '@/src/shared/components/ui/button'
import { LegalDocumentContent } from './LegalDocumentContent'
import { LEGAL_TITULOS, type LegalDocTipo } from '@/src/shared/types/legal'

export function LegalDocumentModal({
  tipo, open, onOpenChange, onAccept,
}: {
  tipo: LegalDocTipo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  // Atajo para quien no va a leer todo el documento: marca la casilla
  // correspondiente y cierra, sin obligar a scrollear hasta el final.
  onAccept?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent trae `grid` por defecto — un hijo de grid no se
          encoge por debajo de su tamaño intrínseco (min-height: auto), así
          que max-h/overflow en el propio grid no alcanza a limitarlo con
          contenido largo. `flex flex-col` + `min-h-0` en el hijo scrolleable
          es lo que de verdad fija la altura y activa el scroll interno. */}
      <DialogContent className="bg-card text-card-foreground border-border max-w-2xl h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl text-secondary">
            {tipo ? LEGAL_TITULOS[tipo] : ''}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Arte Café
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {tipo && <LegalDocumentContent tipo={tipo} enabled={open} />}
        </div>
        {onAccept && (
          <DialogFooter className="shrink-0 px-6 py-4 border-t border-border">
            <Button
              type="button"
              onClick={() => { onAccept(); onOpenChange(false) }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Aceptar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
