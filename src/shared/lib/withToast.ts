// src/shared/lib/withToast.ts
// Helper para envolver operaciones de hook con toast automático
// Uso: await withToast(onCrear(data), 'Cliente registrado', 'Error al registrar')
import { toast } from 'sonner'

export async function withToast<T>(
  promise: Promise<T>,
  successMsg: string,
  errorMsg?: string
): Promise<T> {
  try {
    const result = await promise
    toast.success(successMsg)
    return result
  } catch (e) {
    const msg = errorMsg ?? (e instanceof Error ? e.message : 'Error inesperado')
    toast.error(msg)
    throw e
  }
}

// Uso directo en pages (sin modificar hooks):
// import { withToast } from '@/src/shared/lib/withToast'
//
// // En handleSubmit:
// await withToast(
//   editingId ? onEditar(editingId, data) : onCrear(data),
//   editingId ? 'Cliente actualizado' : 'Cliente registrado',
// )
// setIsFormOpen(false); resetForm()
//
// // En onEliminar:
// await withToast(onEliminar(id), 'Cliente eliminado')