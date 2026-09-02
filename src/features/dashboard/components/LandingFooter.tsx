// src/features/dashboard/components/LandingFooter.tsx
export function LandingFooter() {
  return (
    <footer className="bg-secondary border-t border-secondary-foreground/10 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-1 text-center">
        <span className="text-xs text-secondary-foreground/75">
          © {new Date().getFullYear()} SoftwArt · Todos los derechos reservados
        </span>
      </div>
    </footer>
  )
}
