'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

import { calculateAge, formatDateCompact } from '@/lib/utils/date.utils'
import { formatearDocumentoCompleto } from '@/lib/utils/documento.utils'
import { formatNombreApellido } from '@/lib/utils/string.utils'
import type { Cliente } from '@/modules/clientes/types'
import { ESTADOS_CIVILES } from '@/modules/clientes/types'

import * as styles from '../../../cliente-detalle.styles'

interface InfoPersonalCardProps {
  cliente: Cliente
}

const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export function InfoPersonalCard({ cliente }: InfoPersonalCardProps) {
  return (
    <motion.div {...fadeInLeft} className={styles.infoCardClasses.card}>
      <div className={styles.infoCardClasses.header}>
        <div
          className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cliente}`}
        >
          <User className={styles.infoCardClasses.icon} />
        </div>
        <h3 className={styles.infoCardClasses.title}>Información Personal</h3>
      </div>
      <div className={styles.infoCardClasses.content}>
        {/* Grid compacto 2 columnas */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div className="col-span-2">
            <p className={styles.infoCardClasses.label}>Nombre Completo</p>
            <p className={styles.infoCardClasses.value}>
              {formatNombreApellido(cliente.nombres, cliente.apellidos)}
            </p>
          </div>

          <div>
            <p className={styles.infoCardClasses.label}>Documento</p>
            <p className={styles.infoCardClasses.value}>
              {formatearDocumentoCompleto(cliente.tipo_documento, cliente.numero_documento)}
            </p>
          </div>

          <div>
            <p className={styles.infoCardClasses.label}>Estado Civil</p>
            <p className={cliente.estado_civil ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.estado_civil ? ESTADOS_CIVILES[cliente.estado_civil] : 'No indica'}
            </p>
          </div>

          <div>
            <p className={styles.infoCardClasses.label}>Fecha de Nacimiento</p>
            <p className={cliente.fecha_nacimiento ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.fecha_nacimiento ? formatDateCompact(cliente.fecha_nacimiento) : 'No indica'}
            </p>
          </div>

          <div>
            <p className={styles.infoCardClasses.label}>Edad</p>
            <p className={cliente.fecha_nacimiento ? styles.infoCardClasses.value : 'text-xs text-gray-400 dark:text-gray-500 italic'}>
              {cliente.fecha_nacimiento ? `${calculateAge(cliente.fecha_nacimiento)} años` : 'No indica'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
