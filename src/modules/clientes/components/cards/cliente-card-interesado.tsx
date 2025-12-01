/**
 * ClienteCardInteresado - Card para clientes en estado "Interesado"
 *
 * ✅ Muestra: Interés manifestado, proyecto/vivienda de interés, contacto
 * ✅ Tema: Cyan/Azul
 * ✅ Diseño consistente con sistema base
 */

'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  Edit,
  Eye,
  Home,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'

import { useClienteIntereses } from '../../hooks/useClienteIntereses'
import type { ClienteResumen } from '../../types'
import {
  clienteCardThemes,
  clienteCardBaseStyles as styles
} from './cliente-card-base.styles'

interface ClienteCardInteresadoProps {
  cliente: ClienteResumen
  tieneCedula?: boolean
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInteresado({
  cliente,
  tieneCedula = false,
  onVer,
  onEditar,
  onEliminar,
}: ClienteCardInteresadoProps) {
  const theme = clienteCardThemes.Interesado

  // Cargar intereses del cliente
  const { intereses, isLoading } = useClienteIntereses(cliente.id)

  // Obtener el interés más reciente
  const interesActual = intereses && intereses.length > 0 ? intereses[0] : null
  const tieneNegociacion = cliente.estadisticas.negociaciones_activas > 0 || cliente.estadisticas.negociaciones_completadas > 0

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

        {/* HEADER: Icono + Título + Badges */}
        <div className={styles.header.titleSection}>
          <div className={`${styles.header.icon} ${theme.bg}`}>
            <User className={styles.header.iconSize} />
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
              INTERESADO
            </span>
          </div>
        </div>
        </div>

        {/* SECCIÓN: Información de Contacto - HORIZONTAL */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-l-4 border-cyan-500 dark:border-cyan-400">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/30">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{cliente.telefono || 'Sin teléfono'}</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                {cliente.email || 'Sin email'}
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-cyan-500 dark:bg-cyan-600">
            <Mail className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* SECCIÓN: Interés Manifestado - HORIZONTAL */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="px-3 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : interesActual ? (
            <>
              {/* Proyecto destacado */}
              <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-0.5">Proyecto de Interés</p>
                    <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                      {interesActual.proyecto_nombre || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manzana y Vivienda */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-2.5 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <p className="text-[9px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Manzana</p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    {interesActual.manzana_nombre || 'N/A'}
                  </p>
                </div>

                <div className="px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Vivienda</p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    Casa {interesActual.vivienda_numero || 'N/A'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 opacity-60">
              <div className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700">
                <Home className="w-4 h-4 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                Sin interés registrado
              </p>
            </div>
          )}
        </div>

        {/* Botón: Ver Interés - Diseño Premium */}
        {interesActual && (
          <motion.button
            onClick={() => {
              console.log('Ver interés del cliente:', cliente.id)
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Ver Interés</span>
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
