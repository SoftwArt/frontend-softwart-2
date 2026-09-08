// src/features/payments/components/PaymentFormDialog.tsx
import type { MetodoPago, EstadoPago } from '../types'
import { inputCls, labelCls, selectCls } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { Combobox } from '@/src/shared/components/Combobox'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/components/ui/tooltip'
import { bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'

interface PaymentFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  ventasOpts: ComboboxOption[]; onSearchVentas: (q: string) => void
  metodosPago: MetodoPago[]; estadosPago: EstadoPago[]
  idVenta: string; onIdVentaChange: (v: string) => void
  monto: string;   onMontoChange:  (digits: string) => void
  fecha: string;   onFechaChange:  (v: string) => void
  idMetodo: string; onIdMetodoChange: (v: string) => void
  idEstado: string; onIdEstadoChange: (v: string) => void
  errors: Record<string, string>
  isSubmitting: boolean
  ventaPagada: boolean
  saldoPendiente: number | null
  nextInstallment: number | null
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function PaymentFormDialog({
  open, onOpenChange,
  ventasOpts, onSearchVentas, metodosPago, estadosPago,
  idVenta, onIdVentaChange,
  monto, onMontoChange,
  fecha, onFechaChange,
  idMetodo, onIdMetodoChange,
  idEstado, onIdEstadoChange,
  errors, isSubmitting, ventaPagada, saldoPendiente, nextInstallment,
  onSubmit, onCancel,
}: PaymentFormDialogProps) {
  const montoDisabled = !idVenta || saldoPendiente === 0
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-secondary">Registrar Venta</DialogTitle>
          <DialogDescription className="text-muted-foreground">Completa los datos de la venta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
          <div>
            <label className={labelCls} htmlFor="pago-venta">Pedido <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idVenta}>
              <div>
                <Combobox id="pago-venta" options={ventasOpts} value={idVenta} onValueChange={onIdVentaChange} onSearchChange={onSearchVentas} placeholder="Buscar pedido..." searchPlaceholder="ID o fecha..." />
              </div>
            </FieldErrorTooltip>
            {ventaPagada && (
              <p className="mt-1 text-xs text-destructive font-medium">Este pedido ya tiene todos sus abonos registrados y no admite más ventas.</p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="pago-monto">Monto <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.monto}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      id="pago-monto"
                      type="text"
                      inputMode="numeric"
                      value={monto ? formatCurrency(monto) : ''}
                      readOnly={montoDisabled}
                      aria-disabled={montoDisabled}
                      onChange={e => onMontoChange(e.target.value.replace(/\D/g, ''))}
                      className={inputCls + ` ${montoDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder={idVenta ? '0' : 'Seleccione un pedido'}
                    />
                  </div>
                </TooltipTrigger>
                {montoDisabled && (
                  <TooltipContent>
                    {!idVenta ? 'Elija primero un pedido para habilitar el monto.' : 'Este pedido ya está totalmente pagado.'}
                  </TooltipContent>
                )}
              </Tooltip>
            </FieldErrorTooltip>
            {nextInstallment !== null && !ventaPagada && (
              <p className="mt-1 text-xs text-muted-foreground">
                Próximo abono sugerido:{' '}
                <span className="font-semibold text-foreground">{formatCurrency(nextInstallment)}</span>
              </p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="pago-fecha">Fecha <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.fecha}>
              <div>
                <DatePicker
                  id="pago-fecha"
                  value={fecha}
                  max={bogotaMaxFuturoStr()}
                  onChange={onFechaChange}
                  error={errors.fecha}
                />
              </div>
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="pago-metodo">Método de pago <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idMetodo}>
              <Select value={idMetodo} onValueChange={onIdMetodoChange}>
                <SelectTrigger id="pago-metodo" className={selectCls}><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
                <SelectContent>{metodosPago.map(m => <SelectItem key={m.id_metodo_pago} value={String(m.id_metodo_pago)}>{m.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </FieldErrorTooltip>
          </div>
          <div>
            <label className={labelCls} htmlFor="pago-estado">Estado <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.idEstado}>
              <Select value={idEstado} onValueChange={onIdEstadoChange}>
                <SelectTrigger id="pago-estado" className={selectCls}><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>{estadosPago.map(e => <SelectItem key={e.id_estado_pago} value={String(e.id_estado_pago)}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </FieldErrorTooltip>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">Registrar</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
