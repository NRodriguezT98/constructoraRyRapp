'use client'

/**
 * ============================================
 * COMPONENTE: Validador de Documentos Obligatorios
 * ============================================
 *
 * Verifica que todos los documentos obligatorios de las fuentes
 * de pago de la negociaci�n est�n subidos antes de permitir el desembolso.
 *
 * L�GICA:
 * - Consulta vista_documentos_pendientes_fuentes
 * - Filtra por fuentes de la negociaci�n
 * - Muestra solo obligatorios faltantes
 * - Bloquea desembolso si hay pendientes
 */

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, FileText, Upload } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

interface ValidadorDocumentosProps {
  negociacionId: string
  clienteId: string
  fuentesPagoIds: string[] // IDs de tipos_fuentes_pago en la negociaci�n
  onValidacionCompleta: (completa: boolean) => void
}

interface DocumentoPendiente {
  requisito_id: string
  requisito_nombre: string
  tipo_fuente_nombre: string
  alcance: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE'
  es_obligatorio: boolean
}

export function ValidadorDocumentosObligatorios({
  negociacionId,
  clienteId,
  fuentesPagoIds,
  onValidacionCompleta,
}: ValidadorDocumentosProps) {
  const [pendientes, setPendientes] = useState<DocumentoPendiente[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDocumentosPendientes()
  }, [clienteId, fuentesPagoIds])

  const cargarDocumentosPendientes = async () => {
    try {
      setCargando(true)

      // Consultar vista de documentos pendientes
      const { data, error } = await supabase
        .from('vista_documentos_pendientes_fuentes')
        .select('*')
        .eq('cliente_id', clienteId)
        .in('tipo_fuente_id', fuentesPagoIds)
        .eq('es_obligatorio', true) // Solo obligatorios

      if (error) throw error

      setPendientes((data || []) as unknown as DocumentoPendiente[])
      onValidacionCompleta((data || []).length === 0)
    } catch (error) {
      logger.error('Error cargando documentos pendientes:', error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Verificando documentos obligatorios...
          </span>
        </div>
      </div>
    )
  }

  if (pendientes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              ? Todos los documentos obligatorios est�n completos
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              La negociaci�n puede proceder al desembolso
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
            ?? Documentos obligatorios pendientes ({pendientes.length})
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
            Estos documentos deben subirse antes de autorizar el desembolso
          </p>
        </div>
      </div>

      {/* Lista de pendientes */}
      <div className="space-y-2 mt-3">
        {pendientes.map((doc) => (
          <div
            key={`${doc.requisito_id}-${doc.tipo_fuente_nombre}`}
            className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700"
          >
            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {doc.requisito_nombre}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {doc.tipo_fuente_nombre}
                {doc.alcance === 'COMPARTIDO_CLIENTE' && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    Compartido
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                // Abrir modal de subida de documentos
                // pasando metadata del requisito
              }}
              className="p-1.5 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              title="Subir documento"
            >
              <Upload className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Acci�n */}
      <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-700">
        <button
          onClick={() => {
            // Navegar a pesta�a de documentos
            window.location.hash = '#documentos'
          }}
          className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
        >
          ? Ir a secci�n de documentos para subirlos
        </button>
      </div>
    </motion.div>
  )
}
