import { useCallback, useEffect, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'

import { showLoginSuccessToast } from '@/components/toasts/custom-toasts'
import { createClient } from '@/lib/supabase/client'
import { DebugLogger } from '@/lib/utils/debug-logger'
import { debugLog, errorLog, successLog } from '@/lib/utils/logger'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'

import { useAuth } from '../../contexts/auth-context'

import { useRateLimit } from './useRateLimit'

const REMEMBER_EMAIL_KEY = 'ryr_remember_email'

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
  recordarUsuario: boolean
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setRecordarUsuario: (recordar: boolean) => void
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
  const [recordarUsuario, setRecordarUsuario] = useState(false)
  const [navegando, setNavegando] = useState(false)

  // ✅ Ref para prevenir ejecuciones múltiples durante signIn
  const isSubmittingRef = useRef(false)

  // Hooks externos
  const { signIn, perfil } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  // Cliente de Supabase
  const supabase = createClient()

  // Obtener ruta de redirección (puede ser null en SSR/build)
  const redirectedFrom = searchParams?.get('redirectedFrom') || null

  // ✅ CRÍTICO: Detectar si venimos de logout (hay timestamp en URL)
  const logoutTimestamp = searchParams?.get('_t')

  // ✅ SOLUCIÓN DEFINITIVA: Limpiar TODO al montar si venimos de logout
  useEffect(() => {
    if (logoutTimestamp) {
      // Resetear TODOS los estados de UI (venimos de logout)
      setLoginExitoso(false)
      setMensajeExito('')
      setNavegando(false)
      setError('')
      setLoading(false)
      setPassword('') // ✅ CRÍTICO: Limpiar password

      DebugLogger.log('LOGIN', `🧹 Estados limpiados - Logout timestamp: ${logoutTimestamp}`)
      console.log(`🧹 [CLEAN] Formulario limpiado después de logout`)
    }
  }, [logoutTimestamp]) // Ejecutar cuando cambie el timestamp

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const emailGuardado = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (emailGuardado) {
      setEmail(emailGuardado)
      setRecordarUsuario(true)
    }
  }, [])

  // ✅ Listener de cambios de sesión de Supabase
  // Detecta cuando la sesión se actualiza correctamente
  useEffect(() => {
    // Si ya estamos logueados y el perfil está cargado, redirigir
    if (perfil && !loading && loginExitoso) {
      console.log('✅ Sesión establecida correctamente, perfil:', perfil.nombres)
    }
  }, [perfil, loading, loginExitoso])

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

      DebugLogger.log('LOGIN', '━━━ INICIO HANDLESUBMIT ━━━')
      DebugLogger.log('LOGIN', '📧 Email: ' + email)

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🟢 [INICIO] handleSubmit ejecutado')
      console.log('📧 Email:', email)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      debugLog('📝 Formulario de login enviado')

      // Verificar si está bloqueado
      if (verificarBloqueo()) {
        DebugLogger.warn('LOGIN', '🔴 Usuario bloqueado por rate limit')
        console.log('🔴 [BLOQUEADO] Usuario bloqueado por rate limit')
        setError(
          `🚨 Cuenta bloqueada por seguridad. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`
        )
        return
      }

      // Prevenir múltiples submissions
      if (loading || isSubmittingRef.current) {
        DebugLogger.warn('LOGIN', '⚠️ Login ya en progreso, ignorando duplicado')
        console.log('⚠️ [DUPLICADO] Login ya en progreso, ignorando')
        debugLog('⚠️ Login ya en progreso, ignorando submission duplicado')
        return
      }

      isSubmittingRef.current = true
      setLoading(true)
      DebugLogger.log('LOGIN', '⏳ Estado loading activado')
      console.log('⏳ [LOADING] Estado loading activado')

      let loginSuccess = false // ✅ Flag para controlar el finally

      try {
        // Determinar ruta de redirección ANTES del login
        const isInvalidRedirect =
          !redirectedFrom ||
          redirectedFrom === '/' ||
          redirectedFrom === '/login' ||
          redirectedFrom.startsWith('/auth/')

        const redirectTo = isInvalidRedirect ? '/' : redirectedFrom
        const destinoNombre = isInvalidRedirect ? 'Dashboard' : redirectedFrom.replace('/', '')

        DebugLogger.log('LOGIN', '🎯 Destino calculado: ' + redirectTo)
        DebugLogger.log('LOGIN', '🔐 Llamando a signIn()...')
        console.log('🔐 [SIGNIN] Llamando a signIn()')
        debugLog('🔐 Iniciando proceso de login', { email })

        // ✅ CRÍTICO: signIn PRIMERO, navegación INMEDIATA después (sin cambios de estado)
        await signIn(email, password)

        DebugLogger.log('LOGIN', '✅ signIn() completado exitosamente')
        console.log('✅ [SIGNIN] signIn() completado exitosamente')
        successLog('Login exitoso en signIn()')

        // Login exitoso: resetear intentos fallidos
        resetearIntentos()

        // Guardar email si "Recordar usuario" está marcado
        if (recordarUsuario) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email)
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }

        // 📝 Registrar evento de auditoría
        auditLogService.logLoginExitoso(email)

        DebugLogger.log('LOGIN', '✨ Mostrando toast de éxito')
        console.log('✨ [TOAST] Mostrando toast de éxito')
        // Toast moderno personalizado
        showLoginSuccessToast()

        // ❌ REMOVIDO: No cambiar estados UI (causa re-render y limpia el formulario visualmente)
        // setLoginExitoso(true)
        // setMensajeExito(...)

        // ✅ Navegar INMEDIATAMENTE sin cambiar estado
        DebugLogger.log('LOGIN', '➡️ Navegando INMEDIATAMENTE con router.push: ' + redirectTo)
        console.log('➡️ [ROUTER] Navegación INMEDIATA sin cambios de estado')
        debugLog('🚀 Navegando inmediatamente', { destino: redirectTo })

        // ✅ Navegación directa sin cambiar estado previos
        router.push(redirectTo)

        DebugLogger.log('LOGIN', '✅ Login completado - Cache listo, navegando')
        successLog('Navegación exitosa con cache pre-poblado')

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        // ✅ Marcar como exitoso para que finally NO desactive loading
        loginSuccess = true

        // ✅ NO ejecutar finally (no desactivar loading en caso exitoso)
        return

      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('❌ [ERROR] Error en handleSubmit')
        console.error(error)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        errorLog('login-submit', error, { email })

        // Calcular intentos restantes DESPUÉS de este fallo
        const nuevoIntentosFallidos = intentosRestantes - 1

        // Login fallido: registrar intento
        registrarIntentoFallido()

        // 📝 Registrar evento de auditoría
        auditLogService.logLoginFallido(email, nuevoIntentosFallidos)

        // Traducir mensaje de error al español
        const mensajeError = traducirErrorSupabase(error.message || 'Error de autenticación')

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
        // ✅ Solo desactivar loading si NO fue exitoso
        if (!loginSuccess) {
          setLoading(false)
          isSubmittingRef.current = false
        }
        // Si fue exitoso, loading se queda activo hasta que navegue
      }
    },
    [email, password, signIn, router, redirectedFrom, verificarBloqueo, minutosRestantes, registrarIntentoFallido, resetearIntentos, intentosRestantes, recordarUsuario]
  )

  // ✅ Estabilizar funciones con useCallback para evitar re-renders
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
  }, [])

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value)
  }, [])

  const handleRecordarChange = useCallback((value: boolean) => {
    setRecordarUsuario(value)
  }, [])

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
    recordarUsuario,
    navegando, // ✅ Estado para mostrar overlay
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    setRecordarUsuario: handleRecordarChange,
    handleSubmit,
  }
}
