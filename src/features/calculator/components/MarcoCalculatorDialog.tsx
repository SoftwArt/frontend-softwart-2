// src/features/calculator/components/MarcoCalculatorDialog.tsx
import type { Marco } from '../types'
import { inputCls, labelCls } from '../utils'
import { formatCurrency as fmt } from '@/src/shared/lib/formatCurrency'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface MarcoCalculatorDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  marco: Marco | null
  largo: string; onLargoChange: (v: string) => void
  ancho: string; onAnchoChange: (v: string) => void
  errors: Record<string, string>
  values: { costo: number; venta: number }
}

export function MarcoCalculatorDialog({ open, onOpenChange, marco, largo, onLargoChange, ancho, onAnchoChange, errors, values }: MarcoCalculatorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">Calcular precio</DialogTitle>
          <DialogDescription className="text-muted-foreground">{marco?.codigo}</DialogDescription>
        </DialogHeader>
        {marco && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="calc-largo">Largo (cm) <span className="text-destructive">*</span></label>
                <FieldErrorTooltip error={errors.largo}>
                  <input id="calc-largo" type="number" min="0" value={largo} onChange={(e) => onLargoChange(e.target.value)} placeholder="Ej: 30" className={inputCls} />
                </FieldErrorTooltip>
              </div>
              <div>
                <label className={labelCls} htmlFor="calc-ancho">Ancho (cm) <span className="text-destructive">*</span></label>
                <FieldErrorTooltip error={errors.ancho}>
                  <input id="calc-ancho" type="number" min="0" value={ancho} onChange={(e) => onAnchoChange(e.target.value)} placeholder="Ej: 20" className={inputCls} />
                </FieldErrorTooltip>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Fórmula: ((largo + ancho) × 2 + {marco.colilla}) × {fmt(marco.precio_ensamblado)}
            </div>
            <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
              <div className="flex justify-between"><span className="text-foreground">Costo:</span><span className="font-bold text-foreground">{fmt(values.costo)}</span></div>
              <div className="flex justify-between"><span className="text-foreground">Venta (×2):</span><span className="font-bold text-primary">{fmt(values.venta)}</span></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
