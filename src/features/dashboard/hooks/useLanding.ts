// ================================================================
// src/features/dashboard/hooks/useLanding.ts
// Sin cambios — el landing es solo informativo
// ================================================================
import { useState } from 'react'

export function useLanding() {
  const [ctaClicked, setCtaClicked] = useState(false)
  return { ctaClicked, setCtaClicked }
}