'use client'

import { viviendasListStyles as styles } from '../styles/viviendasList.styles'

/**
 * Skeleton de carga para viviendas
 * Componente presentacional puro
 */
export function ViviendasSkeleton() {
  return (
    <div className={styles.grid.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeleton.card}>
          <div className="space-y-3">
            <div className={styles.skeleton.header} />
            <div className={styles.skeleton.line} />
            <div className={styles.skeleton.line} />
            <div className="flex justify-between pt-4">
              <div className={`${styles.skeleton.line} w-1/3`} />
              <div className={styles.skeleton.button} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
