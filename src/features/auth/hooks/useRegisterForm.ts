// src/features/auth/hooks/useRegisterForm.ts
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRegister } from './useRegister'
import { validatePassword } from '@/src/shared/lib/passwordValidation'
import { isTelefonoValid } from '@/src/shared/lib/validateTelefono'
import { isEmailValid } from '@/src/shared/lib/validateEmail'
import { isNombreLongitudValida, NOMBRE_MAX_LENGTH } from '@/src/shared/lib/validateNombre'
import { validarDocumentoPorTipo } from '@/src/shared/lib/validateDocumento'
import type { LegalDocTipo } from '@/src/shared/types/legal'

export function useRegisterForm() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? undefined
  const { onSubmit, isLoading, error, clearError } = useRegister(redirect)

  const [tipoDocumento,  setTipoDocumento]  = useState('')
  const [documento,      setDocumento]      = useState('')
  const [nombre,         setNombre]         = useState('')
  const [correo,         setCorreo]         = useState('')
  const [telefono,       setTelefono]       = useState('')
  const [clave,          setClave]          = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [showClave,      setShowClave]      = useState(false)
  const [showConfirmar,  setShowConfirmar]  = useState(false)
  // Dos casillas separadas porque en BD son dos constancias independientes
  // (una fila en aceptacion_legal por documento — ADR-007) — el titular debe
  // aceptar cada una explícitamente, no un "acepto todo" genérico.
  const [acceptToS,      setAcceptToS]      = useState(false)
  const [acceptPrivacy,  setAcceptPrivacy]  = useState(false)
  const [legalModal,     setLegalModal]     = useState<LegalDocTipo | null>(null)
  const acceptTerms = acceptToS && acceptPrivacy

  const passwordsMatch    = clave === confirmarClave
  const showMismatchError = confirmarClave.length > 0 && !passwordsMatch
  const passwordValid     = validatePassword(clave).valid
  const telefonoValido    = telefono.length > 0 && isTelefonoValid(telefono)
  const showTelefonoError = telefono.length > 0 && !telefonoValido
  const nombreValido      = isNombreLongitudValida(nombre)
  const showNombreError   = nombre.length > 0 && !nombreValido
  // maxLength ya impide teclear/pegar más de esto — el tooltip es solo el
  // aviso de que se llegó al tope, no una validación adicional de submit.
  const showNombreMaxAviso = nombre.length >= NOMBRE_MAX_LENGTH
  const correoValido      = correo.length > 0 && isEmailValid(correo)
  const showCorreoError   = correo.length > 0 && !correoValido
  const documentoError    = validarDocumentoPorTipo(tipoDocumento, documento)
  const isFormValid =
    tipoDocumento && documento && !documentoError && nombreValido && correoValido &&
    telefonoValido && clave && confirmarClave && passwordsMatch && passwordValid && acceptTerms

  // El botón queda siempre habilitado (mismo criterio de accesibilidad que
  // LoginPage: un botón disabled no explica por qué al foco/lector de
  // pantalla) — "submitted" solo dispara los avisos tras un intento de
  // envío, y se recalculan en cada render contra los valores actuales.
  const [submitted, setSubmitted] = useState(false)
  const showAcceptTosError     = submitted && !acceptToS
  const showAcceptPrivacyError = submitted && !acceptPrivacy

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!isFormValid) return
    await onSubmit({ tipoDocumento, documento, nombre, correo, telefono, clave, acceptTerms })
  }

  return {
    redirect, isLoading, error, clearError,
    tipoDocumento, setTipoDocumento,
    documento, setDocumento: (v: string) => { setDocumento(v); clearError() },
    nombre, setNombre,
    correo, setCorreo: (v: string) => { setCorreo(v); clearError() },
    telefono, setTelefono,
    clave, setClave,
    confirmarClave, setConfirmarClave,
    showClave, setShowClave,
    showConfirmar, setShowConfirmar,
    acceptToS, setAcceptToS,
    acceptPrivacy, setAcceptPrivacy,
    legalModal, setLegalModal,
    submitted,
    documentoError,
    showNombreError, showNombreMaxAviso,
    showCorreoError, showTelefonoError,
    showMismatchError, passwordValid,
    showAcceptTosError, showAcceptPrivacyError,
    handleSubmit,
  }
}
