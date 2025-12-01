'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, DollarSign, FileCheck, Home } from 'lucide-react'

interface StepperAsignarViviendaProps {
  currentStep: 1 | 2 | 3
  completedSteps: number[]
}

const STEPS = [
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
] as const

export function StepperAsignarVivienda({ currentStep, completedSteps }: StepperAsignarViviendaProps) {
  return (
    <div className="w-full py-3">
      {/* Desktop - Horizontal Centrado */}
      <div className="hidden md:flex justify-center items-center w-full">
        <div className="flex items-center justify-center gap-3 max-w-3xl w-full px-6">
          {STEPS.map((step, index) => {
            const isActive = step.number === currentStep
            const isCompleted = completedSteps.includes(step.number)
            const Icon = step.icon

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Card */}
                <div className="flex flex-col items-center w-full">
                  {/* Icon Circle */}
                  <motion.div
                    initial={false}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-3 transition-all duration-300
                        ${
                          isCompleted
                            ? 'bg-green-500 border-green-500'
                            : isActive
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      )}
                    </div>

                    {/* Pulse Animation */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-500"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Step Info */}
                  <div className="mt-1.5 text-center">
                    <p
                      className={`text-xs font-semibold transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div className="flex items-center justify-center w-16 -mt-10">
                    <div className="relative w-full h-1">
                      {/* Background Line */}
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

                      {/* Progress Line */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{
                          scaleX:
                            step.number < currentStep || isCompleted ? 1 : 0,
                        }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile - Vertical Stack */}
      <div className="md:hidden space-y-3 px-4">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep
          const isCompleted = completedSteps.includes(step.number)
          const Icon = step.icon

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.number * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500'
                    : isCompleted
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors
                  ${
                    isCompleted
                      ? 'bg-green-500'
                      : isActive
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-700'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-300'
                      : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Paso {step.number}: {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>

              {/* Active Badge */}
              {isActive && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Actual
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
