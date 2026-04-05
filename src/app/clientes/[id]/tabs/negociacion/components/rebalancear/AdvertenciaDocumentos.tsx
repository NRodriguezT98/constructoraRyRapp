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
          className='space-y-2 overflow-hidden rounded-xl border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20'
        >
          <div className='flex items-start gap-2'>
            <FileWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
            <p className='text-xs font-bold leading-tight text-amber-800 dark:text-amber-300'>
              ¿Confirmar? Algunos documentos quedarán pendientes
            </p>
          </div>

          {fuentesExistentes.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs font-semibold text-amber-700 dark:text-amber-400'>
                Fuentes modificadas que requerirán nueva documentación:
              </p>
              {fuentesExistentes.map(cambio => (
                <div
                  key={cambio.tipo}
                  className='space-y-0.5 border-l-2 border-amber-400 pl-2.5 dark:border-amber-600'
                >
                  <p className='text-xs font-semibold text-amber-800 dark:text-amber-300'>
                    {cambio.tipo}
                  </p>
                  {cambio.motivoCambio === 'entidad' ||
                  cambio.motivoCambio === 'ambos' ? (
                    <p className='text-xs text-amber-700 dark:text-amber-500'>
                      Entidad cambiada:{' '}
                      <span className='font-medium'>
                        {cambio.entidadAnterior}
                      </span>
                      {' → '}
                      <span className='font-medium'>{cambio.entidadNueva}</span>
                    </p>
                  ) : null}
                  {cambio.motivoCambio === 'monto' ||
                  cambio.motivoCambio === 'ambos' ? (
                    <p className='text-xs text-amber-700 dark:text-amber-500'>
                      Monto aumentó:{' '}
                      <span className='font-medium'>
                        {formatCurrency(cambio.montoAnterior ?? 0)}
                      </span>
                      {' → '}
                      <span className='font-medium'>
                        {formatCurrency(cambio.montoNuevo ?? 0)}
                      </span>
                    </p>
                  ) : null}
                  {cambio.documentos.length > 0 ? (
                    <p className='text-xs font-medium text-amber-600 dark:text-amber-400'>
                      Deberás subir: {cambio.documentos.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {fuentesNuevas.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs font-semibold text-amber-700 dark:text-amber-400'>
                Fuentes nuevas que requerirán documentación:
              </p>
              {fuentesNuevas.map(nueva => (
                <div
                  key={nueva.tipo}
                  className='space-y-0.5 border-l-2 border-amber-300 pl-2.5 dark:border-amber-700'
                >
                  <p className='text-xs font-semibold text-amber-800 dark:text-amber-300'>
                    {nueva.tipo}
                  </p>
                  {nueva.documentos.length > 0 ? (
                    <p className='text-xs font-medium text-amber-600 dark:text-amber-400'>
                      Requiere: {nueva.documentos.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <p className='text-xs italic text-amber-600 dark:text-amber-500'>
            El sistema quedará bloqueado para desembolsos hasta que se adjunten
            los documentos.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
