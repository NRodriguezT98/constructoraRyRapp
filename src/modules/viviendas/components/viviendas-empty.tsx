'use client'

import { Home, Plus } from 'lucide-react'
import { viviendasListStyles as styles } from '../styles/viviendasList.styles'

interface ViviendasEmptyProps {
  onCrear: () => void
}

/**
 * Estado vacío cuando no hay viviendas
 * Componente presentacional puro
 */
export function ViviendasEmpty({ onCrear }: ViviendasEmptyProps) {
  return (
    <div className={styles.empty.container}>
      <Home className={styles.empty.icon} />
      <h3 className={styles.empty.title}>No hay viviendas registradas</h3>
      <p className={styles.empty.description}>
        Comienza agregando la primera vivienda de tu proyecto
      </p>
      <button onClick={onCrear} className={styles.empty.button}>
        <Plus className="h-5 w-5" />
        Crear Primera Vivienda
      </button>
    </div>
  )
}
