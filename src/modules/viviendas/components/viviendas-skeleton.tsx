'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton de carga para viviendas
 * Componente presentacional puro con stagger animation
 */
export function ViviendasSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-4 shadow-lg dark:border-gray-700/50 dark:bg-gray-800/80"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
