// src/features/sales/components/InstallmentCompletedBanner.tsx
import type { EstadoPagos } from '../types'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { CheckCircle2 } from 'lucide-react'

export function InstallmentCompletedBanner({ estado }: { estado: EstadoPagos }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-emerald-800">Venta completamente pagada</p>
        <p className="text-xs text-emerald-700">{estado.num_abonos} abono(s) · Total: {formatCurrency(estado.total)}</p>
      </div>
    </div>
  )
}
