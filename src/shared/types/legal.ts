// Espejo del shape que devuelve GET /api/legal/:tipo (LegalController.ts,
// backend) — el backend es la única fuente del contenido, este archivo solo
// tipa la respuesta, no duplica texto legal.
export type LegalDocTipo = 'politica-privacidad' | 'terminos-servicio'

export interface LegalSeccion {
  titulo: string
  parrafos: string[]
}

export interface DocumentoLegal {
  tipo: string
  version: string
  fecha: string
  hash: string
  secciones: LegalSeccion[]
}

export const LEGAL_TITULOS: Record<LegalDocTipo, string> = {
  'politica-privacidad': 'Política de Privacidad',
  'terminos-servicio':   'Términos de Servicio',
}
