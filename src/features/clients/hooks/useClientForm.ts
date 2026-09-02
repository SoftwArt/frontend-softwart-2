// src/features/clients/hooks/useClientForm.ts
import { useState } from 'react'
import type { Cliente } from '../types'
import { withToast } from '@/src/shared/lib/withToast'
import { isTelefonoValid, TELEFONO_ERROR } from '@/src/shared/lib/validateTelefono'
import { isNombreLongitudValida, NOMBRE_MIN_ERROR } from '@/src/shared/lib/validateNombre'
import { validarDocumentoPorTipo } from '@/src/shared/lib/validateDocumento'
import { isEmailValid, EMAIL_ERROR } from '@/src/shared/lib/validateEmail'
import type { LegalDocTipo } from '@/src/shared/types/legal'

type CreateData = { tipoDocumento: string; documento: string; nombre: string; correo: string; telefono: string; estado: boolean; acceptToS: boolean; acceptPrivacy: boolean }
type EditData = { tipoDocumento: string; documento: string; nombre: string; correo: string; telefono: string }

type Params = {
  onCreate: (data: CreateData) => Promise<unknown>
  onEdit: (id: number, data: EditData) => Promise<unknown>
}

export function useClientForm({ onCreate, onEdit }: Params) {
  const [isFormOpen,   setIsFormOpen]   = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [documento,     setDocumento]     = useState('')
  const [nombre,        setNombre]        = useState('')
  const [correo,        setCorreo]        = useState('')
  const [telefono,      setTelefono]      = useState('')
  const [acceptToS,     setAcceptToS]     = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [legalModal,    setLegalModal]    = useState<LegalDocTipo | null>(null)
  const [errors,        setErrors]        = useState<Record<string, string>>({})

  const clearError = (field: string) => setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev))

  // Reactivo: cambia según el tipo de documento seleccionado (CC/TI numérico
  // con longitud propia, CE/PP alfanumérico) — no espera al submit.
  const documentoFormatoError = documento.length > 0 ? validarDocumentoPorTipo(tipoDocumento, documento) : null
  const correoFormatoError = correo.length > 0 && !isEmailValid(correo) ? EMAIL_ERROR : null
  const telefonoFormatoError = telefono.length > 0 && !isTelefonoValid(telefono) ? TELEFONO_ERROR : null

  const resetForm = () => {
    setTipoDocumento(''); setDocumento(''); setNombre('')
    setCorreo(''); setTelefono(''); setErrors({}); setEditingId(null)
    setAcceptToS(false); setAcceptPrivacy(false); setLegalModal(null)
  }
  const openCreate = () => { resetForm(); setIsFormOpen(true) }
  const openEdit   = (c: Cliente) => {
    setEditingId(c.id_cliente); setTipoDocumento(c.tipoDocumento)
    setDocumento(c.documento); setNombre(c.nombre)
    setCorreo(c.correo); setTelefono(c.telefono ?? '')
    setErrors({}); setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!tipoDocumento)    newErrors.tipoDocumento = 'Campo requerido'
    if (!documento.trim())        newErrors.documento = 'Campo requerido'
    else if (documentoFormatoError) newErrors.documento = documentoFormatoError
    if (!nombre.trim())              newErrors.nombre = 'Campo requerido'
    else if (!isNombreLongitudValida(nombre)) newErrors.nombre = NOMBRE_MIN_ERROR
    if (!correo.trim())    newErrors.correo        = 'Campo requerido'
    else if (correoFormatoError) newErrors.correo  = correoFormatoError
    if (!telefono.trim())           newErrors.telefono = 'Campo requerido'
    else if (telefonoFormatoError) newErrors.telefono = telefonoFormatoError
    if (!editingId && !acceptToS) newErrors.acceptToS = 'Debes aceptar los Términos de Servicio'
    if (!editingId && !acceptPrivacy) newErrors.acceptPrivacy = 'Debes aceptar la Política de Privacidad'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      await withToast(
        editingId
          ? onEdit(editingId, { tipoDocumento, documento, nombre, correo, telefono })
          : onCreate({ tipoDocumento, documento, nombre, correo, telefono, estado: true, acceptToS, acceptPrivacy }),
        editingId ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente'
      )
      setIsFormOpen(false); resetForm()
    } catch { } finally { setIsSubmitting(false) }
  }

  return {
    isFormOpen, setIsFormOpen,
    editingId,
    isSubmitting,
    tipoDocumento, setTipoDocumento: (v: string) => { setTipoDocumento(v); clearError('tipoDocumento') },
    documento, setDocumento: (v: string) => { setDocumento(v); clearError('documento') },
    nombre, setNombre: (v: string) => { setNombre(v); clearError('nombre') },
    correo, setCorreo: (v: string) => { setCorreo(v); clearError('correo') },
    telefono, setTelefono: (v: string) => { setTelefono(v); clearError('telefono') },
    acceptToS, setAcceptToS,
    acceptPrivacy, setAcceptPrivacy,
    legalModal, setLegalModal,
    errors,
    documentoFormatoError, correoFormatoError, telefonoFormatoError,
    openCreate,
    openEdit,
    resetForm,
    handleSubmit,
  }
}
