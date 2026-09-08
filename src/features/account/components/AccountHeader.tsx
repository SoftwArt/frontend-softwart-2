// src/features/account/components/AccountHeader.tsx
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'

interface AccountHeaderProps {
  initial: string
  nombre: string | undefined
  onLogout: () => void
}

export function AccountHeader({ initial, nombre, onLogout }: AccountHeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0">
      <img src="/softwart-logo.png" alt="SoftwArt" className="h-8 w-8 object-contain" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
            <div className="h-7 w-7 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-secondary">{initial}</span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground leading-tight truncate max-w-[160px]">{nombre ?? ''}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Cliente</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-foreground truncate">{nombre ?? ''}</p>
            <p className="text-[10px] text-muted-foreground">Cliente</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 shrink-0" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
