'use client'

import { XCircle } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={XCircle}
      label='Cargando renuncias...'
      ringColors='border-t-red-500 border-r-pink-500'
      ringBg='from-red-500/20 to-pink-500/20'
      iconGradient='from-red-600 via-rose-600 to-pink-600'
      iconShadow='shadow-red-500/50'
      pageBg='via-red-50/30 to-pink-50/30'
      pageBgDark='dark:via-red-950/20 dark:to-pink-950/20'
      labelColor='text-red-600 dark:text-red-400'
      sparkleColor='text-red-500'
    />
  )
}
