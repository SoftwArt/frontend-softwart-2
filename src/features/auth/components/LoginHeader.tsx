// src/features/auth/components/LoginHeader.tsx
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, UserPlus } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

export function LoginHeader() {
  return (
    <m.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <img src="/softwart-logo.png" alt="SoftwArt" className="h-9 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Crear cuenta
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </m.header>
  )
}
