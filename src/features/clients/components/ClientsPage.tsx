// src/features/clients/components/ClientsPage.tsx
import { useClients } from '../hooks/useClients'
import { useClientForm } from '../hooks/useClientForm'
import { useState, useMemo } from 'react'
import type { Cliente } from '../types'
import { filterClientes } from '../utils'
import { Plus } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { FilterBar }     from '@/src/shared/components/FilterBar'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { ClientsTable } from './ClientsTable'
import { ClientFormDialog } from './ClientFormDialog'
import { ClientViewDialog } from './ClientViewDialog'

export function ClientsPage() {
  const { clientes, isLoading, onCreate, onEdit, onDelete, onToggleStatus } = useClients()

  const [q,            setQ]            = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterClientes(clientes, q, filterEstado), [clientes, q, filterEstado])
  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isViewOpen,  setIsViewOpen]  = useState(false)
  const [viewingItem, setViewingItem] = useState<Cliente | null>(null)
  const openView = (c: Cliente) => { setViewingItem(c); setIsViewOpen(true) }

  const form = useClientForm({ onCreate, onEdit })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={q} onChange={setQ}
            placeholder="Buscar nombre, documento, correo..."
            className="w-96"
          />
          <Button onClick={form.openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Cliente
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay clientes que coincidan con la búsqueda." />
      ) : (
        <ClientsTable
          clientes={paginated}
          page={page} totalPages={totalPages} total={total} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={setPageSize}
          onView={openView}
          onEdit={form.openEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}

      {viewingItem && (
        <ClientViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} cliente={viewingItem} />
      )}

      <ClientFormDialog
        open={form.isFormOpen}
        onOpenChange={form.setIsFormOpen}
        editingId={form.editingId}
        tipoDocumento={form.tipoDocumento} onTipoDocumentoChange={form.setTipoDocumento}
        documento={form.documento} onDocumentoChange={form.setDocumento}
        nombre={form.nombre} onNombreChange={form.setNombre}
        correo={form.correo} onCorreoChange={form.setCorreo}
        telefono={form.telefono} onTelefonoChange={form.setTelefono}
        acceptToS={form.acceptToS} onAcceptToSChange={form.setAcceptToS}
        acceptPrivacy={form.acceptPrivacy} onAcceptPrivacyChange={form.setAcceptPrivacy}
        legalModal={form.legalModal} onLegalModalChange={form.setLegalModal}
        errors={form.errors}
        documentoFormatoError={form.documentoFormatoError}
        correoFormatoError={form.correoFormatoError}
        telefonoFormatoError={form.telefonoFormatoError}
        isSubmitting={form.isSubmitting}
        onSubmit={form.handleSubmit}
        onCancel={() => form.setIsFormOpen(false)}
      />
    </div>
  )
}
