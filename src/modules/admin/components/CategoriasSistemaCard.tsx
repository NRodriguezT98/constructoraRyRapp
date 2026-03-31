'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Building2, CheckCircle2, Home, Loader2, Shield, Users } from 'lucide-react'

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
  const { verificandoModulo, resultados, verificarModulo } = useCategoriasSistema()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-800 p-6 shadow-2xl shadow-purple-500/20"
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-3 inline-flex rounded-xl bg-white/20 backdrop-blur-sm p-2">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Categorías de Documentos</h3>
          <p className="text-purple-100 dark:text-purple-200 text-sm">
            Verifica y crea las categorías necesarias para cada módulo
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(MODULOS_CONFIG) as [Modulo, typeof MODULOS_CONFIG[Modulo]][]).map(
            ([modulo, config]) => {
              const Icon = config.icono
              const resultado = resultados[modulo]
              const verificando = verificandoModulo === modulo

              return (
                <motion.div
                  key={modulo}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 space-y-3"
                >
                  {/* Header del módulo */}
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{config.nombre}</h4>
                      <p className="text-xs text-purple-200">{config.expectedCount} categorías</p>
                    </div>
                  </div>

                  {/* Resultado */}
                  {resultado.tipo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-2 rounded-lg text-xs ${
                        resultado.tipo === 'success'
                          ? 'bg-green-500/20 border border-green-400/50'
                          : resultado.tipo === 'error'
                          ? 'bg-red-500/20 border border-red-400/50'
                          : 'bg-blue-500/20 border border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {resultado.tipo === 'success' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-200 flex-shrink-0 mt-0.5" />
                        )}
                        {resultado.tipo === 'error' && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-200 flex-shrink-0 mt-0.5" />
                        )}
                        {resultado.tipo === 'info' && (
                          <Loader2 className="w-3.5 h-3.5 text-blue-200 flex-shrink-0 mt-0.5 animate-spin" />
                        )}
                        <p className="text-white flex-1">{resultado.mensaje}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Botón */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => verificarModulo(modulo)}
                    disabled={verificando}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {verificando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verificar
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )
            }
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-purple-200 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-100 dark:text-purple-200">
            <strong>Seguro:</strong> Esta operación solo crea o actualiza categorías.
            No elimina datos existentes ni afecta documentos ya subidos.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
