// src/features/dashboard/components/DashboardErrorState.tsx
import { Alert, AlertDescription } from '@/src/shared/components/ui/alert'
import { RefreshCw } from 'lucide-react'

interface DashboardErrorStateProps { error: string; onRetry: () => void }

export function DashboardErrorState({ error, onRetry }: DashboardErrorStateProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <button onClick={onRetry} className="flex items-center gap-1 text-sm underline">
            <RefreshCw className="h-3.5 w-3.5" />Reintentar
          </button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
