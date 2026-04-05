'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Circle } from 'lucide-react'

interface BannerDocumentacionProps {
  tieneDocumento: boolean
  cargandoValidacion: boolean
  tieneNegociacionActiva: boolean
}

export function BannerDocumentacion({
  tieneDocumento,
  cargandoValidacion,
  tieneNegociacionActiva,
}: BannerDocumentacionProps) {
  // No mostrar si ya tiene negociación activa
  if (tieneNegociacionActiva) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`relative overflow-hidden rounded-xl p-3 shadow-lg ${
        tieneDocumento
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
          : 'bg-gradient-to-r from-orange-500 to-amber-500'
      } text-white`}
    >
      {/* Patrón de fondo */}
      <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black,transparent)]' />

      <div className='relative flex items-center gap-3'>
        {/* Icono */}
        <div className='flex-shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur'>
          {cargandoValidacion ? (
            <Circle className='h-5 w-5 animate-spin' strokeWidth={2.5} />
          ) : tieneDocumento ? (
            <CheckCircle className='h-5 w-5' strokeWidth={2.5} />
          ) : (
            <AlertCircle className='h-5 w-5' strokeWidth={2.5} />
          )}
        </div>

        {/* Texto principal */}
        <div className='min-w-0 flex-1'>
          <h4 className='mb-0.5 text-sm font-bold'>
            {tieneDocumento
              ? '✓ Cliente listo para asignar vivienda'
              : '⚠ Acción requerida: Documento de identidad'}
          </h4>
          <p className='text-xs leading-relaxed opacity-90'>
            {tieneDocumento
              ? 'Todos los documentos verificados. Usa el botón "Asignar Vivienda" arriba.'
              : 'Sube la cédula en la pestaña "Documentos" para poder asignar vivienda.'}
          </p>
        </div>

        {/* Checklist compacto - solo íconos en móvil, texto en desktop */}
        <div className='hidden items-center gap-2 border-l border-white/30 pl-3 text-xs md:flex'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center gap-1.5'>
              <CheckCircle
                className='h-3.5 w-3.5 flex-shrink-0'
                strokeWidth={2.5}
              />
              <span className='whitespace-nowrap'>Cliente Registrado</span>
            </div>
            <div className='flex items-center gap-1.5'>
              {tieneDocumento ? (
                <CheckCircle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
              ) : (
                <Circle
                  className='h-3.5 w-3.5 flex-shrink-0'
                  strokeWidth={2.5}
                />
              )}
              <span className='whitespace-nowrap'>Documento Cargado</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
