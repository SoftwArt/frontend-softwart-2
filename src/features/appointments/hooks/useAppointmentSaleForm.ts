// src/features/appointments/hooks/useAppointmentSaleForm.ts
import { useState, useCallback } from 'react'
import type { Cita, VentaLinea } from '../types'
import { fmtCOP } from '../utils'
import { buildQuotePdf } from '../utils/buildQuotePdf'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { withToast } from '@/src/shared/lib/withToast'

type Params = { refresh: () => Promise<void> }

// Misma validación para "Crear pedido" y "Crear cotización" — una cotización
// con un servicio vacío o un precio en $0 no tiene sentido para el cliente.
function validarLineas(lineas: VentaLinea[]): Record<string, string> {
  const errs: Record<string, string> = {}
  lineas.forEach((l, i) => {
    if (!l.id_servicio) errs[`servicio_${i}`] = 'Requerido'
    if (!l.precio || isNaN(Number(l.precio)) || Number(l.precio) <= 0)
      errs[`precio_${i}`] = 'Precio inválido'
  })
  return errs
}

export function useAppointmentSaleForm({ refresh }: Params) {
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
  const closeVentaModal = () => setVentaModalCita(null)

  const addLinea    = () => setVentaLineas(p => [...p, lineaVacia(Date.now())])
  const removeLinea = (id: number) => setVentaLineas(p => p.filter(l => l.id !== id))
  const updateLinea = (id: number, field: keyof VentaLinea, value: string) =>
    setVentaLineas(p => p.map(l => l.id === id ? { ...l, [field]: value } : l))

  const totalVenta = ventaLineas.reduce((sum, l) => sum + (Number(l.precio) || 0), 0)

  const handleCrearVenta = async () => {
    const errs = validarLineas(ventaLineas)
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

  // Cotización — mismo form, sin tocar el backend: es un documento de un
  // solo uso (el admin lo comparte/guarda por su cuenta), no algo a
  // persistir ni auditar. Misma validación que "Crear pedido" para no
  // generar un PDF con un servicio vacío o precios en $0.
  const handleCrearCotizacion = (clienteLabel: string, serviciosOpts: ComboboxOption[], marcosOpts: ComboboxOption[]) => {
    const errs = validarLineas(ventaLineas)
    if (Object.keys(errs).length) { setVentaErrors(errs); return }
    if (!ventaModalCita) return

    buildQuotePdf({
      cita: ventaModalCita,
      clienteLabel,
      lineas: ventaLineas,
      serviciosOpts,
      marcosOpts,
      observacion: ventaObs,
      total: totalVenta,
    })
  }

  return {
    ventaModalCita, openVentaModal, closeVentaModal,
    ventaLineas, addLinea, removeLinea, updateLinea,
    ventaObs, setVentaObs,
    ventaErrors,
    isCreandoVenta,
    totalVenta,
    handleCrearVenta,
    handleCrearCotizacion,
  }
}
