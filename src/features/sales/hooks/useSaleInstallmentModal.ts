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
  const [numAbonos,    setNumAbonosRaw] = useState('')
  const [pctPrimero,   setPctPrimeroRaw] = useState('')
  // Vía alterna al %: el admin puede indicar el monto en pesos del primer
  // abono en vez de su porcentaje — son modos mutuamente excluyentes, el
  // campo del modo inactivo es opcional/ignorado (nunca se envían ambos).
  const [modoPrimerAbono, setModoPrimerAbono] = useState<'pct' | 'monto'>('pct')
  const [montoPrimero, setMontoPrimeroRaw] = useState('')
  const [isConfigurando, setIsConfigurando] = useState(false)

  // Con 1 abono no hay nada que repartir — es, por definición, el 100% del
  // total en un solo pago. Se fuerza acá (no solo se deshabilita el input,
  // ver InstallmentConfigTab) para que el payload sea coherente aunque el
  // admin nunca haya tocado el toggle %/$. Al volver a 2+ abonos se
  // restaura un default sensato (70%) en vez de dejar el 100% inválido ahí.
  const setNumAbonos = (v: string) => {
    setNumAbonosRaw(v)
    if (v === '1') {
      setModoPrimerAbono('pct')
      setPctPrimeroRaw('100')
    } else if (numAbonos === '1' && v !== '1') {
      setPctPrimeroRaw('70')
    }
  }

  // 100% (o más) del primer abono es, otra vez, "págalo todo ahora" — se
  // convierte directo a pago único (1 abono) en vez de solo aceptar/clamear
  // el valor, para no dejar una combinación inválida como "2 abonos, 100%
  // el primero" (el backend la rechaza: 100% solo es válido con 1 abono).
  const setPctPrimero = (v: string) => {
    const p = Number(v)
    if (v && !isNaN(p) && p >= 100 && numAbonos !== '1') {
      setNumAbonos('1')
      toast.info(`El ${p}% ingresado cubre el total (100% o más) — se configuró como pago único (1 abono).`)
      return
    }
    setPctPrimeroRaw(v)
  }

  // Un monto de primer abono >= total tampoco tiene sentido como "primer"
  // abono — cubre (o supera) toda la venta. Mismo criterio: se convierte a
  // pago único (1 abono) y se avisa, en vez de solo bloquear con un error.
  const setMontoPrimero = (v: string) => {
    const monto = Number(v)
    const total = estado?.total ?? 0
    if (v && total > 0 && !isNaN(monto) && monto >= total) {
      setNumAbonos('1')
      setMontoPrimeroRaw('')
      toast.info(`El monto ingresado (${formatCurrency(monto)}) cubre el total de la venta (${formatCurrency(total)}) — se configuró como pago único (1 abono).`)
      return
    }
    setMontoPrimeroRaw(v)
  }

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
        // Setters "Raw" acá a propósito: esto refleja el estado YA guardado
        // en el servidor (ej. num_abonos=1/100% de una venta ya configurada
        // como pago único), no una edición del admin — pasar por los
        // setters con auto-conversión dispararía un toast de "se configuró
        // como pago único" espurio, cada vez que se abre el modal.
        setNumAbonosRaw(String(estadoRes.data.num_abonos))
        setPctPrimeroRaw(String(estadoRes.data.porcentaje_primer_abono))
        setModoPrimerAbono('pct')
        setMontoPrimeroRaw(String(Math.round(estadoRes.data.total * estadoRes.data.porcentaje_primer_abono / 100)))
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
      // Raw acá también — reflejar lo que el servidor acaba de confirmar
      // guardar, no una edición nueva del admin.
      setPctPrimeroRaw(String(estadoRes.data.porcentaje_primer_abono))
      setMontoPrimeroRaw(String(Math.round(estadoRes.data.total * estadoRes.data.porcentaje_primer_abono / 100)))
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
