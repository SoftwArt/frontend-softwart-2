// src/features/appointments/components/AppointmentsPage.tsx
import { useAppointments } from '../hooks/useAppointments'
import { useAppointmentForm } from '../hooks/useAppointmentForm'
import { useAppointmentSaleForm } from '../hooks/useAppointmentSaleForm'
import { useAppointmentDangerZone } from '../hooks/useAppointmentDangerZone'
import { useServicesOptions, useFrameOptions, useClientsOptions } from '@/src/shared/hooks/useOptions'
import { useState, useMemo } from 'react'
import type { Cita } from '../types'
import { filterCitas } from '../utils'
import { useSearchParams } from 'react-router-dom'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { FilterBar } from '@/src/shared/components/FilterBar'
import { Plus } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { AppointmentsTable } from './AppointmentsTable'
import { AppointmentFormDialog } from './AppointmentFormDialog'
import { AppointmentViewDialog } from './AppointmentViewDialog'
import { AppointmentSaleDialog } from './AppointmentSaleDialog'
import { AppointmentCancelAlert } from './AppointmentCancelAlert'
import { AppointmentDeleteAlert } from './AppointmentDeleteAlert'

export function AppointmentsPage() {
  const { citas, estadosCita, isLoading, onCreate, onEdit, onDelete, onChangeStatus, refresh } = useAppointments()
  const { options: clientesOpts, rawClientes, search: searchClientes } = useClientsOptions()
  const { options: serviciosOpts } = useServicesOptions()
  const { options: marcosOpts }    = useFrameOptions()
  const [searchParams] = useSearchParams()

  const [q,            setQ]            = useState(searchParams.get('q') ?? '')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterCitas(citas, clientesOpts, rawClientes, q, filterEstado), [citas, clientesOpts, rawClientes, q, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Cita | null>(null)
  const openView = (c: Cita) => { setViewingItem(c); setIsViewOpen(true) }

  const form = useAppointmentForm({ citas, estadosCita, onCreate, onEdit })
  const saleForm = useAppointmentSaleForm({ refresh })
  const dangerZone = useAppointmentDangerZone({ estadosCita, clientesOpts, onDelete, onChangeStatus })

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-secondary">Citas</h1>
            <p className="text-muted-foreground">Gestiona las citas programadas</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar por fecha, hora o #cita..." className="w-96" />
            <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />Registrar Cita
            </Button>
          </div>
        </div>

        <FilterBar
          filters={[
            { key: 'estado', label: 'Estado', type: 'select', value: filterEstado, onChange: setFilterEstado,
              options: estadosCita.map(e => ({ value: String(e.id_estado_cita), label: e.nombre })) },
          ]}
          onClear={() => setFilterEstado('')}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}
          </div>
        ) : citas.length === 0 ? (
          <EmptyState title="Sin registros" description="No hay citas registradas aún." />
        ) : (
          <AppointmentsTable
            citas={paginated}
            estadosCita={estadosCita}
            clientesOpts={clientesOpts}
            rawClientes={rawClientes}
            page={page} totalPages={totalPages} total={total} pageSize={pageSize}
            onPageChange={setPage} onPageSizeChange={setPageSize}
            onView={openView}
            onEdit={form.openEdit}
            onDelete={dangerZone.openEliminarCita}
            onCreateSale={saleForm.openVentaModal}
            onChangeStatus={dangerZone.handleChangeStatus}
          />
        )}
      </div>

      {viewingItem && (
        <AppointmentViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          cita={viewingItem}
          estadosCita={estadosCita}
          clientesOpts={clientesOpts}
          rawClientes={rawClientes}
        />
      )}

      <AppointmentFormDialog
        open={form.isFormOpen}
        onOpenChange={(v) => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        editingId={form.editingId}
        clientesOpts={clientesOpts}
        onSearchClientes={searchClientes}
        estadosCita={estadosCita}
        idCliente={form.idCliente} onIdClienteChange={form.setIdCliente}
        fecha={form.fecha} onFechaChange={form.setFecha}
        hora={form.hora} onHoraChange={form.setHora}
        idEstado={form.idEstado} onIdEstadoChange={form.setIdEstado}
        bookedSlots={form.bookedSlots}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />

      <AppointmentSaleDialog
        cita={saleForm.ventaModalCita}
        onClose={saleForm.closeVentaModal}
        clientesOpts={clientesOpts}
        serviciosOpts={serviciosOpts}
        marcosOpts={marcosOpts}
        lineas={saleForm.ventaLineas}
        onAddLinea={saleForm.addLinea}
        onRemoveLinea={saleForm.removeLinea}
        onUpdateLinea={saleForm.updateLinea}
        observacion={saleForm.ventaObs} onObservacionChange={saleForm.setVentaObs}
        errors={saleForm.ventaErrors}
        total={saleForm.totalVenta}
        isSubmitting={saleForm.isCreandoVenta}
        onSubmit={saleForm.handleCrearVenta}
        onCrearCotizacion={() => saleForm.handleCrearCotizacion(
          clientesOpts.find(o => o.value === String(saleForm.ventaModalCita?.id_cliente))?.label ?? 'Cliente',
          serviciosOpts,
          marcosOpts,
        )}
      />

      <AppointmentCancelAlert
        state={dangerZone.alertEstado}
        onOpenChange={(v) => { if (!v) dangerZone.closeAlertEstado() }}
        onConfirm={dangerZone.confirmCancelarCita}
      />

      <AppointmentDeleteAlert
        target={dangerZone.eliminarTarget}
        onOpenChange={(o) => { if (!o) dangerZone.closeEliminarTarget() }}
        onConfirm={dangerZone.confirmEliminarCita}
      />
    </>
  )
}
