// src/shared/lib/undoableAction.ts
// Patrón "Deshacer" tipo Gmail: la acción NO se ejecuta contra el backend hasta
// que expira la ventana de tiempo. Si el usuario pulsa "Deshacer" antes, el
// commit nunca ocurre — cero riesgo de contradecir guards de estado terminal
// (ej. Cancelado/Anulado en saleCascade), porque el estado nunca llegó a cambiar.
import { toast } from 'sonner'

type UndoableActionOptions = {
  message: string
  successMsg: string
  errorMsg?: string
  onCommit: () => Promise<unknown>
  durationMs?: number
}

export function undoableAction({
  message,
  successMsg,
  errorMsg,
  onCommit,
  durationMs = 12000,
}: UndoableActionOptions): void {
  let undone = false

  const timer = setTimeout(async () => {
    if (undone) return
    try {
      await onCommit()
      toast.success(successMsg)
    } catch (e) {
      toast.error(errorMsg ?? (e instanceof Error ? e.message : 'Error inesperado'))
    }
  }, durationMs)

  toast(message, {
    duration: durationMs,
    action: {
      label: 'Deshacer',
      onClick: () => {
        undone = true
        clearTimeout(timer)
        toast.info('Acción deshecha — no se aplicó ningún cambio.')
      },
    },
    // Mismos colores que los botones primarios de acción (ej. "Registrar")
    classNames: {
      actionButton: '!bg-primary !text-primary-foreground hover:!bg-primary/90',
    },
  })
}
