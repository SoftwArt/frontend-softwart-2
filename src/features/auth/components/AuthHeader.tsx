// src/features/auth/components/AuthHeader.tsx
// Barra superior compartida en todas las páginas de auth
// Muestra logo/nombre clickeable que regresa al landing
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
 
export function AuthHeader() {
  return (
    <header className="w-full px-4 py-3 flex items-center justify-between border-b border-border bg-card">
      <Link
        to="/"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
 
      <Link to="/" className="text-base font-bold text-foreground hover:text-primary transition-colors">
        SoftwArt
      </Link>
 
      {/* Espaciador para centrar el logo */}
      <div className="w-24" />
    </header>
  )
}
 