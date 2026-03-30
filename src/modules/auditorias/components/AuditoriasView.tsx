/**
 * AuditoriasView - Vista principal del módulo de Auditorías
 *
 * ✅ DISEÑO ESTANDARIZADO (basado en módulo de Abonos):
 * - Header Hero con gradiente azul/índigo/púrpura
 * - 4 Tarjetas de métricas con glassmorphism
 * - Filtros sticky con backdrop blur
 * - Tabla con diseño premium
 * - Modo oscuro completo
 * - Responsive design
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Trash2,
  User,
  X,
} from 'lucide-react'

import { errorLog } from '@/lib/utils/logger'

import { useAuditorias } from '../hooks/useAuditorias'
import {
  getAccionBadgeStyles,
  metricasIconColors,
  auditoriasStyles as styles,
} from '../styles/auditorias.styles'
import type {
  AccionAuditoria,
  AuditoriaRegistro,
  ModuloAplicacion,
} from '../types'
import { formatearFecha, getAccionLabel } from '../utils/formatters'

import { DetalleAuditoriaModal } from './DetalleAuditoriaModal'

interface AuditoriasViewProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function AuditoriasView({
  canCreate: _canCreate = false,
  canEdit: _canEdit = false,
  canDelete: _canDelete = false,
  canView: _canView = true,
  isAdmin: _isAdmin = false,
}: AuditoriasViewProps = {}) {
  const {
    registros,
    estadisticas,
    resumenModulos: _resumenModulos,
    eliminacionesMasivas: _eliminacionesMasivas,
    cargando,
    error: _error,
    filtros,
    paginaActual,
    totalPaginas,
    cargarEstadisticas,
    cargarResumenModulos,
    cargarEliminacionesMasivas,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refrescar: _refrescar,
  } = useAuditorias()

  const [registroDetalle, setRegistroDetalle] =
    useState<AuditoriaRegistro | null>(null)

  // Cargar datos adicionales al montar
  useEffect(() => {
    let cancelado = false

    const cargarDatos = async () => {
      try {
        await Promise.all([
          cargarEstadisticas(),
          cargarResumenModulos(),
          cargarEliminacionesMasivas(),
        ])
      } catch (error) {
        if (!cancelado) {
          errorLog('[AUDITORIAS] Error al cargar datos', error)
        }
      }
    }

    cargarDatos()

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar al montar

  // Mostrar loading skeleton SOLO en carga inicial (sin datos previos)
  if (cargando && registros.length === 0 && !estadisticas) {
    return (
      <div className={styles.container.page}>
        <div className={styles.container.content}>
          <div className={styles.loading.container}>
            <div className={styles.loading.headerSkeleton}></div>
            <div className={styles.loading.metricsGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.loading.metricSkeleton}></div>
              ))}
            </div>
            <div className={styles.loading.filtrosSkeleton}></div>
            <div className={styles.loading.tablaSkeleton}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* 🎨 HEADER HERO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={styles.header.container}
        >
          <div className={styles.header.pattern} />
          <div className={styles.header.content}>
            <div className={styles.header.topRow}>
              <div className={styles.header.titleGroup}>
                <div className={styles.header.iconCircle}>
                  <Activity className={styles.header.icon} />
                </div>
                <div className={styles.header.titleWrapper}>
                  <h1 className={styles.header.title}>
                    Auditorías del Sistema
                  </h1>
                  <p className={styles.header.subtitle}>
                    Registro completo de operaciones • Trazabilidad total
                  </p>
                </div>
              </div>
              <span className={styles.header.badge}>
                <FileText className='h-4 w-4' />
                {registros.length} Evento{registros.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 📊 MÉTRICAS PREMIUM */}
        {estadisticas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.metricas.grid}
          >
            {/* Total Eventos */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={styles.metricas.card}
            >
              <div
                className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.totalEventos.glowColor}`}
              />
              <div className={styles.metricas.content}>
                <div
                  className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.totalEventos.gradient} shadow-teal-500/50`}
                >
                  <FileText className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p
                    className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.totalEventos.textGradient}`}
                  >
                    {estadisticas.totalEventos.toLocaleString()}
                  </p>
                  <p className={styles.metricas.label}>Total de Eventos</p>
                </div>
              </div>
            </motion.div>

            {/* Creaciones */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={styles.metricas.card}
            >
              <div
                className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.creates.glowColor}`}
              />
              <div className={styles.metricas.content}>
                <div
                  className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.creates.gradient} shadow-green-500/50`}
                >
                  <CheckCircle2 className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p
                    className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.creates.textGradient}`}
                  >
                    {estadisticas.eventosHoy}
                  </p>
                  <p className={styles.metricas.label}>Eventos Hoy</p>
                </div>
              </div>
            </motion.div>

            {/* Actualizaciones */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={styles.metricas.card}
            >
              <div
                className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.updates.glowColor}`}
              />
              <div className={styles.metricas.content}>
                <div
                  className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.updates.gradient} shadow-purple-500/50`}
                >
                  <User className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p
                    className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.updates.textGradient}`}
                  >
                    {estadisticas.usuariosActivos}
                  </p>
                  <p className={styles.metricas.label}>Usuarios Activos</p>
                </div>
              </div>
            </motion.div>

            {/* Eliminaciones */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={styles.metricas.card}
            >
              <div
                className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.deletes.glowColor}`}
              />
              <div className={styles.metricas.content}>
                <div
                  className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.deletes.gradient} shadow-orange-500/50`}
                >
                  <AlertTriangle className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p
                    className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.deletes.textGradient}`}
                  >
                    {estadisticas.eliminacionesTotales}
                  </p>
                  <p className={styles.metricas.label}>Eliminaciones</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🔍 FILTROS PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.filtros.container}
        >
          <div className={styles.filtros.grid}>
            {/* Módulo */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Módulo</label>
              <select
                className={styles.filtros.select}
                value={filtros.modulo || ''}
                onChange={e =>
                  aplicarFiltros({
                    modulo: e.target.value as ModuloAplicacion | undefined,
                  })
                }
              >
                <option value=''>Todos los módulos</option>
                <option value='proyectos'>Proyectos</option>
                <option value='viviendas'>Viviendas</option>
                <option value='clientes'>Clientes</option>
                <option value='negociaciones'>Negociaciones</option>
                <option value='abonos'>Abonos</option>
              </select>
            </div>

            {/* Acción */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Acción</label>
              <select
                className={styles.filtros.select}
                value={filtros.accion || ''}
                onChange={e =>
                  aplicarFiltros({
                    accion: e.target.value as AccionAuditoria | undefined,
                  })
                }
              >
                <option value=''>Todas las acciones</option>
                <option value='CREATE'>Creaciones</option>
                <option value='UPDATE'>Actualizaciones</option>
                <option value='DELETE'>Eliminaciones</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Desde</label>
              <input
                type='date'
                className={styles.filtros.select}
                value={filtros.fechaDesde || ''}
                onChange={e => aplicarFiltros({ fechaDesde: e.target.value })}
              />
            </div>

            {/* Fecha Hasta */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Hasta</label>
              <input
                type='date'
                className={styles.filtros.select}
                value={filtros.fechaHasta || ''}
                onChange={e => aplicarFiltros({ fechaHasta: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.filtros.footer}>
            <p className={styles.filtros.resultCount}>
              {registros.length} registro{registros.length !== 1 ? 's' : ''}{' '}
              encontrado{registros.length !== 1 ? 's' : ''}
            </p>
            {(filtros.modulo ||
              filtros.accion ||
              filtros.fechaDesde ||
              filtros.fechaHasta) && (
              <button
                className={styles.filtros.clearButton}
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </motion.div>

        {/* 📋 TABLA DE AUDITORÍAS */}
        {registros.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.empty.container}
          >
            <div className={styles.empty.iconWrapper}>
              <div className={styles.empty.iconGlow} />
              <div className={styles.empty.iconCircle}>
                <FileText className={styles.empty.icon} />
              </div>
            </div>
            <h3 className={styles.empty.title}>
              No hay registros de auditoría
            </h3>
            <p className={styles.empty.description}>
              {filtros.modulo ||
              filtros.accion ||
              filtros.fechaDesde ||
              filtros.fechaHasta
                ? 'No se encontraron registros con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                : 'Los registros de auditoría aparecerán aquí cuando se realicen operaciones en el sistema.'}
            </p>
            {(filtros.modulo ||
              filtros.accion ||
              filtros.fechaDesde ||
              filtros.fechaHasta) && (
              <button onClick={limpiarFiltros} className={styles.empty.button}>
                <X className='h-4 w-4' />
                Limpiar filtros
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.tabla.container}
          >
            <div className={styles.tabla.wrapper}>
              <table className={styles.tabla.table}>
                <thead className={styles.tabla.thead}>
                  <tr>
                    <th className={styles.tabla.th}>Fecha/Hora</th>
                    <th className={styles.tabla.th}>Acción</th>
                    <th className={styles.tabla.th}>Módulo</th>
                    <th className={styles.tabla.th}>Tabla</th>
                    <th className={styles.tabla.th}>Usuario</th>
                    <th className={styles.tabla.th}>Detalles</th>
                  </tr>
                </thead>
                <tbody className={styles.tabla.tbody}>
                  <AnimatePresence mode='popLayout'>
                    {registros.map((registro, index) => (
                      <motion.tr
                        key={registro.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          delay: index * 0.03,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                        className={styles.tabla.tr}
                      >
                        <td
                          className={`${styles.tabla.td} ${styles.tabla.tdTexto}`}
                        >
                          <div className='flex items-center gap-1.5 text-xs'>
                            <Calendar className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
                            {formatearFecha(registro.fechaEvento)}
                          </div>
                        </td>
                        <td className={styles.tabla.td}>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${getAccionBadgeStyles(registro.accion)}`}
                          >
                            {registro.accion === 'CREATE' && (
                              <CheckCircle2 className='h-3.5 w-3.5' />
                            )}
                            {registro.accion === 'UPDATE' && (
                              <Edit3 className='h-3.5 w-3.5' />
                            )}
                            {registro.accion === 'DELETE' && (
                              <Trash2 className='h-3.5 w-3.5' />
                            )}
                            {getAccionLabel(registro.accion)}
                          </span>
                        </td>
                        <td
                          className={`${styles.tabla.td} ${styles.tabla.tdTexto}`}
                        >
                          <span className='font-medium capitalize'>
                            {registro.modulo || '-'}
                          </span>
                        </td>
                        <td className={styles.tabla.td}>
                          <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-900 dark:bg-gray-900/50 dark:text-gray-100'>
                            {registro.tabla}
                          </code>
                        </td>
                        <td
                          className={`${styles.tabla.td} ${styles.tabla.tdSubtexto}`}
                        >
                          <div className='flex items-center gap-1.5 text-xs'>
                            <User className='h-3.5 w-3.5' />
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {registro.usuarioNombres ||
                                  registro.usuarioEmail}
                              </span>
                              {registro.usuarioNombres && (
                                <span className='text-[10px] text-gray-500 dark:text-gray-500'>
                                  {registro.usuarioEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={styles.tabla.td}>
                          <button
                            onClick={() => setRegistroDetalle(registro)}
                            className='inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          >
                            <Eye className='h-3.5 w-3.5' />
                            Ver
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Paginación (si aplica) */}
            {totalPaginas > 1 && (
              <div className='flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700'>
                <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                  Mostrando {(paginaActual - 1) * 50 + 1} -{' '}
                  {Math.min(paginaActual * 50, registros.length)} de{' '}
                  {registros.length}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  >
                    Anterior
                  </button>
                  <span className='px-2 text-xs text-gray-600 dark:text-gray-400'>
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 🎭 MODAL DE DETALLES MEJORADO */}
      <AnimatePresence>
        {registroDetalle && (
          <DetalleAuditoriaModal
            registro={registroDetalle}
            onClose={() => setRegistroDetalle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
