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
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuditorias } from '../hooks/useAuditorias'
import { getAccionBadgeStyles, metricasIconColors, auditoriasStyles as styles } from '../styles/auditorias.styles'
import type { AccionAuditoria, AuditoriaRegistro, ModuloAplicacion } from '../types'
import { DetalleAuditoriaModal } from './DetalleAuditoriaModal'

interface AuditoriasViewProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function AuditoriasView({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: AuditoriasViewProps = {}) {
  console.log('📊 [AUDITORIAS VIEW] Client Component montado con permisos:', {
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
  })

  const {
    registros,
    estadisticas,
    resumenModulos,
    eliminacionesMasivas,
    cargando,
    error,
    filtros,
    paginaActual,
    totalPaginas,
    cargarEstadisticas,
    cargarResumenModulos,
    cargarEliminacionesMasivas,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refrescar,
  } = useAuditorias()

  const [registroDetalle, setRegistroDetalle] = useState<AuditoriaRegistro | null>(null)

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
          console.error('[AUDITORIAS] Error al cargar datos:', error)
        }
      }
    }

    cargarDatos()

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar al montar

  const getAccionLabel = (accion: AccionAuditoria) => {
    switch (accion) {
      case 'CREATE':
        return 'Creación'
      case 'UPDATE':
        return 'Actualización'
      case 'DELETE':
        return 'Eliminación'
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Mostrar loading skeleton SOLO en carga inicial (sin datos previos)
  console.log('🔍 [AUDITORIAS_VIEW] Evaluando skeleton:', {
    cargando,
    registrosLength: registros.length,
    hasEstadisticas: !!estadisticas,
    shouldShowSkeleton: cargando && registros.length === 0 && !estadisticas
  })

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
          transition={{ duration: 0.5 }}
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
                  <h1 className={styles.header.title}>Auditorías del Sistema</h1>
                  <p className={styles.header.subtitle}>
                    Registro completo de operaciones • Trazabilidad total
                  </p>
                </div>
              </div>
              <span className={styles.header.badge}>
                <FileText className="w-4 h-4" />
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
              <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.totalEventos.glowColor}`} />
              <div className={styles.metricas.content}>
                <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.totalEventos.gradient} shadow-blue-500/50`}>
                  <FileText className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.totalEventos.textGradient}`}>
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
              <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.creates.glowColor}`} />
              <div className={styles.metricas.content}>
                <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.creates.gradient} shadow-green-500/50`}>
                  <CheckCircle2 className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.creates.textGradient}`}>
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
              <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.updates.glowColor}`} />
              <div className={styles.metricas.content}>
                <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.updates.gradient} shadow-purple-500/50`}>
                  <User className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.updates.textGradient}`}>
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
              <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.deletes.glowColor}`} />
              <div className={styles.metricas.content}>
                <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.deletes.gradient} shadow-orange-500/50`}>
                  <AlertTriangle className={styles.metricas.icon} />
                </div>
                <div className={styles.metricas.textGroup}>
                  <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.deletes.textGradient}`}>
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
                onChange={(e) =>
                  aplicarFiltros({
                    modulo: e.target.value as ModuloAplicacion | undefined,
                  })
                }
              >
                <option value="">Todos los módulos</option>
                <option value="proyectos">Proyectos</option>
                <option value="viviendas">Viviendas</option>
                <option value="clientes">Clientes</option>
                <option value="negociaciones">Negociaciones</option>
                <option value="abonos">Abonos</option>
              </select>
            </div>

            {/* Acción */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Acción</label>
              <select
                className={styles.filtros.select}
                value={filtros.accion || ''}
                onChange={(e) =>
                  aplicarFiltros({
                    accion: e.target.value as AccionAuditoria | undefined,
                  })
                }
              >
                <option value="">Todas las acciones</option>
                <option value="CREATE">Creaciones</option>
                <option value="UPDATE">Actualizaciones</option>
                <option value="DELETE">Eliminaciones</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Desde</label>
              <input
                type="date"
                className={styles.filtros.select}
                value={filtros.fechaDesde || ''}
                onChange={(e) => aplicarFiltros({ fechaDesde: e.target.value })}
              />
            </div>

            {/* Fecha Hasta */}
            <div className={styles.filtros.selectWrapper}>
              <label className={styles.filtros.label}>Hasta</label>
              <input
                type="date"
                className={styles.filtros.select}
                value={filtros.fechaHasta || ''}
                onChange={(e) => aplicarFiltros({ fechaHasta: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.filtros.footer}>
            <p className={styles.filtros.resultCount}>
              {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
            </p>
            {(filtros.modulo || filtros.accion || filtros.fechaDesde || filtros.fechaHasta) && (
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
              {filtros.modulo || filtros.accion || filtros.fechaDesde || filtros.fechaHasta
                ? 'No se encontraron registros con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                : 'Los registros de auditoría aparecerán aquí cuando se realicen operaciones en el sistema.'}
            </p>
            {(filtros.modulo || filtros.accion || filtros.fechaDesde || filtros.fechaHasta) && (
              <button
                onClick={limpiarFiltros}
                className={styles.empty.button}
              >
                <X className="w-4 h-4" />
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
                  <AnimatePresence mode="popLayout">
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
                          damping: 25
                        }}
                        className={styles.tabla.tr}
                      >
                        <td className={`${styles.tabla.td} ${styles.tabla.tdTexto}`}>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {formatearFecha(registro.fechaEvento)}
                          </div>
                        </td>
                        <td className={styles.tabla.td}>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${getAccionBadgeStyles(registro.accion)}`}>
                            {registro.accion === 'CREATE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {registro.accion === 'UPDATE' && <Edit3 className="w-3.5 h-3.5" />}
                            {registro.accion === 'DELETE' && <Trash2 className="w-3.5 h-3.5" />}
                            {getAccionLabel(registro.accion)}
                          </span>
                        </td>
                        <td className={`${styles.tabla.td} ${styles.tabla.tdTexto}`}>
                          <span className="font-medium capitalize">
                            {registro.modulo || '-'}
                          </span>
                        </td>
                        <td className={styles.tabla.td}>
                          <code className="bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {registro.tabla}
                          </code>
                        </td>
                        <td className={`${styles.tabla.td} ${styles.tabla.tdSubtexto}`}>
                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="w-3.5 h-3.5" />
                            {registro.usuarioEmail}
                          </div>
                        </td>
                        <td className={styles.tabla.td}>
                          <button
                            onClick={() => setRegistroDetalle(registro)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Mostrando {(paginaActual - 1) * 50 + 1} - {Math.min(paginaActual * 50, registros.length)} de {registros.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
