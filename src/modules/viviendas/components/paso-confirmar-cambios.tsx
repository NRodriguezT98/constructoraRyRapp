/**
 * PasoConfirmarCambios - Paso 5: Confirmar cambios detectados
 * ✅ Componente presentacional puro
 * ✅ Muestra SOLO campos modificados en formato diff
 * ✅ Paleta naranja/ámbar (viviendas)
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Compass,
    DollarSign,
    FileText
} from 'lucide-react'

interface CambioDetectado {
  campo: string
  label: string
  valorAnterior: string | number
  valorNuevo: string | number
  icono: any
  categoria: 'linderos' | 'legal' | 'financiero'
}

interface PasoConfirmarCambiosProps {
  cambiosDetectados: CambioDetectado[]
  viviendaActual: any
}

const categoriasConfig = {
  linderos: {
    titulo: 'Linderos',
    icono: Compass,
    color: 'purple',
  },
  legal: {
    titulo: 'Información Legal',
    icono: FileText,
    color: 'green',
  },
  financiero: {
    titulo: 'Información Financiera',
    icono: DollarSign,
    color: 'orange',
  },
}

export function PasoConfirmarCambios({ cambiosDetectados, viviendaActual }: PasoConfirmarCambiosProps) {
  // Agrupar cambios por categoría
  const cambiosPorCategoria = cambiosDetectados.reduce((acc, cambio) => {
    if (!acc[cambio.categoria]) {
      acc[cambio.categoria] = []
    }
    acc[cambio.categoria].push(cambio)
    return acc
  }, {} as Record<string, CambioDetectado[]>)

  const totalCambios = cambiosDetectados.length

  if (totalCambios === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 px-6"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No se detectaron cambios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          No has modificado ningún campo. Puedes cerrar este modal o volver atrás para realizar cambios.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Título */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Confirmar Cambios
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa los cambios detectados antes de guardar
        </p>
      </div>

      {/* Resumen de cambios */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800">
        <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <p className="text-sm text-orange-900 dark:text-orange-100">
          Se detectaron{' '}
          <strong className="font-bold text-orange-600 dark:text-orange-400">
            {totalCambios}
          </strong>{' '}
          cambio(s) en la vivienda
        </p>
      </div>

      {/* Cambios por categoría */}
      <div className="space-y-4">
        {Object.entries(cambiosPorCategoria).map(([categoria, cambios]) => {
          const config = categoriasConfig[categoria as keyof typeof categoriasConfig]
          const IconoCategoria = config.icono

          return (
            <motion.div
              key={categoria}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header de categoría */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 flex items-center justify-center shadow-lg`}>
                    <IconoCategoria className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {config.titulo} ({cambios.length})
                  </h3>
                </div>
              </div>

              {/* Lista de cambios */}
              <div className="p-4 space-y-3">
                {cambios.map((cambio, index) => {
                  const Icono = cambio.icono

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Label del campo */}
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Icono className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {cambio.label}
                          </span>
                        </div>
                      </div>

                      {/* Diff: Anterior → Nuevo */}
                      <div className="p-3 space-y-2">
                        {/* Valor anterior (rojo) */}
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                          <div className="flex-shrink-0 w-16 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700">
                            <span className="text-xs font-bold text-red-700 dark:text-red-300">
                              Anterior
                            </span>
                          </div>
                          <p className="flex-1 text-sm text-red-900 dark:text-red-100 line-through">
                            {cambio.valorAnterior}
                          </p>
                        </div>

                        {/* Flecha */}
                        <div className="flex justify-center">
                          <ArrowRight className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                        </div>

                        {/* Valor nuevo (verde) */}
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div className="flex-shrink-0 w-16 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700">
                            <span className="text-xs font-bold text-green-700 dark:text-green-300">
                              Nuevo
                            </span>
                          </div>
                          <p className="flex-1 text-sm font-semibold text-green-900 dark:text-green-100">
                            {cambio.valorNuevo}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Advertencia final */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
            ⚠️ Cambios permanentes
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Estos cambios se guardarán permanentemente en el sistema. Asegúrate de revisar que toda la información sea correcta.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
