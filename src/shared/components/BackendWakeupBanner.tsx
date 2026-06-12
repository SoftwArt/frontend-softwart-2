import { Loader2 } from 'lucide-react'

interface Props { show: boolean }

export function BackendWakeupBanner({ show }: Props) {
  if (!show) return null
  return (
    <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 shadow-lg text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
      <span>Conectando con el servidor…</span>
    </div>
  )
}
