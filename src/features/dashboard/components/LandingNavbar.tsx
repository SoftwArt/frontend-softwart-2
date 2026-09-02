// src/features/dashboard/components/LandingNavbar.tsx
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'
import { NAV_LINKS } from '../utils/landing'

interface LandingNavbarProps {
  scrolled: boolean
  token: string | null
  isCliente: boolean
  isAdmin: boolean
  onLogout: () => void
}

export function LandingNavbar({ scrolled, token, isCliente, isAdmin, onLogout }: LandingNavbarProps) {
  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <img
          src="/softwart-logo.png"
          alt="SoftwArt"
          className="h-9 w-auto object-contain"
          width="160"
          height="36"
        />

        {/* Links (desktop) */}
        <div
          className={`hidden md:flex items-center gap-8 transition-colors duration-300 ${
            scrolled ? 'text-foreground' : 'text-secondary-foreground/80'
          }`}
        >
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium hover:opacity-70 transition-opacity duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {!token && (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hidden sm:flex transition-colors duration-300 ${
                    scrolled
                      ? ''
                      : 'text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground'
                  }`}
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
          {isCliente && (
            <>
              <Link to="/my-account">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Mi cuenta
                </Button>
              </Link>
              <Button
                variant="ghost" size="sm" onClick={onLogout}
                className={`gap-1.5 ${scrolled ? '' : 'text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground'}`}
              >
                <LogOut className="h-4 w-4" />Salir
              </Button>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Panel admin
                </Button>
              </Link>
              <Button
                variant="ghost" size="sm" onClick={onLogout}
                className={`gap-1.5 ${scrolled ? '' : 'text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground'}`}
              >
                <LogOut className="h-4 w-4" />Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
