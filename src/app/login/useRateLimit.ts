import { useEffect, useState } from 'react'

/**
 * Configuración de Rate Limiting
 */
const MAX_INTENTOS = 5
const TIEMPO_BLOQUEO = 15 * 60 * 1000 // 15 minutos en milisegundos
const STORAGE_KEY_INTENTOS = 'login_intentos_por_email'
const STORAGE_KEY_BLOQUEO = 'login_bloqueo_por_email'
const TIEMPO_LIMPIEZA = 24 * 60 * 60 * 1000 // 24 horas

interface RateLimitState {
  intentosFallidos: number
  bloqueadoHasta: number | null
  estaBloqueado: boolean
  minutosRestantes: number
  intentosRestantes: number
}

interface UseRateLimitReturn extends RateLimitState {
  registrarIntentoFallido: () => void
  resetearIntentos: () => void
  verificarBloqueo: () => boolean
}

interface IntentosPorEmail {
  [email: string]: number
}

interface BloqueoPorEmail {
  [email: string]: number | null
}

/**
 * Hook para manejar rate limiting de intentos de login POR EMAIL
 * Previene ataques de fuerza bruta bloqueando cada email temporalmente
 *
 * @param email - Email del usuario intentando hacer login
 *
 * @example
 * const { estaBloqueado, minutosRestantes, registrarIntentoFallido, resetearIntentos } = useRateLimit(email)
 */
