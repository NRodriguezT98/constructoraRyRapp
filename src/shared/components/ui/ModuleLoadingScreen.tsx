'use client'

import { motion } from 'framer-motion'
import { Sparkles, type LucideIcon } from 'lucide-react'

interface ModuleLoadingScreenProps {
  /** Lucide icon component for the module */
  Icon: LucideIcon
  /** Display label shown below the spinner */
  label: string
  /** Tailwind color for the rotating ring — e.g. 'border-t-cyan-500 border-r-blue-500' */
  ringColors: string
  /** Tailwind gradient for inner bg ring — e.g. 'from-cyan-500/20 to-blue-500/20' */
  ringBg: string
  /** Tailwind gradient for the icon container — e.g. 'from-cyan-500 to-blue-600' */
  iconGradient: string
  /** Tailwind shadow color — e.g. 'shadow-cyan-500/50' */
  iconShadow: string
  /** Tailwind bg gradient for the page — e.g. 'via-cyan-50/30 to-blue-50/30' */
  pageBg: string
  /** Tailwind dark bg gradient — e.g. 'dark:via-cyan-950/20 dark:to-blue-950/20' */
  pageBgDark: string
  /** Tailwind text color for the label — e.g. 'text-cyan-600 dark:text-cyan-400' */
  labelColor: string
  /** Tailwind sparkle icon color — e.g. 'text-cyan-500' */
  sparkleColor: string
}

export function ModuleLoadingScreen({
  Icon,
  label,
  ringColors,
  ringBg,
  iconGradient,
  iconShadow,
  pageBg,
  pageBgDark,
  labelColor,
  sparkleColor,
}: ModuleLoadingScreenProps) {
  return (
    <div
      className={`flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 ${pageBg} dark:from-gray-900 ${pageBgDark}`}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            className={`absolute inset-0 h-32 w-32 rounded-full border-4 border-transparent ${ringColors}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          {/* Middle pulsing ring */}
          <motion.div
            className={`absolute inset-2 h-28 w-28 rounded-full bg-gradient-to-br ${ringBg} dark:opacity-50`}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Icon */}
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`rounded-2xl bg-gradient-to-br ${iconGradient} p-6 shadow-2xl ${iconShadow}`}
              >
                <Icon className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* Sparkle particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: '50%', left: '50%' }}
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
              <Sparkles className={`h-4 w-4 ${sparkleColor}`} />
            </motion.div>
          ))}
        </div>

        {/* Dots animation */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`h-2 w-2 rounded-full ${sparkleColor.replace('text-', 'bg-')}`}
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <motion.p
          className={`text-sm font-medium ${labelColor}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  )
}
