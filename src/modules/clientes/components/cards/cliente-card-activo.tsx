/**
 * ClienteCardActivo - Card para clientes con vivienda asignada
 * Muestra vivienda, proyecto, progreso de pago y última cuota
 * NOTA: Los datos de vivienda se mostrarán cuando esté implementado el módulo de asignación
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Home,
    Trash2,
    TrendingUp
} from 'lucide-react'
import { clientesStyles, fadeInUp } from '../../styles'
import type { ClienteResumen } from '../../types'

interface ClienteCardActivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onRegistrarAbono?: (cliente: ClienteResumen) => void
}

export function ClienteCardActivo({
  cliente,
  onVer,
  onEditar,
  onEliminar,
  onRegistrarAbono
}: ClienteCardActivoProps) {
  // TODO: Estos datos vendrán de la negociación activa cuando esté implementado
  // Por ahora usamos valores mockeados para preview del diseño
  const datosVivienda = {
    proyecto: 'Proyecto Villa Hermosa',
    manzana: 'A',
    numero: '5',
    valorTotal: 250000000,
    valorPagado: 187500000,
    porcentaje: 75,
    ultimaCuota: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Hace 15 días
    totalAbonos: 12,
  }

  const valorRestante = datosVivienda.valorTotal - datosVivienda.valorPagado

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const tiempoUltimaCuota = formatDistanceToNow(datosVivienda.ultimaCuota, {
    addSuffix: true,
    locale: es
  })

  return (
    <motion.div
      className='overflow-hidden rounded-2xl border border-green-200 bg-white shadow-lg transition-all hover:shadow-2xl dark:border-green-800 dark:bg-gray-800'
      variants={fadeInUp}
      layout
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Header con gradiente VERDE (Activo) */}
      <div className='relative h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6'>
        <div className='bg-grid-white/[0.05] absolute inset-0 bg-[length:20px_20px]' />

        {/* Botones de acción en esquina superior derecha */}
        <div className='relative flex items-start justify-end gap-1'>
          {onVer && (
            <button
              type='button'
              onClick={() => onVer(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Ver detalles'
            >
              <Eye className='h-4 w-4' />
            </button>
          )}
          {onEditar && (
            <button
              type='button'
              onClick={() => onEditar(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Editar cliente'
            >
              <Edit className='h-4 w-4' />
            </button>
          )}
          {onEliminar && (
            <button
              type='button'
              onClick={() => onEliminar(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Eliminar cliente'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Icono flotante de vivienda */}
        <div className='absolute -bottom-6 left-6'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white shadow-xl dark:border-gray-800 dark:bg-gray-800'>
            <Home className='h-6 w-6 text-green-600' />
          </div>
        </div>
      </div>

      {/* Contenido - PT-10 para espacio del icono */}
      <div className='px-6 pb-5 pt-10'>
        {/* Título y badge */}
        <div className='mb-4'>
          <div className='mb-2 flex items-start justify-between gap-3'>
            <h3
              className='line-clamp-1 text-xl font-bold text-gray-900 dark:text-white'
              title={cliente.nombre_completo}
            >
              {cliente.nombre_completo}
            </h3>
            <span className={`flex-shrink-0 ${clientesStyles.badge} ${clientesStyles.badgeActivo}`}>
              {cliente.estado}
            </span>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {cliente.tipo_documento} {cliente.numero_documento}
          </p>
        </div>

        {/* SECCIÓN: VIVIENDA ASIGNADA */}
        <div className='mb-4 rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-900 dark:from-green-900/20 dark:to-emerald-900/20'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400'>
            <Home className='h-4 w-4' />
            <span>VIVIENDA ASIGNADA</span>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
              <Building2 className='h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
              <span className='font-medium'>{datosVivienda.proyecto}</span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                <Home className='h-4 w-4 flex-shrink-0' />
                <span>Manzana {datosVivienda.manzana} • Casa {datosVivienda.numero}</span>
              </div>
              <span className='font-bold text-green-600 dark:text-green-400'>
                {formatCurrency(datosVivienda.valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN: PROGRESO DE PAGO */}
        <div className='mb-4 rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-900 dark:from-blue-900/20 dark:to-indigo-900/20'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400'>
              <TrendingUp className='h-4 w-4' />
              <span>PROGRESO DE PAGO</span>
            </div>
            <span className='text-2xl font-black text-blue-600 dark:text-blue-400'>
              {datosVivienda.porcentaje}%
            </span>
          </div>

          {/* Barra de progreso */}
          <div className='mb-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500'
              style={{ width: `${datosVivienda.porcentaje}%` }}
            />
          </div>

          <div className='space-y-1 text-xs'>
            <div className='flex justify-between text-gray-700 dark:text-gray-300'>
              <span>Pagado:</span>
              <span className='font-bold'>{formatCurrency(datosVivienda.valorPagado)}</span>
            </div>
            <div className='flex justify-between text-gray-700 dark:text-gray-300'>
              <span>Restante:</span>
              <span className='font-bold text-orange-600 dark:text-orange-400'>
                {formatCurrency(valorRestante)}
              </span>
            </div>
          </div>
        </div>

        {/* INFO ADICIONAL */}
        <div className='space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <Clock className='h-3.5 w-3.5' />
              <span>Última cuota: {tiempoUltimaCuota}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-3.5 w-3.5' />
              <span>{datosVivienda.totalAbonos} abonos</span>
            </div>
          </div>
        </div>

        {/* BOTÓN ACCIÓN PRINCIPAL */}
        {onRegistrarAbono && (
          <div className='mt-4 border-t border-gray-100 pt-4 dark:border-gray-700'>
            <button
              type='button'
              onClick={() => onRegistrarAbono(cliente)}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5'
            >
              <DollarSign className='h-5 w-5' />
              <span>Registrar Abono</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
