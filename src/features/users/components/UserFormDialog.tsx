// src/features/users/components/UserFormDialog.tsx
import { inputCls, labelCls, selectCls } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { PasswordChecklist } from '@/src/shared/components/PasswordChecklist'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'

interface UserFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  correo: string; onCorreoChange: (v: string) => void
  clave: string;  onClaveChange:  (v: string) => void
  idRol: string;  onIdRolChange:  (v: string) => void
  rolesOptsForm: ComboboxOption[]
  errors: Record<string, string>
  correoFormatoError: string | null
  editingIsAdminBase: boolean
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function UserFormDialog({
  open, onOpenChange, editingId,
  correo, onCorreoChange,
  clave, onClaveChange,
  idRol, onIdRolChange,
  rolesOptsForm, errors, correoFormatoError, editingIsAdminBase,
  isSubmitting, onSubmit, onCancel,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Usuario' : 'Registrar Usuario'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{editingId ? 'Actualiza el correo o el rol.' : 'Completa los datos del nuevo usuario.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="usr-correo">Correo <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.correo || correoFormatoError}>
              <input id="usr-correo" type="email" value={correo} placeholder='Ingrese el correo...' disabled={editingIsAdminBase} onChange={(e) => onCorreoChange(e.target.value)} className={inputCls} />
            </FieldErrorTooltip>
            {editingIsAdminBase && <p className="text-xs text-muted-foreground mt-1">El correo del administrador base no puede cambiarse.</p>}
          </div>
          {!editingId && (
            <div>
              <label className={labelCls} htmlFor="usr-clave">Contraseña <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.clave}>
                <input id="usr-clave" type="password" value={clave} placeholder='Ingrese la contraseña...' onChange={(e) => onClaveChange(e.target.value)} className={inputCls} />
              </FieldErrorTooltip>
              <PasswordChecklist password={clave} />
            </div>
          )}
          <div>
            <label className={labelCls} htmlFor="usr-rol">Rol <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idRol}>
              <Select value={idRol} disabled={editingIsAdminBase} onValueChange={onIdRolChange}>
                <SelectTrigger id="usr-rol" className={selectCls}><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent>
                  {rolesOptsForm.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldErrorTooltip>
            {editingIsAdminBase && <p className="text-xs text-muted-foreground mt-1">El rol del administrador base no puede cambiarse.</p>}
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
