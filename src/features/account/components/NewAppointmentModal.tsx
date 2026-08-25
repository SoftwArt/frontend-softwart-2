// src/features/account/components/NewAppointmentModal.tsx
import { m } from 'framer-motion'
import { inputCls, labelCls, modalBackdropVariants, modalPanelVariants } from '../utils'
import { bogotaTomorrowStr, bogotaMaxFuturoStr } from '@/src/shared/lib/bogotaTime'
import { TimePicker } from '@/src/shared/components/TimePicker'
import { DatePicker } from '@/src/shared/components/DatePicker'
import { FieldErrorTooltip } from '@/src/shared/components/FieldErrorTooltip'
import { CalendarPlus, X } from 'lucide-react'
import type { BookedSlot } from '@/src/shared/components/TimePicker'

interface NewAppointmentModalProps {
  date: string
  time: string
  notes: string
  onNotesChange: (value: string) => void
  errors: { fecha?: string | null; hora?: string | null }
  isSubmitting: boolean
  bookedSlots: BookedSlot[]
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function NewAppointmentModal({
  date, time, notes, onNotesChange, errors, isSubmitting, bookedSlots,
  onDateChange, onTimeChange, onSubmit, onClose,
}: NewAppointmentModalProps) {
  return (
    <m.div
      key="backdrop-new-appointment"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      variants={modalBackdropVariants}
      initial="initial" animate="animate" exit="exit"
    >
      <m.div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 p-6 relative"
        onClick={e => e.stopPropagation()}
        variants={modalPanelVariants}
        initial="initial" animate="animate" exit="exit"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-secondary">Agendar nueva cita</h3>
          <button type="button" onClick={onClose} title="Cerrar" aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className={labelCls} htmlFor="cita-fecha-mc">Fecha <span className="text-destructive">*</span></label>
            <FieldErrorTooltip error={errors.fecha}>
              <div>
                <DatePicker id="cita-fecha-mc" value={date} min={bogotaTomorrowStr()} max={bogotaMaxFuturoStr()} error={errors.fecha ?? undefined} onChange={onDateChange} />
              </div>
            </FieldErrorTooltip>
          </div>

          <TimePicker value={time} onChange={onTimeChange} error={errors.hora ?? undefined} bookedSlots={bookedSlots} />

          <div>
            <label className={labelCls} htmlFor="cita-obs">
              Observaciones{' '}
              <span className="text-muted-foreground font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea id="cita-obs" value={notes} onChange={e => onNotesChange(e.target.value)}
              placeholder="Cuéntanos qué necesitas, medidas, tipo de marco, etc."
              rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button type="submit" disabled={isSubmitting}
              className="bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
              <CalendarPlus className="h-4 w-4" />
              {isSubmitting ? 'Agendando...' : 'Confirmar cita'}
            </button>
            <button type="button" onClick={onClose}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors py-2">
              Cancelar
            </button>
          </div>
        </form>
      </m.div>
    </m.div>
  )
}