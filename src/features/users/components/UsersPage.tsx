// src/features/users/components/UsersPage.tsx
import { useUsers } from '../hooks/useUsers'
import { useUserForm } from '../hooks/useUserForm'
import { useRolesOptions } from '@/src/shared/hooks/useOptions'
import { useState, useMemo } from 'react'
import type { Usuario } from '../types'
import { filterUsuarios } from '../utils'
import { Plus } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { SearchInput }  from '@/src/shared/components/SearchInput'
import { FilterBar }    from '@/src/shared/components/FilterBar'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { UsersTable } from './UsersTable'
import { UserFormDialog } from './UserFormDialog'
import { UserViewDialog } from './UserViewDialog'

export function UsersPage() {
  const { usuarios, isLoading, onCreate, onEdit, onDelete, onToggleStatus } = useUsers()
  const { options: rolesOptsActivos, rawRoles } = useRolesOptions()

  const [q,           setQ]           = useState('')
  const [filterRol,   setFilterRol]   = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterUsuarios(usuarios, rawRoles, q, filterRol, filterEstado), [usuarios, rawRoles, q, filterRol, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Usuario | null>(null)
  const openView = (u: Usuario) => { setViewingItem(u); setIsViewOpen(true) }

  const form = useUserForm({ usuarios, rolesOptsActivos, rawRoles, onCreate, onEdit })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por correo o rol..." className="w-64" />
          <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Usuario
          </Button>
        </div>
      </div>

      <FilterBar
        filters={[
          { key: 'rol', label: 'Rol', type: 'select', value: filterRol, onChange: setFilterRol,
            options: [{ value: '1', label: 'Admin' }, { value: '3', label: 'Cliente' }] },
          { key: 'estado', label: 'Estado', type: 'chips', value: filterEstado, onChange: setFilterEstado,
            options: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] },
        ]}
        onClear={() => { setFilterRol(''); setFilterEstado('') }}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay usuarios que coincidan con la búsqueda." />
      ) : (
        <UsersTable
          usuarios={paginated}
          rawRoles={rawRoles}
          page={page} totalPages={totalPages} total={total} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onEdit={form.openEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}

      {viewingItem && (
        <UserViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} usuario={viewingItem} rawRoles={rawRoles} />
      )}

      <UserFormDialog
        open={form.isFormOpen}
        onOpenChange={(v) => { form.setIsFormOpen(v); if (!v) form.resetForm() }}
        editingId={form.editingId}
        correo={form.correo} onCorreoChange={form.setCorreo}
        clave={form.clave} onClaveChange={form.setClave}
        idRol={form.idRol} onIdRolChange={form.setIdRol}
        rolesOptsForm={form.rolesOptsForm}
        errors={form.errors}
        correoFormatoError={form.correoFormatoError}
        editingIsAdminBase={form.editingIsAdminBase}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => { form.setIsFormOpen(false); form.resetForm() }}
      />
    </div>
  )
}
