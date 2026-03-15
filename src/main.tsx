// ============================================================
// src/main.tsx
//
// FIX: AuthProvider faltaba — sin él useAuthContext() lanza
//      "useAuthContext debe estar dentro de AuthProvider" en
//      cualquier hook o componente que lo use.
// ============================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/src/features/auth/context/authContext'
import App from './App'
import './index.css'

 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)