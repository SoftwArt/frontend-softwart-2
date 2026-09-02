// src/features/dashboard/components/LandingContact.tsx
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, MessageCircle } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { LandingFadeInView } from './LandingFadeInView'
import { LandingMapFacade } from './LandingMapFacade'

interface LandingContactProps {
  showCta: boolean
}

export function LandingContact({ showCta }: LandingContactProps) {
  return (
    <section id="contacto" className="py-20 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-8 lg:px-12 grid md:grid-cols-2 gap-8 items-stretch">
        <LandingFadeInView className="bg-muted rounded-2xl border border-border p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
              Visita Nuestro Taller
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Taller Principal y Galería</p>
                  <p className="text-muted-foreground text-sm">Cra. 74 #50, Los Colores – Estadio, Medellín</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Horario de Atención</p>
                  <p className="text-muted-foreground text-sm">Lun – Vie: 09:00 – 18:00</p>
                  <p className="text-muted-foreground text-sm">Sábado: 10:00 – 14:00</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Contacto (WhatsApp)</p>
                  <p className="text-muted-foreground text-sm">+57 300 5414130</p>
                </div>
              </div>
            </div>
          </div>
          {showCta && (
            <div className="mt-8">
              <Link to="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2">
                  Agendar una Cita <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </LandingFadeInView>

        <LandingFadeInView
          delay={0.15}
          className="rounded-xl overflow-hidden border border-border shadow-sm min-h-[380px]"
        >
          <LandingMapFacade />
        </LandingFadeInView>
      </div>
    </section>
  )
}
