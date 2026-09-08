// src/features/sales/components/SaleFormDialog.tsx
import { inputCls, labelCls } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { Combobox } from '@/src/shared/components/Combobox'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'

interface SaleFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  clientesOpts: ComboboxOption[]; onSearchClientes: (q: string) => void
  citasFormOpts: ComboboxOption[]
  idCliente: string; onIdClienteChange: (v: string) => void
  idCita: string;    onIdCitaChange:    (v: string) => void
  fecha: string;     onFechaChange:     (v: string) => void
  total: string;     onTotalChange:     (v: string) => void
  observacion: string; onObservacionChange: (v: string) => void
  errors: Record<string, string>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function SaleFormDialog({
  open, onOpenChange, editingId,
  clientesOpts, onSearchClientes, citasFormOpts,
  idCliente, onIdClienteChange,
  idCita, onIdCitaChange,
  fecha, onFechaChange,
  total, onTotalChange,
  observacion, onObservacionChange,
  errors, isSubmitting, onSubmit, onCancel,
}: SaleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Pedido' : 'Registrar Pedido'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Completa los datos del pedido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="vta-cliente">Cliente <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idCliente}>
              <div>
                <Combobox id="vta-cliente" options={clientesOpts} value={idCliente}
                  onValueChange={onIdClienteChange}
                  onSearchChange={onSearchClientes}
                  placeholder="Buscar cliente..." searchPlaceholder="Nombre o documento..." />
              </div>
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="vta-cita">Cita (opcional)</label>
            <Combobox id="vta-cita" options={citasFormOpts} value={idCita} clearable
              onValueChange={onIdCitaChange}
              placeholder={idCliente ? 'Vincular a una cita...' : 'Selecciona un cliente primero'}
              searchPlaceholder="Buscar cita..." />
          </div>
          <div>
            <label className={labelCls} htmlFor="vta-fecha">Fecha <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.fecha}>
              <div>
                <DatePicker
                  id="vta-fecha"
                  value={fecha}
                  max={bogotaMaxFuturoStr()}
                  onChange={onFechaChange}
                  error={errors.fecha}
                />
              </div>
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="vta-total">Total <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.total}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input id="vta-total" type="number" step="1" min="0" value={total}
                  onChange={e => onTotalChange(e.target.value)}
                  className={inputCls + ' pl-8'} placeholder="0" />
              </div>
            </FieldErrorTooltip>
            {total && <p className="text-xs text-muted-foreground">{formatCurrency(Number(total))}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="vta-observacion">Observación (opcional)</label>
            <textarea id="vta-observacion" value={observacion} placeholder="Notas o detalles del pedido..." onChange={e => onObservacionChange(e.target.value)}
              className={inputCls + ' resize-none'} rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
              {editingId ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
