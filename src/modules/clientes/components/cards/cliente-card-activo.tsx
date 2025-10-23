/**
 * 💳 ClienteCardActivo - Card premium con glassmorphism
 * Muestra vivienda, proyecto, progreso de pago con gradientes purple→violet
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Clock,
    Edit,
    Eye,
    Home,
    Trash2,
    TrendingUp,
    User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAvatarGradient } from '../../../abonos/styles/seleccion-cliente.styles'
import { clientesListaStyles as styles } from '../../styles/clientes-lista.styles'
import type { ClienteResumen } from '../../types'

interface ClienteCardActivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onRegistrarAbono?: (cliente: ClienteResumen) => void
}

interface DatosNegociacion {
  proyecto: string
  manzana: string
  numero: string
  valorTotal: number
  valorPagado: number
  porcentaje: number
  ultimaCuota: Date | null
  totalAbonos: number
}

export function ClienteCardActivo({
  cliente,
  onVer,
  onEditar,
  onEliminar,
  onRegistrarAbono
}: ClienteCardActivoProps) {
  const [datosVivienda, setDatosVivienda] = useState<DatosNegociacion | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatosNegociacion = async () => {
      try {
        setCargando(true)
        // Importar dinámicamente para evitar problemas de SSR
        const { supabase } = await import('@/lib/supabase/client-browser')

        // Obtener negociación activa del cliente con sus relaciones
        const { data: negociacion, error } = await supabase
          .from('negociaciones')
          .select(`
            id,
            valor_total,
            total_abonado,
            porcentaje_pagado,
            viviendas!negociaciones_vivienda_id_fkey (
              numero,
              manzanas!viviendas_manzana_id_fkey (
                nombre,
                proyectos!manzanas_proyecto_id_fkey (
                  nombre
                )
              )
            ),
            abonos_historial!abonos_historial_negociacion_id_fkey (
              fecha_abono
            )
          `)
          .eq('cliente_id', cliente.id)
          .eq('estado', 'Activa')
          .order('fecha_negociacion', { ascending: false })
          .limit(1)
          .maybeSingle() // ✅ Cambio: Permite 0 o 1 resultado sin error

        if (error) {
          console.error('❌ Error consultando negociación activa:', error)
          setDatosVivienda(null)
          return
        }

        if (!negociacion) {
          console.warn('⚠️ Cliente activo sin negociación encontrada')
          setDatosVivienda(null)
          return
        }

        // Obtener última fecha de abono
        const abonos = (negociacion.abonos_historial || []) as Array<{ fecha_abono: string }>
        const ultimaCuota = abonos.length > 0
          ? new Date(abonos.sort((a, b) =>
              new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
            )[0].fecha_abono)
          : null

        setDatosVivienda({
          proyecto: negociacion.viviendas?.manzanas?.proyectos?.nombre || 'Sin proyecto',
          manzana: negociacion.viviendas?.manzanas?.nombre || '-',
          numero: negociacion.viviendas?.numero || '-',
          valorTotal: negociacion.valor_total || 0,
          valorPagado: negociacion.total_abonado || 0,
          porcentaje: Math.round(negociacion.porcentaje_pagado || 0),
          ultimaCuota,
          totalAbonos: abonos.length,
        })
      } catch (err) {
        console.error('Error cargando datos de negociación:', err)
        setDatosVivienda(null)
      } finally {
        setCargando(false)
      }
    }

    cargarDatosNegociacion()
  }, [cliente.id])

  const valorRestante = datosVivienda ? datosVivienda.valorTotal - datosVivienda.valorPagado : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const tiempoUltimaCuota = datosVivienda?.ultimaCuota
    ? formatDistanceToNow(datosVivienda.ultimaCuota, {
        addSuffix: true,
        locale: es
      })
    : null

  // Si está cargando, mostrar skeleton
  if (cargando) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.clienteCard.container}
      >
        <div className={styles.clienteCard.glow} />
        <div className="p-5 space-y-4">
          <div className={`h-6 w-48 ${styles.clienteCard.skeleton}`} />
          <div className={`h-4 w-32 ${styles.clienteCard.skeleton}`} />
          <div className={`h-24 ${styles.clienteCard.skeleton}`} />
          <div className={`h-32 ${styles.clienteCard.skeleton}`} />
        </div>
      </motion.div>
    )
  }

  // Si no hay datos de negociación, mostrar mensaje
  if (!datosVivienda) {
    const avatarGradient = getAvatarGradient(cliente.nombre_completo)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.clienteCard.container}
      >
        <div className={styles.clienteCard.glow} />

        <div className="relative z-10 p-5">
          {/* Botones de acción */}
          <div className={styles.clienteCard.headerActions}>
            {onVer && (
              <button
                type="button"
                onClick={() => onVer(cliente)}
                className={styles.clienteCard.actionButton}
                title="Ver detalles"
              >
                <Eye className={styles.clienteCard.actionIcon} />
              </button>
            )}
            {onEditar && (
              <button
                type="button"
                onClick={() => onEditar(cliente)}
                className={styles.clienteCard.actionButton}
                title="Editar cliente"
              >
                <Edit className={styles.clienteCard.actionIcon} />
              </button>
            )}
            {onEliminar && (
              <button
                type="button"
                onClick={() => onEliminar(cliente)}
                className={styles.clienteCard.actionButton}
                title="Eliminar cliente"
              >
                <Trash2 className={styles.clienteCard.actionIcon} />
              </button>
            )}
          </div>

          {/* Avatar + título */}
          <div className={styles.clienteCard.avatarSection}>
            <div className={`${styles.clienteCard.avatar} bg-gradient-to-br ${avatarGradient}`}>
              <User className={styles.clienteCard.avatarIcon} />
            </div>
            <div className={styles.clienteCard.titleGroup}>
              <h3 className={styles.clienteCard.nombre} title={cliente.nombre_completo}>
                {cliente.nombre_completo}
              </h3>
              <p className={styles.clienteCard.documento}>
                {cliente.tipo_documento} {cliente.numero_documento}
              </p>
            </div>
            <span className={styles.clienteCard.badgeActivo}>Activo</span>
          </div>

          {/* Mensaje sin negociación */}
          <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:border-yellow-700/50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 text-center">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              ⚠️ Cliente activo sin negociación registrada
            </p>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Crea una negociación desde el detalle del cliente
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  const avatarGradient = getAvatarGradient(cliente.nombre_completo)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={styles.clienteCard.container}
    >
      {/* Glow effect on hover */}
      <div className={styles.clienteCard.glow} />

      {/* Content wrapper */}
      <div className="relative z-10 p-5">
        {/* HEADER: Botones de acción */}
        <div className={styles.clienteCard.headerActions}>
          {onVer && (
            <button
              type="button"
              onClick={() => onVer(cliente)}
              className={styles.clienteCard.actionButton}
              title="Ver detalles"
            >
              <Eye className={styles.clienteCard.actionIcon} />
            </button>
          )}
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(cliente)}
              className={styles.clienteCard.actionButton}
              title="Editar cliente"
            >
              <Edit className={styles.clienteCard.actionIcon} />
            </button>
          )}
          {onEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(cliente)}
              className={styles.clienteCard.actionButton}
              title="Eliminar cliente"
            >
              <Trash2 className={styles.clienteCard.actionIcon} />
            </button>
          )}
        </div>

        {/* AVATAR + TÍTULO + BADGE */}
        <div className={styles.clienteCard.avatarSection}>
          {/* Avatar con gradient único */}
          <div className={`${styles.clienteCard.avatar} bg-gradient-to-br ${avatarGradient}`}>
            <User className={styles.clienteCard.avatarIcon} />
          </div>

          {/* Título y documento */}
          <div className={styles.clienteCard.titleGroup}>
            <h3 className={styles.clienteCard.nombre} title={cliente.nombre_completo}>
              {cliente.nombre_completo}
            </h3>
            <p className={styles.clienteCard.documento}>
              {cliente.tipo_documento} {cliente.numero_documento}
            </p>
          </div>

          {/* Badge estado */}
          <span className={styles.clienteCard.badgeActivo}>
            Activo
          </span>
        </div>

        {/* SECCIÓN: VIVIENDA ASIGNADA */}
        <div className={styles.clienteCard.viviendaSection}>
          <div className={styles.clienteCard.viviendaHeader}>
            <Home className={styles.clienteCard.viviendaIcon} />
            <span>VIVIENDA ASIGNADA</span>
          </div>

          <div className={styles.clienteCard.viviendaInfo}>
            {/* Proyecto */}
            <div className={styles.clienteCard.viviendaRow}>
              <Building2 className={styles.clienteCard.viviendaRowIcon} />
              <span className="font-medium">{datosVivienda.proyecto}</span>
            </div>

            {/* Manzana + Casa + Valor */}
            <div className={styles.clienteCard.viviendaRowBetween}>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>
                  Manzana {datosVivienda.manzana} • Casa {datosVivienda.numero}
                </span>
              </div>
              <span className={styles.clienteCard.viviendaValor}>
                {formatCurrency(datosVivienda.valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN: PROGRESO DE PAGO */}
        <div className={styles.clienteCard.progresoSection}>
          {/* Header con porcentaje */}
          <div className={styles.clienteCard.progresoHeader}>
            <div className={styles.clienteCard.progresoTitle}>
              <TrendingUp className={styles.clienteCard.progresoIcon} />
              <span>PROGRESO DE PAGO</span>
            </div>
            <span className={styles.clienteCard.progresoPorcentaje}>
              {datosVivienda.porcentaje}%
            </span>
          </div>

          {/* Barra de progreso con gradient purple */}
          <div className={styles.clienteCard.progresoBar}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${datosVivienda.porcentaje}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className={styles.clienteCard.progresoFill}
            />
          </div>

          {/* Detalle: Pagado + Restante */}
          <div className={styles.clienteCard.progresoDetalle}>
            <div className={styles.clienteCard.progresoDetalleRow}>
              <span className={styles.clienteCard.progresoDetalleLabel}>Pagado:</span>
              <span className={styles.clienteCard.progresoDetalleValue}>
                {formatCurrency(datosVivienda.valorPagado)}
              </span>
            </div>
            <div className={styles.clienteCard.progresoDetalleRow}>
              <span className={styles.clienteCard.progresoDetalleLabel}>Restante:</span>
              <span className={styles.clienteCard.progresoDetalleRestante}>
                {formatCurrency(valorRestante)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER: Última cuota + Total abonos */}
        <div className={styles.clienteCard.footer}>
          <div className={styles.clienteCard.footerRow}>
            <div className={styles.clienteCard.footerItem}>
              <Clock className={styles.clienteCard.footerIcon} />
              <span>
                {tiempoUltimaCuota
                  ? `Última cuota: ${tiempoUltimaCuota}`
                  : 'Sin abonos registrados'}
              </span>
            </div>
            <div className={styles.clienteCard.footerItem}>
              <Calendar className={styles.clienteCard.footerIcon} />
              <span>{datosVivienda.totalAbonos} abonos</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
