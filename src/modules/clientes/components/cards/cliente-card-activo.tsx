/**
 * ClienteCardActivo - Card para clientes en estado "Activo"
 *
 * ✅ Muestra: Vivienda asignada, manzana, valor, abonos, saldo, progreso
 * ✅ Tema: Verde/Esmeralda
 * ✅ Panel financiero completo con métricas
 */

'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Home,
  Trash2,
  TrendingUp,
  UserCheck,
  Wallet
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'

import { useClienteCardActivo } from '../../hooks/useClienteCardActivo'
import type { ClienteResumen } from '../../types'
import {
  clienteCardThemes,
  clienteCardBaseStyles as styles,
} from './cliente-card-base.styles'

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
  onRegistrarAbono,
}: ClienteCardActivoProps) {
  const theme = clienteCardThemes.Activo

  // Cargar datos reales de la negociación
  const { datosVivienda, cargando } = useClienteCardActivo({ clienteId: cliente.id })

  // Formatear moneda COP
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Si está cargando, mostrar skeleton
  if (cargando) {
    return (
      <div className={`${styles.container} ${theme.hoverShadow} animate-pulse`}>
        <div className={styles.content}>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    )
  }

  // Si no hay datos, mostrar mensaje
  if (!datosVivienda) {
    return (
      <div className={`${styles.container} ${theme.hoverShadow}`}>
        <div className={styles.content}>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se encontró negociación activa
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`${styles.container} ${theme.hoverShadow}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo */}
      <div className={`${styles.glow} ${theme.glow}`} />

      <div className={`${styles.content} grid grid-rows-[85px_45px_95px_42px_auto] gap-3`}>
        {/* HEADER COMPLETO */}
        <div className={styles.header.container}>
          {/* HEADER: Botones de acción */}
          <div className={styles.header.actions}>
          {onVer && (
            <button onClick={() => onVer(cliente)} className={styles.header.actionButton} title="Ver detalle">
              <Eye className={styles.header.iconSize} />
            </button>
          )}
          {onEditar && (
            <button onClick={() => onEditar(cliente)} className={styles.header.actionButton} title="Editar">
              <Edit className={styles.header.iconSize} />
            </button>
          )}
          {onEliminar && (
            <button onClick={() => onEliminar(cliente)} className={styles.header.actionButtonDelete} title="Eliminar">
              <Trash2 className={styles.header.iconSize} />
            </button>
          )}
        </div>

        {/* HEADER: Icono + Título + Badge */}
        <div className={styles.header.titleSection}>
          <div className={`${styles.header.icon} ${theme.bg}`}>
            <UserCheck className={styles.header.iconSize} />
          </div>

          <div className={styles.header.info}>
            <h3 className={styles.header.title}>{cliente.nombre_completo}</h3>
            <p className={styles.header.documento}>
              <span className={`${styles.header.documentoLabel} ${theme.text}`}>
                {cliente.tipo_documento}
              </span>
              {cliente.numero_documento}
            </p>
            {cliente.estado_civil && (
              <p className={styles.header.estadoCivil}>{cliente.estado_civil}</p>
            )}
          </div>

          <div className={styles.header.badges}>
            {/* Badge principal de estado */}
            <span className={`${styles.header.badge} ${theme.badge} ${theme.shadow}`}>
              <div className={styles.header.badgeDot} />
              ACTIVO
            </span>
          </div>
        </div>
        </div>

        {/* SECCIÓN: Vivienda Asignada - HORIZONTAL */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-l-4 border-emerald-500 dark:border-emerald-400">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{datosVivienda.proyecto}</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                Mzna. {datosVivienda.manzana} • Casa {datosVivienda.numero}
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500 dark:bg-emerald-600">
            <Home className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* SECCIÓN: Panel Financiero Compacto (Grid 2x2) */}
        <div className={`${styles.section.container} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-700/50 p-2.5 overflow-hidden transition-all duration-200 hover:shadow-md`}>
          <div className={`${styles.section.title} text-blue-700 dark:text-blue-300 mb-1.5 text-sm font-extrabold tracking-wide`}>
            <DollarSign className="w-3.5 h-3.5" />
            INFORMACIÓN FINANCIERA
          </div>

          {/* Grid 2x2 */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Valor Total */}
            <div className="flex items-center gap-1">
              <div className="p-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Wallet className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</p>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate">
                  {formatCurrency(datosVivienda.valorTotal)}
                </p>
              </div>
            </div>

            {/* Total Abonado */}
            <div className="flex items-center gap-1">
              <div className={`p-0.5 rounded-md ${theme.bgLight}`}>
                <TrendingUp className={`w-2.5 h-2.5 ${theme.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Abonado</p>
                <p className={`text-[10px] font-bold ${theme.text} truncate`}>
                  {formatCurrency(datosVivienda.valorPagado)}
                </p>
              </div>
            </div>

            {/* Saldo Pendiente */}
            <div className="flex items-center gap-1">
              <div className="p-0.5 rounded-md bg-red-100 dark:bg-red-900/30">
                <DollarSign className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Saldo</p>
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(datosVivienda.saldoPendiente)}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="flex items-center gap-1">
              <div className={`p-0.5 rounded-md ${theme.bgLight}`}>
                <TrendingUp className={`w-2.5 h-2.5 ${theme.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Progreso</p>
                <p className={`text-[10px] font-bold ${theme.text}`}>
                  {datosVivienda.porcentaje}%
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progreso compacta */}
          <div className="mt-1.5">
            <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 ${theme.bg} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${datosVivienda.porcentaje}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Botón: Registrar Abono - Diseño Premium */}
        {onRegistrarAbono && (
          <motion.button
            onClick={() => onRegistrarAbono(cliente)}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>Registrar Abono</span>
            </div>
          </motion.button>
        )}

        {/* FOOTER: Fecha de registro */}
        <div className={styles.footer.container}>
          <div className={styles.footer.text}>
            <Calendar className={styles.footer.icon} />
            <span>Registrado {formatDateShort(cliente.fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
