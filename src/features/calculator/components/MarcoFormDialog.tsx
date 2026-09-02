// src/features/calculator/components/MarcoFormDialog.tsx
import { inputCls, labelCls } from '../utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface MarcoFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  codigo: string; onCodigoChange: (v: string) => void
  colillaStr: string; onColillaChange: (v: string) => void
  precioStr: string; onPrecioChange: (v: string) => void
  errors: Record<string, string>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function MarcoFormDialog({
  open, onOpenChange, editingId,
  codigo, onCodigoChange,
  colillaStr, onColillaChange,
  precioStr, onPrecioChange,
  errors, isSubmitting, onSubmit, onCancel,
}: MarcoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Marco' : 'Registrar Marco'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Completa los datos del marco.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="marco-codigo">Código <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.codigo}>
              <input id="marco-codigo" value={codigo} placeholder="Ej: MDF-001" onChange={(e) => onCodigoChange(e.target.value)} className={inputCls} />
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="marco-colilla">Colilla (mm) <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.colilla}>
              <input id="marco-colilla" type="number" step="1" min="1" value={colillaStr} placeholder="Ej: 5" onChange={(e) => onColillaChange(e.target.value)} className={inputCls} />
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="marco-precio">Precio Ensamblado <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.precio}>
              <input id="marco-precio" type="number" step="0.01" min="0" value={precioStr} placeholder="Ej: 15000" onChange={(e) => onPrecioChange(e.target.value)} className={inputCls} />
            </FieldErrorTooltip>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">{editingId ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
