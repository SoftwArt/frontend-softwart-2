// src/features/services/components/ServiceFormDialog.tsx
import { inputCls, labelCls, fmtDuracion } from '../utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface ServiceFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  nombre: string; onNombreChange: (v: string) => void
  duracionStr: string; onDuracionChange: (v: string) => void
  descripcion: string; onDescripcionChange: (v: string) => void
  errors: Record<string, string>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function ServiceFormDialog({
  open, onOpenChange, editingId,
  nombre, onNombreChange,
  duracionStr, onDuracionChange,
  descripcion, onDescripcionChange,
  errors, isSubmitting, onSubmit, onCancel,
}: ServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">
            {editingId ? 'Editar Tipo de Servicio' : 'Registrar Tipo de Servicio'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            La duración estimada ayuda a planificar la entrega del pedido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="srv-nombre">Nombre <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.nombre}>
              <input id="srv-nombre" value={nombre} placeholder="Ej: Enmarcado simple"
                onChange={e => onNombreChange(e.target.value)}
                className={inputCls} />
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="srv-duracion">
              Duración estimada (días) <span className="text-destructive">*</span>
            </label>
            <FieldErrorTooltip error={errors.duracion}>
              <input id="srv-duracion" type="number" min="1" step="1" value={duracionStr}
                onChange={e => onDuracionChange(e.target.value)}
                className={inputCls}
                placeholder="Ej: 7 (= 1 semana)" />
            </FieldErrorTooltip>
            {duracionStr && Number(duracionStr) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{fmtDuracion(Number(duracionStr))}</p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="srv-descripcion">Descripción (opcional)</label>
            <textarea id="srv-descripcion" value={descripcion} placeholder="Descripción del servicio..." onChange={e => onDescripcionChange(e.target.value)}
              className={`${inputCls} resize-none`} rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
              {editingId ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
