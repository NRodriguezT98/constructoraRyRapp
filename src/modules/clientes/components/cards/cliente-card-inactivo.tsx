/**
 * ClienteCardInactivo - Card para clientes en estado "Inactivo"
 *
 * ✅ Muestra: Motivo de inactividad, última actividad, contacto
 * ✅ Tema: Gris
 * ✅ Diseño minimalista para estado inactivo
 */

'use client'

import { motion } from 'framer-motion'
import {
    Calendar,
    Edit,
    Eye,
    Mail,
    Phone,
    Trash2,
    UserX,
    XCircle,
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'

import type { ClienteResumen } from '../../types'
import {
    clienteCardThemes,
    clienteCardBaseStyles as styles,
} from './cliente-card-base.styles'

interface ClienteCardInactivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInactivo({
  cliente,
  onVer,
  onEditar,
  onEliminar,
}: ClienteCardInactivoProps) {
  const theme = clienteCardThemes.Inactivo

  return (
    <motion.div
      className={`${styles.container} ${theme.hoverShadow}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo */}
      <div className={`${styles.glow} ${theme.glow}`} />

      <div className={styles.content}>
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
            <UserX className={styles.header.iconSize} />
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
              INACTIVO
            </span>
          </div>
        </div>

        {/* SECCIÓN: Estado de Inactividad */}
        <div className={`${styles.section.container} bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200/50 dark:border-red-700/50`}>
          <div className={`${styles.section.title} text-red-700 dark:text-red-300`}>
            <XCircle className={styles.section.titleIcon} />
            Estado de Inactividad
          </div>

          <div className="flex items-center gap-2 py-1">
            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium italic">
                Cliente marcado como inactivo
              </p>
              <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                Sin actividad reciente o proceso cancelado
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Información de Contacto */}
        <div className={`${styles.section.container} bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200/50 dark:border-slate-700/50`}>
          <div className={`${styles.section.title} text-slate-700 dark:text-slate-300`}>
            <Phone className={styles.section.titleIcon} />
            Información de Contacto
          </div>

          <div className={styles.section.content}>
            {/* Teléfono */}
            {cliente.telefono && (
              <div className={styles.item.container}>
                <div className={`${styles.item.icon} bg-blue-100 dark:bg-blue-900/30`}>
                  <Phone className={`${styles.item.iconSize} text-blue-600 dark:text-blue-400`} />
                </div>
                <div className={styles.item.info}>
                  <p className={styles.item.label}>Teléfono</p>
                  <p className={styles.item.value}>{cliente.telefono}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {cliente.email && (
              <div className={styles.item.container}>
                <div className={`${styles.item.icon} bg-purple-100 dark:bg-purple-900/30`}>
                  <Mail className={`${styles.item.iconSize} text-purple-600 dark:text-purple-400`} />
                </div>
                <div className={styles.item.info}>
                  <p className={styles.item.label}>Email</p>
                  <p className={styles.item.value}>{cliente.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

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
