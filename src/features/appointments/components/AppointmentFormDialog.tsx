// src/features/appointments/components/AppointmentFormDialog.tsx
import type { EstadoCita } from '../types'
import { labelCls, selectCls } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { Combobox } from '@/src/shared/components/Combobox'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { TimePicker, BookedSlot } from '@/src/shared/components/TimePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { bogotaTodayStr, bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editingId: number | null
  clientesOpts: ComboboxOption[]
  onSearchClientes: (q: string) => void
  estadosCita: EstadoCita[]
  idCliente: string; onIdClienteChange: (v: string) => void
  fecha: string;     onFechaChange:     (v: string) => void
  hora: string;      onHoraChange:      (v: string) => void
  idEstado: string;  onIdEstadoChange:  (v: string) => void
  bookedSlots: BookedSlot[]
  errors: Record<string, string>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function AppointmentFormDialog({
  open, onOpenChange, editingId,
  clientesOpts, onSearchClientes, estadosCita,
  idCliente, onIdClienteChange,
  fecha, onFechaChange,
  hora, onHoraChange,
  idEstado, onIdEstadoChange,
  bookedSlots, errors, isSubmitting, onSubmit, onCancel,
}: AppointmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Cita' : 'Registrar Cita'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Completa los datos de la cita.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="cita-cliente">Cliente <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idCliente}>
              <div>
                <Combobox
                  id="cita-cliente"
                  options={clientesOpts} value={idCliente}
                  onValueChange={onIdClienteChange}
                  onSearchChange={onSearchClientes}
                  placeholder="Buscar cliente..." searchPlaceholder="Nombre o documento..."
                />
              </div>
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="cita-fecha">Fecha <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.fecha}>
              <div>
                <DatePicker
                  id="cita-fecha"
                  value={fecha}
                  min={bogotaTodayStr()}
                  max={bogotaMaxFuturoStr()}
                  onChange={onFechaChange}
                  error={errors.fecha}
                />
              </div>
            </FieldErrorTooltip>
          </div>
          <TimePicker
            value={hora}
            onChange={onHoraChange}
            error={errors.hora}
            bookedSlots={bookedSlots}
          />
          <div>
            <label className={labelCls} htmlFor="cita-estado">Estado <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idEstado}>
              <Select value={idEstado} onValueChange={onIdEstadoChange}>
                <SelectTrigger id="cita-estado" className={selectCls}>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosCita.map(e => <SelectItem key={e.id_estado_cita} value={String(e.id_estado_cita)}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldErrorTooltip>
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
