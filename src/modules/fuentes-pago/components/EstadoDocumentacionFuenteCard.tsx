/**
 * ============================================
 * COMPONENTE: Estado de Documentación de Fuente
 * ============================================
 *
 * Card compacto que muestra el estado de requisitos de documentación
 * de una fuente de pago (semáforo visual).
 *
 * ✅ COMPONENTE PRESENTACIONAL
 * - Lógica en hook useEstadoDocumentacionFuente
 * - Diseño compacto y profesional
 * - Esquema de colores dinámico por estado
 * - Iconos lucide-react
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileCheck,
    FileSignature,
    Loader2,
    Lock,
    Send,
    Upload,
} from 'lucide-react'

import { useEstadoDocumentacionFuente } from '@/modules/fuentes-pago/hooks/useEstadoDocumentacionFuente'
import type { RequisitoDocumento } from '@/modules/fuentes-pago/services/requisitos.service'

import {
    getEstadoClasses,
    estadoDocumentacionStyles as styles,
} from './EstadoDocumentacionFuenteCard.styles'

// ============================================
// TYPES
// ============================================

interface EstadoDocumentacionFuenteCardProps {
  fuentePagoId: string
  onSubirDocumento?: (requisito: RequisitoDocumento) => void
  compact?: boolean
  compacto?: boolean // Alias en español
}

// ============================================
// HELPERS
// ============================================

const ICONOS_MAP = {
  FileCheck,
  FileSignature,
  Send,
} as const

const getIconoPorNombre = (nombre: string) => {
  return ICONOS_MAP[nombre as keyof typeof ICONOS_MAP] || FileCheck
}

// ============================================
// COMPONENTE
// ============================================

export function EstadoDocumentacionFuenteCard({
  fuentePagoId,
  onSubirDocumento,
  compact = false,
  compacto = false,
}: EstadoDocumentacionFuenteCardProps) {
  const { estado, loading, error } = useEstadoDocumentacionFuente(fuentePagoId)
  const [expandido, setExpandido] = useState(false)

  // Determinar si usar modo compacto (cualquiera de las dos props)
  const modoCompacto = compact || compacto

  // Configuración del semáforo
  const semaforoConfig = useMemo(() => {
    if (!estado) return null

    const IconComponent =
      estado.estado_general === 'completo'
        ? CheckCircle2
        : estado.estado_general === 'advertencia'
          ? AlertCircle
          : Lock

    const labels = {
      completo: {
        title: 'Lista para desembolso',
        description: 'Todos los documentos obligatorios están completos',
      },
      advertencia: {
        title: 'Advertencia',
        description: 'Puedes desembolsar, pero faltan documentos opcionales',
      },
      bloqueado: {
        title: 'Desembolso bloqueado',
        description: 'Completa los documentos obligatorios antes de continuar',
      },
    }

    return {
      icon: IconComponent,
      colors: getEstadoClasses(estado.estado_general),
      labels: labels[estado.estado_general],
    }
  }, [estado])

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className={`${styles.card.base} border-gray-200 dark:border-gray-700`}>
        <div className={styles.loading.container}>
          <Loader2 className={styles.loading.spinner} />
        </div>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error || !estado || !semaforoConfig) {
    return (
      <div className={`${styles.card.base} border-red-200 dark:border-red-800`}>
        <div className={styles.empty.container}>
          <AlertCircle className={styles.empty.icon} />
          <p className={styles.empty.text}>
            {error?.message || 'No se pudo cargar el estado de documentación'}
          </p>
        </div>
      </div>
    )
  }

  const { icon: Icon, colors, labels } = semaforoConfig
  const { validacion } = estado

  // ============================================
  // RENDER
  // Versión COMPACTA COLAPSABLE (minimalista)
  if (modoCompacto) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}
      >
        {/* Header Compacto (siempre visible) */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${colors.icon}`} />
            <span className={`text-xs font-semibold ${colors.text}`}>
              {labels.title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.badge}`}>
              {validacion.requisitos_completados}/{validacion.total_requisitos}
            </span>
          </div>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Contenido Expandible */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              {/* Progreso */}
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/30">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${estado.progreso_porcentaje}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full bg-gradient-to-r ${colors.gradient}`}
                  />
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  {estado.progreso_porcentaje}% completado
                  {validacion.obligatorios_faltantes > 0 && (
                    <> • {validacion.obligatorios_faltantes} obligatorio(s)</>
                  )}
                </p>
              </div>

              {/* Documentos Faltantes */}
              {validacion.documentos_faltantes.length > 0 && (
                <div className="px-3 py-2 space-y-1">
                  {validacion.documentos_faltantes.slice(0, 3).map((doc) => {
                    const IconoDoc = getIconoPorNombre(doc.icono)
                    return (
                      <div
                        key={doc.tipo_documento}
                        className="flex items-center gap-2 text-[11px]"
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${
                            doc.es_obligatorio ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                        />
                        <IconoDoc className={`w-3 h-3 ${colors.icon}`} />
                        <span className={`flex-1 ${colors.text} truncate`}>
                          {doc.tipo_documento}
                        </span>
                        {!doc.es_obligatorio && (
                          <span className="text-[9px] text-gray-500">Opc</span>
                        )}
                      </div>
                    )
                  })}
                  {validacion.documentos_faltantes.length > 3 && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right">
                      +{validacion.documentos_faltantes.length - 3} más
                    </p>
                  )}
                </div>
              )}

              {/* Documentos Completados */}
              {validacion.documentos_completados.length > 0 && (
                <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
                  <p className="text-[10px] text-green-600 dark:text-green-400">
                    ✓ {validacion.documentos_completados.length} documento(s) completo(s)
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Versión COMPLETA (modo normal)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${styles.card.base} ${colors.bg} ${colors.border} ${styles.card.hover}`}
    >
      {/* HEADER */}
      <div className={styles.header.container}>
        {/* Ícono de estado */}
        <div
          className={`${styles.header.iconWrapper} ${colors.bgLight}`}
        >
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>

        {/* Contenido */}
        <div className={styles.header.contentWrapper}>
          <h4 className={`${styles.header.title} ${colors.text}`}>{labels.title}</h4>
          <p className={`${styles.header.description} ${colors.textMuted}`}>
            {labels.description}
          </p>
        </div>

        {/* Badge de progreso */}
        <div className={styles.header.badge}>
          <span className={`${styles.badge.base} ${colors.badge}`}>
            {validacion.requisitos_completados}/{validacion.total_requisitos}
          </span>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className={styles.progress.container}>
        <div className={styles.progress.wrapper}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${estado.progreso_porcentaje}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`${styles.progress.bar} bg-gradient-to-r ${colors.gradient}`}
          />
        </div>
        <p className={styles.progress.label}>
          {estado.progreso_porcentaje}% completado
          {validacion.obligatorios_faltantes > 0 && (
            <> • {validacion.obligatorios_faltantes} obligatorio(s) faltante(s)</>
          )}
        </p>
      </div>

      {/* DOCUMENTOS FALTANTES */}
      {validacion.documentos_faltantes.length > 0 && (
        <div className={styles.documentos.container}>
          <p className={styles.documentos.header}>Documentos pendientes</p>
          {validacion.documentos_faltantes.map((doc) => {
            const IconoDoc = getIconoPorNombre(doc.icono)
            return (
              <div key={doc.tipo_documento} className={styles.documentos.item.container}>
                {/* Lado izquierdo */}
                <div className={styles.documentos.item.left}>
                  {/* Indicador obligatorio/opcional */}
                  <div
                    className={`${styles.documentos.item.indicator} ${
                      doc.es_obligatorio
                        ? 'bg-red-500 dark:bg-red-400'
                        : 'bg-gray-400 dark:bg-gray-500'
                    }`}
                  />

                  {/* Ícono del documento */}
                  <IconoDoc className={`w-3.5 h-3.5 ${colors.icon} flex-shrink-0`} />

                  {/* Nombre del documento */}
                  <span className={`${styles.documentos.item.text} ${colors.text}`}>
                    {doc.tipo_documento}
                  </span>

                  {/* Badge opcional */}
                  {!doc.es_obligatorio && (
                    <span
                      className={`${styles.documentos.item.badge} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
                    >
                      Opcional
                    </span>
                  )}
                </div>

                {/* Botón subir */}
                {onSubirDocumento && (
                  <button
                    onClick={() => onSubirDocumento(doc)}
                    className={styles.documentos.item.button}
                    title={`Subir ${doc.tipo_documento}`}
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
