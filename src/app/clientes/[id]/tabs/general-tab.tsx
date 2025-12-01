'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle,
    Circle,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    TrendingUp,
    User
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { calculateAge, formatDateCompact } from '@/lib/utils/date.utils'
import { formatearDocumentoCompleto } from '@/lib/utils/documento.utils'
import { construirURLCliente } from '@/lib/utils/slug.utils'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import type { Cliente } from '@/modules/clientes/types'
import { ESTADOS_CIVILES } from '@/modules/clientes/types'

import * as styles from '../cliente-detalle.styles'

interface GeneralTabProps {
  cliente: Cliente
}

export function GeneralTab({ cliente }: GeneralTabProps) {
  const router = useRouter()

  // ✅ Hook de validación real de documento de identidad
  const { tieneCedula: tieneDocumento, cargando: cargandoValidacion } = useDocumentoIdentidad({
    clienteId: cliente.id
  })

  const estadisticas = cliente.estadisticas || {
    total_negociaciones: 0,
    negociaciones_activas: 0,
    negociaciones_completadas: 0,
  }

  const tieneNegociacionActiva = estadisticas.negociaciones_activas > 0

  const handleIniciarAsignacion = () => {
    if (!tieneDocumento) {
      // Cambiar a tab documentos
      window.dispatchEvent(new CustomEvent('cambiar-tab', { detail: 'documentos' }))
      return
    }

    // Navegar a crear negociación
    const clienteSlug = construirURLCliente({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    }).split('/').pop()

    router.push(
      `/clientes/${clienteSlug}/asignar-vivienda?nombre=${encodeURIComponent(cliente.nombres + ' ' + cliente.apellidos)}`
    )
  }

  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='space-y-3'
    >
      {/* Banner Informativo: Estado de Documentación (compacto) */}
      {!tieneNegociacionActiva && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-3 rounded-xl shadow-lg ${
            tieneDocumento
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-orange-500 to-amber-500'
          } text-white`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
              {tieneDocumento ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">
                {tieneDocumento
                  ? '✓ Cliente listo para asignar vivienda'
                  : '⚠ Acción requerida'}
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {tieneDocumento
                  ? 'Todos los documentos verificados. Presiona el botón "Asignar Vivienda" en la parte superior para iniciar el proceso.'
                  : 'Sube el documento de identidad del cliente en la pestaña "Documentos" para poder asignar una vivienda.'}
              </p>
            </div>

            {/* Checklist compacto */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cliente Registrado</span>
              </div>
              <div className="flex items-center gap-1">
                {tieneDocumento ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Documento de identidad Cargado</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas Comerciales */}
      {/* Estadísticas Comerciales */}
      <motion.div
        {...styles.animations.fadeInUp}
        transition={{ delay: 0.1 }}
        className={styles.progressClasses.container}
      >
        <div className={styles.progressClasses.header}>
          <div className={styles.progressClasses.leftSection}>
            <div className={styles.progressClasses.iconContainer}>
              <TrendingUp className={styles.progressClasses.icon} />
            </div>
            <div className={styles.progressClasses.titleSection}>
              <p className={styles.progressClasses.title}>
                Estadísticas Comerciales
              </p>
              <p className={styles.progressClasses.subtitle}>
                Resumen de actividad del cliente
              </p>
            </div>
          </div>
          <div className={styles.progressClasses.rightSection}>
            <p className={styles.progressClasses.percentage}>
              {estadisticas.total_negociaciones}
            </p>
            <p className={styles.progressClasses.percentageLabel}>
              Negociaciones
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className={styles.progressClasses.milestones}>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {estadisticas.total_negociaciones}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Total
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {estadisticas.negociaciones_activas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Activas
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {estadisticas.negociaciones_completadas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Completadas
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {(cliente as any).intereses?.length || 0}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Intereses
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cards de Información */}
      <div className='grid gap-3 lg:grid-cols-3'>
        {/* Información Personal */}
        <motion.div
          {...styles.animations.fadeInLeft}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cliente}`}
            >
              <User className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>
              Información Personal
            </h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <div className='space-y-2'>
              <div>
                <p className={styles.infoCardClasses.label}>Nombre Completo</p>
                <p className={styles.infoCardClasses.value}>{cliente.nombres} {cliente.apellidos}</p>
              </div>
              <div>
                <p className={styles.infoCardClasses.label}>Documento</p>
                <p className={styles.infoCardClasses.value}>
                  {formatearDocumentoCompleto(cliente.tipo_documento, cliente.numero_documento)}
                </p>
              </div>
              {cliente.fecha_nacimiento && (
                <div>
                  <p className={styles.infoCardClasses.label}>Fecha de Nacimiento</p>
                  <p className={styles.infoCardClasses.value}>
                    {formatDateCompact(cliente.fecha_nacimiento)} ({calculateAge(cliente.fecha_nacimiento)} años)
                  </p>
                </div>
              )}
              {cliente.estado_civil && (
                <div>
                  <p className={styles.infoCardClasses.label}>Estado Civil</p>
                  <p className={styles.infoCardClasses.value}>
                    {ESTADOS_CIVILES[cliente.estado_civil]}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Información de Contacto */}
        <motion.div
          {...styles.animations.fadeInLeft}
          transition={{ delay: 0.1 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.contacto}`}
            >
              <Phone className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Contacto</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <div className='space-y-2'>
              {cliente.telefono && (
                <div className={styles.infoCardClasses.row}>
                  <Phone className={styles.infoCardClasses.rowIcon} />
                  <span>{cliente.telefono}</span>
                </div>
              )}
              {cliente.telefono_alternativo && (
                <div className={styles.infoCardClasses.row}>
                  <Phone className={styles.infoCardClasses.rowIcon} />
                  <span>{cliente.telefono_alternativo}</span>
                </div>
              )}
              {cliente.email && (
                <div className={styles.infoCardClasses.row}>
                  <Mail className={styles.infoCardClasses.rowIcon} />
                  <span className='truncate'>{cliente.email}</span>
                </div>
              )}
              {!cliente.telefono && !cliente.email && (
                <p className='text-xs text-gray-500 dark:text-gray-400 italic'>
                  Sin información de contacto
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Ubicación */}
        <motion.div
          {...styles.animations.fadeInLeft}
          transition={{ delay: 0.2 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.ubicacion}`}
            >
              <MapPin className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Ubicación</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <div className='space-y-2'>
              {cliente.direccion && (
                <div>
                  <p className={styles.infoCardClasses.label}>Dirección</p>
                  <p className={styles.infoCardClasses.value}>{cliente.direccion}</p>
                </div>
              )}
              {cliente.ciudad && (
                <div>
                  <p className={styles.infoCardClasses.label}>Ciudad</p>
                  <p className={styles.infoCardClasses.value}>{cliente.ciudad}</p>
                </div>
              )}
              {cliente.departamento && (
                <div>
                  <p className={styles.infoCardClasses.label}>Departamento</p>
                  <p className={styles.infoCardClasses.value}>{cliente.departamento}</p>
                </div>
              )}
              {!cliente.direccion && !cliente.ciudad && (
                <p className='text-xs text-gray-500 dark:text-gray-400 italic'>
                  Sin información de ubicación
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notas (si existen) */}
      {cliente.notas && (
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.3 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.adicional}`}
            >
              <MessageSquare className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Notas y Observaciones</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <p className='text-sm text-gray-700 dark:text-gray-300'>{cliente.notas}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