export function useRateLimit(email: string): UseRateLimitReturn {
  const [intentosFallidos, setIntentosFallidos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null)
  const [estaBloqueado, setEstaBloqueado] = useState(false)
  const [minutosRestantes, setMinutosRestantes] = useState(0)

  /**
   * Limpia emails antiguos (más de 24h sin actividad)
   */
  const limpiarEmailsAntiguos = () => {
    try {
      const intentosData = localStorage.getItem(STORAGE_KEY_INTENTOS)
      const bloqueoData = localStorage.getItem(STORAGE_KEY_BLOQUEO)

      if (bloqueoData) {
        const bloqueos: BloqueoPorEmail = JSON.parse(bloqueoData)
        const ahora = Date.now()
        const bloqueosLimpios: BloqueoPorEmail = {}

        Object.entries(bloqueos).forEach(([emailKey, timestamp]) => {
          if (timestamp && (ahora - timestamp) < TIEMPO_LIMPIEZA) {
            bloqueosLimpios[emailKey] = timestamp
          }
        })

        if (Object.keys(bloqueosLimpios).length > 0) {
          localStorage.setItem(STORAGE_KEY_BLOQUEO, JSON.stringify(bloqueosLimpios))
        } else {
          localStorage.removeItem(STORAGE_KEY_BLOQUEO)
        }
      }

      if (intentosData) {
        // Limpiar intentos de emails que ya no están bloqueados
        const intentos: IntentosPorEmail = JSON.parse(intentosData)
        const bloqueoData = localStorage.getItem(STORAGE_KEY_BLOQUEO)
        const bloqueos: BloqueoPorEmail = bloqueoData ? JSON.parse(bloqueoData) : {}

        const intentosLimpios: IntentosPorEmail = {}
        Object.entries(intentos).forEach(([emailKey, count]) => {
          if (bloqueos[emailKey]) {
            intentosLimpios[emailKey] = count
          }
        })

        if (Object.keys(intentosLimpios).length > 0) {
          localStorage.setItem(STORAGE_KEY_INTENTOS, JSON.stringify(intentosLimpios))
        } else {
          localStorage.removeItem(STORAGE_KEY_INTENTOS)
        }
      }
    } catch (error) {
      console.error('Error al limpiar emails antiguos:', error)
    }
  }

  // Cargar estado desde localStorage para este email específico
  useEffect(() => {
    if (!email) return

    // Limpiar emails antiguos al montar
    limpiarEmailsAntiguos()

    try {
      // Cargar intentos para este email
      const intentosData = localStorage.getItem(STORAGE_KEY_INTENTOS)
      if (intentosData) {
        const intentosPorEmail: IntentosPorEmail = JSON.parse(intentosData)
        const intentosEmail = intentosPorEmail[email] || 0
        setIntentosFallidos(intentosEmail)
      }

      // Cargar bloqueo para este email
      const bloqueoData = localStorage.getItem(STORAGE_KEY_BLOQUEO)
      if (bloqueoData) {
        const bloqueoPorEmail: BloqueoPorEmail = JSON.parse(bloqueoData)
        const tiempoBloqueo = bloqueoPorEmail[email]

        if (tiempoBloqueo) {
          setBloqueadoHasta(tiempoBloqueo)

          // Verificar si aún está bloqueado
          if (Date.now() < tiempoBloqueo) {
            setEstaBloqueado(true)
          } else {
            // Expiró el bloqueo, limpiar
            limpiarBloqueo()
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar rate limit:', error)
    }
  }, [email])

  // Actualizar minutos restantes cada segundo si está bloqueado
  useEffect(() => {
    if (!estaBloqueado || !bloqueadoHasta) return

    const interval = setInterval(() => {
      const ahora = Date.now()

      if (ahora >= bloqueadoHasta) {
        // Bloqueo expirado
        limpiarBloqueo()
      } else {
        // Calcular minutos restantes
        const minutosRestantesCalc = Math.ceil((bloqueadoHasta - ahora) / 60000)
        setMinutosRestantes(minutosRestantesCalc)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [estaBloqueado, bloqueadoHasta])

  /**
   * Limpia el bloqueo y resetea intentos para este email
   */
  const limpiarBloqueo = () => {
    if (!email) return

    setEstaBloqueado(false)
    setBloqueadoHasta(null)
    setIntentosFallidos(0)
    setMinutosRestantes(0)

    try {
      // Remover intentos de este email
      const intentosData = localStorage.getItem(STORAGE_KEY_INTENTOS)
      if (intentosData) {
        const intentosPorEmail: IntentosPorEmail = JSON.parse(intentosData)
        delete intentosPorEmail[email]

        if (Object.keys(intentosPorEmail).length > 0) {
          localStorage.setItem(STORAGE_KEY_INTENTOS, JSON.stringify(intentosPorEmail))
        } else {
          localStorage.removeItem(STORAGE_KEY_INTENTOS)
        }
      }

      // Remover bloqueo de este email
      const bloqueoData = localStorage.getItem(STORAGE_KEY_BLOQUEO)
      if (bloqueoData) {
        const bloqueoPorEmail: BloqueoPorEmail = JSON.parse(bloqueoData)
        delete bloqueoPorEmail[email]

        if (Object.keys(bloqueoPorEmail).length > 0) {
          localStorage.setItem(STORAGE_KEY_BLOQUEO, JSON.stringify(bloqueoPorEmail))
        } else {
          localStorage.removeItem(STORAGE_KEY_BLOQUEO)
        }
      }
    } catch (error) {
      console.error('Error al limpiar bloqueo:', error)
    }
  }

  /**
   * Verifica si la cuenta está bloqueada actualmente
   */
  const verificarBloqueo = (): boolean => {
    if (!bloqueadoHasta) return false

    if (Date.now() >= bloqueadoHasta) {
      limpiarBloqueo()
      return false
    }

    return true
  }

  /**
   * Registra un intento de login fallido para este email
   * Bloquea el email si se alcanza el máximo de intentos
   */
  const registrarIntentoFallido = () => {
    if (!email) return

    const nuevosIntentos = intentosFallidos + 1
    setIntentosFallidos(nuevosIntentos)

    try {
      // Actualizar intentos para este email
      const intentosData = localStorage.getItem(STORAGE_KEY_INTENTOS)
      const intentosPorEmail: IntentosPorEmail = intentosData ? JSON.parse(intentosData) : {}
      intentosPorEmail[email] = nuevosIntentos
      localStorage.setItem(STORAGE_KEY_INTENTOS, JSON.stringify(intentosPorEmail))

      // Si alcanzó el máximo, bloquear este email
      if (nuevosIntentos >= MAX_INTENTOS) {
        const tiempoBloqueo = Date.now() + TIEMPO_BLOQUEO
        setBloqueadoHasta(tiempoBloqueo)
        setEstaBloqueado(true)

        const bloqueoData = localStorage.getItem(STORAGE_KEY_BLOQUEO)
        const bloqueoPorEmail: BloqueoPorEmail = bloqueoData ? JSON.parse(bloqueoData) : {}
        bloqueoPorEmail[email] = tiempoBloqueo
        localStorage.setItem(STORAGE_KEY_BLOQUEO, JSON.stringify(bloqueoPorEmail))

        console.warn(`🚨 Email ${email} bloqueado por ${TIEMPO_BLOQUEO / 60000} minutos`)
      }
    } catch (error) {
      console.error('Error al registrar intento fallido:', error)
    }
  }

  /**
   * Resetea los intentos fallidos para este email (llamar después de login exitoso)
   */
  const resetearIntentos = () => {
    if (!email) return

    setIntentosFallidos(0)

    try {
      const intentosData = localStorage.getItem(STORAGE_KEY_INTENTOS)
      if (intentosData) {
        const intentosPorEmail: IntentosPorEmail = JSON.parse(intentosData)
        delete intentosPorEmail[email]

        if (Object.keys(intentosPorEmail).length > 0) {
          localStorage.setItem(STORAGE_KEY_INTENTOS, JSON.stringify(intentosPorEmail))
        } else {
          localStorage.removeItem(STORAGE_KEY_INTENTOS)
        }
      }
    } catch (error) {
      console.error('Error al resetear intentos:', error)
    }

    // Si estaba bloqueado, limpiar también el bloqueo
    if (estaBloqueado) {
      limpiarBloqueo()
    }
  }

  const intentosRestantes = Math.max(0, MAX_INTENTOS - intentosFallidos)

  return {
    intentosFallidos,
    bloqueadoHasta,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    registrarIntentoFallido,
    resetearIntentos,
    verificarBloqueo,
  }
}
