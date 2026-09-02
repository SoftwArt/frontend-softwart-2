// src/features/dashboard/components/LandingHero.tsx
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { EASE, HERO_IMG } from '../utils/landing'

interface LandingHeroProps {
  isAuthenticated: boolean
  onAgendarCita: () => void
}

export function LandingHero({ isAuthenticated, onAgendarCita }: LandingHeroProps) {
  return (
    <section
      id="inicio"
      className="relative h-dvh flex items-center bg-secondary text-secondary-foreground overflow-hidden"
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative w-full h-full max-w-[1600px] mx-auto px-8 xl:px-16 grid md:grid-cols-2 gap-12 xl:gap-20 items-center pt-16 py-8">

        {/* Columna izquierda */}
        <div className="space-y-6 xl:space-y-8">
          <m.p
            className="text-xs xl:text-sm font-semibold tracking-widest uppercase text-secondary-foreground/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Marquetería · Los Colores, Medellín
          </m.p>

          <m.h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          >
            Preservando tus momentos más{' '}
            <em className="not-italic text-accent">especiales</em>{' '}
            con manos artesanas
          </m.h1>

          <m.p
            className="text-base xl:text-lg text-secondary-foreground/70 max-w-md xl:max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: EASE }}
          >
            Transformando recuerdos en legados duraderos a través del meticuloso
            arte de la marquetería artesanal y el enmarcado personalizado.
          </m.p>

          <m.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={onAgendarCita}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <CalendarPlus className="h-5 w-5" />
                Agenda tu cita
              </Button>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <CalendarPlus className="h-5 w-5" />
                    Quiero agendar una cita
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg" variant="ghost"
                    className="text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              </>
            )}
          </m.div>
        </div>

        {/* Columna derecha — imagen (LCP: sin animación de entrada para render inmediato) */}
        <div className="relative hidden md:flex md:items-center md:justify-center h-full py-8">
          <div className="relative h-full w-full max-h-[calc(100dvh-8rem)]">
            <div className="h-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                alt="Taller artesanal Arte Café"
                className="w-full h-full object-cover"
                src={HERO_IMG}
                width={900}
                height={1125}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-36 h-36 bg-primary/25 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/30 rounded-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
