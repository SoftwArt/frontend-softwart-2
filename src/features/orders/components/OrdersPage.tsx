// src/features/orders/components/OrdersPage.tsx
import { useOrders } from '../hooks/useOrders'
import { useEstadosServicio } from '../hooks/useEstadosServicio'
import { useSalesOptions, useServicesOptions, useFrameOptions } from '@/src/shared/hooks/useOptions'
import { useState, useMemo } from 'react'
import type { Pedido, PedidoDetalle, HistorialEstado } from '../types'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { inputCls, labelCls, badgeClassByName, filterPedidos } from '../utils'
import { useSearchParams } from 'react-router-dom'
import { SearchInput } from '@/src/shared/components/SearchInput'
import { Pagination }    from '@/src/shared/components/Pagination'
import { usePagination } from '@/src/shared/hooks/usePagination'
import { FilterBar } from '@/src/shared/components/FilterBar'
import { withToast } from '@/src/shared/lib/withToast'
import { undoableAction } from '@/src/shared/lib/undoableAction'
import { formatDate } from '@/src/shared/lib/formatDate'
import { bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { Badge } from '@/src/shared/components/ui/badge'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { StatusSelect } from '@/src/shared/components/StatusSelect'
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
import { formatCurrency, fmtCOP } from '@/src/shared/lib/formatCurrency'

export function OrdersPage() {
  const { pedidos, isLoading, onCreate, onEdit, onChangeStatus, onDelete } = useOrders()
  const { options: ventasOpts, rawVentas, search: searchVentas } = useSalesOptions()
  const { options: serviciosOpts } = useServicesOptions()
  const { options: marcosOpts }    = useFrameOptions()
  const estados = useEstadosServicio()
  const [searchParams] = useSearchParams()

  // ── Búsqueda y filtros ─────────────────────────────────────────────────
  const [q,              setQ]              = useState(searchParams.get('q') ?? '')
  const [filterEstado,   setFilterEstado]   = useState('')
  const [filterServicio, setFilterServicio] = useState('')

  const filtered = useMemo(
    () => filterPedidos(pedidos, ventasOpts, serviciosOpts, marcosOpts, rawVentas, estados, q, filterEstado, filterServicio),
    [pedidos, ventasOpts, serviciosOpts, marcosOpts, rawVentas, estados, q, filterEstado, filterServicio],
  )

  const { paginated, page, setPage, totalPages, total, pageSize, setPageSize } = usePagination(filtered)

  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [isViewOpen,   setIsViewOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [viewingItem,  setViewingItem]  = useState<Pedido | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [idVenta,      setIdVenta]      = useState('')
  const [idServicio,   setIdServicio]   = useState('')
  const [idMarco,      setIdMarco]      = useState('')
  const [idEstado,     setIdEstado]     = useState('')
  const [fecha,        setFecha]        = useState('')
  const [precio,       setPrecio]       = useState('')
  const [observacion,  setObservacion]  = useState('')
  const [errors,       setErrors]       = useState<Record<string, string>>({})

  // Helpers para nombre y color de estado por id
  const estadoNombre = (id: number) =>
    estados.find(e => e.id_estado === id)?.nombre ?? `Estado ${id}`
  const estadoColor = (id: number) => {
    const idx = estados.findIndex(e => e.id_estado === id)
    return badgeClassByName(estadoNombre(id), idx === -1 ? 0 : idx)
  }
  const isCancelado  = (id: number) => estadoNombre(id).toLowerCase().includes('cancelado')
  // Mismo estándar visual que la fila verde de Ventas (bg-emerald): un
  // servicio Finalizado ya completó su flujo — se reconoce de un vistazo,
  // sin tener que leer el badge de estado (procesamiento preatentivo).
  const isFinalizado = (id: number) => estadoNombre(id).toLowerCase().includes('finaliz')
  const estadoCanceladoObj = estados.find(e => e.nombre.toLowerCase().includes('cancelado'))

  // Confirmación antes de cancelar (estado terminal e irreversible)
  const [cancelTarget, setCancelTarget] = useState<{ id: number; id_estado: number; loading?: boolean; bloqueado?: boolean; msg?: string; lines: string[] } | null>(null)
  const MSG_CANCELAR_BASE = 'Esta acción es definitiva: un servicio cancelado no podrá modificarse ni volver a cambiar de estado.'

  // Confirmación al avanzar el estado (a cualquiera que no sea "Sin
  // empezar" ni el flujo de cancelar, que ya tiene su propia confirmación)
  // si la Venta todavía no tiene ningún abono Validado — evita que el
  // servicio arranque en el taller antes de que el cliente haya pagado el
  // primer abono.
  const [advanceTarget, setAdvanceTarget] = useState<{ id: number; id_estado: number } | null>(null)

  // Confirmación antes de eliminar (hard-delete: solo para corregir un error
  // de captura antes de que el servicio avance — bloqueado si ya está
  // Cancelado/Finalizado, ahí el camino es anular, no borrar).
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const confirmEliminarServicio = () => {
    if (!deleteTarget) return
    const { id, label } = deleteTarget
    setDeleteTarget(null)
    undoableAction({
      message: `Eliminando ${label}...`,
      successMsg: 'Servicio eliminado',
      onCommit: () => onDelete(id),
    })
  }

  const resetForm = () => {
    setIdVenta(''); setIdServicio(''); setIdMarco(''); setIdEstado('')
    setFecha(''); setPrecio(''); setObservacion(''); setErrors({}); setEditingId(null)
  }
  const openCreate = () => { resetForm(); setFecha(new Date().toISOString().slice(0, 10)); setIsFormOpen(true) }
  const openEdit   = (p: Pedido) => {
    setEditingId(p.id_detalle); setIdVenta(String(p.id_venta))
    setIdServicio(String(p.id_servicio)); setIdMarco(p.id_marco ? String(p.id_marco) : '')
    setIdEstado(String(p.id_estado)); setFecha(p.fecha)
    setPrecio(String(p.precio)); setObservacion(p.observacion ?? '')
    setErrors({}); setIsFormOpen(true)
  }

  const handleVentaChange = (v: string) => {
    setIdVenta(v)
    if (errors.idVenta) setErrors(p => ({...p, idVenta: ''}))
    if (!editingId) {
      const total = rawVentas.find(rv => String(rv.id_venta) === v)?.total
      if (total != null) setPrecio(String(total))
    }
  }
  const [historial, setHistorial] = useState<HistorialEstado[] | null>(null)

  const openView = (p: Pedido) => {
    setViewingItem(p); setIsViewOpen(true); setHistorial(null)
    apiRequest<{ success: boolean; data: HistorialEstado[] }>(`/api/sale-details/${p.id_detalle}/historial`)
      .then(res => setHistorial(res.data ?? []))
      .catch(() => setHistorial([]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!idVenta)      newErrors.idVenta    = 'Campo requerido'
    if (!idServicio)   newErrors.idServicio = 'Campo requerido'
    if (!fecha.trim()) newErrors.fecha      = 'Campo requerido'
    if (!precio)       newErrors.precio     = 'Campo requerido'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      const data = {
        id_venta: Number(idVenta), id_servicio: Number(idServicio),
        id_marco: idMarco ? Number(idMarco) : null,
        id_estado: idEstado ? Number(idEstado) : (estados[0]?.id_estado ?? 1), fecha,
        precio: Number(precio), observacion, estado: true,
      }
      await withToast(
        editingId ? onEdit(editingId, data) : onCreate(data),
        editingId ? 'Pedido actualizado' : 'Pedido registrado'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  const aplicarCambioEstado = async (id: number, id_estado: number) => {
    try { await withToast(onChangeStatus(id, id_estado), 'Estado actualizado') } catch { }
  }

  const handleCambiarEstado = async (id: number, id_estadoSeleccionado: number, idEstadoActual?: number) => {
    // Un servicio Finalizado ya se entregó — el único cambio de estado válido
    // a partir de acá es cancelarlo, no "retroceder" a Sin empezar/En
    // preparación. En vez de solo bloquear con un error, se redirige a la
    // misma confirmación de cancelar (igual que Citas Completada / Pagos Validado).
    const bloqueadoDesdeFinalizado = idEstadoActual !== undefined
      && isFinalizado(idEstadoActual)
      && !estadoNombre(id_estadoSeleccionado).toLowerCase().includes('cancelado')
    const id_estado = bloqueadoDesdeFinalizado && estadoCanceladoObj
      ? estadoCanceladoObj.id_estado
      : id_estadoSeleccionado

    // Cancelar es terminal → pedir confirmación antes de aplicar
    if (estadoNombre(id_estado).toLowerCase().includes('cancelado')) {
      setCancelTarget({
        id, id_estado, loading: true, lines: [],
        msg: bloqueadoDesdeFinalizado
          ? `Este servicio ya está Finalizado — no puede cambiar a otro estado, solo cancelarse. ${MSG_CANCELAR_BASE}`
          : undefined,
      })
      apiRequest<{ success: boolean; data: PedidoDetalle }>(`/api/sale-details/${id}`)
        .then((res) => {
          const sale = res.data?.sale
          if (!sale) {
            setCancelTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: [] } : prev)
            return
          }
          const hermanosActivos = (sale.saleDetails ?? [])
            .filter(d => d.id_detalle !== id)
            .filter(d => {
              const n = d.serviceStatus?.nombre?.toLowerCase() ?? ''
              return !n.includes('finaliz') && !n.includes('cancel')
            })

          if (hermanosActivos.length > 0) {
            // Quedan otros servicios activos: no cascadea, solo se informa.
            setCancelTarget(prev => prev && prev.id === id ? {
              ...prev,
              loading: false,
              lines: [
                `La Venta #${sale.id_venta} NO se anulará`,
                ...hermanosActivos.map(d => `Servicio #${d.id_detalle} sigue activo, no se ve afectado`),
              ],
            } : prev)
            return
          }

          // Es el último servicio activo → cascadea y anula también la Venta.
          const pagosValidados = (sale.payments ?? []).some(
            p => p.paymentStatus?.nombre?.toLowerCase().includes('validado')
          )
          if (pagosValidados) {
            setCancelTarget(prev => prev && prev.id === id ? {
              ...prev,
              loading: false,
              bloqueado: true,
              msg: `Es el único servicio activo de la Venta #${sale.id_venta} y tiene pagos validados. Registra la devolución antes de cancelarlo.`,
              lines: [],
            } : prev)
            return
          }
          const abonosAAnular = (sale.payments ?? [])
            .filter(p => p.paymentStatus?.nombre?.toLowerCase().includes('pendiente'))
          setCancelTarget(prev => prev && prev.id === id ? {
            ...prev,
            loading: false,
            lines: [
              `Se anulará también la Venta #${sale.id_venta} (era su último servicio activo)`,
              ...abonosAAnular.map(p => `Abono #${p.id_pago} (${formatCurrency(p.monto)}) se anulará`),
            ],
          } : prev)
        })
        .catch(() => setCancelTarget(prev => prev && prev.id === id ? { ...prev, loading: false, lines: [] } : prev))
      return
    }

    // "Sin empezar" es el estado inicial — no hace falta advertir nada al
    // volver ahí. Para cualquier otro avance, se verifica si la Venta ya
    // tiene su primer abono Validado antes de aplicar directo.
    if (estadoNombre(id_estado).toLowerCase().includes('sin empezar')) {
      await aplicarCambioEstado(id, id_estado)
      return
    }

    try {
      const res = await apiRequest<{ success: boolean; data: PedidoDetalle }>(`/api/sale-details/${id}`)
      const pagos = res.data?.sale?.payments ?? []
      const tieneAbonoValidado = pagos.some(p => p.paymentStatus?.nombre?.toLowerCase().includes('validado'))
      if (tieneAbonoValidado) {
        await aplicarCambioEstado(id, id_estado)
        return
      }
      setAdvanceTarget({ id, id_estado })
    } catch {
      // Si no se pudo verificar, no bloquear el cambio — solo se pierde la advertencia.
      await aplicarCambioEstado(id, id_estado)
    }
  }

  const confirmAvanzarEstado = async () => {
    if (!advanceTarget) return
    const { id, id_estado } = advanceTarget
    setAdvanceTarget(null)
    await aplicarCambioEstado(id, id_estado)
  }

  const confirmCancelarServicio = () => {
    if (!cancelTarget || cancelTarget.loading || cancelTarget.bloqueado) return
    const { id, id_estado } = cancelTarget
    setCancelTarget(null)
    undoableAction({
      message: 'Cancelando servicio...',
      successMsg: 'Servicio cancelado',
      onCommit: () => onChangeStatus(id, id_estado),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-secondary">Servicios</h1>
  
          <p className="text-muted-foreground">Gestiona los servicios registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar venta, tipo de servicio, marco, fecha..." className="w-96" />
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="mr-2 h-4 w-4" />Registrar Servicio
          </Button>
        </div>
      </div>

      <FilterBar
        filters={[
          { key: 'estado', label: 'Estado', type: 'select', value: filterEstado, onChange: setFilterEstado,
            options: estados.map((e, i) => ({ value: String(e.id_estado), label: e.nombre })) },
          { key: 'servicio', label: 'Tipo de Servicio', type: 'select', value: filterServicio, onChange: setFilterServicio,
            options: serviciosOpts },
        ]}
        onClear={() => { setFilterEstado(''); setFilterServicio('') }}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin registros" description="No hay pedidos registrados aún." />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
           
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[18%]">Venta</TableHead>
               
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[14%]">Tipo de Servicio</TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[13%]">Marco</TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[11%]">Fecha</TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[10%]">Precio</TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-muted-foreground w-[18%]">Estado</TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wide text-muted-foreground w-[16%]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p) => {
                const ventaLabel    = ventasOpts.find(o => o.value === String(p.id_venta))?.label ?? `#${p.id_venta}`
                const servicioLabel = serviciosOpts.find(o => o.value === String(p.id_servicio))?.label ?? `#${p.id_servicio}`
                const marcoLabel    = p.id_marco
                  ? (marcosOpts.find(o => o.value === String(p.id_marco))?.label ?? `#${p.id_marco}`)
                  : '—'
                const clienteNombre = rawVentas.find(rv => rv.id_venta === p.id_venta)?.client?.nombre ?? '—'
                return (
                  <TableRow
                    key={p.id_detalle}
                    className={isFinalizado(p.id_estado)
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-border'
                      : 'hover:bg-muted/40 transition-colors border-border'}
                  >
                    <TableCell className="text-foreground text-sm">
                      <div className="font-medium">{ventaLabel}</div>
                      <div className="text-xs text-muted-foreground">{clienteNombre}</div>
                    </TableCell>
                    <TableCell className="text-foreground">{servicioLabel}</TableCell>
                    <TableCell className="text-foreground">{marcoLabel}</TableCell>
                    <TableCell className="text-foreground">{formatDate(p.fecha)}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(p.precio)}</TableCell>
                    <TableCell>
                      <StatusSelect
                        value={String(p.id_estado)}
                        onValueChange={(v) => handleCambiarEstado(p.id_detalle, Number(v), p.id_estado)}
                        disabled={isCancelado(p.id_estado)}
                        options={estados.map((e, i) => ({
                          value: String(e.id_estado),
                          label: e.nombre,
                          badgeCls: badgeClassByName(e.nombre, i),
                        }))}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Ver detalle de pedido" onClick={() => openView(p)}>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalle</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" size="icon"
                              aria-label="Editar pedido"
                              aria-disabled={isCancelado(p.id_estado) || isFinalizado(p.id_estado)}
                              onClick={() => { if (!isCancelado(p.id_estado) && !isFinalizado(p.id_estado)) openEdit(p) }}
                              className={(isCancelado(p.id_estado) || isFinalizado(p.id_estado)) ? 'opacity-40 cursor-not-allowed' : ''}
                            >
                              <Pencil className={`h-4 w-4 ${(isCancelado(p.id_estado) || isFinalizado(p.id_estado)) ? 'text-muted-foreground' : 'text-foreground'}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCancelado(p.id_estado)
                              ? 'No se puede editar un servicio Cancelado'
                              : isFinalizado(p.id_estado)
                                ? 'No se puede editar un servicio Finalizado'
                                : 'Editar'}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" size="icon"
                              aria-label="Eliminar servicio"
                              aria-disabled={isCancelado(p.id_estado) || isFinalizado(p.id_estado)}
                              onClick={() => {
                                if (isCancelado(p.id_estado) || isFinalizado(p.id_estado)) return
                                setDeleteTarget({ id: p.id_detalle, label: `Servicio #${p.id_detalle} · ${servicioLabel}` })
                              }}
                              className={(isCancelado(p.id_estado) || isFinalizado(p.id_estado)) ? 'opacity-40 cursor-not-allowed' : ''}
                            >
                              <Trash2 className={`h-4 w-4 ${(isCancelado(p.id_estado) || isFinalizado(p.id_estado)) ? 'text-muted-foreground' : 'text-destructive'}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCancelado(p.id_estado)
                              ? 'No se puede eliminar: ya está Cancelado'
                              : isFinalizado(p.id_estado)
                                ? 'No se puede eliminar: ya está Finalizado — solo se puede cancelar'
                                : 'Eliminar'}
                          </TooltipContent>
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

      {/* ── Ver detalle ──────────────────────────────────────────────────────── */}
      {viewingItem && (
        <ViewDialog
          open={isViewOpen} onOpenChange={setIsViewOpen}
          title={`Pedido #${viewingItem.id_detalle}`}
          fields={[
            { label: 'Estado',      value: <Badge variant="outline" className={estadoColor(viewingItem.id_estado)}>{estadoNombre(viewingItem.id_estado)}</Badge> },
            { label: 'Venta',       value: ventasOpts.find(o => o.value === String(viewingItem.id_venta))?.label ?? `#${viewingItem.id_venta}`, fullWidth: true },
            { label: 'Servicio',    value: serviciosOpts.find(o => o.value === String(viewingItem.id_servicio))?.label ?? `#${viewingItem.id_servicio}` },
            { label: 'Marco',       value: viewingItem.id_marco ? (marcosOpts.find(o => o.value === String(viewingItem.id_marco))?.label ?? `#${viewingItem.id_marco}`) : '—' },
            { label: 'Fecha',       value: formatDate(viewingItem.fecha) },
            { label: 'Precio',      value: formatCurrency(viewingItem.precio) },
            { label: 'Observación', value: viewingItem.observacion, fullWidth: true },
            {
              label: 'Historial de estado',
              fullWidth: true,
              value: historial === null
                ? 'Cargando...'
                : historial.length === 0
                  ? 'Sin historial disponible.'
                  : (
                    <div className="space-y-1">
                      {historial.map(h => (
                        <div key={h.id_historial} className="text-sm">
                          <span className="font-medium">{h.estado}</span>
                          <span className="text-muted-foreground"> — {new Date(h.fecha).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  ),
            },
          ]}
        />
      )}

      {/* ── Form crear/editar ─────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { setIsFormOpen(v); if (!v) resetForm() }}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-secondary">{editingId ? 'Editar Servicio' : 'Registrar Servicio'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Completa los datos del servicio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2" noValidate>
            <div>
              <label className={labelCls} htmlFor="ped-venta">
                Venta <span className="text-destructive">*</span>
                {!!editingId && <span className="text-muted-foreground font-normal normal-case tracking-normal"> (no editable)</span>}
              </label>
              <FieldErrorTooltip error={errors.idVenta}>
                <div>
                  <Combobox id="ped-venta" options={ventasOpts} value={idVenta} onValueChange={handleVentaChange} onSearchChange={searchVentas} placeholder="Buscar venta..." searchPlaceholder="ID o fecha..." disabled={!!editingId} />
                </div>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="ped-servicio">Tipo de Servicio <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.idServicio}>
                <div>
                  <Combobox id="ped-servicio" options={serviciosOpts} value={idServicio} onValueChange={(v) => { setIdServicio(v); if (errors.idServicio) setErrors({...errors, idServicio: ''}) }} placeholder="Buscar servicio..." searchPlaceholder="Nombre del servicio..." />
                </div>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="ped-marco">Marco (opcional)</label>
              <Combobox id="ped-marco" options={marcosOpts} value={idMarco} onValueChange={setIdMarco} placeholder="Seleccionar marco..." searchPlaceholder="Código del marco..." clearable />
            </div>

            <div>
              <label className={labelCls} htmlFor="ped-fecha">Fecha <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.fecha}>
                <div>
                  <DatePicker
                    id="ped-fecha"
                    value={fecha}
                    max={bogotaMaxFuturoStr()}
                    onChange={(v) => { setFecha(v); if (errors.fecha) setErrors({...errors, fecha: ''}) }}
                    error={errors.fecha}
                  />
                </div>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="ped-precio">
                Precio <span className="text-muted-foreground font-normal normal-case tracking-normal">(tomado de la venta, no editable)</span>
              </label>
              <FieldErrorTooltip error={errors.precio}>
                <input
                  id="ped-precio"
                  type="text"
                  value={precio ? fmtCOP(Number(precio)) : ''}
                  readOnly
                  className={inputCls + ' opacity-60 cursor-not-allowed'}
                  placeholder="Se completa al seleccionar la venta"
                />
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="ped-observacion">Observación (opcional)</label>
              <textarea id="ped-observacion" value={observacion} onChange={(e) => setObservacion(e.target.value)} className={inputCls + ' resize-none'} rows={3} placeholder='Detalles adicionales del pedido...'/>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button type="button" onClick={() => { setIsFormOpen(false); resetForm() }} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                {editingId ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de cancelación (estado terminal) */}
      <AlertDialog open={cancelTarget !== null} onOpenChange={(o) => { if (!o) setCancelTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.msg ?? MSG_CANCELAR_BASE}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <CascadePreview lines={cancelTarget?.lines ?? []} loading={cancelTarget?.loading} />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelTarget?.loading || cancelTarget?.bloqueado}
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmCancelarServicio}
            >
              {cancelTarget?.bloqueado ? 'No se puede cancelar' : 'Sí, cancelar servicio'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación al avanzar el estado sin abono validado todavía */}
      <AlertDialog open={advanceTarget !== null} onOpenChange={(o) => { if (!o) setAdvanceTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar el estado sin el primer abono?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta venta todavía no tiene ningún abono <strong>Validado</strong> registrado. ¿Quieres
              continuar de todas formas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAvanzarEstado}>
              Sí, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de eliminar (hard-delete, solo Sin empezar/En preparación) */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.label}</strong> por completo — pensado para corregir un
              error de captura, no para el flujo normal (ahí corresponde cancelar). Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmEliminarServicio}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}