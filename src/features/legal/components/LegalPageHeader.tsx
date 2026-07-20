// src/features/legal/components/LegalPageHeader.tsx
// Header simple para las páginas públicas de lectura (ToS/PyP) — misma idea
// que AuthHeader (logo + volver al inicio) pero fijo sobre fondo claro,
// consistente con una página de lectura larga en vez de un formulario.
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function LegalPageHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <img src="/softwart-logo.png" alt="SoftwArt" className="h-8 w-auto object-contain" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>
      </div>
    </header>
  )
}
