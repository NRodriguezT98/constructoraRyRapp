/**
 * ViviendaCardEntregada - Card para viviendas entregadas
 * Componente presentacional puro
 */

import { ProgressBar } from '@/shared/components/ui'
import { formatCurrency, formatDate } from '@/shared/utils'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, FileCheck, FileSignature, FileText, Home, MapPin, Phone, User } from 'lucide-react'
import { viviendaCardExtendedStyles as styles } from '../../styles'
import type { Vivienda } from '../../types'

interface ViviendaCardEntregadaProps {
  vivienda: Vivienda
  onVerAbonos?: () => void
  onGenerarEscritura?: () => void
  onEditar?: () => void
}

export function ViviendaCardEntregada({
  vivienda,
  onVerAbonos,
  onGenerarEscritura,
  onEditar,
}: ViviendaCardEntregadaProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const cliente = vivienda.clientes

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* HEADER */}
      <div className={`${styles.header.base} ${styles.header.pagada}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={styles.headerTitle}>
              <Home className="w-5 h-5" />
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className={styles.headerSubtitle}>
              <MapPin className="w-4 h-4" />
              {proyectoNombre}
            </p>
          </div>
          <span className={styles.estadoBadge.base}>
            ✅ Pagada
          </span>
        </div>
      </div>

      {/* BODY - 2 COLUMNAS */}
      <div className={styles.body}>
        {/* SECCIÓN PROPIETARIO - FULL WIDTH */}
        <div className={`${styles.clienteSection.container} !from-emerald-50 !to-green-50 dark:!from-emerald-900/20 dark:!to-green-900/20 !border-emerald-200 dark:!border-emerald-700`}>
          <div className={styles.clienteSection.nombre}>
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {cliente?.nombre_completo || 'Propietario'}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {cliente?.telefono && (
              <span className={styles.clienteSection.info}>
                <Phone className="w-4 h-4" />
                {cliente.telefono}
              </span>
            )}
            {vivienda.fecha_asignacion && (
              <span className={styles.clienteSection.info}>
                <Calendar className="w-4 h-4" />
                Asignada: {formatDate(vivienda.fecha_asignacion)}
              </span>
            )}
            {vivienda.fecha_pago_completo && (
              <span className={`${styles.clienteSection.info} !text-emerald-700 dark:!text-emerald-300 font-semibold`}>
                <CheckCircle2 className="w-4 h-4" />
                Pagada: {formatDate(vivienda.fecha_pago_completo)}
              </span>
            )}
          </div>
        </div>

        {/* GRID 2 COLUMNAS */}
        <div className={styles.twoColumnGrid}>
          {/* COLUMNA 1: INFORMACIÓN BÁSICA */}
          <div className={styles.section.base}>
            <h4 className={styles.section.title}>
              <FileText className="w-4 h-4" />
              Detalles Técnicos
            </h4>
            <div className={styles.section.content}>
              {/* Tipo + Esquinera */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`
                    ${styles.badge.base}
                    ${vivienda.tipo_vivienda === 'Irregular'
                      ? styles.badge.irregular
                      : styles.badge.regular
                    }
                  `}
                >
                  {vivienda.tipo_vivienda || 'Regular'}
                </span>
                {vivienda.es_esquinera && (
                  <span className={`${styles.badge.base} ${styles.badge.esquinera}`}>
                    🏘️ Esquinera
                  </span>
                )}
              </div>

              {/* Matrícula */}
              {vivienda.matricula_inmobiliaria && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Matrícula:</span>
                  <span className={styles.infoValue}>
                    {vivienda.matricula_inmobiliaria}
                  </span>
                </div>
              )}

              {/* Nomenclatura */}
              {vivienda.nomenclatura && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Nomenclatura:</span>
                  <span className={styles.infoValue}>{vivienda.nomenclatura}</span>
                </div>
              )}

              {/* Áreas */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Áreas:</span>
                <span className={styles.infoValue}>
                  {vivienda.area_construida ? `${vivienda.area_construida}m²` : 'N/A'}
                  {' / '}
                  {vivienda.area_lote ? `${vivienda.area_lote}m²` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: CONFIRMACIÓN DE PAGO */}
          <div className={styles.financialSection.container}>
            <div className={styles.pagadaConfirmation}>
              <div className={styles.pagadaIcon}>
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <p className={styles.pagadaText}>
                TOTALMENTE PAGADA
              </p>
              <p className="text-sm text-white/90 mt-1">
                {formatCurrency(vivienda.valor_total)}
              </p>
            </div>

            {/* Barra de progreso completa */}
            <div className="mt-3">
              <ProgressBar
                porcentaje={100}
                height="lg"
                variant="success"
                showPercentage={false}
              />
            </div>

            {/* Info adicional */}
            {vivienda.cantidad_abonos && vivienda.cantidad_abonos > 0 && (
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                Pagada en {vivienda.cantidad_abonos} abono{vivienda.cantidad_abonos > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - ACCIONES */}
      <div className={styles.footer}>
        <div className={styles.actionGroup}>
          {onVerAbonos && (
            <button
              onClick={onVerAbonos}
              className={styles.actionButton.secondary}
            >
              <FileCheck className="w-4 h-4" />
              Ver Abonos ({vivienda.cantidad_abonos || 0})
            </button>
          )}
          {onGenerarEscritura && (
            <button
              onClick={onGenerarEscritura}
              className={styles.actionButton.primary}
            >
              <FileSignature className="w-4 h-4" />
              Generar Escritura
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
