export const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export function getIgnored(key: string): number[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}

export function persistIgnored(key: string, ids: number[]): void {
  localStorage.setItem(key, JSON.stringify(ids))
}

// ── Fila de filtro de semanas para la gráfica de ventas ─────────────────────
export const WEEK_OPTIONS = [
  { value: 1, label: '1 semana' },
  { value: 2, label: '2 semanas' },
  { value: 4, label: '4 semanas' },
  { value: 8, label: '8 semanas' },
] as const

export function todayLongEsCO(): string {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function salesTrend(actual: number, anterior: number): { trend: 'up' | 'down' | 'flat'; label: string } {
  const trend = actual > anterior ? 'up' : actual < anterior ? 'down' : 'flat'
  const label = anterior > 0
    ? `${actual > anterior ? '+' : ''}${(((actual - anterior) / anterior) * 100).toFixed(1)}% vs mes anterior`
    : 'Sin datos mes anterior'
  return { trend, label }
}
