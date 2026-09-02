// src/features/dashboard/components/DashboardDonutCard.tsx
import { PIE_COLORS } from '../utils'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DashboardDonutCardProps {
  title: string
  data: { name: string; total: number }[]
  isLoading: boolean
  tooltipLabel: string
  emptyMessage?: string
}

export function DashboardDonutCard({ title, data, isLoading, tooltipLabel, emptyMessage }: DashboardDonutCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : emptyMessage && data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%" cy="50%"
              innerRadius={40} outerRadius={65}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={`slice-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
            <Tooltip formatter={(v) => [Number(v), tooltipLabel]} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
