// src/features/dashboard/components/DashboardKpiCard.tsx
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

interface DashboardKpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'flat'
  trendLabel?: string
  color?: 'primary' | 'amber' | 'emerald' | 'rose'
}

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  amber:   'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose:    'bg-rose-100 text-rose-700',
}

export function DashboardKpiCard({ label, value, sub, icon: Icon, trend, trendLabel, color = 'primary' }: DashboardKpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`rounded-lg p-2 ${COLOR_MAP[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
        {(trendLabel || sub) && (
          <div className="flex items-center gap-1.5">
            {trend && <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />}
            <span className={`text-xs ${trendColor}`}>{trendLabel ?? sub}</span>
          </div>
        )}
      </div>
    </div>
  )
}
