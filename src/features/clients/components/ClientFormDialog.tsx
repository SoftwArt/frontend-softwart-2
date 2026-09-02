// src/features/clients/components/ClientFormDialog.tsx
import { DOCUMENT_TYPES, inputCls, labelCls, selectCls } from '../utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/shared/components/ui/dialog'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { LegalDocumentModal } from '@/src/shared/components/LegalDocumentModal'
import type { LegalDocTipo } from '@/src/shared/types/legal'
import { onlyDigits, TELEFONO_MAX_LENGTH } from '@/src/shared/lib/validateTelefono'
import { stripDigits, NOMBRE_MAX_ERROR, NOMBRE_MAX_LENGTH } from '@/src/shared/lib/validateNombre'

interface ClientFormDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  editingId: number | null
  tipoDocumento: string; onTipoDocumentoChange: (v: string) => void
  documento: string;     onDocumentoChange:     (v: string) => void
  nombre: string;        onNombreChange:        (v: string) => void
  correo: string;        onCorreoChange:        (v: string) => void
  telefono: string;      onTelefonoChange:      (v: string) => void
  acceptToS: boolean;     onAcceptToSChange:     (v: boolean) => void
  acceptPrivacy: boolean; onAcceptPrivacyChange: (v: boolean) => void
  legalModal: LegalDocTipo | null; onLegalModalChange: (v: LegalDocTipo | null) => void
  errors: Record<string, string>
  documentoFormatoError: string | null
  correoFormatoError: string | null
  telefonoFormatoError: string | null
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function ClientFormDialog({
  open, onOpenChange, editingId,
  tipoDocumento, onTipoDocumentoChange,
  documento, onDocumentoChange,
  nombre, onNombreChange,
  correo, onCorreoChange,
  telefono, onTelefonoChange,
  acceptToS, onAcceptToSChange,
  acceptPrivacy, onAcceptPrivacyChange,
  legalModal, onLegalModalChange,
  errors, documentoFormatoError, correoFormatoError, telefonoFormatoError,
  isSubmitting, onSubmit, onCancel,
}: ClientFormDialogProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-secondary">
              {editingId ? 'Editar Cliente' : 'Registrar Cliente'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId ? 'Puedes editar los datos y el correo sincronizado con su usuario.' : 'Completa los datos del nuevo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-2" noValidate>
            <div>
              <label className={labelCls} htmlFor="cli-tipo-doc">Tipo de documento <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.tipoDocumento}>
                <Select value={tipoDocumento} onValueChange={onTipoDocumentoChange}>
                  <SelectTrigger id="cli-tipo-doc" className={selectCls}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-documento">Número de documento <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.documento || documentoFormatoError}>
                <input id="cli-documento" value={documento} placeholder="Ej: 1234567890"
                  onChange={e => onDocumentoChange(e.target.value)}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-nombre">Nombre completo <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.nombre || (nombre.length >= NOMBRE_MAX_LENGTH ? NOMBRE_MAX_ERROR : null)}>
                <input id="cli-nombre" value={nombre} placeholder="Nombre completo del cliente"
                  onChange={e => onNombreChange(stripDigits(e.target.value))}
                  maxLength={NOMBRE_MAX_LENGTH}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-correo">Correo electrónico <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.correo || correoFormatoError}>
                <input id="cli-correo" type="email" value={correo} placeholder="correo@ejemplo.com"
                  onChange={e => onCorreoChange(e.target.value)}
                  className={inputCls} />
              </FieldErrorTooltip>
              {editingId && <p className="text-xs text-muted-foreground mt-1">Se actualizará también en el usuario asociado.</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="cli-telefono">Teléfono <span className="text-destructive">*</span></label>
              <FieldErrorTooltip error={errors.telefono || telefonoFormatoError}>
                <input id="cli-telefono" type="tel" value={telefono} placeholder="Ej: 3001234567"
                  maxLength={TELEFONO_MAX_LENGTH}
                  onChange={e => onTelefonoChange(onlyDigits(e.target.value))}
                  className={inputCls} />
              </FieldErrorTooltip>
            </div>
            {!editingId && (
              <div className="space-y-2 border-t border-border pt-3">
                <FieldErrorTooltip error={errors.acceptToS} side="right">
                  <div className="flex items-start gap-3">
                    <Checkbox id="cli-accept-tos" checked={acceptToS} onCheckedChange={v => onAcceptToSChange(v === true)} className="mt-0.5" />
                    <label htmlFor="cli-accept-tos" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      El cliente acepta los{' '}
                      <button type="button" className="text-foreground font-semibold underline underline-offset-2" onClick={() => onLegalModalChange('terminos-servicio')}>Términos de Servicio</button>.
                    </label>
                  </div>
                </FieldErrorTooltip>
                <FieldErrorTooltip error={errors.acceptPrivacy} side="right">
                  <div className="flex items-start gap-3">
                    <Checkbox id="cli-accept-privacy" checked={acceptPrivacy} onCheckedChange={v => onAcceptPrivacyChange(v === true)} className="mt-0.5" />
                    <label htmlFor="cli-accept-privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      El cliente acepta la{' '}
                      <button type="button" className="text-foreground font-semibold underline underline-offset-2" onClick={() => onLegalModalChange('politica-privacidad')}>Política de Privacidad</button>.
                    </label>
                  </div>
                </FieldErrorTooltip>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                {editingId ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <LegalDocumentModal
        open={legalModal !== null}
        tipo={legalModal}
        onOpenChange={open => { if (!open) onLegalModalChange(null) }}
        onAccept={() => {
          if (legalModal === 'terminos-servicio') onAcceptToSChange(true)
          if (legalModal === 'politica-privacidad') onAcceptPrivacyChange(true)
        }}
      />
    </>
  )
}
