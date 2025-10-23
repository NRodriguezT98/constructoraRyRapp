'use client'

import { Tooltip } from '@/shared/components/ui'
import { AlertCircle, DollarSign, FileText, Pause, XCircle } from 'lucide-react'

interface AccionesSectionProps {
  estado: string
  onRegistrarAbono?: () => void
  onSuspender?: () => void
  onRenunciar?: () => void
  onGenerarPDF?: () => void
  disabled?: boolean
}

export function AccionesSection({
  estado,
  onRegistrarAbono,
  onSuspender,
  onRenunciar,
  onGenerarPDF,
  disabled = false,
}: AccionesSectionProps) {
  const isActiva = estado === 'Activa'
  const isSuspendida = estado === 'Suspendida'
  const isCerrada = estado === 'Cerrada por Renuncia' || estado === 'Completada'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Acciones
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona los procesos de esta negociación
        </p>
      </div>

      {/* Grid de Acciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Registrar Abono */}
        <Tooltip
          content={
            isCerrada
              ? 'No se pueden registrar abonos en negociaciones cerradas'
              : 'Registrar un nuevo pago para esta negociación'
          }
          side="top"
        >
          <button
            onClick={onRegistrarAbono}
            disabled={disabled || isCerrada}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              isCerrada || disabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Registrar Abono</span>
          </button>
        </Tooltip>

        {/* Suspender */}
        <Tooltip
          content={
            isCerrada
              ? 'Esta negociación ya está cerrada'
              : isSuspendida
              ? 'Esta negociación ya está suspendida'
              : 'Suspender temporalmente esta negociación'
          }
          side="top"
        >
          <button
            onClick={onSuspender}
            disabled={disabled || isCerrada || isSuspendida}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              isCerrada || isSuspendida || disabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Pause className="w-5 h-5" />
            <span>Suspender</span>
          </button>
        </Tooltip>

        {/* Renunciar */}
        <Tooltip
          content={
            isCerrada
              ? 'Esta negociación ya está cerrada'
              : 'Cerrar esta negociación por renuncia del cliente'
          }
          side="top"
        >
          <button
            onClick={onRenunciar}
            disabled={disabled || isCerrada}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              isCerrada || disabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-lg'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>Renunciar</span>
          </button>
        </Tooltip>

        {/* Generar PDF */}
        <Tooltip content="Descargar resumen de la negociación en PDF" side="top">
          <button
            onClick={onGenerarPDF}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              disabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Generar PDF</span>
          </button>
        </Tooltip>
      </div>

      {/* Advertencia si está cerrada */}
      {isCerrada && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span>
              Esta negociación está <strong>{estado}</strong> y no permite más modificaciones.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
