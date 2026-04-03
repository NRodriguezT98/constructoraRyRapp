/**
 * ============================================
 * COMPONENTE: Lista de Fuentes
 * ============================================
 *
 * Lista todas las fuentes de pago configuradas con
 * información detallada y acciones contextuales.
 */

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Edit,
  FileText,
  FileX,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react'

import { logger } from '@/lib/utils/logger'
import type {
  FuentePago,
  TipoFuentePago,
} from '@/modules/clientes/types/fuentes-pago'
import type { TipoFuentePago as TipoFuentePagoConfig } from '@/modules/configuracion/types/tipos-fuentes-pago.types'
import { esCuotaInicial } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import { fuentesPagoTabStyles as styles } from '../../fuentes-pago-tab.styles'

interface ListaFuentesProps {
  fuentesPago: FuentePago[]
  onEditarFuente: (fuente: FuentePago) => void
  onEliminarFuente: (id: string) => void
  onAgregarFuente: (tipo: TipoFuentePago) => void
  // Funciones del hook (lógica procesada)
  getTipoConfig: (tipo: TipoFuentePago) => {
    icon: React.ComponentType<{ className?: string }>
    styles: string
    iconStyles: string
  }
  getDocumentacionEstado: (fuente: FuentePago) => {
    estado: 'pendiente' | 'completo' | 'parcial' | 'no_requerido'
    mensaje: string
    detalle?: string
    documentos?: {
      total: number
      subidos: number
      pendientes: number
      obligatoriosPendientes: number
      lista?: Array<{
        nombre: string
        obligatorio: boolean
        nivel: string
        subido: boolean
      }>
    }
  }
  calcularProgreso: (fuente: FuentePago) => number
  getEstadoStyles: (estado: string) => string
  getProgressStyles: (porcentaje: number) => string
  tiposDisponibles: TipoFuentePagoConfig[]
  todasFuentesCreadas: boolean
  mensajeBotonDeshabilitado?: string
}

