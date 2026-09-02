// src/features/dashboard/hooks/useLanding.ts
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { performLogout } from '@/src/features/auth/utils'
import type { LandingServicio } from '../types'

const POLL_INTERVAL = 30_000 // 30 segundos

function getToken() { return localStorage.getItem('token') ?? sessionStorage.getItem('token') }
function getRol()   { return localStorage.getItem('rol')   ?? sessionStorage.getItem('rol') }

export function useLanding() {
  const navigate = useNavigate()

  const [servicios, setServicios] = useState<LandingServicio[]>([])

  const fetchServicios = useCallback(() => {
    apiRequest<{ data: LandingServicio[] }>('/api/services?limit=6&activos=true')
      .then(r => setServicios(r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchServicios()

    const interval = setInterval(fetchServicios, POLL_INTERVAL)

    const onFocus = () => fetchServicios()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchServicios])

  const [token, setToken] = useState(getToken)
  const rol       = getRol()
  const isCliente = !!(token && rol === 'Cliente')
  const isAdmin   = !!(token && rol === 'Admin')

  // Navbar: transparente en top → opaca en scroll
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Servicio activo (click para revelar descripción)
  const [activeService, setActiveService] = useState<number | null>(null)
  const toggleService = (id: number) => setActiveService(prev => prev === id ? null : id)

  const handleAgendarCita = () => {
    if (isCliente) navigate('/my-account?nueva-cita=true')
    else if (isAdmin) navigate('/admin/dashboard')
  }

  const handleLogout = async () => {
    await performLogout()
    setToken(null)
  }

  return {
    servicios,
    token, isCliente, isAdmin,
    scrolled,
    activeService, toggleService,
    handleAgendarCita,
    handleLogout,
  }
}
