// src/shared/hooks/useBackendWakeup.ts
// Pinga el backend al cargar para despertar el servidor (Render cold start).
// Muestra el banner solo si el backend tarda más de SHOW_AFTER_MS.
// Reintenta hasta que el backend responda — el banner persiste hasta que conecta.
import { useEffect, useRef, useState } from 'react'

const API_URL       = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const SHOW_AFTER_MS = 800   // muestra el banner si el backend tarda más de esto
const RETRY_MS      = 5000  // intervalo entre reintentos

export function useBackendWakeup() {
  const [showBanner, setShowBanner] = useState(false)
  const stopped = useRef(false)

  useEffect(() => {
    stopped.current = false
    const showTimer = setTimeout(() => setShowBanner(true), SHOW_AFTER_MS)

    async function ping() {
      while (!stopped.current) {
        try {
          await fetch(`${API_URL}/api/services`, { signal: AbortSignal.timeout(RETRY_MS) })
          clearTimeout(showTimer)
          setShowBanner(false)
          return
        } catch {
          // backend aún no responde — espera antes de reintentar
          await new Promise(r => setTimeout(r, RETRY_MS))
        }
      }
    }

    ping()

    return () => {
      stopped.current = true
      clearTimeout(showTimer)
    }
  }, [])

  return showBanner
}
