// src/features/dashboard/components/LandingPage.tsx
import { useLanding } from '../hooks/useLanding'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Scissors, Sparkles, CalendarPlus } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'

function getToken() { return localStorage.getItem('token') ?? sessionStorage.getItem('token') }
function getRol()   { return localStorage.getItem('rol')   ?? sessionStorage.getItem('rol') }

export function LandingPage() {
  useLanding()
  const navigate = useNavigate()

  const token = getToken()
  const rol   = getRol()
  const isCliente   = token && rol === 'Cliente'
  const isAdminEmpl = token && (rol === 'Admin' || rol === 'Empleado')

  const handleAgendarCita = () => {
    if (isCliente) {
      // Ya logueado como cliente → directo al formulario
      navigate('/mi-cuenta?nueva-cita=true')
    } else if (isAdminEmpl) {
      // Admin/Empleado logueado → panel
      navigate('/admin/dashboard')
    } else {
      // Sin sesión → login con contexto de redirección
      navigate('/login?redirect=cita')
    }
  }

  const features = [
    {
      icon: Scissors,
      title: 'Servicios de Calidad',
      description: 'Ofrecemos los mejores servicios de marquetería de alta calidad.',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Clock,
      title: 'Equipo Profesional',
      description: 'Tiempos de entrega competitivos sin afectar calidad.',
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      icon: Sparkles,
      title: 'Experiencia Única',
      description: 'Aquí se trabaja todo personalizado, a tu gusto.',
      bgColor: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Bienvenido a SoftwArt
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 max-w-2xl mx-auto text-pretty">
              Tu marquetería de confianza. Agenda tu cita hoy y obtén tu cuadro a tu gusto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              {/* CTA principal — siempre visible, comportamiento según estado de sesión */}
              <Button
                size="lg"
                onClick={handleAgendarCita}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <CalendarPlus className="h-5 w-5" />
                Agenda tu cita
              </Button>

              {/* CTAs secundarios según estado */}
              {!token && (
                <>
                  <Link to="/login">
                    <Button size="lg" variant="outline"
                      className="border-secondary-foreground/30 text-secondary-foreground bg-secondary-foreground/10 hover:bg-transparent w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button size="lg" variant="outline"
                      className="border-secondary-foreground/30 text-secondary-foreground bg-secondary-foreground/10 hover:bg-transparent w-full">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}

              {isCliente && (
                <Link to="/mi-cuenta">
                  <Button size="lg" variant="outline"
                    className="border-secondary-foreground/30 text-secondary-foreground bg-secondary-foreground/10 hover:bg-transparent w-full">
                    Mi cuenta
                  </Button>
                </Link>
              )}

              {isAdminEmpl && (
                <Link to="/admin/dashboard">
                  <Button size="lg" variant="outline"
                    className="border-secondary-foreground/30 text-secondary-foreground bg-secondary-foreground/10 hover:bg-transparent w-full">
                    Panel admin
                  </Button>
                </Link>
              )}
            </div>

            {/* Aviso sutil si no tiene sesión */}
            {!token && (
              <p className="mt-4 text-sm text-secondary-foreground/60">
                Necesitas una cuenta para agendar. Es rápido y gratis.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="servicios" className="py-16 bg-background scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">SoftwArt</h3>
              <p className="text-muted-foreground text-sm">Tu marquetería de confianza.</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} SoftwArt. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}