// src/shared/lib/validateDocumento.ts
// Espeja DOCUMENTO_REGLAS / validarDocumentoPorTipo del backend
// (backend/src/schemas/auth.schemas.ts). Estándar colombiano:
//   CC — numérico, 6, 7, 8 o 10 dígitos (nunca 9)
//   TI — numérico, 10 u 11 dígitos
//   CE — alfanumérico, 6-10 caracteres
//   PP — alfanumérico, hasta 9 caracteres (ICAO Doc 9303)
type DocumentoRegla = { min: number; max: number; soloNumerico: boolean; label: string }

export const DOCUMENTO_REGLAS: Record<string, DocumentoRegla> = {
  CC: { min: 6,  max: 10, soloNumerico: true,  label: 'La Cédula de Ciudadanía' },
  TI: { min: 10, max: 11, soloNumerico: true,  label: 'La Tarjeta de Identidad' },
  CE: { min: 6,  max: 10, soloNumerico: false, label: 'La Cédula de Extranjería' },
  PP: { min: 6,  max: 9,  soloNumerico: false, label: 'El Pasaporte' },
}

// null = válido (o tipoDocumento aún no seleccionado / documento vacío)
export function validarDocumentoPorTipo(tipoDocumento: string, documento: string): string | null {
  const regla = DOCUMENTO_REGLAS[tipoDocumento]
  if (!regla || !documento) return null
  if (regla.soloNumerico && !/^\d+$/.test(documento)) {
    return `${regla.label} solo debe contener números.`
  }
  if (documento.length < regla.min || documento.length > regla.max) {
    const unidad = regla.soloNumerico ? 'dígitos' : 'caracteres'
    return regla.min === regla.max
      ? `${regla.label} debe tener ${regla.min} ${unidad}.`
      : `${regla.label} debe tener entre ${regla.min} y ${regla.max} ${unidad}.`
  }
  return null
}
