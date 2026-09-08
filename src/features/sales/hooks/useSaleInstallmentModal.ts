// src/features/sales/hooks/useSaleInstallmentModal.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import type { EstadoPago, EstadoPagos, MetodoPago } from '../types'

// Mismo margen que el default de `tolerancia` en registerInstallment
// (SaleInstallmentsController.ts) — $1 de holgura por redondeos. Si el
// backend cambia su default, hay que actualizar acá también (no hay un
// endpoint que lo exponga todavía).
const TOLERANCIA_ABONO = 1

type Params = { open: boolean; idVenta: number; onSuccess: () => void }

export function useSaleInstallmentModal({ open, idVenta, onSuccess }: Params) {
  const [estado,            setEstado]            = useState<EstadoPagos | null>(null)
  const [metodos,           setMetodos]           = useState<MetodoPago[]>([])
  const [idEstadoValidado,  setIdEstadoValidado]  = useState<number | null>(null)
  const [isLoading,         setIsLoading]         = useState(false)
  const [tab,               setTab]               = useState<'pagar' | 'configurar'>('pagar')

  // Form pago
  const [monto,        setMonto]        = useState('')
  const [idMetodo,     setIdMetodo]     = useState('')
  const [fechaPago,    setFechaPago]    = useState(() => new Date().toISOString().slice(0, 10))
  const [isPagando,    setIsPagando]    = useState(false)

  // Form configurar
  const [numAbonos,    setNumAbonos]    = useState('')
  const [pctPrimero,   setPctPrimero]   = useState('')
  // Vía alterna al %: el admin puede indicar el monto en pesos del primer
  // abono en vez de su porcentaje — son modos mutuamente excluyentes, el
  // campo del modo inactivo es opcional/ignorado (nunca se envían ambos).
  const [modoPrimerAbono, setModoPrimerAbono] = useState<'pct' | 'monto'>('pct')
  const [montoPrimero, setMontoPrimero] = useState('')
  const [isConfigurando, setIsConfigurando] = useState(false)

  // Cargar estado de pagos y métodos
  useEffect(() => {
    if (!open || !idVenta) return
    setIsLoading(true)
    setTab('pagar')

    Promise.all([
      apiRequest<{ success: boolean; data: EstadoPagos }>(`/api/sales/${idVenta}/payment-plan`),
      apiRequest<{ success: boolean; data: MetodoPago[] }>('/api/payment-methods?limit=50'),
      apiRequest<{ success: boolean; data: EstadoPago[] }>('/api/payment-status?limit=50'),
    ])
      .then(([estadoRes, metodosRes, estadosPagoRes]) => {
        setEstado(estadoRes.data)
        setMetodos(metodosRes.data ?? [])
        const validado = (estadosPagoRes.data ?? []).find(e => e.nombre === 'Validado')
        setIdEstadoValidado(validado?.id_estado_pago ?? null)
        // Pre-llenar monto con el siguiente abono esperado
        if (estadoRes.data.siguiente_abono) {
          setMonto(String(estadoRes.data.siguiente_abono.expectedAmount))
        }
        setNumAbonos(String(estadoRes.data.num_abonos))
        setPctPrimero(String(estadoRes.data.porcentaje_primer_abono))
        setModoPrimerAbono('pct')
        setMontoPrimero(String(Math.round(estadoRes.data.total * estadoRes.data.porcentaje_primer_abono / 100)))
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [open, idVenta])

  const handlePagar = async () => {
    if (!idMetodo) { toast.error('Selecciona el método de pago'); return }
    setIsPagando(true)
    try {
      const body: Record<string, unknown> = { monto: Number(monto), id_metodo_pago: Number(idMetodo), fecha: fechaPago }
      if (idEstadoValidado != null) body.id_estado_pago = idEstadoValidado
      const res = await apiRequest<{ success: boolean; message: string; data: any }>(
        `/api/sales/${idVenta}/installment`,
        { method: 'POST', body: JSON.stringify(body) }
      )
      toast.success(res.message)
      onSuccess()
      // Recargar estado
      const estadoRes = await apiRequest<{ success: boolean; data: EstadoPagos }>(`/api/sales/${idVenta}/payment-plan`)
      setEstado(estadoRes.data)
      if (estadoRes.data.siguiente_abono) setMonto(String(estadoRes.data.siguiente_abono.expectedAmount))
      else setMonto('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar abono')
    } finally { setIsPagando(false) }
  }

  const handleConfigurar = async () => {
    setIsConfigurando(true)
    try {
      const body: Record<string, unknown> = { num_abonos: Number(numAbonos) }
      // Campos mutuamente excluyentes y opcionales — solo se envía el del
      // modo activo (el backend también los valida como excluyentes, ver
      // configureInstallmentsSchema).
      if (modoPrimerAbono === 'pct') body.porcentaje_primer_abono = Number(pctPrimero)
      else                           body.monto_primer_abono      = Number(montoPrimero)

      const res = await apiRequest<{ success: boolean; message: string; data: any }>(
        `/api/sales/${idVenta}/configure-installments`,
        { method: 'PATCH', body: JSON.stringify(body) }
      )
      toast.success(res.message)
      const estadoRes = await apiRequest<{ success: boolean; data: EstadoPagos }>(`/api/sales/${idVenta}/payment-plan`)
      setEstado(estadoRes.data)
      setPctPrimero(String(estadoRes.data.porcentaje_primer_abono))
      setMontoPrimero(String(Math.round(estadoRes.data.total * estadoRes.data.porcentaje_primer_abono / 100)))
      if (estadoRes.data.siguiente_abono) setMonto(String(estadoRes.data.siguiente_abono.expectedAmount))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al configurar')
    } finally { setIsConfigurando(false) }
  }

  // Reactivo: mismo criterio de aceptación que registerInstallment
  // (SaleInstallmentsController.ts) — último abono exige monto exacto
  // (± tolerancia), los intermedios solo exigen un mínimo (se puede pagar de
  // más, no de menos). Feedback inmediato en vez de esperar el 400 del submit.
  const siguienteAbono = estado?.siguiente_abono
  const montoError = (() => {
    if (!siguienteAbono || !monto.trim()) return undefined
    const montoNum = Number(monto)
    if (isNaN(montoNum)) return 'Monto inválido'
    const esperado    = siguienteAbono.expectedAmount
    const diferencia  = Math.abs(montoNum - esperado)
    if (siguienteAbono.isLast) {
      if (diferencia > TOLERANCIA_ABONO) {
        return `El último abono debe ser de ${formatCurrency(esperado)} (saldo exacto). Ingresaste ${formatCurrency(montoNum)}`
      }
    } else if (montoNum < esperado - TOLERANCIA_ABONO) {
      return `El abono ${siguienteAbono.number} debe ser de al menos ${formatCurrency(esperado)}`
    }
    return undefined
  })()

  return {
    estado, metodos, isLoading, tab, setTab,
    monto, setMonto, idMetodo, setIdMetodo, fechaPago, setFechaPago, isPagando,
    numAbonos, setNumAbonos, pctPrimero, setPctPrimero, isConfigurando,
    modoPrimerAbono, setModoPrimerAbono, montoPrimero, setMontoPrimero,
    handlePagar, handleConfigurar,
    montoError,
  }
}
