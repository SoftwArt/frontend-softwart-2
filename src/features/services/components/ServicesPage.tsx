// src/features/services/components/ServicesPage.tsx
import { useServices } from '../hooks/useServices'
import { useServiceForm } from '../hooks/useServiceForm'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { Servicio } from '../types'
import { filterServicios } from '../utils'
import { Plus } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState }    from '@/src/shared/components/EmptyState'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { FilterBar }     from '@/src/shared/components/FilterBar'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { ServicesTable } from './ServicesTable'
import { ServiceFormDialog } from './ServiceFormDialog'
import { ServiceViewDialog } from './ServiceViewDialog'

export function ServicesPage() {
  const { servicios, isLoading, onCreate, onEdit, onDelete, onToggleStatus } = useServices()

  const [q,            setQ]            = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterServicios(servicios, q, filterEstado), [servicios, q, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Servicio | null>(null)
  const openView = (s: Servicio) => { setViewingItem(s); setIsViewOpen(true) }

  const form = useServiceForm({ onCreate, onEdit })

  const handleDelete = async (id: number) => {
    const err = await onDelete(id)
    if (err) toast.error(err)
    else toast.success('Tipo de servicio eliminado')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Tipos de Servicio</h1>
          <p className="text-muted-foreground">Gestiona los tipos de servicio disponibles</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar nombre o descripción..." className="w-96" />
          <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Tipo
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
        <EmptyState title="Sin resultados" description="No hay servicios que coincidan." />
      ) : (
        <ServicesTable
          servicios={paginated}
          page={page} totalPages={totalPages} total={total} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onEdit={form.openEdit}
          onToggleStatus={onToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {viewingItem && (
        <ServiceViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} servicio={viewingItem} />
      )}

      <ServiceFormDialog
        open={form.isFormOpen}
        onOpenChange={v => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        editingId={form.editingId}
        nombre={form.nombre} onNombreChange={form.setNombre}
        duracionStr={form.duracionStr} onDuracionChange={form.setDuracionStr}
        descripcion={form.descripcion} onDescripcionChange={form.setDescripcion}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />
    </div>
  )
}
