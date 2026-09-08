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
  // Modo alterno: en vez de indicar el % del primer abono, se indica su
  // valor en pesos y el backend lo convierte a % (única vía persistida).
  // Los dos son opcionales — se envía solo el del modo activo.
  modoPrimerAbono: 'pct' | 'monto'; onModoPrimerAbonoChange: (v: 'pct' | 'monto') => void
  montoPrimero: string; onMontoPrimeroChange: (v: string) => void
  isConfigurando: boolean
  onSubmit: () => void
}

export function InstallmentConfigTab({
  estado, numAbonos, onNumAbonosChange, pctPrimero, onPctPrimeroChange,
  modoPrimerAbono, onModoPrimerAbonoChange, montoPrimero, onMontoPrimeroChange,
  isConfigurando, onSubmit,
}: InstallmentConfigTabProps) {
  const bloqueado = estado.pagos_realizados > 0
  const t = estado.total

  // % efectivo para la vista previa, sin importar el modo activo — en modo
  // "monto" se deriva del valor ingresado (misma fórmula que el backend:
  // Math.round(monto/total*100)), solo para mostrar; la validación real
  // (1-99%) la hace el servidor al guardar.
  const pctEfectivo = modoPrimerAbono === 'pct'
    ? Number(pctPrimero)
    : Math.round((Number(montoPrimero) / t) * 100)

  const previewValido = numAbonos && Number(numAbonos) >= 1 &&
    (modoPrimerAbono === 'pct' ? Number(pctPrimero) >= 1 : Number(montoPrimero) > 0) &&
    pctEfectivo >= 1 && pctEfectivo <= 99

  return (
    <div className="flex flex-col gap-3">
      {bloqueado && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Ya hay {estado.pagos_realizados} pago(s) registrado(s). No se puede cambiar la configuración.
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="abono-num">Número de abonos <span className="text-destructive">*</span></label>
        <input
          id="abono-num"
          type="number" min="1" max="12"
          value={numAbonos} placeholder="Ej: 2"
          onChange={e => onNumAbonosChange(e.target.value)}
          disabled={bloqueado}
          className={inputCls}
        />
        <p className="text-[10px] text-muted-foreground mt-1">Máximo 12</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls} htmlFor="abono-primer">
            Primer abono <span className="text-destructive">*</span>
          </label>
          {/* Toggle de modo — cambiar de modo no borra el otro valor, solo
              decide cuál de los dos se envía al guardar. */}
          <div className="flex rounded-md border border-border overflow-hidden text-[11px]">
            {(['pct', 'monto'] as const).map(m => (
              <button key={m} type="button"
                onClick={() => onModoPrimerAbonoChange(m)}
                disabled={bloqueado}
                className={`px-2 py-1 font-medium transition-colors
                  ${modoPrimerAbono === m ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'pct' ? '%' : '$'}
              </button>
            ))}
          </div>
        </div>

        {modoPrimerAbono === 'pct' ? (
          <>
            <input
              id="abono-primer"
              type="number" min="1" max="99"
              value={pctPrimero} placeholder="Ej: 70"
              onChange={e => onPctPrimeroChange(e.target.value)}
              disabled={bloqueado}
              className={inputCls}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Entre 1% y 99% del total</p>
          </>
        ) : (
          <>
            <input
              id="abono-primer"
              type="number" min="1"
              value={montoPrimero} placeholder={`Ej: ${Math.round(t * 0.7)}`}
              onChange={e => onMontoPrimeroChange(e.target.value)}
              disabled={bloqueado}
              className={inputCls}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {montoPrimero && Number(montoPrimero) > 0
                ? `≈ ${pctEfectivo}% del total (${formatCurrency(t)})`
                : `En pesos, sobre un total de ${formatCurrency(t)}`}
            </p>
          </>
        )}
      </div>

      {/* Preview del plan */}
      {previewValido && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1.5">Vista previa:</p>
          {(() => {
            const n = Number(numAbonos)
            const p = pctEfectivo
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
        disabled={isConfigurando || bloqueado}
        variant="outline"
        className="gap-2 self-end"
      >
        <Settings2 className="h-4 w-4" />
        {isConfigurando ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </div>
  )
}
