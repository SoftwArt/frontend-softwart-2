import type { ComponentType } from 'react'
import {
  UserRound, UserCircle, Calendar, ShoppingBag, ClipboardList, LayoutDashboard,
  CreditCard, Calculator, Wrench, Users, Shield, ShieldCheck,
} from 'lucide-react'

export const ADMIN_ROL_ID = 1

// VENTAS/PEDIDOS/PAGOS son los códigos de permiso reales (VENTAS.VER, etc.)
// y no cambian — pero VENTAS.* hoy controla la página que el panel muestra
// como "Pedidos", PEDIDOS.* controla la que se sigue mostrando como
// "Servicios", y PAGOS.* controla la que se muestra como "Ventas" (ver
// AdminSidebar.tsx). Estos labels reflejan eso, para que el módulo que se
// activa/desactiva en Permisos coincida con lo que el rol realmente ve.
// SERVICIOS (Tipos de Servicio) es un módulo aparte, sin relación con este
// swap, y queda igual.
export const MODULO_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  CUENTA:    'Mi Cuenta (Cliente)',
  CLIENTES:  'Clientes',
  CITAS:     'Citas',
  VENTAS:    'Pedidos',
  PEDIDOS:   'Servicios',
  PAGOS:     'Ventas',
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
  VENTAS:    CreditCard,
  PEDIDOS:   ClipboardList,
  PAGOS:     ShoppingBag,
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
