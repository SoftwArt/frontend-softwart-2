// src/features/dashboard/components/LandingMapFacade.tsx
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { MAP_URL } from '../utils/landing'

export function LandingMapFacade() {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={MAP_URL}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '380px' }}
        allowFullScreen
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación Arte Café"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="w-full min-h-[380px] flex flex-col items-center justify-center gap-4 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      aria-label="Cargar mapa de ubicación"
    >
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="rounded-full bg-primary/10 p-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Arte Café</p>
          <p className="text-sm text-muted-foreground">Cra. 74 #50-17, Los Colores, Medellín</p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <MapPin className="h-4 w-4" />
          Ver mapa interactivo
        </span>
      </div>
    </button>
  )
}
