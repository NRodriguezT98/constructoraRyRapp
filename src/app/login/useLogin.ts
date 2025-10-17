import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
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

  // Hooks externos
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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

      // Verificar si está bloqueado
      if (verificarBloqueo()) {
        setError(
          `🚨 Cuenta bloqueada por seguridad. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`
        )
        return
      }

      setLoading(true)

      try {
        await signIn(email, password)

        // Login exitoso: resetear intentos fallidos
        resetearIntentos()

        // 📝 Registrar evento de auditoría
        auditLogService.logLoginExitoso(email)

        // Obtener ruta de redirección si existe
        const redirectedFrom = searchParams.get('redirectedFrom')
        // Si redirectedFrom es '/' (raíz) o no existe, redirigir al dashboard
        const redirectTo = redirectedFrom && redirectedFrom !== '/' ? redirectedFrom : '/'

        // Redirección con recarga completa para que middleware detecte la sesión
        window.location.href = redirectTo
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
    [email, password, signIn, router, searchParams, verificarBloqueo, minutosRestantes, registrarIntentoFallido, resetearIntentos, intentosRestantes]
  )

  return {
    email,
    password,
    loading,
    error,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    setEmail,
    setPassword,
    handleSubmit,
  }
}
