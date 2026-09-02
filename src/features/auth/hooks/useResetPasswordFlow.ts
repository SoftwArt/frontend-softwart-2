// src/features/auth/hooks/useResetPasswordFlow.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { useResetPassword } from './useResetPassword'
import { apiRequest } from '@/src/shared/lib/apiClient'
import { validatePassword } from '@/src/shared/lib/passwordValidation'

export function useResetPasswordFlow() {
  const { onSubmit, isLoading, error } = useResetPassword()

  // El token de recuperación viaja en el link del email: /reset?token=...
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [nuevaClave,     setNuevaClave]     = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [showNueva,      setShowNueva]      = useState(false)
  const [showConfirmar,  setShowConfirmar]  = useState(false)
  const [errorNueva,     setErrorNueva]     = useState('')
  const [errorConfirmar, setErrorConfirmar] = useState('')
  const [success,        setSuccess]        = useState(false)
  // Cubre tanto "expiró" como "nunca existió" (token bien formado pero
  // inexistente) — antes solo se reaccionaba a `expired`, así que un token
  // inexistente pasaba este chequeo proactivo sin avisar y el usuario recién
  // se enteraba al hacer submit real.
  const [tokenInvalido,  setTokenInvalido]  = useState(false)
  const [checkingToken,  setCheckingToken]  = useState(!!token)

  // Reenviar enlace
  const [correoReenvio, setCorreoReenvio] = useState('')
  const [isResending,   setIsResending]   = useState(false)
  const [resendError,   setResendError]   = useState('')

  // Uno u otro, nunca ambos: con token válido solo tiene sentido pedir la
  // nueva contraseña; sin token (o vencido) solo tiene sentido reenviar.
  const showFields = !!token && !checkingToken && !tokenInvalido
  const showResend = !token || (!checkingToken && tokenInvalido)

  const passwordsMatch = nuevaClave === confirmarClave
  const passwordValid  = validatePassword(nuevaClave).valid
  const canSubmit =
    token.trim() !== '' &&
    !tokenInvalido &&
    nuevaClave.trim() !== '' &&
    confirmarClave.trim() !== '' &&
    passwordsMatch &&
    passwordValid &&
    !isLoading

  useEffect(() => {
    if (confirmarClave && !passwordsMatch) setErrorConfirmar('Las contraseñas no coinciden')
    else setErrorConfirmar('')
  }, [nuevaClave, confirmarClave, passwordsMatch])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => { window.location.href = '/login' }, 2000)
    return () => clearTimeout(t)
  }, [success])

  // Chequeo proactivo: si el link ya expiró, avisar de inmediato en vez de que
  // el usuario lo descubra recién al llenar el formulario y darle submit.
  useEffect(() => {
    if (!token) { setCheckingToken(false); return }
    let cancelled = false
    apiRequest<{ success: boolean; data: { valid: boolean; expired: boolean } }>(
      `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`
    )
      .then(res => { if (!cancelled) setTokenInvalido(!res.data.valid) })
      .catch(() => { /* si falla el chequeo, se deja que el submit lo valide igual */ })
      .finally(() => { if (!cancelled) setCheckingToken(false) })
    return () => { cancelled = true }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorNueva(''); setErrorConfirmar('')
    if (!nuevaClave.trim())     { setErrorNueva('Campo requerido'); return }
    const pwCheck = validatePassword(nuevaClave)
    if (!pwCheck.valid)         { setErrorNueva(pwCheck.firstError!); return }
    if (!confirmarClave.trim()) { setErrorConfirmar('Campo requerido'); return }
    if (!passwordsMatch)        { setErrorConfirmar('Las contraseñas no coinciden'); return }
    try {
      await onSubmit(token, nuevaClave)
      setSuccess(true)
    } catch { /* error lo muestra el hook */ }
  }

  const handleReenviar = async () => {
    if (!correoReenvio.trim()) return
    setIsResending(true)
    setResendError('')
    try {
      await apiRequest('/api/auth/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ correo: correoReenvio }),
      })
      toast.success('Enlace reenviado correctamente')
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Error al reenviar el enlace')
    } finally {
      setIsResending(false)
    }
  }

  return {
    token, isLoading, error, success,
    nuevaClave, setNuevaClave: (v: string) => { setNuevaClave(v); if (errorNueva) setErrorNueva('') },
    confirmarClave, setConfirmarClave,
    showNueva, setShowNueva,
    showConfirmar, setShowConfirmar,
    errorNueva, errorConfirmar,
    tokenInvalido, checkingToken,
    correoReenvio, setCorreoReenvio: (v: string) => { setCorreoReenvio(v); if (resendError) setResendError('') },
    isResending, resendError,
    showFields, showResend,
    canSubmit,
    handleSubmit, handleReenviar,
  }
}
