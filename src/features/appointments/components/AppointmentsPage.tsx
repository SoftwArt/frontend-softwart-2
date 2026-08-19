// src/features/appointments/components/AppointmentsPage.tsx
import { useAppointments } from '../hooks/useAppointments'
import { useServicesOptions, useFrameOptions } from '@/src/shared/hooks/useOptions'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { useClientsOptions } from '@/src/shared/hooks/useOptions'
import { useState, useMemo, useCallback } from 'react'
import type { Cita, VentaLinea, CitaDetalle } from '../types'
import { inputCls, labelCls, selectCls, badgeClassByName, filterCitas, todayStr, validateFecha, fmtCOP } from '../utils'
import { DOCUMENT_TYPES } from '@/src/features/clients/utils'
import { useSearchParams } from 'react-router-dom'
import { SearchInput }   from '@/src/shared/components/SearchInput'
import { Pagination }    from '@/src/shared/components/Pagination'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { FilterBar } from '@/src/shared/components/FilterBar'
import { withToast } from '@/src/shared/lib/withToast'
import { undoableAction } from '@/src/shared/lib/undoableAction'
import { formatDate, formatTime } from '@/src/shared/lib/formatDate'
import { bogotaTodayStr, bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { isWithinBusinessHours } from '@/src/shared/lib/businessHours'
import { Plus, Pencil, Eye, ShoppingCart, PlusCircle, Trash, Trash2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { Badge } from '@/src/shared/components/ui/badge'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { StatusSelect } from '@/src/shared/components/StatusSelect'
import { TimePicker, BookedSlot } from '@/src/shared/components/TimePicker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/src/shared/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/shared/components/ui/table'
import { ViewDialog } from '@/src/shared/components/ViewDialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'
import { Combobox } from '@/src/shared/components/Combobox'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { CascadePreview } from '@/src/shared/components/CascadePreview'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'


export function AppointmentsPage() {
  const { citas, estadosCita, isLoading, onCreate, onEdit, onDelete, onChangeStatus, refresh } = useAppointments()
  const { options: clientesOpts, rawClientes, search: searchClientes } = useClientsOptions()
  const { options: serviciosOpts } = useServicesOptions()
  const { options: marcosOpts }    = useFrameOptions()
  const [searchParams] = useSearchParams()

  const [q,            setQ]            = useState(searchParams.get('q') ?? '')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = useMemo(() => filterCitas(citas, clientesOpts, q, filterEstado), [citas, clientesOpts, q, filterEstado])

  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  // ── Form cita ──────────────────────────────────────────────────────────────
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [isViewOpen,   setIsViewOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [viewingItem,  setViewingItem]  = useState<Cita | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idCliente,    setIdCliente]    = useState('')
  const [fecha,        setFecha]        = useState('')
  const [hora,         setHora]         = useState('')
  const [idEstado,     setIdEstado]     = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  // ── Modal Crear Venta ──────────────────────────────────────────────────────
  const [ventaModalCita, setVentaModalCita] = useState<Cita | null>(null)
  const [ventaLineas,    setVentaLineas]    = useState<VentaLinea[]>([])
  const [ventaObs,       setVentaObs]       = useState('')
  const [ventaErrors,    setVentaErrors]    = useState<Record<string, string>>({})
  const [isCreandoVenta, setIsCreandoVenta] = useState(false)

  const lineaVacia = useCallback((id: number): VentaLinea =>
    ({ id, id_servicio: '', id_marco: '', precio: '', observacion: '' }), [])

  const openVentaModal = (cita: Cita) => {
    setVentaModalCita(cita)
    setVentaLineas([lineaVacia(Date.now())])
    setVentaObs('')
    setVentaErrors({})
  }

  const addLinea    = () => setVentaLineas(p => [...p, lineaVacia(Date.now())])
  const removeLinea = (id: number) => setVentaLineas(p => p.filter(l => l.id !== id))
  const updateLinea = (id: number, field: string, value: string) =>
    setVentaLineas(p => p.map(l => l.id === id ? { ...l, [field]: value } : l))

  const totalVenta = ventaLineas.reduce((sum, l) => sum + (Number(l.precio) || 0), 0)

  const handleCrearVenta = async () => {
    const errs: Record<string, string> = {}
    ventaLineas.forEach((l, i) => {
      if (!l.id_servicio) errs[`servicio_${i}`] = 'Requerido'
      if (!l.precio || isNaN(Number(l.precio)) || Number(l.precio) <= 0)
        errs[`precio_${i}`] = 'Precio inválido'
    })
    if (Object.keys(errs).length) { setVentaErrors(errs); return }
    if (!ventaModalCita) return

    setIsCreandoVenta(true)
    try {
      await withToast(
        apiRequest(`/api/appointments/${ventaModalCita.id_cita}/create-sale`, {
          method: 'POST',
          body: JSON.stringify({
            observacion: ventaObs || undefined,
            servicios: ventaLineas.map(l => ({
              id_servicio: Number(l.id_servicio),
              id_marco:    l.id_marco ? Number(l.id_marco) : null,
              precio:      Number(l.precio),
              observacion: l.observacion || undefined,
            })),
          }),
        }),
        `Venta creada por ${fmtCOP(totalVenta)}. La cita pasó a Completada.`
      )
      await refresh()
      setVentaModalCita(null)
    } catch { } finally {
      setIsCreandoVenta(false)
    }
  }

  // ── Form helpers ───────────────────────────────────────────────────────────
  const resetForm  = () => { setIdCliente(''); setFecha(''); setHora(''); setIdEstado(''); setErrors({}); setEditingId(null) }
  const openCreate = () => {
    resetForm()
    const confirmada = estadosCita.find(e => e.nombre.toLowerCase() === 'confirmada')
    setIdEstado(String(confirmada?.id_estado_cita ?? 5))
    setFecha(todayStr())
    setIsFormOpen(true)
  }
  const openEdit   = (c: Cita) => { setEditingId(c.id_cita); setIdCliente(String(c.id_cliente)); setFecha(c.fecha); setHora(c.hora); setIdEstado(String(c.id_estado_cita)); setErrors({}); setIsFormOpen(true) }
  const openView   = (c: Cita) => { setViewingItem(c); setIsViewOpen(true) }

  const getEstadoLabel = (id: number) => estadosCita.find(e => e.id_estado_cita === id)?.nombre ?? `Estado ${id}`
  const isCancelada  = (id: number) => getEstadoLabel(id).toLowerCase().includes('cancelada')
  const isCompletada = (id: number) => getEstadoLabel(id).toLowerCase().includes('completada')
  const estadoCancelada = estadosCita.find(e => e.nombre.toLowerCase().includes('cancelada'))

  // Confirmación de eliminar cita — si tiene Venta asociada, el backend la
  // cascadea igual que deleteSale (bloquea solo si hay abonos Validados).
  // Previsualizar qué se borra en vez del texto genérico fijo de antes.
  const [eliminarCitaTarget, setEliminarCitaTarget] = useState<{ id: number; label: string; loading?: boolean; bloqueado?: boolean; msg?: string; lines: string[] } | null>(null)

  const openEliminarCita = (cita: Cita) => {
    const label = clientesOpts.find(o => o.value === String(cita.id_cliente))?.label ?? `Cita #${cita.id_cita}`
    setEliminarCitaTarget({ id: cita.id_cita, label, loading: true, lines: [] })
    apiRequest<{ success: boolean; data: CitaDetalle }>(`/api/appointments/${cita.id_cita}`)
      .then((res) => {
        const sale = res.data?.sale
        if (!sale) {
          setEliminarCitaTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines: [] } : prev)
          return
        }
        const pagosValidados = (sale.payments ?? []).some(
          p => p.paymentStatus?.nombre?.toLowerCase().includes('validado')
        )
        if (pagosValidados) {
          setEliminarCitaTarget(prev => prev && prev.id === cita.id_cita
            ? { ...prev, loading: false, bloqueado: true, msg: `Tiene la Venta #${sale.id_venta} con abonos validados. No se puede eliminar, solo anular.`, lines: [] }
            : prev)
          return
        }
        const lines = [
          `Venta #${sale.id_venta} se eliminará`,
          ...(sale.saleDetails ?? []).map(d => `Servicio #${d.id_detalle} se eliminará`),
          ...(sale.payments ?? []).map(p => `Abono #${p.id_pago} se eliminará`),
        ]
        setEliminarCitaTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines } : prev)
      })
      .catch(() => setEliminarCitaTarget(prev => prev && prev.id === cita.id_cita ? { ...prev, loading: false, lines: [] } : prev))
  }

  const confirmEliminarCita = () => {
    if (!eliminarCitaTarget || eliminarCitaTarget.loading || eliminarCitaTarget.bloqueado) return
    const { id, label } = eliminarCitaTarget
    setEliminarCitaTarget(null)
    undoableAction({
      message: `Eliminando cita de ${label}...`,
      successMsg: 'Cita eliminada',
      onCommit: () => onDelete(id),
    })
  }

  // Protección de estado Cancelada — terminal e irreversible, igual que Anulado en Pagos
  const MSG_BASE = 'Cancelar una cita es definitivo: no podrá modificarse ni volver a cambiar de estado.'
  const [alertEstado, setAlertEstado] = useState<{ open: boolean; msg: string; lines: string[]; citaId?: number; nuevoEstado?: number; loading?: boolean; bloqueado?: boolean }>({ open: false, msg: '', lines: [] })

  const handleChangeStatus = (cita: Cita, nuevoIdEstadoSeleccionado: number) => {
    // Una cita Completada ya ocurrió — el único cambio de estado válido a
    // partir de acá es anularla (Cancelada), no "retroceder" a otro estado.
    // En vez de solo bloquear con un error, se redirige a la misma
    // confirmación de anular (igual que un pago Validado en Pagos).
    const bloqueadoDesdeCompletada = isCompletada(cita.id_estado_cita)
      && !getEstadoLabel(nuevoIdEstadoSeleccionado).toLowerCase().includes('cancelada')
    const nuevoIdEstado = bloqueadoDesdeCompletada && estadoCancelada
      ? estadoCancelada.id_estado_cita
      : nuevoIdEstadoSeleccionado

    if (!getEstadoLabel(nuevoIdEstado).toLowerCase().includes('cancelada')) {
      withToast(onChangeStatus(cita.id_cita, nuevoIdEstado), 'Estado actualizado')
      return
    }

    setAlertEstado({
      open: true,
      loading: true,
      msg: bloqueadoDesdeCompletada
        ? `Esta cita ya está Completada — no puede cambiar a otro estado, solo anularse. ${MSG_BASE}`
        : MSG_BASE,
      lines: [],
      citaId: cita.id_cita,
      nuevoEstado: nuevoIdEstado,
    })

    apiRequest<{ success: boolean; data: CitaDetalle }>(`/api/appointments/${cita.id_cita}`)
      .then((res) => {
        const sale = res.data?.sale
        if (!sale) {
          setAlertEstado(prev => ({ ...prev, loading: false, lines: [] }))
          return
        }

        const pagosValidados = (sale.payments ?? []).some(
          p => p.paymentStatus?.nombre?.toLowerCase().includes('validado')
        )
        if (pagosValidados) {
          setAlertEstado(prev => ({
            ...prev,
            loading: false,
            bloqueado: true,
            msg: `No se puede cancelar: la Venta #${sale.id_venta} asociada tiene pagos validados. Registra la devolución antes de cancelar la cita.`,
            lines: [],
          }))
          return
        }

        const serviciosACancelar = (sale.saleDetails ?? [])
          .filter(d => {
            const n = d.serviceStatus?.nombre?.toLowerCase() ?? ''
            return !n.includes('finaliz') && !n.includes('cancel')
          })
          .map(d => d.id_detalle)

        const abonosAAnular = (sale.payments ?? [])
          .filter(p => p.paymentStatus?.nombre?.toLowerCase().includes('pendiente'))

        const lines = [
          `Se anulará la Venta #${sale.id_venta}`,
          ...serviciosACancelar.map(id => `Servicio #${id} se cancelará`),
          ...abonosAAnular.map(p => `Abono #${p.id_pago} (${fmtCOP(p.monto)}) se anulará`),
        ]

        setAlertEstado(prev => ({ ...prev, loading: false, lines }))
      })
      .catch(() => {
        setAlertEstado(prev => ({ ...prev, loading: false, lines: [] }))
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!idCliente)    newErrors.idCliente = 'Campo requerido'
    if (!fecha.trim()) newErrors.fecha = 'Campo requerido'
    else if (!validateFecha(fecha)) newErrors.fecha = 'La fecha no puede ser en el pasado'
    if (!hora.trim()) {
      newErrors.hora = 'Campo requerido'
    } else if (!isWithinBusinessHours(hora)) {
      newErrors.hora = 'La hora debe estar entre 13:00 y 18:00'
    }
    if (!idEstado) newErrors.idEstado = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      const data = { id_cliente: Number(idCliente), fecha, hora, id_estado_cita: Number(idEstado) }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Cita actualizada' : 'Cita registrada'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
          <div className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
               
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[34%]">Cliente</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[14%]">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[12%]">Hora</TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[20%]">Estado</TableHead>
                  <TableHead className="text-right text-xs font-semibold tracking-wide text-muted-foreground w-[20%]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => {
                  const clienteLabel = clientesOpts.find(o => o.value === String(c.id_cliente))?.label ?? `#${c.id_cliente}`
                  const cliente = rawClientes.find(rc => rc.id_cliente === c.id_cliente)
                  // Siglas (CC/TI/CE/PP), no el nombre completo — mismo formato que la
                  // columna Documento del CRUD de Clientes.
                  const documentoLabel = cliente ? `${cliente.tipoDocumento} · ${cliente.documento}` : null
                  return (
                    <TableRow
                      key={c.id_cita}
                      className={c.tieneVenta
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-border'
                        : 'hover:bg-muted/40 transition-colors border-border'}
                    >

                      <TableCell className="text-foreground">
                        <div className="font-medium">{clienteLabel}</div>
                        {documentoLabel && <div className="text-xs text-muted-foreground">{documentoLabel}</div>}
                      </TableCell>
                      <TableCell className="text-foreground">{formatDate(c.fecha)}</TableCell>
                      <TableCell className="text-foreground">{formatTime(c.hora)}</TableCell>
                      <TableCell>
                        {isCancelada(c.id_estado_cita) ? (
                          <Badge variant="outline" className={`${badgeClassByName(getEstadoLabel(c.id_estado_cita))} cursor-not-allowed opacity-70`}>
                            {getEstadoLabel(c.id_estado_cita)}
                          </Badge>
                        ) : (
                          <StatusSelect
                            value={String(c.id_estado_cita)}
                            onValueChange={(v) => handleChangeStatus(c, Number(v))}
                            options={estadosCita.map((e, i) => ({
                              value:    String(e.id_estado_cita),
                              label:    e.nombre,
                              badgeCls: badgeClassByName(e.nombre, i),
                            }))}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botón siempre presente (no se esconde según contexto) — si la cita
                              no está Completada queda aria-disabled con tooltip explicando por
                              qué, en vez de desaparecer del DOM. Mismo criterio de accesibilidad
                              que RegisterPage/LoginPage: informar el estado, no ocultarlo. */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost" size="icon"
                                aria-label="Crear venta desde cita"
                                aria-disabled={!isCompletada(c.id_estado_cita) || c.tieneVenta}
                                onClick={() => { if (isCompletada(c.id_estado_cita) && !c.tieneVenta) openVentaModal(c) }}
                                className={(!isCompletada(c.id_estado_cita) || c.tieneVenta) ? 'opacity-40 cursor-not-allowed' : ''}
                              >
                                <ShoppingCart className={`h-4 w-4 ${isCompletada(c.id_estado_cita) && !c.tieneVenta ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {!isCompletada(c.id_estado_cita)
                                ? 'Solo se puede crear una venta cuando la cita está Completada'
                                : c.tieneVenta
                                  ? 'Esta cita ya tiene una venta — si necesitas registrar otra (ej. un producto sin servicio asociado), créala manual desde Ventas sin vincular la cita'
                                  : 'Crear venta'}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Ver detalle de cita" onClick={() => openView(c)}>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalle</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost" size="icon"
                                aria-label="Editar cita"
                                aria-disabled={isCancelada(c.id_estado_cita) || isCompletada(c.id_estado_cita)}
                                onClick={() => { if (!isCancelada(c.id_estado_cita) && !isCompletada(c.id_estado_cita)) openEdit(c) }}
                                className={(isCancelada(c.id_estado_cita) || isCompletada(c.id_estado_cita)) ? 'opacity-40 cursor-not-allowed' : ''}
                              >
                                <Pencil className="h-4 w-4 text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCancelada(c.id_estado_cita)
                                ? 'No se puede editar una cita Cancelada'
                                : isCompletada(c.id_estado_cita)
                                  ? 'No se puede editar una cita Completada'
                                  : 'Editar'}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Eliminar cita" onClick={() => openEliminarCita(c)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page} totalPages={totalPages} total={total} pageSize={pageSize}
            onChange={setPage} onPageSizeChange={setPageSize} className="px-2 pb-2"
          />
        </div>
        )}
      </div>

      {/* ── ViewDialog ──────────────────────────────────────────────────────── */}
      {viewingItem && (() => {
        const cliente = rawClientes.find(c => c.id_cliente === viewingItem.id_cliente)
        return (
        <ViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          title={`Cita #${viewingItem.id_cita}`}
          fields={[
            { label: 'Estado',  value: <Badge variant="outline" className={badgeClassByName(getEstadoLabel(viewingItem.id_estado_cita))}>{getEstadoLabel(viewingItem.id_estado_cita)}</Badge> },
            { label: 'Cliente', value: clientesOpts.find(o => o.value === String(viewingItem.id_cliente))?.label ?? `#${viewingItem.id_cliente}`, fullWidth: true },
            { label: 'Tipo de documento', value: DOCUMENT_TYPES.find(t => t.value === cliente?.tipoDocumento)?.label ?? cliente?.tipoDocumento },
            { label: 'Documento',         value: cliente?.documento },
            { label: 'Fecha',   value: formatDate(viewingItem.fecha) },
            { label: 'Hora',    value: formatTime(viewingItem.hora) },
            ...(viewingItem.motivoCancelacion
              ? [{ label: 'Motivo de cancelación', value: viewingItem.motivoCancelacion, fullWidth: true }]
              : []),
          ]}
        />
        )
      })()}

      {/* ── Dialog Form Cita ────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { setIsFormOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Cita' : 'Registrar Cita'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Completa los datos de la cita.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2" noValidate>
            <div>
              <label className={labelCls} htmlFor="cita-cliente">Cliente <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.idCliente}>
                <div>
                  <Combobox
                    id="cita-cliente"
                    options={clientesOpts} value={idCliente}
                    onValueChange={(v) => { setIdCliente(v); if (errors.idCliente) setErrors({...errors, idCliente: ''}) }}
                    onSearchChange={searchClientes}
                    placeholder="Buscar cliente..." searchPlaceholder="Nombre o documento..."
                  />
                </div>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cita-fecha">Fecha <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.fecha}>
                <div>
                  <DatePicker
                    id="cita-fecha"
                    value={fecha}
                    min={bogotaTodayStr()}
                    max={bogotaMaxFuturoStr()}
                    onChange={(v) => { setFecha(v); if (errors.fecha) setErrors({...errors, fecha: ''}) }}
                    error={errors.fecha}
                  />
                </div>
              </FieldErrorTooltip>
            </div>
            <TimePicker
              value={hora}
              onChange={(v) => { setHora(v); if (errors.hora) setErrors({...errors, hora: ''}) }}
              error={errors.hora}
              bookedSlots={
                fecha
                  ? (citas as any[])
                      .filter((c: any) => c.fecha === fecha && c.id_cita !== editingId)
                      .map((c: any): BookedSlot => ({ hora: c.hora, clienteNombre: c.clienteNombre, id_cita: c.id_cita }))
                  : []
              }
            />
            <div>
              <label className={labelCls} htmlFor="cita-estado">Estado <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.idEstado}>
                <Select value={idEstado} onValueChange={(v) => { setIdEstado(v); if (errors.idEstado) setErrors({...errors, idEstado: ''}) }}>
                  <SelectTrigger id="cita-estado" className={selectCls}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosCita.map(e => <SelectItem key={e.id_estado_cita} value={String(e.id_estado_cita)}>{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldErrorTooltip>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button type="button" onClick={() => { setIsFormOpen(false); resetForm() }} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                {editingId ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Crear Venta desde Cita ─────────────────────────────────────── */}
      <Dialog open={ventaModalCita !== null} onOpenChange={v => { if (!v) setVentaModalCita(null) }}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              Crear venta — Cita #{ventaModalCita?.id_cita}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {ventaModalCita != null
                ? `${clientesOpts.find(o => o.value === String(ventaModalCita.id_cliente))?.label ?? 'Cliente'} · ${ventaModalCita.fecha} ${ventaModalCita.hora}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* Líneas de servicio */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Servicios</span>
                <Button type="button" variant="outline" size="sm" onClick={addLinea} className="gap-1 h-7 text-xs">
                  <PlusCircle className="h-3.5 w-3.5" />Agregar servicio
                </Button>
              </div>

              {ventaLineas.map((linea, i) => (
                <div key={linea.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border border-border bg-background">
                  <div className="col-span-4 flex flex-col gap-1">
                    <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-svc-${i}`}>Tipo de Servicio <span className="text-destructive">*</span></label>
                    <FieldErrorTooltip error={ventaErrors[`servicio_${i}`]}>
                      <select
                        id={`srv-svc-${i}`}
                        value={linea.id_servicio}
                        onChange={e => updateLinea(linea.id, 'id_servicio', e.target.value)}
                        className="flex h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Seleccionar...</option>
                        {serviciosOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </FieldErrorTooltip>
                  </div>
                  <div className="col-span-3 flex flex-col gap-1">
                    <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-marco-${i}`}>Marco (opcional)</label>
                    <select
                      id={`srv-marco-${i}`}
                      value={linea.id_marco}
                      onChange={e => updateLinea(linea.id, 'id_marco', e.target.value)}
                      className="flex h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Sin marco</option>
                      {marcosOpts.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3 flex flex-col gap-1">
                    <label className="block text-xs text-muted-foreground mb-0.5" htmlFor={`srv-precio-${i}`}>Precio (COP) <span className="text-destructive">*</span></label>
                    <FieldErrorTooltip error={ventaErrors[`precio_${i}`]}>
                      <Input
                        id={`srv-precio-${i}`}
                        type="number" min="0" placeholder="0"
                        value={linea.precio}
                        onChange={e => updateLinea(linea.id, 'precio', e.target.value)}
                        className="h-8 text-xs bg-card border-border"
                      />
                    </FieldErrorTooltip>
                  </div>
                  <div className="col-span-2 flex items-end pb-0.5">
                    <Button
                      type="button" variant="ghost" size="icon"
                      disabled={ventaLineas.length === 1}
                      onClick={() => removeLinea(linea.id)}
                      title="Quitar línea" aria-label="Quitar línea de servicio"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="col-span-12 flex flex-col gap-1">
                    <Input
                      placeholder="Observación de este servicio (opcional)"
                      value={linea.observacion}
                      onChange={e => updateLinea(linea.id, 'observacion', e.target.value)}
                      className="h-7 text-xs bg-card border-border"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Observación general */}
            <div>
              <label className={labelCls} htmlFor="venta-obs">Observación general (opcional)</label>
              <textarea
                id="venta-obs"
                value={ventaObs}
                onChange={e => setVentaObs(e.target.value)}
                placeholder="Notas sobre la venta..."
                className="w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Total + confirmar */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{fmtCOP(totalVenta)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setVentaModalCita(null)} disabled={isCreandoVenta} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCrearVenta}
                  disabled={isCreandoVenta}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isCreandoVenta ? 'Creando...' : 'Crear venta'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación de cancelación (estado terminal, igual que Anulado en Pagos) */}
      <AlertDialog open={alertEstado.open} onOpenChange={(v) => { if (!v) setAlertEstado({ open: false, msg: '', lines: [] }) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>{alertEstado.msg}</AlertDialogDescription>
          </AlertDialogHeader>
          <CascadePreview lines={alertEstado.lines} loading={alertEstado.loading} />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              disabled={alertEstado.loading || alertEstado.bloqueado}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (alertEstado.citaId && alertEstado.nuevoEstado) {
                  const { citaId, nuevoEstado } = alertEstado
                  undoableAction({
                    message: 'Cancelando cita...',
                    successMsg: 'Cita cancelada',
                    onCommit: () => onChangeStatus(citaId, nuevoEstado),
                  })
                }
                setAlertEstado({ open: false, msg: '', lines: [] })
              }}
            >
              {alertEstado.bloqueado ? 'No se puede cancelar' : 'Cancelar cita'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de eliminar cita (cascadea Venta/Servicios/Abonos si tiene) */}
      <AlertDialog open={eliminarCitaTarget !== null} onOpenChange={(o) => { if (!o) setEliminarCitaTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              {eliminarCitaTarget?.label}. {eliminarCitaTarget?.bloqueado ? eliminarCitaTarget.msg : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <CascadePreview lines={eliminarCitaTarget?.lines ?? []} loading={eliminarCitaTarget?.loading} />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              disabled={eliminarCitaTarget?.loading || eliminarCitaTarget?.bloqueado}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmEliminarCita}
            >
              {eliminarCitaTarget?.bloqueado ? 'No se puede eliminar' : 'Sí, eliminar cita'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}