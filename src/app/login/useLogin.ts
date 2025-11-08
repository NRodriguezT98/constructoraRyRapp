import { useCallback, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { showLoginSuccessToast } from '@/components/toasts/custom-toasts'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'

import { useAuth } from '../../contexts/auth-context'

import { useRateLimit } from './useRateLimit'

interface UseLoginReturn {
  email: string
  password: string
  loading: boolean
  error: string
  estaBloqueado: boolean
  minutosRestantes: number
  intentosRestantes: number
  loginExitoso: boolean
  mensajeExito: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

/**
 * Hook personalizado para manejar la lógica de autenticación
 * Separa la lógica de negocio del componente de presentación
 * NOTA: Registro público deshabilitado por seguridad
 */
export function useLogin(): UseLoginReturn {
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginExitoso, setLoginExitoso] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  // Hooks externos
  const { signIn, perfil } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener ruta de redirección (puede ser null en SSR/build)
  const redirectedFrom = searchParams?.get('redirectedFrom') || null

  // Rate limiting POR EMAIL (5 intentos por email)
  const {
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    registrarIntentoFallido,
    resetearIntentos,
    verificarBloqueo,
  } = useRateLimit(email)

  // Handler del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      console.log('📝 handleSubmit llamado')

      // Verificar si está bloqueado
      if (verificarBloqueo()) {
        setError(
          `🚨 Cuenta bloqueada por seguridad. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`
        )
        return
      }

      // Prevenir múltiples submissions
      if (loading) {
        console.warn('⚠️ Login ya en progreso, ignorando...')
        return
      }

      setLoading(true)

      try {
        console.log('🔐 Intentando login:', email)
        await signIn(email, password)

        // Login exitoso: resetear intentos fallidos
        resetearIntentos()

        // 📝 Registrar evento de auditoría
        auditLogService.logLoginExitoso(email)

        console.log('✅ Login exitoso, mostrando notificación...')

        // Determinar ruta de redirección
        const isInvalidRedirect =
          !redirectedFrom ||
          redirectedFrom === '/' ||
          redirectedFrom === '/login' ||
          redirectedFrom.startsWith('/auth/')

        const redirectTo = isInvalidRedirect ? '/' : redirectedFrom
        const destinoNombre = isInvalidRedirect ? 'Dashboard' : redirectedFrom.replace('/', '')

        // Mostrar notificación de éxito moderna
        setLoginExitoso(true)
        setMensajeExito(`¡Bienvenido! Redirigiendo a ${destinoNombre}...`)

        // Toast moderno personalizado (sin esperar perfil)
        showLoginSuccessToast()

        // Esperar 1.5 segundos antes de redirigir (tiempo para mostrar notificación)
        setTimeout(() => {
          console.log('🔀 Redirigiendo a:', redirectTo)
          // Usar window.location para redirección completa
          // Esto asegura que el middleware valide la nueva sesión
          window.location.href = redirectTo
        }, 1500)
      } catch (err: any) {
        // Calcular intentos restantes DESPUÉS de este fallo
        const nuevoIntentosFallidos = intentosRestantes - 1

        // Login fallido: registrar intento
        registrarIntentoFallido()

        // 📝 Registrar evento de auditoría
        auditLogService.logLoginFallido(email, nuevoIntentosFallidos)

        // Traducir mensaje de error al español
        const mensajeError = traducirErrorSupabase(err.message || 'Error de autenticación')

        // Si se bloqueó la cuenta, registrar también
        if (nuevoIntentosFallidos === 0) {
          auditLogService.logCuentaBloqueada(email, 15)
          setError(
            '🚨 Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos por seguridad.'
          )
        } else if (nuevoIntentosFallidos <= 2) {
          // Advertencia cuando quedan 2 o menos intentos
          setError(
            `${mensajeError}. ⚠️ Te quedan ${nuevoIntentosFallidos} intento${nuevoIntentosFallidos !== 1 ? 's' : ''}.`
          )
        } else {
          setError(mensajeError)
        }
      } finally {
        setLoading(false)
      }
    },
    [email, password, signIn, router, redirectedFrom, verificarBloqueo, minutosRestantes, registrarIntentoFallido, resetearIntentos, intentosRestantes]
  )

  return {
    email,
    password,
    loading,
    error,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    loginExitoso,
    mensajeExito,
    setEmail,
    setPassword,
    handleSubmit,
  }
}
