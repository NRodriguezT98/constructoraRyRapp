'use client'

/**
 * ============================================
 * COMPONENTE: Sección Documentos Pendientes (Colapsable)
 * ============================================
 *
 * Versión mejorada del banner de documentos pendientes:
 * - Colapsable (no invasivo)
 * - Muestra TODOS los requisitos de fuentes (no solo cartas)
 * - Agrupado por fuente de pago
 * - Botones directos para subir con pre-llenado
 *
 * @version 2.0.0 - 2025-12-17
 */

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    ChevronDown,
    FileText,
    Gift,
    Home,
    Upload
} from 'lucide-react'

import { useDocumentosPendientes } from '@/modules/clientes/hooks/useDocumentosPendientes'

// ============================================
// TYPES
// ============================================

interface SeccionDocumentosPendientesProps {
  clienteId: string
  onSubirDocumento?: (pendienteId: string, tipoDocumento: string, metadata: Record<string, any>) => void
}

interface DocumentoPorFuente {
  fuenteId: string
  tipo: string
  entidad: string
  pendientes: Array<{
    id: string
    tipo_documento: string
    nivel: string
    prioridad: string
    metadata: any
  }>
  completados: number
  total: number
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el ícono apropiado según el tipo de fuente de pago
 */
const getIconoPorTipo = (tipoFuente?: string) => {
  if (!tipoFuente) return FileText

  if (tipoFuente.includes('Crédito')) return Building2
  if (tipoFuente.includes('Subsidio')) return Gift
  if (tipoFuente.includes('Mi Casa Ya')) return Home
  return FileText
}

// ============================================
// COMPONENTE
// ============================================

export function SeccionDocumentosPendientes({
  clienteId,
  onSubirDocumento,
}: SeccionDocumentosPendientesProps) {
  const [expandido, setExpandido] = useState(false) // Colapsado por defecto — se expande al hacer clic

  // Query de documentos pendientes con React Query
  const { data: documentosPendientes = [], isLoading } = useDocumentosPendientes(clienteId)

  // Agrupar pendientes por fuente
  const pendientesPorFuente = useMemo(() => {
    const agrupados: Record<string, DocumentoPorFuente> = {}

    documentosPendientes.forEach((doc) => {
      const fuenteId = doc.fuente_pago_id
      const tipoFuente = doc.metadata?.tipo_fuente || 'Sin especificar'
      // ✅ La vista genera 'entidad_fuente' (no 'entidad') en el JSON
      const entidad = (doc.metadata as any)?.entidad_fuente || ''

      if (!agrupados[fuenteId]) {
        agrupados[fuenteId] = {
          fuenteId,
          tipo: tipoFuente,
          entidad,
          pendientes: [],
          completados: 0,
          total: 0,
        }
      }

      if (doc.estado === 'Pendiente') {
        agrupados[fuenteId].pendientes.push({
          id: doc.id,
          tipo_documento: doc.tipo_documento,
          nivel: (doc.metadata as any)?.nivel_validacion || '',
          prioridad: doc.prioridad,
          metadata: doc.metadata,
        })
      } else if (doc.estado === 'Completado') {
        agrupados[fuenteId].completados++
      }

      agrupados[fuenteId].total++
    })

    return Object.values(agrupados)
      .filter((grupo) => grupo.pendientes.length > 0)
      .sort((a, b) => {
        // Documentación final (docs compartidos como Boleta de Registro) siempre van al final
        const aEsCompartida = a.tipo === 'Compartido'
        const bEsCompartida = b.tipo === 'Compartido'
        if (aEsCompartida && !bEsCompartida) return 1
        if (!aEsCompartida && bEsCompartida) return -1
        return 0
      })
  }, [documentosPendientes])

  // Contar totales
  const totalPendientes = useMemo(
    () => pendientesPorFuente.reduce((sum, grupo) => sum + grupo.pendientes.length, 0),
    [pendientesPorFuente]
  )

  const totalObligatorios = useMemo(
    () =>
      pendientesPorFuente.reduce(
        (sum, grupo) =>
          sum + grupo.pendientes.filter((p) => p.nivel === 'DOCUMENTO_OBLIGATORIO').length,
        0
      ),
    [pendientesPorFuente]
  )

  // No mostrar si no hay pendientes o está cargando
  if (isLoading || totalPendientes === 0) {
    return null
  }

  return (
    <div className="mb-4">
      {/* Header Colapsable */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between p-3 rounded-lg
                   bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50
                   dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30
                   border-2 border-amber-200 dark:border-amber-800
                   hover:border-amber-300 dark:hover:border-amber-700
                   hover:shadow-lg hover:shadow-amber-500/20
                   transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="rounded-lg p-2 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
          >
            <AlertTriangle className="h-5 w-5 text-white" />
          </motion.div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Tienes {totalPendientes} documentos pendientes de fuentes de pago
              </span>
              {totalObligatorios > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {totalObligatorios} obligatorios
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {expandido ? 'Clic para ocultar detalles' : 'Clic para ver detalles y subir documentos'}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: expandido ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </motion.div>
      </button>

      {/* Contenido Expandible */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 space-y-4">
              {/* Agrupación por fuente */}
              {pendientesPorFuente.map((grupo) => {
                const IconoFuente = getIconoPorTipo(grupo.tipo)

                return (
                  <motion.div
                    key={grupo.fuenteId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    {/* Header de fuente */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                        <IconoFuente className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {grupo.tipo === 'Compartido' ? 'Documentación final' : grupo.tipo}
                          {grupo.tipo !== 'Compartido' && grupo.entidad && <span className="text-cyan-600 dark:text-cyan-400"> • {grupo.entidad}</span>}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {grupo.pendientes.length} pendiente{grupo.pendientes.length !== 1 ? 's' : ''}
                          {grupo.completados > 0 && ` • ${grupo.completados} completado${grupo.completados !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Lista de documentos pendientes */}
                    <div className="space-y-2 pl-4">
                      {grupo.pendientes.map((doc, index) => {
                        const esObligatorio = doc.nivel === 'DOCUMENTO_OBLIGATORIO'

                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 4, scale: 1.01 }}
                            className={`group flex items-center justify-between p-2.5 rounded-lg
                                       backdrop-blur-sm transition-all duration-300
                                       ${
                                         esObligatorio
                                           ? 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500'
                                           : 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500'
                                       }
                                       hover:shadow-md`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FileText
                                className={`h-4 w-4 ${
                                  esObligatorio
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {doc.tipo_documento}
                                </p>
                                <span
                                  className={`text-xs font-medium ${
                                    esObligatorio
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`}
                                >
                                  {esObligatorio ? 'OBLIGATORIO' : 'Opcional'}
                                </span>
                                {(doc.metadata as any)?.alcance === 'COMPARTIDO_CLIENTE' && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    Documento final · Se obtiene tras escrituración
                                  </p>
                                )}
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                onSubirDocumento?.(doc.id, doc.tipo_documento, {
                                  ...doc.metadata,
                                  fuente_pago_id: grupo.fuenteId,
                                })
                              }
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5
                                         text-xs font-medium text-white transition-all duration-300
                                         ${
                                           esObligatorio
                                             ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30'
                                             : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30'
                                         }`}
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Subir
                            </motion.button>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}

              {/* Footer informativo */}
              <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Los documentos se vincularán automáticamente a la fuente al subirlos
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
