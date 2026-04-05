'use client'

import { Users } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={Users}
      label='Cargando usuarios...'
      ringColors='border-t-purple-500 border-r-violet-500'
      ringBg='from-purple-500/20 to-violet-500/20'
      iconGradient='from-purple-600 via-violet-600 to-fuchsia-600'
      iconShadow='shadow-purple-500/50'
      pageBg='via-purple-50/30 to-violet-50/30'
      pageBgDark='dark:via-purple-950/20 dark:to-violet-950/20'
      labelColor='text-purple-600 dark:text-purple-400'
      sparkleColor='text-purple-500'
    />
  )
}
