import type { ComponentType } from 'react'
import {
  UserRound, UserCircle, Calendar, ShoppingBag, ClipboardList, LayoutDashboard,
  CreditCard, Calculator, Wrench, Users, Shield, ShieldCheck,
} from 'lucide-react'

export const ADMIN_ROL_ID = 1

export const MODULO_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  CUENTA:    'Mi Cuenta (Cliente)',
  CLIENTES:  'Clientes',
  CITAS:     'Citas',
  VENTAS:    'Ventas',
  PEDIDOS:   'Pedidos',
  PAGOS:     'Pagos',
  MARCOS:    'Marcos / Calculadora',
  SERVICIOS: 'Tipos de Servicio',
  USUARIOS:  'Usuarios',
  ROLES:     'Roles',
  PERMISOS:  'Permisos',
}

// Mismos iconos que AdminSidebar.tsx para el módulo equivalente — consistencia
// visual (Nielsen H4), ADR-004 tarea 7: reemplazo de emojis por iconos shadcn/lucide.
export const MODULO_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  DASHBOARD: LayoutDashboard,
  CUENTA:    UserRound,
  CLIENTES:  UserCircle,
  CITAS:     Calendar,
  VENTAS:    ShoppingBag,
  PEDIDOS:   ClipboardList,
  PAGOS:     CreditCard,
  MARCOS:    Calculator,
  SERVICIOS: Wrench,
  USUARIOS:  Users,
  ROLES:     Shield,
  PERMISOS:  ShieldCheck,
}

export const MODULO_ORDER = [
  'DASHBOARD', 'CUENTA', 'CLIENTES', 'CITAS', 'VENTAS', 'PEDIDOS',
  'PAGOS', 'MARCOS', 'SERVICIOS', 'USUARIOS', 'ROLES', 'PERMISOS',
]

export function getModulo(nombre: string): string {
  return nombre.split('.')[0] ?? 'GENERAL'
}

export function getAccion(nombre: string): string {
  return nombre.split('.')[1] ?? nombre
}
