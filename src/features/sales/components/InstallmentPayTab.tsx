// src/features/sales/components/InstallmentPayTab.tsx
import type { EstadoPagos, MetodoPago } from '../types'
import { inputCls, labelCls } from '../utils'
import { Badge } from '@/src/shared/components/ui/badge'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { ChevronRight } from 'lucide-react'

interface InstallmentPayTabProps {
  estado: EstadoPagos
  metodos: MetodoPago[]
  monto: string; onMontoChange: (v: string) => void
  montoError?: string
  fechaPago: string; onFechaPagoChange: (v: string) => void
  idMetodo: string; onIdMetodoChange: (v: string) => void
  isPagando: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function InstallmentPayTab({
  estado, metodos,
  monto, onMontoChange, montoError,
  fechaPago, onFechaPagoChange,
  idMetodo, onIdMetodoChange,
  isPagando, onCancel, onSubmit,
}: InstallmentPayTabProps) {
  const siguienteAbono = estado.siguiente_abono
  if (!siguienteAbono) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">Abono {siguienteAbono.number} esperado: </span>
        <span className="font-bold text-foreground">{formatCurrency(siguienteAbono.expectedAmount)}</span>
        {siguienteAbono.isLast && (
          <Badge variant="outline" className="ml-2 text-[10px] border-amber-300 bg-amber-50 text-amber-700">Último abono</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="abono-monto">Monto ($) <span className="text-destructive">*</span></label>
          <FieldErrorTooltip error={montoError}>
            <input
              id="abono-monto"
              type="number" min="0" value={monto} placeholder="0"
              onChange={e => onMontoChange(e.target.value)}
              className={inputCls}
            />
          </FieldErrorTooltip>
          {monto && <p className="text-xs text-muted-foreground mt-1">{formatCurrency(Number(monto))}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="abono-fecha">Fecha <span className="text-destructive">*</span></label>
          <DatePicker
            id="abono-fecha"
            value={fechaPago}
            max={bogotaMaxFuturoStr()}
            onChange={onFechaPagoChange}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Método de pago <span className="text-destructive">*</span></label>
        <div className="flex rounded-lg border border-border overflow-hidden mt-1">
          {metodos.map(m => (
            <button
              key={m.id_metodo_pago}
              type="button"
              onClick={() => onIdMetodoChange(String(m.id_metodo_pago))}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors
                ${idMetodo === String(m.id_metodo_pago)
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 self-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPagando}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPagando || !monto || !idMetodo || !!montoError}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
          {isPagando ? 'Registrando...' : `Registrar abono ${siguienteAbono.number}`}
        </button>
      </div>
    </div>
  )
}
