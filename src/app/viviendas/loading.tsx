'use client'

import { Home } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={Home}
      label='Cargando viviendas...'
      ringColors='border-t-orange-500 border-r-amber-500'
      ringBg='from-orange-500/20 to-amber-500/20'
      iconGradient='from-orange-500 via-amber-500 to-yellow-500'
      iconShadow='shadow-orange-500/50'
      pageBg='via-orange-50/30 to-amber-50/30'
      pageBgDark='dark:via-orange-950/20 dark:to-amber-950/20'
      labelColor='text-orange-600 dark:text-orange-400'
      sparkleColor='text-orange-500'
    />
  )
}
