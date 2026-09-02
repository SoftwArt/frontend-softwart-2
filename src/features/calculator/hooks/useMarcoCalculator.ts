// src/features/calculator/hooks/useMarcoCalculator.ts
import { useState, useMemo } from 'react'
import type { Marco } from '../types'

export function useMarcoCalculator() {
  const [isCalcOpen, setIsCalcOpen] = useState(false)
  const [calcMarco,  setCalcMarco]  = useState<Marco | null>(null)
  const [largo,      setLargo]      = useState('')
  const [ancho,      setAncho]      = useState('')

  const openCalc = (m: Marco) => { setCalcMarco(m); setLargo(''); setAncho(''); setIsCalcOpen(true) }

  // Reactivo (sin submit) — "0" es truthy como string, así que el chequeo de
  // vacío por sí solo dejaba pasar un largo/ancho de 0 (o negativo, tecleado
  // a mano pese al min="0" del input) y calculaba un costo sin sentido.
  const calcErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (largo && Number(largo) <= 0) errs.largo = 'Debe ser mayor a 0'
    if (ancho && Number(ancho) <= 0) errs.ancho = 'Debe ser mayor a 0'
    return errs
  }, [largo, ancho])

  const calcValues = useMemo(() => {
    if (!calcMarco || !largo || !ancho || Number(largo) <= 0 || Number(ancho) <= 0) return { costo: 0, venta: 0 }
    const costo = ((Number(largo) + Number(ancho)) * 2 + Number(calcMarco.colilla)) * Number(calcMarco.precio_ensamblado)
    return { costo, venta: costo * 2 }
  }, [calcMarco, largo, ancho])

  return {
    isCalcOpen, setIsCalcOpen,
    calcMarco,
    largo, setLargo,
    ancho, setAncho,
    openCalc,
    calcErrors, calcValues,
  }
}
