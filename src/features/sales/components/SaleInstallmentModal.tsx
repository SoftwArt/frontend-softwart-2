// src/features/sales/components/SaleInstallmentModal.tsx
import { useSaleInstallmentModal } from '../hooks/useSaleInstallmentModal'
import type { SaleInstallmentModalProps } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { CreditCard } from 'lucide-react'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { InstallmentPlanProgress } from './InstallmentPlanProgress'
import { InstallmentPayTab } from './InstallmentPayTab'
import { InstallmentConfigTab } from './InstallmentConfigTab'
import { InstallmentCompletedBanner } from './InstallmentCompletedBanner'

export function SaleInstallmentModal({ open, onClose, idVenta, labelVenta, onSuccess }: SaleInstallmentModalProps) {
  const {
    estado, metodos, isLoading, tab, setTab,
    monto, setMonto, idMetodo, setIdMetodo, fechaPago, setFechaPago, isPagando,
    numAbonos, setNumAbonos, pctPrimero, setPctPrimero, isConfigurando,
    handlePagar, handleConfigurar,
    montoError,
  } = useSaleInstallmentModal({ open, idVenta, onSuccess })

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            Abonos — {labelVenta}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {estado ? `Total: ${formatCurrency(estado.total)} · ${estado.pagos_realizados}/${estado.num_abonos} abonos` : 'Cargando...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Cargando...</div>
        ) : !estado ? null : (
          <div className="flex flex-col gap-4 mt-2">

            <InstallmentPlanProgress estado={estado} />

            {/* ── Tabs: Pagar / Configurar ─────────────────────────────────── */}
            {!estado.completado && (
              <>
                <div className="flex gap-1 border-b border-border pb-0 -mb-1">
                  {(['pagar', 'configurar'] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setTab(t)}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                        ${tab === t
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      {t === 'pagar' ? '💳 Registrar abono' : '⚙️ Configurar plan'}
                    </button>
                  ))}
                </div>

                {tab === 'pagar' && (
                  <InstallmentPayTab
                    estado={estado}
                    metodos={metodos}
                    monto={monto} onMontoChange={setMonto} montoError={montoError}
                    fechaPago={fechaPago} onFechaPagoChange={setFechaPago}
                    idMetodo={idMetodo} onIdMetodoChange={setIdMetodo}
                    isPagando={isPagando}
                    onCancel={onClose}
                    onSubmit={handlePagar}
                  />
                )}

                {tab === 'configurar' && (
                  <InstallmentConfigTab
                    estado={estado}
                    numAbonos={numAbonos} onNumAbonosChange={setNumAbonos}
                    pctPrimero={pctPrimero} onPctPrimeroChange={setPctPrimero}
                    isConfigurando={isConfigurando}
                    onSubmit={handleConfigurar}
                  />
                )}
              </>
            )}

            {estado.completado && <InstallmentCompletedBanner estado={estado} />}

          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
