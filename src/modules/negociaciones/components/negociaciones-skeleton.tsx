/**
 * Skeleton Loading para Negociaciones
 */

'use client'

import * as styles from '../styles/negociaciones.styles'

export function NegociacionesSkeleton() {
  return (
    <div className={styles.layoutClasses.container}>
      <div className={styles.layoutClasses.inner}>
        {/* Header Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="mb-2 h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Métricas Skeleton */}
        <div className={styles.metricasClasses.grid}>
          {[...Array(7)].map((_, i) => (
            <div key={i} className={styles.skeletonClasses.card}>
              <div className="mx-auto mb-2 h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="mx-auto mb-1 h-6 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mx-auto h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>

        {/* Filtros Skeleton */}
        <div className={`${styles.filtrosClasses.container} animate-pulse`}>
          <div className={styles.filtrosClasses.grid}>
            <div>
              <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div>
              <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-end">
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className={styles.listaClasses.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.skeletonClasses.card} animate-pulse`}>
              <div className={styles.skeletonClasses.header}>
                <div className="flex-1">
                  <div className="mb-2 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="my-3 h-px bg-gray-200 dark:bg-gray-700" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="mb-1 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 flex justify-between">
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
