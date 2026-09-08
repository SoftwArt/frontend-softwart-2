// src/features/appointments/components/AppointmentSaleDialog.tsx
import type { Cita, VentaLinea } from '../types'
import { labelCls, fmtCOP } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { PlusCircle, ShoppingCart, Trash } from 'lucide-react'

interface AppointmentSaleDialogProps {
  cita: Cita | null
  onClose: () => void
  clientesOpts: ComboboxOption[]
  serviciosOpts: ComboboxOption[]
  marcosOpts: ComboboxOption[]
  lineas: VentaLinea[]
  onAddLinea: () => void
  onRemoveLinea: (id: number) => void
  onUpdateLinea: (id: number, field: keyof VentaLinea, value: string) => void
  observacion: string; onObservacionChange: (v: string) => void
  errors: Record<string, string>
  total: number
  isSubmitting: boolean
  onSubmit: () => void
}

export function AppointmentSaleDialog({
  cita, onClose, clientesOpts, serviciosOpts, marcosOpts,
  lineas, onAddLinea, onRemoveLinea, onUpdateLinea,
  observacion, onObservacionChange, errors, total, isSubmitting, onSubmit,
}: AppointmentSaleDialogProps) {
  return (
    <Dialog open={cita !== null} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            Crear pedido — Cita #{cita?.id_cita}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {cita != null
              ? `${clientesOpts.find(o => o.value === String(cita.id_cliente))?.label ?? 'Cliente'} · ${cita.fecha} ${cita.hora}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Líneas de servicio */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={labelCls}>Servicios</span>
              <Button type="button" variant="outline" size="sm" onClick={onAddLinea} className="gap-1 h-7 text-xs">
                <PlusCircle className="h-3.5 w-3.5" />Agregar servicio
              </Button>
            </div>

            {lineas.map((linea, i) => (
              <div key={linea.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border border-border bg-background">
                <div className="col-span-4 flex flex-col gap-1">
                  <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-svc-${i}`}>Tipo de Servicio <span className="text-destructive">*</span></label>
                  <FieldErrorTooltip error={errors[`servicio_${i}`]}>
                    <select
                      id={`srv-svc-${i}`}
                      value={linea.id_servicio}
                      onChange={e => onUpdateLinea(linea.id, 'id_servicio', e.target.value)}
                      className="flex h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Seleccionar...</option>
                      {serviciosOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </FieldErrorTooltip>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-marco-${i}`}>Marco (opcional)</label>
                  <select
                    id={`srv-marco-${i}`}
                    value={linea.id_marco}
                    onChange={e => onUpdateLinea(linea.id, 'id_marco', e.target.value)}
                    className="flex h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Sin marco</option>
                    {marcosOpts.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-precio-${i}`}>Precio (COP) <span className="text-destructive">*</span></label>
                  <FieldErrorTooltip error={errors[`precio_${i}`]}>
                    <Input
                      id={`srv-precio-${i}`}
                      type="number" min="0" placeholder="0"
                      value={linea.precio}
                      onChange={e => onUpdateLinea(linea.id, 'precio', e.target.value)}
                      className="h-8 text-xs bg-card border-border"
                    />
                  </FieldErrorTooltip>
                </div>
                <div className="col-span-2 flex items-end pb-0.5">
                  <Button
                    type="button" variant="ghost" size="icon"
                    disabled={lineas.length === 1}
                    onClick={() => onRemoveLinea(linea.id)}
                    title="Quitar línea" aria-label="Quitar línea de servicio"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="col-span-12 flex flex-col gap-1">
                  <Input
                    placeholder="Observación de este servicio (opcional)"
                    value={linea.observacion}
                    onChange={e => onUpdateLinea(linea.id, 'observacion', e.target.value)}
                    className="h-7 text-xs bg-card border-border"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Observación general */}
          <div>
            <label className={labelCls} htmlFor="venta-obs">Observación general (opcional)</label>
            <textarea
              id="venta-obs"
              value={observacion}
              onChange={e => onObservacionChange(e.target.value)}
              placeholder="Notas sobre el pedido..."
              className="w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Total + confirmar */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">{fmtCOP(total)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {isSubmitting ? 'Creando...' : 'Crear pedido'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
