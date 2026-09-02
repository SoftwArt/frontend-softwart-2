// src/features/dashboard/components/LandingServices.tsx
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowRight, CalendarPlus, X } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import type { LandingServicio } from '../types'
import { EASE, CARD_IDS, cldCard } from '../utils/landing'
import { LandingFadeInView } from './LandingFadeInView'

interface LandingServicesProps {
  servicios: LandingServicio[]
  activeService: number | null
  onToggleService: (id: number) => void
  showCta: boolean
}

export function LandingServices({ servicios, activeService, onToggleService, showCta }: LandingServicesProps) {
  return (
    <section id="servicios" className="py-20 bg-muted scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <LandingFadeInView className="text-center mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Artesanía
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-3">
            Nuestros Servicios
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Cada pieza es única. Trabajamos con los mejores materiales para que tu obra luzca perfecta.
          </p>
        </LandingFadeInView>

        <div className="flex flex-wrap justify-center gap-4">
          {servicios.map((s, i) => {
            const isActive = activeService === s.id_servicio
            return (
              <LandingFadeInView
                key={s.id_servicio}
                delay={i * 0.08}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className={`relative h-72 w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-primary shadow-xl scale-[1.02]'
                      : 'shadow-sm hover:shadow-md hover:scale-[1.01]'
                  }`}
                  onClick={() => onToggleService(s.id_servicio)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggleService(s.id_servicio) }}
                >
                  <img
                    {...cldCard(CARD_IDS[i % CARD_IDS.length])}
                    alt={s.nombre}
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) calc(50vw - 8px), (max-width: 1024px) calc(33vw - 11px), calc(20vw - 13px)"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isActive ? 'scale-105 blur-sm' : ''}`}
                  />
                  <div className={`absolute inset-0 z-10 transition-all duration-500 ${isActive ? 'bg-black/70' : 'bg-gradient-to-t from-black/75 via-black/20 to-transparent'}`} />
                  <div className="absolute bottom-0 p-4 z-20 w-full">
                    <h3 className="text-white font-semibold text-base leading-tight">
                      {s.nombre}
                    </h3>
                    <m.div
                      className="overflow-hidden"
                      initial={false}
                      animate={isActive ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <p className="text-white/80 text-xs leading-relaxed mt-2">
                        {s.descripcion ?? s.nombre}
                      </p>
                      <button
                        className="mt-2 text-accent text-xs font-semibold flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); onToggleService(s.id_servicio) }}
                      >
                        <X className="h-3 w-3" /> Cerrar
                      </button>
                    </m.div>
                    {!isActive && (
                      <span className="text-white/50 text-[10px] flex items-center gap-1 mt-1">
                        <ArrowRight className="h-3 w-3" /> Ver descripción
                      </span>
                    )}
                  </div>
                </div>
              </LandingFadeInView>
            )
          })}
        </div>

        {showCta && (
          <LandingFadeInView className="text-center mt-10 mb-2">
            <div className="flex flex-col items-center gap-2">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <CalendarPlus className="h-5 w-5" />
                  Quiero agendar una cita
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary underline underline-offset-2">Inicia sesión</Link>
              </p>
            </div>
          </LandingFadeInView>
        )}
      </div>
    </section>
  )
}
