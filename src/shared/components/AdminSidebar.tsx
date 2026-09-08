// src/shared/components/AdminSidebar.tsx
import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Users, Shield, Wrench, Calendar, UserCircle, CreditCard,
  Calculator, ShoppingBag, ClipboardList, ShieldCheck,
  ChevronLeft, ChevronRight, ChevronDown, LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/src/shared/lib/utils'
import { useMyPermissions } from '@/src/shared/hooks/useMyPermissions'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/src/shared/components/ui/tooltip'

interface NavItem {
  label:   string
  href:    string
  icon:    React.ComponentType<{ className?: string }>
  permiso?: string
}

const DASHBOARD_ITEM: NavItem = { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permiso: 'DASHBOARD.VER' }

// Grupos según el flujo real del negocio
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operaciones',
    items: [
      { label: 'Clientes',         href: '/admin/clients',      icon: UserCircle,    permiso: 'CLIENTES.VER' },
      { label: 'Citas',            href: '/admin/appointments', icon: Calendar,      permiso: 'CITAS.VER' },
      { label: 'Pedidos',          href: '/admin/sales',        icon: CreditCard,    permiso: 'VENTAS.VER' },
      { label: 'Servicios',        href: '/admin/orders',       icon: ClipboardList, permiso: 'PEDIDOS.VER' },
      { label: 'Ventas',           href: '/admin/payments',     icon: ShoppingBag,   permiso: 'PAGOS.VER' },
      { label: 'Calculadora',       href: '/admin/calculator',  icon: Calculator,    permiso: 'MARCOS.VER' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { label: 'Tipos de Servicio', href: '/admin/services',    icon: Wrench,        permiso: 'SERVICIOS.VER' },
      
      { label: 'Usuarios',          href: '/admin/users',       icon: Users,         permiso: 'USUARIOS.VER' },
      { label: 'Roles',             href: '/admin/roles',       icon: Shield,        permiso: 'ROLES.VER' },
      { label: 'Permisos',          href: '/admin/permissions', icon: ShieldCheck,   permiso: 'PERMISOS.VER' },
    ],
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { pathname } = useLocation()
  const { can } = useMyPermissions()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NAV_GROUPS.map(g => [g.label, true]))
  )

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside className={cn(
      'group flex flex-col bg-sidebar-accent border-r border-sidebar-border',
      'h-full min-h-0 shrink-0 transition-all duration-300 ease-in-out',
      collapsed ? 'w-[56px]' : 'w-64',
      className
    )}>

      {/* Header */}
      <div className={cn(
        'shrink-0 flex items-center border-b border-sidebar-border h-14 px-3 gap-2',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/softwart-logo.png" alt="SoftwArt" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-sidebar-foreground truncate">SoftwArt</span>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(v => !v)}
              className="shrink-0 rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {collapsed
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft  className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}</TooltipContent>
        </Tooltip>
      </div>

      {/* Nav por grupos */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex flex-col gap-0.5">
          {/* Dashboard — ítem suelto sin grupo */}
          <li>
            {can(DASHBOARD_ITEM.permiso ?? '') && (collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={DASHBOARD_ITEM.href}
                    aria-label={DASHBOARD_ITEM.label}
                    className={cn(
                      'flex items-center justify-center gap-3 rounded-md text-sm transition-colors px-2 py-2',
                      pathname === DASHBOARD_ITEM.href || pathname.startsWith(`${DASHBOARD_ITEM.href}/`)
                        ? 'bg-sidebar-primary/15 text-sidebar-primary font-semibold'
                        : 'text-sidebar-accent-foreground hover:bg-sidebar hover:text-sidebar-foreground'
                    )}
                  >
                    <DASHBOARD_ITEM.icon className="h-4 w-4 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{DASHBOARD_ITEM.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                to={DASHBOARD_ITEM.href}
                className={cn(
                  'flex items-center gap-3 rounded-md text-sm transition-colors px-2 py-2',
                  pathname === DASHBOARD_ITEM.href || pathname.startsWith(`${DASHBOARD_ITEM.href}/`)
                    ? 'bg-sidebar-primary/15 text-sidebar-primary font-semibold'
                    : 'text-sidebar-accent-foreground hover:bg-sidebar hover:text-sidebar-foreground'
                )}
              >
                <DASHBOARD_ITEM.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{DASHBOARD_ITEM.label}</span>
              </Link>
            ))}
          </li>

          {NAV_GROUPS.map((group) => (
            <li key={group.label}>
              {/* Separador / cabecera de grupo */}
              {collapsed ? (
                <div className="my-1 border-t border-sidebar-border mx-1" />
              ) : (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1 rounded-md',
                    'text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60',
                    'hover:text-sidebar-foreground/70 transition-colors mt-3'
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown className={cn(
                    'h-3 w-3 shrink-0 transition-transform duration-200',
                    openGroups[group.label] ? '' : '-rotate-90'
                  )} />
                </button>
              )}

              {/* Items del grupo — colapsables en sidebar expandido */}
              {(collapsed || openGroups[group.label]) && (
                <ul className="flex flex-col gap-0.5 mt-0.5">
                  {group.items.filter(item => can(item.permiso ?? '')).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const Icon     = item.icon
                    const linkCls = cn(
                      'flex items-center gap-3 rounded-md text-sm transition-colors px-2 py-2',
                      collapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-sidebar-primary/15 text-sidebar-primary font-semibold'
                        : 'text-sidebar-accent-foreground hover:bg-sidebar hover:text-sidebar-foreground'
                    )
                    return (
                      <li key={item.href}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={item.href} aria-label={item.label} className={linkCls}>
                                <Icon className="h-4 w-4 shrink-0" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Link to={item.href} className={linkCls}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t border-sidebar-border p-2">
          <p className="text-[11px] text-sidebar-foreground/60 text-center truncate px-2">
            SoftwArt Admin v1.0
          </p>
        </div>
      )}
    </aside>
  )
}