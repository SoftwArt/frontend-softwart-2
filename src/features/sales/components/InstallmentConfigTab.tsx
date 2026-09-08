// src/features/sales/components/InstallmentConfigTab.tsx
import type { EstadoPagos } from '../types'
import { inputCls, labelCls } from '../utils'
import { Button } from '@/src/shared/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { Settings2 } from 'lucide-react'

const MODO_TOOLTIP: Record<'pct' | 'monto', string> = {
  pct:   'Calcular el primer abono como porcentaje del total',
  monto: 'Calcular el primer abono a partir de su valor en pesos',
}

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

  // Con 1 abono no hay nada que repartir — es, por definición, el 100% del
  // total en un solo pago (el hook ya fuerza pct=100 y bloquea el modo $ al
  // llegar a este número, ver useSaleInstallmentModal.setNumAbonos).
  const abonoUnico = Number(numAbonos) === 1

  // % efectivo para la vista previa, sin importar el modo activo — en modo
  // "monto" se deriva del valor ingresado (misma fórmula que el backend:
  // Math.round(monto/total*100)), solo para mostrar; la validación real
  // (1-99%, o 100% solo con 1 abono) la hace el servidor al guardar.
  const pctEfectivo = modoPrimerAbono === 'pct'
    ? Number(pctPrimero)
    : Math.round((Number(montoPrimero) / t) * 100)

  const previewValido = numAbonos && Number(numAbonos) >= 1 &&
    (abonoUnico || (
      (modoPrimerAbono === 'pct' ? Number(pctPrimero) >= 1 : Number(montoPrimero) > 0) &&
      pctEfectivo >= 1 && pctEfectivo <= 99
    ))

  // Aviso no bloqueante — mismo criterio que el modal de "Crear pedido"
  // desde Citas: el primer abono queda por debajo de lo que le tocaría en
  // un reparto parejo entre los N abonos. Se permite igual, solo se avisa.
  const promedioEsperado = Number(numAbonos) > 0 ? Math.round(100 / Number(numAbonos)) : 0
  const avisoAbonoBajo = !abonoUnico && pctEfectivo >= 1 && pctEfectivo <= 99 && pctEfectivo < promedioEsperado

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
              decide cuál de los dos se envía al guardar. Tooltip explicando
              cada botón, mismo criterio de accesibilidad que el resto del
              panel (informar la acción, no solo un ícono/símbolo suelto). */}
          <div className="flex rounded-md border border-border overflow-hidden text-[11px]">
            {(['pct', 'monto'] as const).map(m => (
              <Tooltip key={m}>
                <TooltipTrigger asChild>
                  <button type="button"
                    onClick={() => onModoPrimerAbonoChange(m)}
                    disabled={bloqueado || abonoUnico}
                    aria-label={abonoUnico ? 'Con 1 abono se paga el total completo' : MODO_TOOLTIP[m]}
                    className={`px-2 py-1 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                      ${modoPrimerAbono === m ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    {m === 'pct' ? '%' : '$'}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{abonoUnico ? 'Con 1 abono se paga el total completo — no hay nada que repartir' : MODO_TOOLTIP[m]}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {modoPrimerAbono === 'pct' ? (
          <>
            <input
              id="abono-primer"
              type="number" min="1" max="100"
              value={pctPrimero} placeholder="Ej: 70"
              onChange={e => onPctPrimeroChange(e.target.value)}
              disabled={bloqueado || abonoUnico}
              className={`${inputCls} disabled:opacity-70`}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {abonoUnico ? 'Con 1 abono se paga el 100% del total en un solo pago' : 'Entre 1% y 99% del total'}
            </p>
          </>
        ) : (
          <>
            <input
              id="abono-primer"
              type="number" min="1"
              value={montoPrimero} placeholder={`Ej: ${Math.round(t * 0.7)}`}
              onChange={e => onMontoPrimeroChange(e.target.value)}
              disabled={bloqueado || abonoUnico}
              className={`${inputCls} disabled:opacity-70`}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {montoPrimero && Number(montoPrimero) > 0
                ? `≈ ${pctEfectivo}% del total (${formatCurrency(t)})`
                : `En pesos, sobre un total de ${formatCurrency(t)}`}
            </p>
          </>
        )}
      </div>

      {avisoAbonoBajo && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠ El primer abono ({pctEfectivo}%) es menor al {promedioEsperado}% que le tocaría en un reparto
          parejo entre los {numAbonos} abonos. Podés continuar si es intencional, pero confirma que no fue
          un error de tipeo.
        </div>
      )}

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
