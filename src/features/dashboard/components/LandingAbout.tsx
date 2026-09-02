// src/features/dashboard/components/LandingAbout.tsx
import { BadgeCheck } from 'lucide-react'
import { LandingFadeInView } from './LandingFadeInView'

export function LandingAbout() {
  return (
    <section className="py-20 bg-muted scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <LandingFadeInView className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-secondary" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Sobre Arte Café</h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            Somos una marquetería ubicada en el barrio Los Colores – Estadio de Medellín,
            con años de experiencia enmarcando fotografías, pinturas, diplomas y todo
            lo que quieras conservar con estilo. Cada trabajo es personalizado y hecho
            con dedicación para que el resultado supere tus expectativas.
          </p>
        </LandingFadeInView>
      </div>
    </section>
  )
}
