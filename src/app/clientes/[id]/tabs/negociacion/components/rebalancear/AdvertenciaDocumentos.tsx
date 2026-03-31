'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileWarning } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

import type { CambioEnriquecido, NuevaEnriquecida } from './types'

interface AdvertenciaDocumentosProps {
  visible: boolean
  fuentesExistentes: CambioEnriquecido[]
  fuentesNuevas: NuevaEnriquecida[]
}

export function AdvertenciaDocumentos({
  visible,
  fuentesExistentes,
  fuentesNuevas,
}: AdvertenciaDocumentosProps) {
  const hayContenido = fuentesExistentes.length > 0 || fuentesNuevas.length > 0

  return (
    <AnimatePresence>
      {visible && hayContenido && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2 overflow-hidden"
        >
          <div className="flex items-start gap-2">
            <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-tight">
              ¿Confirmar? Algunos documentos quedarán pendientes
            </p>
          </div>

          {fuentesExistentes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Fuentes modificadas que requerirán nueva documentación:
              </p>
              {fuentesExistentes.map((cambio) => (
                <div
                  key={cambio.tipo}
                  className="pl-2.5 border-l-2 border-amber-400 dark:border-amber-600 space-y-0.5"
                >
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {cambio.tipo}
                  </p>
                  {(cambio.motivoCambio === 'entidad' || cambio.motivoCambio === 'ambos') ? (
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      Entidad cambiada:{' '}
                      <span className="font-medium">{cambio.entidadAnterior}</span>
                      {' → '}
                      <span className="font-medium">{cambio.entidadNueva}</span>
                    </p>
                  ) : null}
                  {(cambio.motivoCambio === 'monto' || cambio.motivoCambio === 'ambos') ? (
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      Monto aumentó:{' '}
                      <span className="font-medium">{formatCurrency(cambio.montoAnterior ?? 0)}</span>
                      {' → '}
                      <span className="font-medium">{formatCurrency(cambio.montoNuevo ?? 0)}</span>
                    </p>
                  ) : null}
                  {cambio.documentos.length > 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Deberás subir: {cambio.documentos.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {fuentesNuevas.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Fuentes nuevas que requerirán documentación:
              </p>
              {fuentesNuevas.map((nueva) => (
                <div
                  key={nueva.tipo}
                  className="pl-2.5 border-l-2 border-amber-300 dark:border-amber-700 space-y-0.5"
                >
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {nueva.tipo}
                  </p>
                  {nueva.documentos.length > 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Requiere: {nueva.documentos.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-amber-600 dark:text-amber-500 italic">
            El sistema quedará bloqueado para desembolsos hasta que se adjunten los documentos.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
