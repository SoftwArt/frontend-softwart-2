// src/features/roles/components/RoleFormDialog.tsx
import { inputCls, labelCls } from '../utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface RoleFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  nombre: string; onNombreChange: (v: string) => void
  descripcion: string; onDescripcionChange: (v: string) => void
  errors: Record<string, string>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function RoleFormDialog({
  open, onOpenChange, editingId,
  nombre, onNombreChange,
  descripcion, onDescripcionChange,
  errors, isSubmitting, onSubmit, onCancel,
}: RoleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Rol' : 'Registrar Rol'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Completa los datos del rol.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="rol-nombre">Nombre <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.nombre}>
              <input id="rol-nombre" value={nombre} placeholder="Ej: Administrador" onChange={e => onNombreChange(e.target.value)}
                className={inputCls} />
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="rol-descripcion">Descripción (opcional)</label>
            <input id="rol-descripcion" value={descripcion} placeholder="Descripción del rol..." onChange={e => onDescripcionChange(e.target.value)}
              className={inputCls} />
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
