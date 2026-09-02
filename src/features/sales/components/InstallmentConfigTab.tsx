// src/features/sales/components/InstallmentConfigTab.tsx
import type { EstadoPagos } from '../types'
import { inputCls, labelCls } from '../utils'
import { Button } from '@/src/shared/components/ui/button'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { Settings2 } from 'lucide-react'

interface InstallmentConfigTabProps {
  estado: EstadoPagos
  numAbonos: string; onNumAbonosChange: (v: string) => void
  pctPrimero: string; onPctPrimeroChange: (v: string) => void
  isConfigurando: boolean
  onSubmit: () => void
}

export function InstallmentConfigTab({
  estado, numAbonos, onNumAbonosChange, pctPrimero, onPctPrimeroChange, isConfigurando, onSubmit,
}: InstallmentConfigTabProps) {
  return (
    <div className="flex flex-col gap-3">
      {estado.pagos_realizados > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Ya hay {estado.pagos_realizados} pago(s) registrado(s). No se puede cambiar la configuración.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="abono-num">Número de abonos <span className="text-destructive">*</span></label>
          <input
            id="abono-num"
            type="number" min="1" max="12"
            value={numAbonos} placeholder="Ej: 2"
            onChange={e => onNumAbonosChange(e.target.value)}
            disabled={estado.pagos_realizados > 0}
            className={inputCls}
          />
          <p className="text-[10px] text-muted-foreground mt-1">Máximo 12</p>
        </div>
        <div>
          <label className={labelCls} htmlFor="abono-pct">% primer abono <span className="text-destructive">*</span></label>
          <input
            id="abono-pct"
            type="number" min="1" max="99"
            value={pctPrimero} placeholder="Ej: 70"
            onChange={e => onPctPrimeroChange(e.target.value)}
            disabled={estado.pagos_realizados > 0}
            className={inputCls}
          />
          <p className="text-[10px] text-muted-foreground mt-1">Entre 1 y 99</p>
        </div>
      </div>

      {/* Preview del plan */}
      {numAbonos && pctPrimero && Number(numAbonos) >= 1 && Number(pctPrimero) >= 1 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1.5">Vista previa:</p>
          {(() => {
            const t = estado.total
            const n = Number(numAbonos)
            const p = Number(pctPrimero)
            const a1 = Math.round(t * p / 100 * 100) / 100
            const resto = t - a1
            if (n === 1) return <p>Abono único: {formatCurrency(t)}</p>
            const intermedios = Array.from({ length: n - 2 }, (_, i) =>
              Math.round(resto / (n - 1) * 100) / 100
            )
            const ultimo = Math.round((resto - intermedios.reduce((a,b) => a+b, 0)) * 100) / 100
            return (
              <div className="space-y-0.5">
                <p>Abono 1: {formatCurrency(a1)} ({p}%)</p>
                {intermedios.map((m, i) => <p key={`abono-${i}`}>Abono {i+2}: {formatCurrency(m)}</p>)}
                <p>Abono {n} (último): {formatCurrency(ultimo)}</p>
              </div>
            )
          })()}
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={isConfigurando || estado.pagos_realizados > 0}
        variant="outline"
        className="gap-2 self-end"
      >
        <Settings2 className="h-4 w-4" />
        {isConfigurando ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </div>
  )
}
