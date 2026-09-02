// src/features/permissions/components/PermissionsPage.tsx
import { usePermissions } from '../hooks/usePermissions'
import { usePermissionsRoleEditor } from '../hooks/usePermissionsRoleEditor'
import { Lock, AlertCircle } from 'lucide-react'
import { Label } from '@/src/shared/components/ui/label'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Alert, AlertDescription } from '@/src/shared/components/ui/alert'
import { Badge } from '@/src/shared/components/ui/badge'
import { EmptyState } from '@/src/shared/components/EmptyState'
import { PermissionModuloCard } from './PermissionModuloCard'
import { PermissionSaveBar } from './PermissionSaveBar'
import { PermissionDiscardAlert } from './PermissionDiscardAlert'

export function PermissionsPage() {
  const {
    permisos, roles, isLoading, error,
    hasPermission, isDirty,
    onTogglePermission, onToggleAllPermissions,
    guardarCambios, descartarCambios,
  } = usePermissions()

  const {
    selectedRol, selectedRolId, isAdmin, dirty, isSaving,
    pendingRolChange,
    handleRolChange, confirmDiscardAndSwitch, cancelDiscard,
    handleGuardarCambios, handleDescartar,
    modulosAgrupados, totalActivos,
    handleToggle, handleToggleAll,
  } = usePermissionsRoleEditor({ permisos, hasPermission, isDirty, onTogglePermission, onToggleAllPermissions, guardarCambios, descartarCambios })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl text-secondary">Permisos por Rol</h1>
        <p className="text-muted-foreground">Selecciona un rol para gestionar sus permisos por módulo</p>
      </div>

      {/* Selector de Rol + resumen */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="perm-rol" className="text-foreground">Rol</Label>
          {isLoading ? <Skeleton className="h-10 w-48 rounded-md" /> : (
            <Select value={selectedRol} onValueChange={handleRolChange}>
              <SelectTrigger id="perm-rol" className="bg-card text-foreground border-border">
                <SelectValue placeholder="Seleccionar rol..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedRolId && !isLoading && (
          <div className="flex items-center gap-2 pb-0.5">
            <Badge variant="secondary" className="text-sm">
              {totalActivos}/{permisos.length} permisos activos
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 gap-1">
                <Lock className="h-3 w-3" /> Solo lectura
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Aviso Admin */}
      {isAdmin && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-800">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin</strong> tiene todos los permisos del sistema y no puede modificarse por seguridad.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contenido */}
      {!selectedRolId ? (
        <EmptyState title="Selecciona un rol" description="Elige un rol para ver y gestionar sus permisos agrupados por módulo." />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : permisos.length === 0 ? (
        <EmptyState title="Sin permisos" description="No hay permisos registrados en el sistema." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          {modulosAgrupados.map(([moduloKey, permisosModulo]) => (
            <PermissionModuloCard
              key={moduloKey}
              moduloKey={moduloKey}
              permisos={permisosModulo}
              id_rol={selectedRolId}
              isAdmin={isAdmin}
              hasPermission={hasPermission}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
          ))}
        </div>
      )}

      {/* Barra flotante "Guardar cambios" — los toggles de arriba ya no
          disparan red en tiempo real (la cascada VER↔módulo dejaba de ser
          idempotente si un request fallaba a mitad de una secuencia). Todo
          se acumula en el draft del hook y se envía de una sola vez acá. */}
      {dirty && (
        <PermissionSaveBar isSaving={isSaving} onSave={handleGuardarCambios} onDiscard={handleDescartar} />
      )}

      {/* Cambiar de rol con cambios sin guardar — confirmar antes de descartar */}
      <PermissionDiscardAlert
        open={pendingRolChange !== null}
        onOpenChange={(v) => { if (!v) cancelDiscard() }}
        onConfirm={confirmDiscardAndSwitch}
      />
    </div>
  )
}
