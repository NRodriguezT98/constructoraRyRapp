'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Home,
  Loader2,
  Shield,
  Users,
} from 'lucide-react'

import { useCategoriasSistema, type Modulo } from '../hooks'

const MODULOS_CONFIG = {
  clientes: {
    nombre: 'Clientes',
    icono: Users,
    expectedCount: 6,
  },
  proyectos: {
    nombre: 'Proyectos',
    icono: Building2,
    expectedCount: 5,
  },
  viviendas: {
    nombre: 'Viviendas',
    icono: Home,
    expectedCount: 8,
  },
}

export function CategoriasSistemaCard() {
  const { verificandoModulo, resultados, verificarModulo } =
    useCategoriasSistema()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 shadow-2xl shadow-purple-500/20 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-800'
    >
      {/* Pattern overlay */}
      <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

      <div className='relative z-10 space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <div className='mb-3 inline-flex rounded-xl bg-white/20 p-2 backdrop-blur-sm'>
            <Shield className='h-6 w-6 text-white' />
          </div>
          <h3 className='mb-2 text-xl font-bold text-white'>
            Categorías de Documentos
          </h3>
          <p className='text-sm text-purple-100 dark:text-purple-200'>
            Verifica y crea las categorías necesarias para cada módulo
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {(
            Object.entries(MODULOS_CONFIG) as [
              Modulo,
              (typeof MODULOS_CONFIG)[Modulo],
            ][]
          ).map(([modulo, config]) => {
            const Icon = config.icono
            const resultado = resultados[modulo]
            const verificando = verificandoModulo === modulo

            return (
              <motion.div
                key={modulo}
                whileHover={{ scale: 1.02 }}
                className='space-y-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl'
              >
                {/* Header del módulo */}
                <div className='flex items-center gap-2 border-b border-white/10 pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20'>
                    <Icon className='h-5 w-5 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-bold text-white'>
                      {config.nombre}
                    </h4>
                    <p className='text-xs text-purple-200'>
                      {config.expectedCount} categorías
                    </p>
                  </div>
                </div>

                {/* Resultado */}
                {resultado.tipo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-lg p-2 text-xs ${
                      resultado.tipo === 'success'
                        ? 'border border-green-400/50 bg-green-500/20'
                        : resultado.tipo === 'error'
                          ? 'border border-red-400/50 bg-red-500/20'
                          : 'border border-blue-400/50 bg-blue-500/20'
                    }`}
                  >
                    <div className='flex items-start gap-2'>
                      {resultado.tipo === 'success' && (
                        <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-200' />
                      )}
                      {resultado.tipo === 'error' && (
                        <AlertCircle className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-200' />
                      )}
                      {resultado.tipo === 'info' && (
                        <Loader2 className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 animate-spin text-blue-200' />
                      )}
                      <p className='flex-1 text-white'>{resultado.mensaje}</p>
                    </div>
                  </motion.div>
                )}

                {/* Botón */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => verificarModulo(modulo)}
                  disabled={verificando}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {verificando ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4' />
                      Verificar
                    </>
                  )}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Info */}
        <div className='flex items-start gap-2 rounded-lg bg-white/10 p-3 backdrop-blur-sm'>
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-200' />
          <p className='text-xs text-purple-100 dark:text-purple-200'>
            <strong>Seguro:</strong> Esta operación solo crea o actualiza
            categorías. No elimina datos existentes ni afecta documentos ya
            subidos.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
