// src/features/dashboard/components/LandingFadeInView.tsx
import { useRef } from 'react'
import { m, useInView } from 'framer-motion'
import { EASE } from '../utils/landing'

// ─── Helper: fade-in al entrar en viewport ───────────────────────────────────
export function LandingFadeInView({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <m.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </m.div>
  )
}
