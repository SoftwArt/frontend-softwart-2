import { useEffect, useState } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { DocumentoLegal, LegalDocTipo } from '@/src/shared/types/legal'

// `enabled` evita el fetch mientras la modal está cerrada — la página de
// lectura siempre la pasa en true.
export function useLegalDocument(tipo: LegalDocTipo | null, enabled: boolean) {
  const [documento, setDocumento] = useState<DocumentoLegal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!tipo || !enabled) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    apiRequest<{ success: boolean; data: DocumentoLegal }>(`/api/legal/${tipo}`)
      .then(res => { if (!cancelled) setDocumento(res.data) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar el documento') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [tipo, enabled])

  return { documento, isLoading, error }
}
