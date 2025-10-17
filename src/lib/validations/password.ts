/**
 * Configuración de requisitos de contraseña
 * Basado en NIST SP 800-63B
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Opcional por ahora
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
}

/**
 * Valida la fortaleza de una contraseña según múltiples criterios
 *
 * @param password - Contraseña a validar
 * @returns Resultado de validación con errores y fortaleza
 *
 * @example
 * const result = validatePasswordStrength('MyP@ssw0rd123')
 * if (!result.isValid) {
 *   console.log('Errores:', result.errors)
 * }
 * console.log('Fortaleza:', result.strength)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Validación de longitud
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`)
  } else {
    score += 20
    // Bonus por longitud adicional
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10
  }

  // Validación de mayúsculas
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Al menos una letra mayúscula (A-Z)')
  } else if (/[A-Z]/.test(password)) {
    score += 20
  }

  // Validación de minúsculas
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Al menos una letra minúscula (a-z)')
  } else if (/[a-z]/.test(password)) {
    score += 20
  }

  // Validación de números
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Al menos un número (0-9)')
  } else if (/\d/.test(password)) {
    score += 20
  }

  // Validación de caracteres especiales (opcional pero suma puntos)
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Al menos un carácter especial (!@#$%^&*...)')
  } else if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 10
  }

  // Penalización por patrones comunes
  const commonPatterns = [
    '123456', 'password', 'qwerty', 'abc123', '111111',
    '123123', 'admin', 'letmein', 'welcome', '123321',
  ]

  const lowerPassword = password.toLowerCase()
  if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
    score -= 30
    errors.push('Evita patrones comunes como "123456" o "password"')
  }

  // Penalización por caracteres repetidos
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
  }

  // Bonus por variedad de caracteres
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) {
    score += 10
  }

  // Normalizar score entre 0-100
  score = Math.max(0, Math.min(100, score))

  // Determinar fortaleza basada en score
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score >= 80) {
    strength = 'very-strong'
  } else if (score >= 60) {
    strength = 'strong'
  } else if (score >= 40) {
    strength = 'medium'
  } else {
    strength = 'weak'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  }
}

/**
 * Obtiene el color asociado a la fortaleza de la contraseña
 */
export function getStrengthColor(strength: PasswordValidationResult['strength']): {
  bg: string
  text: string
  border: string
} {
  switch (strength) {
    case 'very-strong':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-400/30',
      }
    case 'strong':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        border: 'border-blue-400/30',
      }
    case 'medium':
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        border: 'border-yellow-400/30',
      }
    case 'weak':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        border: 'border-red-400/30',
      }
  }
}

/**
 * Obtiene el texto legible de la fortaleza
 */
export function getStrengthLabel(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return 'Muy Fuerte'
    case 'strong':
      return 'Fuerte'
    case 'medium':
      return 'Media'
    case 'weak':
      return 'Débil'
  }
}
