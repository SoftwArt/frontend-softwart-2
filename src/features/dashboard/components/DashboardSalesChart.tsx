// src/features/dashboard/components/DashboardSalesChart.tsx
import type { VentaSemana } from '../types'
import { PIE_COLORS, WEEK_OPTIONS } from '../utils'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface DashboardSalesChartProps {
  data: VentaSemana[]
  isLoading: boolean
  weeksFilter: number
  onWeeksFilterChange: (weeks: number) => void
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function DashboardSalesChart({ data, isLoading, weeksFilter, onWeeksFilterChange }: DashboardSalesChartProps) {
  return (
    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Pedidos por semana</h2>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {WEEK_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onWeeksFilterChange(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                weeksFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <Skeleton className="h-48 w-full" /> : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data.map((d, i) => ({ ...d, fill: PIE_COLORS[i % PIE_COLORS.length] }))}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="semana" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((_, i) => (
                <Cell key={`bar-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
