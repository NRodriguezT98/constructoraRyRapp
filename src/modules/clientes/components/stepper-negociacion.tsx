'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, DollarSign, FileCheck, Home } from 'lucide-react'

interface StepperNegociacionProps {
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

export function StepperNegociacion({
  currentStep,
  completedSteps,
}: StepperNegociacionProps) {
  return (
    <div className='w-full py-4'>
      {/* Desktop - Horizontal Centrado */}
      <div className='hidden w-full items-center justify-center md:flex'>
        <div className='flex w-full max-w-3xl items-center justify-center gap-3 px-6'>
          {STEPS.map((step, index) => {
            const isActive = step.number === currentStep
            const isCompleted = completedSteps.includes(step.number)
            const Icon = step.icon

            return (
              <div key={step.number} className='flex flex-1 items-center'>
                {/* Step Card */}
                <div className='flex w-full flex-col items-center'>
                  {/* Icon Circle */}
                  <motion.div
                    initial={false}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                    className='relative'
                  >
                    <div
                      className={`border-3 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500'
                          : isActive
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
                      } `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className='h-6 w-6 text-white' />
                      ) : (
                        <Icon
                          className={`h-6 w-6 ${
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
                        className='absolute inset-0 rounded-full bg-blue-500'
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
                  <div className='mt-2 text-center'>
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
                    <p className='mt-0.5 text-[10px] text-gray-500 dark:text-gray-400'>
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div className='-mt-12 flex w-16 items-center justify-center'>
                    <div className='relative h-1 w-full'>
                      {/* Background Line */}
                      <div className='absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700' />

                      {/* Progress Line */}
                      <motion.div
                        className='absolute inset-0 origin-left rounded-full bg-gradient-to-r from-blue-500 to-green-500'
                        initial={{ scaleX: 0 }}
                        animate={{
                          scaleX:
                            step.number < currentStep || isCompleted ? 1 : 0,
                        }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
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
      <div className='space-y-4 px-4 md:hidden'>
        {STEPS.map(step => {
          const isActive = step.number === currentStep
          const isCompleted = completedSteps.includes(step.number)
          const Icon = step.icon

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.number * 0.1 }}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
              } `}
            >
              {/* Icon */}
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                  isCompleted
                    ? 'bg-green-500'
                    : isActive
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                } `}
              >
                {isCompleted ? (
                  <CheckCircle2 className='h-6 w-6 text-white' />
                ) : (
                  <Icon className='h-6 w-6 text-white' />
                )}
              </div>

              {/* Content */}
              <div className='flex-1'>
                <p
                  className={`text-sm font-semibold ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-300'
                      : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Paso {step.number}: {step.title}
                </p>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  {step.description}
                </p>
              </div>

              {/* Active Badge */}
              {isActive && (
                <div className='flex-shrink-0'>
                  <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
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
