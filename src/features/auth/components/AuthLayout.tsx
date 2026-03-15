// src/features/auth/components/AuthLayout.tsx
// Layout compartido para Login, Registro, Recuperar y Reset
// Úsalo en App.tsx como wrapper de las rutas de auth
import { Outlet } from 'react-router-dom'
import { AuthHeader } from './AuthHeader'
 
export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
 