'use client'

import type { Proyecto } from '@/modules/proyectos/types'
import { formatCurrency, formatDate } from '@/shared/utils/format'
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

  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='grid gap-4 lg:grid-cols-2'
    >
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

      {/* Detalles Técnicos */}
      <motion.div
        {...styles.animations.fadeInLeft}
        transition={{ delay: 0.3 }}
        className={styles.infoCardClasses.card}
      >
        <div className={styles.infoCardClasses.header}>
          <div
            className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.detalles}`}
          >
            <Home className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>
            Detalles Técnicos
          </h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div>
            <p className={styles.infoCardClasses.label}>Presupuesto</p>
            <p className={styles.infoCardClasses.value}>
              {formatCurrency(proyecto.presupuesto)}
            </p>
          </div>
          <div className={styles.infoCardClasses.row}>
            <Home className={styles.infoCardClasses.rowIcon} />
            <span>
              Manzanas: <strong>{proyecto.manzanas.length}</strong>
            </span>
          </div>
          <div className={styles.infoCardClasses.row}>
            <Home className={styles.infoCardClasses.rowIcon} />
            <span>
              Total Viviendas: <strong>{totalViviendas}</strong>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cronograma */}
      <motion.div
        {...styles.animations.fadeInLeft}
        transition={{ delay: 0.4 }}
        className={`${styles.infoCardClasses.card} lg:col-span-2`}
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
    </motion.div>
  )
}
