// src/features/auth/components/RegisterLegalAcceptance.tsx
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { LegalDocumentModal } from '@/src/shared/components/LegalDocumentModal'
import type { LegalDocTipo } from '@/src/shared/types/legal'

interface RegisterLegalAcceptanceProps {
  acceptToS: boolean; onAcceptToSChange: (v: boolean) => void
  acceptPrivacy: boolean; onAcceptPrivacyChange: (v: boolean) => void
  legalModal: LegalDocTipo | null; onLegalModalChange: (v: LegalDocTipo | null) => void
  showAcceptTosError: boolean
  showAcceptPrivacyError: boolean
}

export function RegisterLegalAcceptance({
  acceptToS, onAcceptToSChange,
  acceptPrivacy, onAcceptPrivacyChange,
  legalModal, onLegalModalChange,
  showAcceptTosError, showAcceptPrivacyError,
}: RegisterLegalAcceptanceProps) {
  return (
    <>
      {/* Términos — dos casillas, una por documento (ver aceptacion_legal) */}
      <div className="space-y-2 pt-1">
        <FieldErrorTooltip
          error={showAcceptTosError ? 'Debes aceptar los Términos de Servicio para continuar' : null}
          side="right"
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-tos"
              checked={acceptToS}
              onCheckedChange={v => onAcceptToSChange(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="accept-tos" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              He leído y acepto los{' '}
              <span
                className="text-foreground font-semibold underline underline-offset-2 cursor-pointer hover:text-primary"
                onClick={e => { e.preventDefault(); onLegalModalChange('terminos-servicio') }}
              >
                Términos de Servicio
              </span>
              .
            </label>
          </div>
        </FieldErrorTooltip>
        <FieldErrorTooltip
          error={showAcceptPrivacyError ? 'Debes aceptar la Política de Privacidad para continuar' : null}
          side="right"
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-privacy"
              checked={acceptPrivacy}
              onCheckedChange={v => onAcceptPrivacyChange(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="accept-privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              He leído y autorizo el tratamiento de mis datos personales conforme a la{' '}
              <span
                className="text-foreground font-semibold underline underline-offset-2 cursor-pointer hover:text-primary"
                onClick={e => { e.preventDefault(); onLegalModalChange('politica-privacidad') }}
              >
                Política de Privacidad
              </span>
              .
            </label>
          </div>
        </FieldErrorTooltip>
      </div>

      <LegalDocumentModal
        tipo={legalModal}
        open={legalModal !== null}
        onOpenChange={v => { if (!v) onLegalModalChange(null) }}
        onAccept={() => {
          if (legalModal === 'terminos-servicio') onAcceptToSChange(true)
          if (legalModal === 'politica-privacidad') onAcceptPrivacyChange(true)
        }}
      />
    </>
  )
}
