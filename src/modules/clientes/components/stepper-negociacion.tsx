/**
 * Componente: Stepper de Navegación para Crear Negociación
 *
 * Muestra visualmente los 3 pasos del proceso de creación:
 * 1. Información Básica
 * 2. Fuentes de Pago
 * 3. Revisión y Confirmación
 */

'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, DollarSign, FileCheck, Home } from 'lucide-react'

export interface Step {
  number: 1 | 2 | 3
  title: string
  description: string
  icon: LucideIcon
}

interface StepperNegociacionProps {
  currentStep: 1 | 2 | 3
  completedSteps: number[]
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Información Básica',
    description: 'Cliente, vivienda y valores',
    icon: Home,
  },
  {
    number: 2,
    title: 'Fuentes de Pago',
    description: 'Configurar financiamiento',
    icon: DollarSign,
  },
  {
    number: 3,
    title: 'Revisión',
    description: 'Confirmar información',
    icon: FileCheck,
  },
]

export function StepperNegociacion({ currentStep, completedSteps }: StepperNegociacionProps) {
  return (
    <div className="w-full">
      {/* Stepper horizontal - Desktop */}
      <div className="hidden md:block max-w-5xl mx-auto">
        <div className="relative flex items-center justify-between py-6">
        {STEPS.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = completedSteps.includes(step.number)
          const isPast = step.number < currentStep
          const Icon = step.icon

          return (
            <div key={step.number} className="relative flex flex-1 items-center">
              {/* Step circle */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Circle container */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  className="relative"
                >
                  {/* Background circle */}
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all ${
                      isCompleted || isPast
                        ? 'border-green-500 bg-green-500'
                        : isActive
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                    }`}
                  >
                    {isCompleted || isPast ? (
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    ) : isActive ? (
                      <Icon className="h-8 w-8 text-white" />
                    ) : (
                      <Icon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Pulse animation for active step */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-purple-400"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                </motion.div>

                {/* Step info */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isActive
                        ? 'text-purple-600 dark:text-purple-400'
                        : isCompleted || isPast
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div className="relative -mt-12 flex-1 px-4">
                  {/* Background line */}
                  <div className="h-1 w-full rounded-full bg-gray-300 dark:bg-gray-600" />

                  {/* Progress line */}
                  <motion.div
                    className="absolute left-4 top-0 h-1 rounded-full bg-gradient-to-r from-purple-500 to-green-500"
                    initial={{ width: '0%' }}
                    animate={{
                      width:
                        step.number < currentStep || isCompleted
                          ? '100%'
                          : step.number === currentStep
                            ? '50%'
                            : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* Mobile version (vertical) */}
      <div className="block md:hidden py-6">
        <div className="space-y-4">
          {STEPS.map((step) => {
            const isActive = step.number === currentStep
            const isCompleted = completedSteps.includes(step.number)
            const isPast = step.number < currentStep
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className={`flex items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? 'border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
                    : isCompleted || isPast
                      ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                    isCompleted || isPast
                      ? 'bg-green-500'
                      : isActive
                        ? 'bg-purple-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {isCompleted || isPast ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <Icon className="h-6 w-6 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isActive
                        ? 'text-purple-700 dark:text-purple-300'
                        : isCompleted || isPast
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Paso {step.number}: {step.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>

                {isActive && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      Actual
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
