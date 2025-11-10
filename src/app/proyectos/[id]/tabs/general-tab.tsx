'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Home,
    Mail,
    MapPin,
    Phone,
    Users
} from 'lucide-react'

import type { Proyecto } from '@/modules/proyectos/types'
import { formatCurrency, formatDate } from '@/shared/utils/format'

import * as styles from '../proyecto-detalle.styles'

interface GeneralTabProps {
  proyecto: Proyecto
}

export function GeneralTab({ proyecto }: GeneralTabProps) {
  // Calcular total de viviendas
  const totalViviendas = proyecto.manzanas.reduce(
    (acc, manzana) => acc + (manzana.totalViviendas || 0),
    0
  )

  // Stats data
  const statsData = [
    {
      icon: Building2,
      label: 'Presupuesto Total',
      value: formatCurrency(proyecto.presupuesto),
      gradient: styles.gradients.presupuesto,
    },
    {
      icon: Home,
      label: 'Manzanas',
      value: proyecto.manzanas.length,
      gradient: styles.gradients.manzanas,
    },
    {
      icon: Home,
      label: 'Viviendas',
      value: totalViviendas,
      gradient: styles.gradients.viviendas,
    },
    {
      icon: Calendar,
      label: 'Creado',
      value: formatDate(proyecto.fechaCreacion),
      gradient: styles.gradients.fecha,
    },
  ]

  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='space-y-4'
    >
      {/* Barra de Progreso Mejorada */}
      <motion.div
        {...styles.animations.fadeInUp}
        transition={{ delay: 0.1 }}
        className={styles.progressClasses.container}
      >
        <div className={styles.progressClasses.header}>
          <div className={styles.progressClasses.leftSection}>
            <div className={styles.progressClasses.iconContainer}>
              <Building2 className={styles.progressClasses.icon} />
            </div>
            <div className={styles.progressClasses.titleSection}>
              <p className={styles.progressClasses.title}>
                Progreso de Ventas
              </p>
              <p className={styles.progressClasses.subtitle}>
                Calculado según viviendas vendidas
              </p>
            </div>
          </div>
          <div className={styles.progressClasses.rightSection}>
            <p className={styles.progressClasses.percentage}>
              0%
            </p>
            <p className={styles.progressClasses.percentageLabel}>
              Vendidas
            </p>
          </div>
        </div>

        {/* Barra con gradiente animado */}
        <div className={styles.progressClasses.bar}>
          <motion.div
            className={styles.progressClasses.barFill}
            initial={{ width: 0 }}
            animate={{ width: '0%' }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
          >
            <div className={`${styles.progressClasses.shimmer} animate-shimmer`}></div>
          </motion.div>
        </div>

        {/* Milestones */}
        <div className={styles.progressClasses.milestones}>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalViviendas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Total
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>0</div>
            <div className={styles.progressClasses.milestoneLabel}>
              Vendidas
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalViviendas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Disponibles
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Mejorados */}
      <div className={styles.statsCardClasses.container}>
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.2 + index * 0.1 }}
            {...styles.animations.hoverLift}
            className={styles.statsCardClasses.card}
          >
            {/* Gradiente de fondo en hover */}
            <div
              className={`${styles.statsCardClasses.gradientOverlay} bg-gradient-to-br ${stat.gradient}`}
            ></div>

            <div className={styles.statsCardClasses.header}>
              <motion.div
                className={`${styles.statsCardClasses.iconWrapper} bg-gradient-to-br ${stat.gradient}`}
                {...styles.animations.hoverRotate}
              >
                <stat.icon className={styles.statsCardClasses.icon} />
              </motion.div>
              <div className={styles.statsCardClasses.content}>
                <p className={styles.statsCardClasses.value}>
                  {stat.value}
                </p>
                <p className={styles.statsCardClasses.label}>
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cards de Información */}
      <div className='grid gap-3 lg:grid-cols-3'>
      {/* Descripción */}
      <motion.div
        {...styles.animations.fadeInLeft}
        className={styles.infoCardClasses.card}
      >
        <div className={styles.infoCardClasses.header}>
          <div
            className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.descripcion}`}
          >
            <Building2 className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>
            Descripción del Proyecto
          </h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <p>{proyecto.descripcion}</p>
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
            <Users className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>
            Información de Contacto
          </h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div>
            <p className={styles.infoCardClasses.label}>Responsable</p>
            <p className={styles.infoCardClasses.value}>
              {proyecto.responsable}
            </p>
          </div>
          <div className={styles.infoCardClasses.row}>
            <Phone className={styles.infoCardClasses.rowIcon} />
            <span>{proyecto.telefono}</span>
          </div>
          <div className={styles.infoCardClasses.row}>
            <Mail className={styles.infoCardClasses.rowIcon} />
            <span>{proyecto.email}</span>
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
          <div className={styles.infoCardClasses.row}>
            <MapPin className={styles.infoCardClasses.rowIcon} />
            <span>{proyecto.ubicacion}</span>
          </div>
          {proyecto.estado && (
            <div className={styles.infoCardClasses.row}>
              <MapPin className={styles.infoCardClasses.rowIcon} />
              <span>{proyecto.estado}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cronograma */}
      <motion.div
        {...styles.animations.fadeInLeft}
        transition={{ delay: 0.3 }}
        className={`${styles.infoCardClasses.card} lg:col-span-3`}
      >
        <div className={styles.infoCardClasses.header}>
          <div
            className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cronograma}`}
          >
            <Calendar className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>Cronograma</h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <p className={styles.infoCardClasses.label}>Fecha de Inicio</p>
              <p className={styles.infoCardClasses.value}>
                {formatDate(proyecto.fechaInicio)}
              </p>
            </div>
            {proyecto.fechaFinEstimada && (
              <div>
                <p className={styles.infoCardClasses.label}>
                  Fecha de Finalización Estimada
                </p>
                <p className={styles.infoCardClasses.value}>
                  {formatDate(proyecto.fechaFinEstimada)}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
    </motion.div>
  )
}
