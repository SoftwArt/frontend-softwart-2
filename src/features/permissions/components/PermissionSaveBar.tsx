// src/features/permissions/components/PermissionSaveBar.tsx
import { Save, Undo2 } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'

interface PermissionSaveBarProps {
  isSaving: boolean
  onSave: () => void
  onDiscard: () => void
}

export function PermissionSaveBar({ isSaving, onSave, onDiscard }: PermissionSaveBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
      <span className="text-sm text-muted-foreground">Tienes cambios sin guardar</span>
      <Button
        variant="outline" size="sm"
        disabled={isSaving}
        onClick={onDiscard}
        className="gap-1.5"
      >
        <Undo2 className="h-3.5 w-3.5" />Descartar
      </Button>
      <Button
        size="sm"
        disabled={isSaving}
        onClick={onSave}
        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Save className="h-3.5 w-3.5" />{isSaving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  )
}
