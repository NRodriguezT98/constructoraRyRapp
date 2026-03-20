'use client'

import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'

import type { Cliente } from '@/modules/clientes/types'

import * as styles from '../../../cliente-detalle.styles'

const EMPTY = 'Sin registrar'

interface ContactoUbicacionCardProps {
  cliente: Cliente
}

const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export function ContactoUbicacionCard({ cliente }: ContactoUbicacionCardProps) {
  return (
    <motion.div
      {...fadeInLeft}
      transition={{ delay: 0.1 }}
      className={styles.infoCardClasses.card}
    >
      <div className={styles.infoCardClasses.header}>
        <div
          className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.contacto}`}
        >
          <Phone className={styles.infoCardClasses.icon} />
        </div>
        <h3 className={styles.infoCardClasses.title}>Contacto y Ubicación</h3>
      </div>
      <div className={styles.infoCardClasses.content}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {/* Teléfono Principal */}
          <div>
            <p className={styles.infoCardClasses.label}>Teléfono Principal</p>
            {cliente.telefono ? (
              <a
                href={`tel:${cliente.telefono}`}
                className={`${styles.infoCardClasses.value} hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors underline-offset-2 hover:underline`}
              >
                {cliente.telefono}
              </a>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">{EMPTY}</p>
            )}
          </div>

          {/* Teléfono Alternativo */}
          <div>
            <p className={styles.infoCardClasses.label}>Teléfono Alternativo</p>
            {cliente.telefono_alternativo ? (
              <a
                href={`tel:${cliente.telefono_alternativo}`}
                className={`${styles.infoCardClasses.value} hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors underline-offset-2 hover:underline`}
              >
                {cliente.telefono_alternativo}
              </a>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">{EMPTY}</p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className="col-span-2">
            <p className={styles.infoCardClasses.label}>Correo Electrónico</p>
            {cliente.email ? (
              <a
                href={`mailto:${cliente.email}`}
                className={`truncate block ${styles.infoCardClasses.value} hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors underline-offset-2 hover:underline`}
              >
                {cliente.email}
              </a>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">{EMPTY}</p>
            )}
          </div>

          {/* Separador */}
          <div className="col-span-2 border-t border-gray-200 dark:border-gray-700" />

          {/* Dirección */}
          <div className="col-span-2">
            <p className={styles.infoCardClasses.label}>Dirección</p>
            <p className={cliente.direccion ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.direccion || EMPTY}
            </p>
          </div>

          {/* Ciudad */}
          <div>
            <p className={styles.infoCardClasses.label}>Ciudad</p>
            <p className={cliente.ciudad ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.ciudad || EMPTY}
            </p>
          </div>

          {/* Departamento */}
          <div>
            <p className={styles.infoCardClasses.label}>Departamento</p>
            <p className={cliente.departamento ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.departamento || EMPTY}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
