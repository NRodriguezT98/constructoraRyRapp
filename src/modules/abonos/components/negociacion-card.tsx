'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Building2, CreditCard, Home, MapPin, User } from 'lucide-react'
import { negociacionCardStyles as styles } from '../styles'
import { NegociacionConAbonos } from '../types'

interface NegociacionCardProps {
  negociacion: NegociacionConAbonos
  onRegistrarAbono?: (negociacion: NegociacionConAbonos) => void
}

/**
 * Componente presentacional puro para tarjetas de negociación
 * Diseño compacto, profesional, con dark mode
 * Sin lógica de negocio - solo UI
 */
export function NegociacionCard({
  negociacion,
  onRegistrarAbono,
}: NegociacionCardProps) {
  const { cliente, vivienda, proyecto, fuentes_pago } = negociacion

  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const valorTotal = negociacion.valor_total || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  // Construir nombre completo del cliente
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()

  return (
    <motion.div
      className={styles.container.base}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header con información del cliente */}
      <div className={styles.header.wrapper}>
        <div className={styles.header.clienteContainer}>
          <div className={styles.header.clienteInfo}>
            <div className={styles.header.iconWrapper}>
              <User className={styles.header.icon} />
            </div>
            <div>
              <h3 className={styles.header.nombre}>
                {nombreCompleto}
              </h3>
              <p className={styles.header.documento}>
                CC {cliente.numero_documento}
              </p>
            </div>
          </div>
        </div>

        {/* Información del proyecto */}
        {proyecto && (
          <div className={styles.proyecto.container}>
            <Building2 className={styles.proyecto.icon} />
            <span className={styles.proyecto.text}>
              {proyecto.nombre}
            </span>
            {proyecto.ubicacion && (
              <>
                <span>•</span>
                <MapPin className={styles.proyecto.icon} />
                <span>{proyecto.ubicacion}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className={styles.content.wrapper}>
        {/* Detalles de la vivienda */}
        {vivienda && (
          <div className={styles.vivienda.container}>
            <div className={styles.vivienda.item}>
              <Home className={styles.vivienda.icon} />
              <span className={styles.vivienda.label}>Vivienda:</span>
              <span className={styles.vivienda.value}>{vivienda.numero}</span>
            </div>
            <div className={styles.vivienda.item}>
              <Building2 className={styles.vivienda.icon} />
              <span className={styles.vivienda.label}>Área:</span>
              <span className={styles.vivienda.value}>{vivienda.area} m²</span>
            </div>
          </div>
        )}

        {/* Resumen financiero */}
        <div className={styles.financiero.container}>
          <div className={styles.financiero.row}>
            <span className={styles.financiero.label}>Valor Total:</span>
            <span className={styles.financiero.valor}>
              ${valorTotal.toLocaleString('es-CO')}
            </span>
          </div>
          <div className={styles.financiero.row}>
            <span className={styles.financiero.label}>Total Abonado:</span>
            <span className={styles.financiero.valorAbonado}>
              ${totalAbonado.toLocaleString('es-CO')}
            </span>
          </div>
          <div className={styles.financiero.row}>
            <span className={styles.financiero.label}>Saldo Pendiente:</span>
            <span className={styles.financiero.valorPendiente}>
              ${saldoPendiente.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={styles.progreso.wrapper}>
          <div className={styles.progreso.container}>
            <div
              className={styles.progreso.barra}
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
          <div className={styles.progreso.label}>
            <span className={styles.progreso.texto}>Progreso de pago</span>
            <span className={styles.progreso.porcentaje}>
              {porcentajePagado.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Fuentes de pago */}
        {fuentes_pago && fuentes_pago.length > 0 && (
          <div className={styles.fuentes.container}>
            <h4 className={styles.fuentes.titulo}>Fuentes de Pago</h4>
            <div className={styles.fuentes.lista}>
              {fuentes_pago.map((fuente) => {
                const porcentajeFuente =
                  fuente.monto_aprobado > 0
                    ? ((fuente.monto_recibido || 0) / fuente.monto_aprobado) *
                      100
                    : 0

                return (
                  <div key={fuente.id} className={styles.fuentes.item}>
                    <div className={styles.fuentes.itemHeader}>
                      <span className={styles.fuentes.tipo}>{fuente.tipo}</span>
                      <span className={styles.fuentes.montos}>
                        ${(fuente.monto_recibido || 0).toLocaleString('es-CO')} / ${fuente.monto_aprobado.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className={styles.fuentes.progreso}>
                      <div
                        className={`${styles.fuentes.progresoFill} ${
                          porcentajeFuente >= 100
                            ? styles.fuentes.progresoCompleto
                            : styles.fuentes.progresoParcial
                        }`}
                        style={{ width: `${Math.min(porcentajeFuente, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className={styles.footer.wrapper}>
        <span
          className={`${styles.footer.badge} ${
            negociacion.estado === 'Activa'
              ? styles.footer.badgeActiva
              : styles.footer.badgePendiente
          }`}
        >
          {negociacion.estado}
        </span>

        <Button
          onClick={() => onRegistrarAbono?.(negociacion)}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Registrar Abono
        </Button>
      </div>
    </motion.div>
  )
}
