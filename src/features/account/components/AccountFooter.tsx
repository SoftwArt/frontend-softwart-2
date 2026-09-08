// src/features/account/components/AccountFooter.tsx
export function AccountFooter() {
  return (
    <footer className="bg-secondary border-t border-secondary-foreground/10 py-6 shrink-0">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-1 text-center">
        <span className="font-serif text-base font-bold italic text-secondary-foreground">Arte Café</span>
        <span className="text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} SoftwArt · Todos los derechos reservados
        </span>
      </div>
    </footer>
  )
}
