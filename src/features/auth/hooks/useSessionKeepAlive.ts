// src/features/auth/hooks/useSessionKeepAlive.ts
// Sliding expiration del lado del frontend: mientras la sesión esté abierta,
// refresca el access token un poco antes de que expire (silencioso, sin que
// el usuario lo note). Si el refresh token ya murió (8h sin actividad), avisa
// con un toast antes de forzar el logout — última oportunidad de "seguir
// conectado" en vez de perder el trabajo sin aviso.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getAuthToken, clearAuth } from '../utils'
import { decodeJwtExp } from '@/src/shared/lib/checkAuth'
import { refreshAccessToken } from '@/src/shared/lib/tokenRefresh'

const REFRESH_MARGIN_MS = 60_000 // refrescar 60s antes de que expire

export function useSessionKeepAlive(): void {
  const navigate = useNavigate()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let cancelado = false

    const forceLogout = () => {
      clearAuth()
      navigate('/login', { replace: true })
    }

    const schedule = () => {
      const token = getAuthToken()
      if (!token) return
      const exp = decodeJwtExp(token)
      if (!exp) return

      const msHastaExpirar = exp * 1000 - Date.now()
      // Margen proporcional, nunca más de la mitad del tiempo restante — con
      // un ACCESS_TOKEN_TTL corto (ej. pruebas locales con "15s"), restar un
      // margen fijo de 60s daría negativo, se saturaría en 0, y dispararía un
      // refresh inmediato que se reprograma a sí mismo sin parar.
      const margen = Math.min(REFRESH_MARGIN_MS, msHastaExpirar / 2)
      const refrescarEn = Math.max(msHastaExpirar - margen, 0)

      timer = setTimeout(async () => {
        if (cancelado) return
        const ok = await refreshAccessToken()
        if (cancelado) return

        if (ok) {
          schedule() // reprograma contra el nuevo exp
          return
        }

        // El refresh token ya expiró (8h de inactividad) — última chance
        // antes de forzar el logout. Timer propio (no onAutoClose/onDismiss
        // de sonner, cuya semántica junto al click del action es ambigua) —
        // mismo patrón que undoableAction.ts.
        let atendido = false
        const logoutTimer = setTimeout(() => { if (!atendido && !cancelado) forceLogout() }, 15_000)

        toast('Tu sesión está por expirar', {
          duration: 15_000,
          action: {
            label: 'Seguir conectado',
            onClick: async () => {
              atendido = true
              clearTimeout(logoutTimer)
              const retried = await refreshAccessToken()
              if (retried) schedule()
              else forceLogout()
            },
          },
          // Mismo estándar que el botón "Deshacer" de undoableAction.ts —
          // color café primario en vez del default del toast.
          classNames: {
            actionButton: '!bg-primary !text-primary-foreground hover:!bg-primary/90',
          },
        })
      }, refrescarEn)
    }

    schedule()
    return () => { cancelado = true; clearTimeout(timer) }
  }, [navigate])
}
