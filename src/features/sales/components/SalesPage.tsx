// src/features/sales/components/SalesPage.tsx
import { useSales } from '../hooks/useSales'
import { useSaleForm } from '../hooks/useSaleForm'
import { useSaleDangerZone } from '../hooks/useSaleDangerZone'
import { useClientsOptions, useAppointmentsOptions } from '@/src/shared/hooks/useOptions'
import { SaleInstallmentModal } from './SaleInstallmentModal'
import { useState, useMemo } from 'react'
import type { Venta } from '../types'
import { filterVentas } from '../utils'
import { useSearchParams } from 'react-router-dom'
import { SearchInput } from '@/src/shared/components/SearchInput'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { FilterBar } from '@/src/shared/components/FilterBar'
import { Plus } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { SalesTable } from './SalesTable'
import { SaleFormDialog } from './SaleFormDialog'
import { SaleViewDialog } from './SaleViewDialog'
import { SaleAnnulAlert } from './SaleAnnulAlert'
import { SaleDeleteAlert } from './SaleDeleteAlert'

export function SalesPage() {
  const { ventas, isLoading, onCreate, onEdit, onToggleStatus, onDelete, refetch } = useSales()
  const [searchParams] = useSearchParams()

  const [abonoModalVenta, setAbonoModalVenta] = useState<{ id: number; label: string } | null>(null)
  const { options: clientesOpts, rawClientes, search: searchClientes } = useClientsOptions()
  const { options: citasOpts, rawCitas } = useAppointmentsOptions()

  const [q,            setQ]            = useState(searchParams.get('q') ?? '')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterVentas(ventas, clientesOpts, citasOpts, rawClientes, q, filterEstado), [ventas, clientesOpts, citasOpts, rawClientes, q, filterEstado])
  const { paginated, page, setPage, totalPages, total: paginationTotal, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Venta | null>(null)
  const openView = (v: Venta) => { setViewingItem(v); setIsViewOpen(true) }

  const form = useSaleForm({ citasOpts, rawCitas, onCreate, onEdit })
  const dangerZone = useSaleDangerZone({ onToggleStatus, onDelete, refetch })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar cliente, cita, fecha..." className="w-96" />
          <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Pedido
          </Button>
        </div>
      </div>

      <FilterBar
        filters={[
          { key: 'estado', label: 'Estado', type: 'chips', value: filterEstado, onChange: setFilterEstado,
            options: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] },
        ]}
        onClear={() => setFilterEstado('')}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin registros" description="No hay pedidos registrados aún." />
      ) : (
        <SalesTable
          ventas={paginated}
          clientesOpts={clientesOpts} citasOpts={citasOpts}
          rawClientes={rawClientes}
          page={page} totalPages={totalPages} total={paginationTotal} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onAnular={dangerZone.openAnular}
          onEliminar={dangerZone.openEliminar}
          onManagePayments={setAbonoModalVenta}
        />
      )}

      {viewingItem && (
        <SaleViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          venta={viewingItem}
          clientesOpts={clientesOpts} citasOpts={citasOpts} rawClientes={rawClientes}
        />
      )}

      <SaleFormDialog
        open={form.isFormOpen}
        onOpenChange={v => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        editingId={form.editingId}
        clientesOpts={clientesOpts} onSearchClientes={searchClientes}
        citasFormOpts={form.citasFormOpts}
        idCliente={form.idCliente} onIdClienteChange={form.setIdCliente}
        idCita={form.idCita} onIdCitaChange={form.setIdCita}
        fecha={form.fecha} onFechaChange={form.setFecha}
        total={form.total} onTotalChange={form.setTotal}
        observacion={form.observacion} onObservacionChange={form.setObservacion}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />

      <SaleAnnulAlert
        target={dangerZone.anularTarget}
        onOpenChange={(o) => { if (!o) dangerZone.setAnularTarget(null) }}
        onConfirm={dangerZone.confirmAnular}
      />

      <SaleDeleteAlert
        target={dangerZone.eliminarTarget}
        onOpenChange={(o) => { if (!o) dangerZone.setEliminarTarget(null) }}
        onConfirm={dangerZone.confirmEliminar}
      />

      {abonoModalVenta && (
        <SaleInstallmentModal
          open={abonoModalVenta !== null}
          onClose={() => setAbonoModalVenta(null)}
          idVenta={abonoModalVenta.id}
          labelVenta={abonoModalVenta.label}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
