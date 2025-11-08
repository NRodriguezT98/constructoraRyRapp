import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import {
    getStrengthColor,
    getStrengthLabel,
    validatePasswordStrength,
    type PasswordValidationResult,
} from '@/lib/validations/password'

interface PasswordStrengthIndicatorProps {
  password: string
  showDetails?: boolean
}

/**
 * Componente que muestra visualmente la fortaleza de una contraseña
 * Incluye barra de progreso, etiqueta de fortaleza y lista de requisitos
 */
export function PasswordStrengthIndicator({
  password,
  showDetails = true,
}: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null)

  useEffect(() => {
    if (password.length > 0) {
      const result = validatePasswordStrength(password)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }, [password])

  if (!validation || password.length === 0) {
    return null
  }

  const colors = getStrengthColor(validation.strength)
  const label = getStrengthLabel(validation.strength)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-2'
    >
      {/* Barra de progreso */}
      <div className='flex items-center gap-3'>
        <div className='flex-1'>
          <div className='h-2 overflow-hidden rounded-full bg-white/10'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${validation.score}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full ${
                validation.strength === 'very-strong'
                  ? 'bg-green-500'
                  : validation.strength === 'strong'
                    ? 'bg-blue-500'
                    : validation.strength === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
              }`}
            />
          </div>
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>
          {label}
        </span>
      </div>

      {/* Detalles de requisitos */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='space-y-1'
        >
          {/* Requisitos cumplidos */}
          <div className='space-y-1'>
            {password.length >= 8 && (
              <div className='flex items-center gap-2 text-xs text-green-300'>
                <span>✓</span>
                <span>Mínimo 8 caracteres</span>
              </div>
            )}
            {/[A-Z]/.test(password) && (
              <div className='flex items-center gap-2 text-xs text-green-300'>
                <span>✓</span>
                <span>Contiene mayúsculas</span>
              </div>
            )}
            {/[a-z]/.test(password) && (
              <div className='flex items-center gap-2 text-xs text-green-300'>
                <span>✓</span>
                <span>Contiene minúsculas</span>
              </div>
            )}
            {/\d/.test(password) && (
              <div className='flex items-center gap-2 text-xs text-green-300'>
                <span>✓</span>
                <span>Contiene números</span>
              </div>
            )}
            {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) && (
              <div className='flex items-center gap-2 text-xs text-green-300'>
                <span>✓</span>
                <span>Contiene caracteres especiales (bonus)</span>
              </div>
            )}
          </div>

          {/* Errores/Requisitos faltantes */}
          {validation.errors.length > 0 && (
            <div className='space-y-1'>
              {validation.errors.map((error, index) => (
                <div key={index} className='flex items-center gap-2 text-xs text-red-300'>
                  <span>✗</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recomendaciones */}
          {validation.strength === 'weak' && (
            <div className='mt-2 rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-2 text-xs text-yellow-200'>
              💡 <strong>Tip:</strong> Usa una combinación de letras mayúsculas, minúsculas y números.
              Considera agregar símbolos especiales.
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
