// src/features/calculator/components/MarcoViewDialog.tsx
import type { Marco } from '../types'
import { formatCurrency as fmt } from '@/src/shared/lib/formatCurrency'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'

interface MarcoViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  marco: Marco
}

export function MarcoViewDialog({ open, onOpenChange, marco }: MarcoViewDialogProps) {
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Marco — ${marco.codigo}`}
      fields={[
        { label: 'Estado',          value: <EstadoBadge estado={marco.estado} /> },
        { label: 'Código',          value: marco.codigo },
        { label: 'Colilla',         value: `${marco.colilla} mm` },
        { label: 'Precio Ensamblado', value: fmt(marco.precio_ensamblado) },
        { label: 'Precio Venta (×2)', value: fmt(marco.precio_ensamblado * 2) },
      ]} />
  )
}
