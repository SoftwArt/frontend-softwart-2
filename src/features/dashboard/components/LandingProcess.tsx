// src/features/dashboard/components/LandingProcess.tsx
import { useRef } from 'react'
import { m, useInView } from 'framer-motion'
import { PASOS, STAGGER, FADE_UP } from '../utils/landing'
import { LandingFadeInView } from './LandingFadeInView'

export function LandingProcess() {
  const processRef    = useRef<HTMLDivElement>(null)
  const processInView = useInView(processRef, { once: true, margin: '-60px 0px' })

  return (
    <section id="proceso" className="py-24 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <LandingFadeInView className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
            Cómo Trabajamos
          </h2>
          <p className="text-muted-foreground">
            Un viaje desde el concepto hasta la creación
          </p>
        </LandingFadeInView>

        <m.div
          ref={processRef}
          className="grid md:grid-cols-3 gap-12 relative"
          variants={STAGGER}
          initial="hidden"
          animate={processInView ? 'visible' : 'hidden'}
        >
          {PASOS.map((p, i) => (
            <m.div key={p.n} variants={FADE_UP} className="text-center relative">
              <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-6 shadow-lg">
                {p.n}
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">{p.titulo}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.descripcion}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 left-[62%] w-[78%] h-px border-t border-dashed border-border" />
              )}
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
