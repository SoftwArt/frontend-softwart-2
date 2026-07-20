// src/features/legal/components/TerminosServicioPage.tsx
import { LegalPageHeader } from './LegalPageHeader'
import { LegalDocumentContent } from '@/src/shared/components/LegalDocumentContent'

export function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalPageHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Términos de Servicio</h1>
        <p className="text-sm text-muted-foreground mb-10">Arte Café</p>
        <LegalDocumentContent tipo="terminos-servicio" />
      </main>
    </div>
  )
}
