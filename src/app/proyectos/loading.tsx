'use client'

import { motion } from 'framer-motion'
import { Building2, Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-950/20 dark:to-emerald-950/20">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Icon Container */}
        <div className="relative">
          {/* Outer Rotating Ring */}
          <motion.div
            className="absolute inset-0 h-32 w-32 rounded-full border-4 border-transparent border-t-green-500 border-r-emerald-500"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Middle Pulsing Ring */}
          <motion.div
            className="absolute inset-2 h-28 w-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner Icon */}
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-2xl shadow-green-500/50">
                <Building2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* Sparkle Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * 2 * Math.PI) / 3) * 60, 0],
                y: [0, Math.sin((i * 2 * Math.PI) / 3) * 60, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-4 w-4 text-green-500" />
            </motion.div>
          ))}
        </div>

        {/* Text Content */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Cargando Proyectos
          </motion.h2>

          <motion.p
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Preparando la información...
          </motion.p>

          {/* Animated Dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
