// src/features/dashboard/components/LandingPage.tsx
import { useLanding } from '../hooks/useLanding'
import { LazyMotion, domAnimation } from 'framer-motion'
import { LandingNavbar } from './LandingNavbar'
import { LandingHero } from './LandingHero'
import { LandingServices } from './LandingServices'
import { LandingProcess } from './LandingProcess'
import { LandingAbout } from './LandingAbout'
import { LandingContact } from './LandingContact'
import { LandingFooter } from './LandingFooter'

export function LandingPage() {
  const {
    servicios,
    token, isCliente, isAdmin,
    scrolled,
    activeService, toggleService,
    handleAgendarCita,
    handleLogout,
  } = useLanding()

  const isAuthenticated = isCliente || isAdmin

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background text-foreground">
        <LandingNavbar
          scrolled={scrolled}
          token={token}
          isCliente={isCliente}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />

        <main>
          <LandingHero isAuthenticated={isAuthenticated} onAgendarCita={handleAgendarCita} />

          {servicios.length > 0 && (
            <LandingServices
              servicios={servicios}
              activeService={activeService}
              onToggleService={toggleService}
              showCta={!token}
            />
          )}

          <LandingProcess />
          <LandingAbout />
          <LandingContact showCta={!token} />
        </main>

        <LandingFooter />
      </div>
    </LazyMotion>
  )
}
