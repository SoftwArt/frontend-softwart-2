// src/features/roles/components/RolesPage.tsx
import { useRoles } from '../hooks/useRoles'
import { useRoleForm } from '../hooks/useRoleForm'
import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState }    from '@/src/shared/components/EmptyState'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { FilterBar }     from '@/src/shared/components/FilterBar'
import { usePagination } from '@/src/shared/hooks/usePagination'
import type { Rol } from '../types'
import { filterRoles } from '../utils'
import { RolesTable } from './RolesTable'
import { RoleFormDialog } from './RoleFormDialog'
import { RoleViewDialog } from './RoleViewDialog'

export function RolesPage() {
  const { roles, isLoading, onCreate, onEdit, onDelete, onToggleStatus } = useRoles()

  const [q,            setQ]            = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterRoles(roles, q, filterEstado), [roles, q, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Rol | null>(null)
  const openView = (r: Rol) => { setViewingItem(r); setIsViewOpen(true) }

  const form = useRoleForm({ onCreate, onEdit })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Roles</h1>
          <p className="text-muted-foreground">Gestiona los roles del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar nombre o descripción..." className="w-64" />
          <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Rol
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
        <EmptyState title="Sin resultados" description="No hay roles que coincidan." />
      ) : (
        <RolesTable
          roles={paginated}
          page={page} totalPages={totalPages} total={total} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onEdit={form.openEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}

      {viewingItem && (
        <RoleViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} rol={viewingItem} />
      )}

      <RoleFormDialog
        open={form.isFormOpen}
        onOpenChange={(v) => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        editingId={form.editingId}
        nombre={form.nombre} onNombreChange={form.setNombre}
        descripcion={form.descripcion} onDescripcionChange={form.setDescripcion}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />
    </div>
  )
}
