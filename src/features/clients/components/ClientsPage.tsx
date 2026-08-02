// src/features/clients/components/ClientsPage.tsx
import { useClients } from '../hooks/useClients'
import { useState, useMemo } from 'react'
import type { Cliente } from '../types'
import { DOCUMENT_TYPES, inputCls, labelCls, selectCls, filterClientes } from '../utils'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button }   from '@/src/shared/components/ui/button'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { ToggleSwitch, ACTIVO_OPTIONS } from '@/src/shared/components/ToggleSwitch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/shared/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/src/shared/components/ui/alert-dialog'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { withToast } from '@/src/shared/lib/withToast'
import { isTelefonoValid, onlyDigits, TELEFONO_ERROR, TELEFONO_MAX_LENGTH } from '@/src/shared/lib/validateTelefono'
import { isNombreLongitudValida, stripDigits, NOMBRE_MIN_ERROR, NOMBRE_MAX_ERROR, NOMBRE_MAX_LENGTH } from '@/src/shared/lib/validateNombre'
import { validarDocumentoPorTipo } from '@/src/shared/lib/validateDocumento'
import { isEmailValid, EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { FilterBar }     from '@/src/shared/components/FilterBar'
import { Pagination }    from '@/src/shared/components/Pagination'
import { usePagination } from '@/src/shared/hooks/usePagination'

export function ClientsPage() {
  const { clientes, isLoading, onCreate, onEdit, onDelete, onToggleStatus } = useClients()

  // ── Búsqueda y filtros ─────────────────────────────────────────────────────
  const [q,            setQ]            = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterClientes(clientes, q, filterEstado), [clientes, q, filterEstado])

  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  // ── Form ───────────────────────────────────────────────────────────────────
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [isViewOpen,   setIsViewOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [viewingItem,  setViewingItem]  = useState<Cliente | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [documento,     setDocumento]     = useState('')
  const [nombre,        setNombre]        = useState('')
  const [correo,        setCorreo]        = useState('')
  const [telefono,      setTelefono]      = useState('')
  const [errors,        setErrors]        = useState<Record<string, string>>({})

  // Reactivo: cambia según el tipo de documento seleccionado (CC/TI numérico
  // con longitud propia, CE/PP alfanumérico) — no espera al submit.
  const documentoFormatoError = documento.length > 0 ? validarDocumentoPorTipo(tipoDocumento, documento) : null
  const correoFormatoError = correo.length > 0 && !isEmailValid(correo) ? EMAIL_ERROR : null
  const telefonoFormatoError = telefono.length > 0 && !isTelefonoValid(telefono) ? TELEFONO_ERROR : null

  const resetForm = () => {
    setTipoDocumento(''); setDocumento(''); setNombre('')
    setCorreo(''); setTelefono(''); setErrors({}); setEditingId(null)
  }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (c: Cliente) => {
    setEditingId(c.id_cliente); setTipoDocumento(c.tipoDocumento)
    setDocumento(c.documento); setNombre(c.nombre)
    setCorreo(c.correo); setTelefono(c.telefono ?? '')
    setErrors({}); setIsFormOpen(true)
  }
  const openView = (c: Cliente) => { setViewingItem(c); setIsViewOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!tipoDocumento)    newErrors.tipoDocumento = 'Campo requerido'
    if (!documento.trim())        newErrors.documento = 'Campo requerido'
    else if (documentoFormatoError) newErrors.documento = documentoFormatoError
    if (!nombre.trim())              newErrors.nombre = 'Campo requerido'
    else if (!isNombreLongitudValida(nombre)) newErrors.nombre = NOMBRE_MIN_ERROR
    if (!correo.trim())    newErrors.correo        = 'Campo requerido'
    else if (correoFormatoError) newErrors.correo  = correoFormatoError
    if (!telefono.trim())           newErrors.telefono = 'Campo requerido'
    else if (telefonoFormatoError) newErrors.telefono = telefonoFormatoError
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      await withToast(
        editingId
          ? onEdit(editingId, { tipoDocumento, documento, nombre, telefono })
          : onCreate({ tipoDocumento, documento, nombre, correo, telefono, estado: true }),
        editingId ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
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
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Cliente
          </Button>
        </div>
      </div>

      {/* FilterBar */}
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
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>

                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[22%]">Nombre</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[14%]">Documento</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[24%]">Correo</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[14%]">Teléfono</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[12%]">Estado</TableHead>
                  <TableHead className="text-right text-xs font-semibold tracking-wide text-muted-foreground w-[14%]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id_cliente} className="hover:bg-muted/40 transition-colors border-border">

                    <TableCell className="text-foreground font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-foreground">
                      <span className="text-xs text-muted-foreground mr-1">{c.tipoDocumento}</span>{c.documento}
                    </TableCell>
                    <TableCell className="text-foreground">{c.correo}</TableCell>
                    <TableCell className="text-foreground">{c.telefono ?? '—'}</TableCell>
                    <TableCell>
                      <ToggleSwitch value={c.estado ? 1 : 0} onChange={() => withToast(onToggleStatus(c.id_cliente), 'Estado actualizado')} options={ACTIVO_OPTIONS} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Ver detalle de cliente" onClick={() => openView(c)}>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalle</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Editar cliente" onClick={() => openEdit(c)}>
                              <Pencil className="h-4 w-4 text-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Eliminar cliente">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent className="bg-card text-card-foreground border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif text-secondary">¿Eliminar a {c.nombre}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará el cliente y su usuario asociado. Si <strong>{c.nombre}</strong> tiene
                                citas o ventas asociadas, no podrá eliminarse. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border text-foreground">Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground"
                                onClick={async () => {
                                await withToast(onDelete(c.id_cliente), 'Cliente eliminado')
                              }}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page} totalPages={totalPages} total={total} pageSize={pageSize}
            onChange={setPage} onPageSizeChange={setPageSize} className="px-2 pb-2"
          />
        </div>
      )}

      {/* ViewDialog */}
      {viewingItem && (
        <ViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          title={`Cliente — ${viewingItem.nombre}`}
          fields={[
            { label: 'ID',             value: viewingItem.id_cliente },
            { label: 'Estado',         value: <EstadoBadge estado={viewingItem.estado} /> },
            { label: 'Tipo documento', value: viewingItem.tipoDocumento },
            { label: 'Documento',      value: viewingItem.documento },
            { label: 'Nombre',         value: viewingItem.nombre, fullWidth: true },
            { label: 'Correo',         value: viewingItem.correo, fullWidth: true },
            { label: 'Teléfono',       value: viewingItem.telefono },
          ]}
        />
      )}

      {/* Form */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { setIsFormOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-secondary">
              {editingId ? 'Editar Cliente' : 'Registrar Cliente'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId ? 'Puedes editar todos los campos excepto el correo.' : 'Completa los datos del nuevo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2" noValidate>
            <div>
              <label className={labelCls} htmlFor="cli-tipo-doc">Tipo de documento <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.tipoDocumento}>
                <Select value={tipoDocumento} onValueChange={(v) => { setTipoDocumento(v); if (errors.tipoDocumento) setErrors({...errors, tipoDocumento: ''}) }}>
                  <SelectTrigger id="cli-tipo-doc" className={selectCls}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-documento">Número de documento <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.documento || documentoFormatoError}>
                <input id="cli-documento" value={documento} placeholder="Ej: 1234567890"
                  onChange={e => { setDocumento(e.target.value); if (errors.documento) setErrors({...errors, documento: ''}) }}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-nombre">Nombre completo <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.nombre || (nombre.length >= NOMBRE_MAX_LENGTH ? NOMBRE_MAX_ERROR : null)}>
                <input id="cli-nombre" value={nombre} placeholder="Nombre completo del cliente"
                  onChange={e => { setNombre(stripDigits(e.target.value)); if (errors.nombre) setErrors({...errors, nombre: ''}) }}
                  maxLength={NOMBRE_MAX_LENGTH}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            {!editingId && (
              <div>
                <label className={labelCls} htmlFor="cli-correo">Correo electrónico <span className="text-destructive">*</span></label>
                <FieldErrorTooltip error={errors.correo || correoFormatoError}>
                  <input id="cli-correo" type="email" value={correo} placeholder="correo@ejemplo.com"
                    onChange={e => { setCorreo(e.target.value); if (errors.correo) setErrors({...errors, correo: ''}) }}
                    className={inputCls} />
                </FieldErrorTooltip>
              </div>
            )}
            <div>
              <label className={labelCls} htmlFor="cli-telefono">Teléfono <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.telefono || telefonoFormatoError}>
                <input id="cli-telefono" type="tel" value={telefono} placeholder="Ej: 3001234567"
                  maxLength={TELEFONO_MAX_LENGTH}
                  onChange={e => { setTelefono(onlyDigits(e.target.value)); if (errors.telefono) setErrors({...errors, telefono: ''}) }}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button type="button"
                onClick={() => { setIsFormOpen(false); resetForm() }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                {editingId ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
