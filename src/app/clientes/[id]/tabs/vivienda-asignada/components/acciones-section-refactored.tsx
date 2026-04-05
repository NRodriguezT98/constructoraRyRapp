/**
 * ============================================
 * COMPONENTE: AccionesSection
 * ============================================
 *
 * Sección de acciones rápidas para vivienda asignada.
 * Botones para registrar abono, renunciar y generar PDF.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { motion } from 'framer-motion'
import { DollarSign, FileText, XCircle } from 'lucide-react'

interface AccionesSectionProps {
  estado: string
  onRegistrarAbono: () => void
  onRenunciar: () => void
  onGenerarPDF: () => void
  disabled?: boolean
}

export function AccionesSection({
  estado,
  onRegistrarAbono,
  onRenunciar,
  onGenerarPDF,
  disabled = false,
}: AccionesSectionProps) {
  const puedeRegistrarAbono = estado === 'Activa'

  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
      {/* Registrar Abono */}
      <motion.button
        whileHover={{ scale: puedeRegistrarAbono ? 1.02 : 1 }}
        whileTap={{ scale: puedeRegistrarAbono ? 0.98 : 1 }}
        onClick={onRegistrarAbono}
        disabled={!puedeRegistrarAbono || disabled}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-md transition-all ${
          puedeRegistrarAbono && !disabled
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20 hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg'
            : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        } `}
      >
        <DollarSign className='h-4 w-4' />
        Registrar Abono
      </motion.button>

      {/* Generar PDF */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerarPDF}
        disabled={disabled}
        className='flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-purple-500/20 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
      >
        <FileText className='h-4 w-4' />
        Generar PDF
      </motion.button>

      {/* Renunciar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRenunciar}
        disabled={disabled}
        className='flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-red-500/20 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
      >
        <XCircle className='h-4 w-4' />
        Renunciar
      </motion.button>
    </div>
  )
}