export function ListaFuentes({
  fuentesPago,
  onEditarFuente,
  onEliminarFuente,
  onAgregarFuente,
  // Funciones procesadas del hook
  getTipoConfig,
  getDocumentacionEstado,
  calcularProgreso,
  getProgressStyles,
  tiposDisponibles,
  todasFuentesCreadas,
  mensajeBotonDeshabilitado,
}: ListaFuentesProps) {
  // ============================================
  // STATE LOCAL (SOLO UI)
  // ============================================

  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null)
  const [documentosExpandidos, setDocumentosExpandidos] = useState<Set<string>>(
    new Set()
  )

  const toggleDropdown = (fuenteId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDropdownAbierto(dropdownAbierto === fuenteId ? null : fuenteId)
  }

  const toggleDocumentos = (fuenteId: string) => {
    setDocumentosExpandidos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fuenteId)) {
        newSet.delete(fuenteId)
      } else {
        newSet.add(fuenteId)
      }
      return newSet
    })
  }

  const cerrarDropdown = () => {
    setDropdownAbierto(null)
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownAbierto) {
        setDropdownAbierto(null)
      }
    }

    if (dropdownAbierto) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownAbierto])

  // ============================================
  // COMPONENTE PRESENTACIONAL PURO
  // ============================================

  return (
    <motion.div
      className={styles.fuentesList.container}
      {...styles.animations.fadeInUp}
    >
      {/* Header */}
      <div className={styles.fuentesList.header}>
        <h3 className={styles.fuentesList.headerTitle}>
          <DollarSign className={styles.fuentesList.headerIcon} />
          Fuentes de Pago Configuradas ({fuentesPago.length})
        </h3>

        {/* Botón Agregar Fuente con estado dinámico */}
        <div className='group relative'>
          <button
            disabled={todasFuentesCreadas || tiposDisponibles.length === 0}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 ${
              todasFuentesCreadas || tiposDisponibles.length === 0
                ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                : 'cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
            }`}
          >
            <Plus className='h-4 w-4' />
            <span>Agregar Fuente</span>
          </button>

          {/* Tooltip cuando está deshabilitado */}
          {todasFuentesCreadas && mensajeBotonDeshabilitado && (
            <div className='absolute bottom-full left-1/2 z-50 mb-2 max-w-xs -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100'>
              <div>
                <p className='font-semibold'>✅ Configuración Completa</p>
                <p className='mt-1 text-gray-300'>
                  {mensajeBotonDeshabilitado}
                </p>
              </div>
              <div className='absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900'></div>
            </div>
          )}

          {/* Dropdown para tipos disponibles (solo si hay tipos disponibles) */}
          {!todasFuentesCreadas && tiposDisponibles.length > 0 && (
            <div className='invisible absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-gray-200 bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800'>
              <div className='p-1'>
                <div className='border-b border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400'>
                  Tipos disponibles:
                </div>
                {tiposDisponibles.map((tipoConfig: TipoFuentePagoConfig) => (
                  <button
                    key={tipoConfig.id}
                    onClick={() =>
                      onAgregarFuente(tipoConfig.nombre as TipoFuentePago)
                    }
                    className='w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-all hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-900/30'
                  >
                    ✨ {tipoConfig.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de fuentes */}
      {fuentesPago.length > 0 ? (
        <motion.div
          className={styles.fuentesList.lista}
          variants={styles.animations.staggerChildren}
          initial='initial'
          animate='animate'
        >
          {fuentesPago.map((fuente, index) => {
            const tipoConfig = getTipoConfig(fuente.tipo)
            const progreso = calcularProgreso(fuente)
            const saldoPendiente =
              fuente.monto_aprobado - (fuente.monto_recibido || 0)

            return (
              <motion.div
                key={fuente.id}
                className='relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-lg backdrop-blur-xl transition-all duration-200 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80'
                variants={styles.animations.fadeInUp}
                transition={{ delay: index * 0.1 }}
                onClick={cerrarDropdown}
              >
                {/* Header Compacto */}
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    {/* Ícono Tipo */}
                    <div
                      className={`h-8 w-8 rounded-lg ${tipoConfig.styles} flex items-center justify-center shadow-md`}
                    >
                      <tipoConfig.icon
                        className={`h-4 w-4 ${tipoConfig.iconStyles}`}
                      />
                    </div>

                    {/* Info Principal */}
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                        {fuente.tipo}
                      </p>
                      {fuente.entidad && (
                        <p className='truncate text-xs text-gray-600 dark:text-gray-400'>
                          {fuente.entidad}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Documentación y Menú */}
                  <div className='flex items-center gap-1.5'>
                    {/* Badge Documentación - CLARO Y DESCRIPTIVO */}
                    {(() => {
                      const docEstado = getDocumentacionEstado(fuente)

                      // Estado: Sin documentos subidos
                      if (docEstado.estado === 'pendiente') {
                        const tieneDocs = (docEstado.documentos?.total ?? 0) > 0
                        return (
                          <div
                            className='flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 dark:border-red-800 dark:bg-red-900/20'
                            title={`📄 Documentación Pendiente\n\n${docEstado.mensaje}\n\nRequeridos: ${docEstado.documentos?.total || 0}\nSubidos: 0\n\n💡 Sube los documentos obligatorios en la pestaña Documentos`}
                          >
                            <FileX className='h-3 w-3 text-red-600 dark:text-red-400' />
                            <span className='text-xs font-medium text-red-700 dark:text-red-300'>
                              {tieneDocs
                                ? `0/${docEstado.documentos?.total} Docs`
                                : 'Sin Requisitos'}
                            </span>
                          </div>
                        )
                      }

                      // Estado: Algunos documentos subidos
                      if (docEstado.estado === 'parcial') {
                        return (
                          <div
                            className='flex items-center gap-1 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 dark:border-yellow-800 dark:bg-yellow-900/20'
                            title={`📄 Documentación Incompleta\n\n${docEstado.mensaje}\n\nRequeridos: ${docEstado.documentos?.total}\nSubidos: ${docEstado.documentos?.subidos}\nPendientes: ${docEstado.documentos?.pendientes}\n\n⚠️ Faltan documentos obligatorios`}
                          >
                            <AlertCircle className='h-3 w-3 text-yellow-600 dark:text-yellow-400' />
                            <span className='text-xs font-medium text-yellow-700 dark:text-yellow-300'>
                              {docEstado.documentos?.subidos}/
                              {docEstado.documentos?.total} Docs
                            </span>
                          </div>
                        )
                      }

                      // Estado: Todos los documentos subidos
                      if (docEstado.estado === 'completo') {
                        return (
                          <div
                            className='flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 dark:border-green-800 dark:bg-green-900/20'
                            title={`✅ Documentación Completa\n\n${docEstado.mensaje}\n\nTodos los documentos obligatorios están subidos (${docEstado.documentos?.total}/${docEstado.documentos?.total})\n\n🎉 Esta fuente está lista para desembolso`}
                          >
                            <CheckCircle className='h-3 w-3 text-green-600 dark:text-green-400' />
                            <span className='text-xs font-medium text-green-700 dark:text-green-300'>
                              ✓ {docEstado.documentos?.total} Docs
                            </span>
                          </div>
                        )
                      }

                      // Estado: No requiere documentación específica (se gestiona por abonos)
                      return (
                        <div
                          className='flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 dark:border-blue-800 dark:bg-blue-900/20'
                          title={`ℹ️ Sin Requisitos de Documentos\n\n${docEstado.mensaje}\n\n💰 Esta fuente se gestiona directamente por abonos en el módulo de Abonos, no requiere documentos específicos de aprobación`}
                        >
                          <DollarSign className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                          <span className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                            Por Abonos
                          </span>
                        </div>
                      )
                    })()}

                    {/* Menú Compacto - SOLO ONCLICK */}
                    <div className='relative'>
                      <button
                        onClick={e => toggleDropdown(fuente.id, e)}
                        className='flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                      >
                        <MoreVertical className='h-3 w-3 text-gray-500 dark:text-gray-400' />
                      </button>

                      {dropdownAbierto === fuente.id && (
                        <div className='absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-xl duration-150 animate-in fade-in dark:border-gray-700 dark:bg-gray-800'>
                          <div className='p-1'>
                            <button
                              onClick={() => onEditarFuente(fuente)}
                              className='flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            >
                              <Edit className='h-3 w-3' />
                              Editar Fuente
                            </button>

                            {/* Navegación contextual a Documentos */}
                            {getDocumentacionEstado(fuente).estado ===
                              'pendiente' && (
                              <button
                                onClick={() =>
                                  logger.info(
                                    'Navegar a documentos para:',
                                    fuente.id
                                  )
                                }
                                className='flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                              >
                                <FileText className='h-3 w-3' />
                                Gestionar Docs
                              </button>
                            )}

                            {getDocumentacionEstado(fuente).estado ===
                              'completo' && (
                              <button
                                onClick={() =>
                                  logger.info('Ver documentos de:', fuente.id)
                                }
                                className='flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                              >
                                <FileText className='h-3 w-3' />
                                Ver Documentos
                              </button>
                            )}

                            <button
                              onClick={() => onEliminarFuente(fuente.id)}
                              className='flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                            >
                              <Trash2 className='h-3 w-3' />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido Compacto */}
                <div className='space-y-2'>
                  {/* Métricas en Grid 3 columnas */}
                  <div className='grid grid-cols-3 gap-2 text-xs'>
                    <div className='space-y-0.5'>
                      <p className='font-medium text-gray-500 dark:text-gray-400'>
                        {esCuotaInicial(fuente.tipo) ? 'Pactado' : 'Aprobado'}
                      </p>
                      <p className='bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent'>
                        {formatCurrency(fuente.monto_aprobado)}
                      </p>
                    </div>
                    <div className='space-y-0.5'>
                      <p className='font-medium text-gray-500 dark:text-gray-400'>
                        {esCuotaInicial(fuente.tipo)
                          ? 'Pagado'
                          : 'Desembolsado'}
                      </p>
                      <p className='text-sm font-semibold text-green-600 dark:text-green-400'>
                        {formatCurrency(fuente.monto_recibido || 0)}
                      </p>
                    </div>
                    <div className='space-y-0.5'>
                      <p className='font-medium text-gray-500 dark:text-gray-400'>
                        {esCuotaInicial(fuente.tipo)
                          ? 'Por Pagar'
                          : 'Pendiente'}
                      </p>
                      <p className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
                        {formatCurrency(saldoPendiente)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progreso Compacta */}
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                        Progreso Desembolso
                      </span>
                      <span className='text-xs font-bold text-cyan-600 dark:text-cyan-400'>
                        {progreso}%
                      </span>
                    </div>
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                      <motion.div
                        className={`h-full rounded-full ${getProgressStyles(progreso)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso}%` }}
                        transition={{
                          duration: 1.2,
                          ease: 'easeOut',
                          delay: index * 0.15,
                        }}
                      />
                    </div>
                  </div>

                  {/* LISTA DE DOCUMENTOS REQUERIDOS - DROPDOWN INTELIGENTE */}
                  {(() => {
                    const docEstado = getDocumentacionEstado(fuente)
                    const isExpanded = documentosExpandidos.has(fuente.id)

                    // Si no requiere documentos, mostrar mensaje
                    if (docEstado.estado === 'no_requerido') {
                      return (
                        <div className='border-t border-gray-200 pt-2 dark:border-gray-700'>
                          <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20'>
                            <DollarSign className='h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                            <p className='text-xs text-blue-700 dark:text-blue-300'>
                              <span className='font-semibold'>
                                Se gestiona por abonos.
                              </span>{' '}
                              No requiere documentos de aprobación.
                            </p>
                          </div>
                        </div>
                      )
                    }

                    // Mostrar resumen + dropdown expandible
                    return (
                      <div className='border-t border-gray-200 pt-2 dark:border-gray-700'>
                        {/* Resumen clickeable - MUY VISIBLE */}
                        <button
                          onClick={() => toggleDocumentos(fuente.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 shadow-md transition-all duration-200 ${
                            isExpanded
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                              : 'bg-gradient-to-r from-gray-100 to-gray-50 hover:from-cyan-50 hover:to-blue-50 hover:shadow-lg hover:shadow-cyan-500/20 dark:from-gray-800 dark:to-gray-700 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.3, type: 'spring' }}
                              className='flex-shrink-0'
                            >
                              <svg
                                className={`h-5 w-5 ${isExpanded ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`}
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={3}
                                  d='M9 5l7 7-7 7'
                                />
                              </svg>
                            </motion.div>
                            <div className='flex items-center gap-2'>
                              <FileText
                                className={`h-5 w-5 ${isExpanded ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`}
                              />
                              <div className='flex flex-col items-start'>
                                <p
                                  className={`text-sm font-bold ${isExpanded ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}
                                >
                                  📋 Requisitos para Desembolso
                                </p>
                                {docEstado.documentos &&
                                  docEstado.documentos.lista &&
                                  (() => {
                                    const obligatorios =
                                      docEstado.documentos.lista.filter(
                                        d => d.obligatorio
                                      )
                                    const opcionales =
                                      docEstado.documentos.lista.filter(
                                        d => !d.obligatorio
                                      )
                                    const obligatoriosSubidos =
                                      obligatorios.filter(d => d.subido).length
                                    const opcionalesSubidos = opcionales.filter(
                                      d => d.subido
                                    ).length

                                    return (
                                      <p
                                        className={`text-[10px] font-medium ${isExpanded ? 'text-cyan-100' : 'text-gray-500 dark:text-gray-400'}`}
                                      >
                                        {obligatorios.length > 0 &&
                                          `${obligatoriosSubidos}/${obligatorios.length} Obligatorios`}
                                        {opcionales.length > 0 &&
                                          ` • ${opcionalesSubidos}/${opcionales.length} Opcional${opcionales.length > 1 ? 'es' : ''}`}
                                      </p>
                                    )
                                  })()}
                              </div>
                            </div>
                          </div>

                          {/* Badge estado - Basado en OBLIGATORIOS */}
                          {(() => {
                            const obligatorios =
                              docEstado.documentos?.lista?.filter(
                                d => d.obligatorio
                              ) || []
                            const obligatoriosSubidos = obligatorios.filter(
                              d => d.subido
                            ).length
                            const todosObligatoriosCompletos =
                              obligatorios.length > 0 &&
                              obligatoriosSubidos === obligatorios.length

                            if (todosObligatoriosCompletos) {
                              return (
                                <span
                                  className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                                    isExpanded
                                      ? 'border-white bg-white text-green-600 shadow-lg'
                                      : 'border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  }`}
                                >
                                  <CheckCircle className='h-4 w-4' />✓ Completo
                                </span>
                              )
                            } else if (obligatoriosSubidos > 0) {
                              return (
                                <span
                                  className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                                    isExpanded
                                      ? 'border-white bg-white text-yellow-600 shadow-lg'
                                      : 'border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  }`}
                                >
                                  <AlertCircle className='h-4 w-4' />
                                  {obligatoriosSubidos}/{obligatorios.length}
                                </span>
                              )
                            } else {
                              return (
                                <span
                                  className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                                    isExpanded
                                      ? 'border-white bg-white text-red-600 shadow-lg'
                                      : 'border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  }`}
                                >
                                  <FileX className='h-4 w-4' />
                                  0/{obligatorios.length}
                                </span>
                              )
                            }
                          })()}
                        </button>

                        {/* Lista expandible de documentos */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: isExpanded ? 'auto' : 0,
                            opacity: isExpanded ? 1 : 0,
                          }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className='overflow-hidden'
                        >
                          <div className='mt-2 space-y-1.5 pl-3'>
                            {docEstado.documentos?.lista?.map((doc, idx) => (
                              <div
                                key={idx}
                                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                                  doc.subido
                                    ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                    : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                }`}
                              >
                                {doc.subido ? (
                                  <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
                                ) : (
                                  <FileX className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
                                )}
                                <div className='min-w-0 flex-1'>
                                  <div className='flex flex-wrap items-start gap-2'>
                                    <p
                                      className={`font-medium leading-tight ${
                                        doc.subido
                                          ? 'text-green-700 dark:text-green-300'
                                          : 'text-red-700 dark:text-red-300'
                                      }`}
                                    >
                                      {doc.nombre}
                                    </p>
                                    {/* Badge Obligatorio/Opcional */}
                                    <span
                                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                        doc.obligatorio
                                          ? 'border border-red-400 bg-red-200 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-200'
                                          : 'border border-blue-400 bg-blue-200 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                      }`}
                                    >
                                      {doc.obligatorio
                                        ? '⚠️ Obligatorio'
                                        : 'ℹ️ Opcional'}
                                    </span>
                                  </div>
                                  {!doc.subido && doc.obligatorio && (
                                    <p className='mt-1 text-[10px] font-medium text-red-600 dark:text-red-400'>
                                      📌 Requerido para habilitar desembolso -
                                      Sube en pestaña Documentos
                                    </p>
                                  )}
                                  {!doc.subido && !doc.obligatorio && (
                                    <p className='mt-1 text-[10px] text-blue-600 dark:text-blue-400'>
                                      💡 Documento opcional - Mejora el proceso
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Mensaje de acción si no está expandido */}
                        {!isExpanded && docEstado.estado !== 'completo' && (
                          <p className='mt-1 pl-5 text-xs italic text-gray-500 dark:text-gray-400'>
                            Click para ver {docEstado.documentos?.pendientes}{' '}
                            documento
                            {docEstado.documentos?.pendientes === 1 ? '' : 's'}{' '}
                            pendiente
                            {docEstado.documentos?.pendientes === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        /* Estado vacío */
        <motion.div
          className={styles.fuentesList.emptyState}
          {...styles.animations.fadeInUp}
        >
          <DollarSign className={styles.fuentesList.emptyIcon} />
          <h4 className={styles.fuentesList.emptyTitle}>
            No hay fuentes de pago configuradas
          </h4>
          <p className={styles.fuentesList.emptySubtitle}>
            Agrega fuentes de pago para comenzar a gestionar los pagos de esta
            vivienda
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
