// src/features/payments/components/PaymentsPage.tsx
import { usePayments } from '../hooks/usePayments'
import { usePaymentForm } from '../hooks/usePaymentForm'
import { usePaymentStatusFlow } from '../hooks/usePaymentStatusFlow'
import { useSalesOptions } from '@/src/shared/hooks/useOptions'
import { useState, useMemo } from 'react'
import type { Pago } from '../types'
import { filterPagos } from '../utils'
import { Plus } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { SearchInput } from '@/src/shared/components/SearchInput'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { FilterBar }   from '@/src/shared/components/FilterBar'
import { PaymentsTable } from './PaymentsTable'
import { PaymentFormDialog } from './PaymentFormDialog'
import { PaymentViewDialog } from './PaymentViewDialog'
import { PaymentStatusAlert } from './PaymentStatusAlert'

export function PaymentsPage() {
  const { pagos, metodosPago, estadosPago, isLoading, onCreate, onChangeStatus, onChangeMethod } = usePayments()
  const { options: ventasOpts, rawVentas, search: searchVentas } = useSalesOptions()

  const [q,             setQ]             = useState('')
  const [filterMetodo,  setFilterMetodo]  = useState('')
  const [filterEstado,  setFilterEstado]  = useState('')

  const filtered = useMemo(() => filterPagos(pagos, ventasOpts, q, filterMetodo, filterEstado), [pagos, ventasOpts, q, filterMetodo, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Pago | null>(null)
  const openView = (p: Pago) => { setViewingItem(p); setIsViewOpen(true) }

  const statusFlow = usePaymentStatusFlow({ estadosPago, onChangeStatus })
  const form = usePaymentForm({ pagos, estadosPago, rawVentas, onCreate, onAlert: statusFlow.setAlertEstado })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Pagos</h1>
          <p className="text-muted-foreground">Gestiona los pagos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar venta, monto, fecha..." className="w-96" />
          <Button onClick={() => form.openCreate()} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Pago
          </Button>
        </div>
      </div>

      <FilterBar
        filters={[
          { key: 'metodo', label: 'Método de pago', type: 'select', value: filterMetodo, onChange: setFilterMetodo,
            options: metodosPago.map(m => ({ value: String(m.id_metodo_pago), label: m.nombre })) },
          { key: 'estado', label: 'Estado', type: 'chips', value: filterEstado, onChange: setFilterEstado,
            options: estadosPago.map(e => ({ value: String(e.id_estado_pago), label: e.nombre })) },
        ]}
        onClear={() => { setFilterMetodo(''); setFilterEstado('') }}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay pagos que coincidan." />
      ) : (
        <PaymentsTable
          pagos={paginated}
          metodosPago={metodosPago} estadosPago={estadosPago}
          ventasOpts={ventasOpts} rawVentas={rawVentas}
          page={page} totalPages={totalPages} total={total} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onChangeStatus={statusFlow.handleChangeStatus}
          onChangeMethod={(p, nuevoIdMetodo) => onChangeMethod(p.id_pago, nuevoIdMetodo)}
        />
      )}

      {viewingItem && (
        <PaymentViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          pago={viewingItem}
          ventasOpts={ventasOpts}
          metodosPago={metodosPago} estadosPago={estadosPago}
        />
      )}

      <PaymentStatusAlert
        state={statusFlow.alertEstado}
        hasIdEstadoAnulado={!!statusFlow.idEstadoAnulado}
        onOpenChange={(v) => { if (!v) statusFlow.closeAlertEstado() }}
        onConfirmAnular={statusFlow.confirmAnular}
      />

      <PaymentFormDialog
        open={form.isFormOpen}
        onOpenChange={v => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        ventasOpts={ventasOpts} onSearchVentas={searchVentas}
        metodosPago={metodosPago} estadosPago={estadosPago}
        idVenta={form.idVenta} onIdVentaChange={form.setIdVenta}
        monto={form.monto} onMontoChange={form.setMonto}
        fecha={form.fecha} onFechaChange={form.setFecha}
        idMetodo={form.idMetodo} onIdMetodoChange={form.setIdMetodo}
        idEstado={form.idEstado} onIdEstadoChange={form.setIdEstado}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        ventaPagada={form.ventaPagada}
        saldoPendiente={form.saldoPendiente}
        nextInstallment={form.nextInstallment}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />
    </div>
  )
}
