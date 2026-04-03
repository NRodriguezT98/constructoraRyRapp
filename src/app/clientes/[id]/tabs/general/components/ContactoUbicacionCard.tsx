'use client'

import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'

import * as styles from '@/app/clientes/[id]/cliente-detalle.styles'
import type { Cliente } from '@/modules/clientes/types'

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
        <div className='grid grid-cols-2 gap-x-4 gap-y-2.5'>
          {/* Teléfono Principal */}
          <div>
            <p className={styles.infoCardClasses.label}>Teléfono Principal</p>
            {cliente.telefono ? (
              <a
                href={`tel:${cliente.telefono}`}
                className={`${styles.infoCardClasses.value} underline-offset-2 transition-colors hover:text-cyan-600 hover:underline dark:hover:text-cyan-400`}
              >
                {cliente.telefono}
              </a>
            ) : (
              <p className='text-xs italic text-gray-400 dark:text-gray-500'>
                {EMPTY}
              </p>
            )}
          </div>

          {/* Teléfono Alternativo */}
          <div>
            <p className={styles.infoCardClasses.label}>Teléfono Alternativo</p>
            {cliente.telefono_alternativo ? (
              <a
                href={`tel:${cliente.telefono_alternativo}`}
                className={`${styles.infoCardClasses.value} underline-offset-2 transition-colors hover:text-cyan-600 hover:underline dark:hover:text-cyan-400`}
              >
                {cliente.telefono_alternativo}
              </a>
            ) : (
              <p className='text-xs italic text-gray-400 dark:text-gray-500'>
                {EMPTY}
              </p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className='col-span-2'>
            <p className={styles.infoCardClasses.label}>Correo Electrónico</p>
            {cliente.email ? (
              <a
                href={`mailto:${cliente.email}`}
                className={`block truncate ${styles.infoCardClasses.value} underline-offset-2 transition-colors hover:text-cyan-600 hover:underline dark:hover:text-cyan-400`}
              >
                {cliente.email}
              </a>
            ) : (
              <p className='text-xs italic text-gray-400 dark:text-gray-500'>
                {EMPTY}
              </p>
            )}
          </div>

          {/* Separador */}
          <div className='col-span-2 border-t border-gray-200 dark:border-gray-700' />

          {/* Dirección */}
          <div className='col-span-2'>
            <p className={styles.infoCardClasses.label}>Dirección</p>
            <p
              className={
                cliente.direccion
                  ? styles.infoCardClasses.value
                  : 'text-xs italic text-gray-400 dark:text-gray-500'
              }
            >
              {cliente.direccion || EMPTY}
            </p>
          </div>

          {/* Ciudad */}
          <div>
            <p className={styles.infoCardClasses.label}>Ciudad</p>
            <p
              className={
                cliente.ciudad
                  ? styles.infoCardClasses.value
                  : 'text-xs italic text-gray-400 dark:text-gray-500'
              }
            >
              {cliente.ciudad || EMPTY}
            </p>
          </div>

          {/* Departamento */}
          <div>
            <p className={styles.infoCardClasses.label}>Departamento</p>
            <p
              className={
                cliente.departamento
                  ? styles.infoCardClasses.value
                  : 'text-xs italic text-gray-400 dark:text-gray-500'
              }
            >
              {cliente.departamento || EMPTY}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
