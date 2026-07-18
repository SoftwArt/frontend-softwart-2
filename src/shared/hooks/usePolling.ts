// src/shared/hooks/usePolling.ts
// Polling scoped por componente: solo corre mientras la pestaña está visible,
// se pausa al minimizar/cambiar de pestaña y refresca al instante al volver
// (no espera el intervalo completo). No es un timer global — cada instancia
// de este hook vive y muere con el componente que la usa.
import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void, intervalMs: number): void {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') savedCallback.current()
    }

    const id = setInterval(tick, intervalMs)

    // Al volver a la pestaña, refresca de inmediato en vez de esperar el resto del intervalo
    const onVisibility = () => {
      if (document.visibilityState === 'visible') savedCallback.current()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])
}
