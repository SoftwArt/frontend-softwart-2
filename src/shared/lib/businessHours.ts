// src/shared/lib/businessHours.ts
// Espeja horaHHMM en backend/src/schemas/common.schemas.ts (13:00-18:00) —
// no duplicar este rango en más lugares.
export const BUSINESS_HOUR_START = 13
export const BUSINESS_HOUR_END = 18

export const BUSINESS_HOUR_SLOTS = Array.from(
  { length: BUSINESS_HOUR_END - BUSINESS_HOUR_START },
  (_, i) => `${String(BUSINESS_HOUR_START + i).padStart(2, '0')}:00`,
)

export function isWithinBusinessHours(hora: string): boolean {
  const h = Number(hora.split(':')[0])
  return h >= BUSINESS_HOUR_START && h < BUSINESS_HOUR_END
}
