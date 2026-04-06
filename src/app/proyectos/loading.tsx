'use client'

import { Building2 } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={Building2}
      label='Cargando proyectos...'
      ringColors='border-t-green-500 border-r-emerald-500'
      ringBg='from-green-500/20 to-emerald-500/20'
      iconGradient='from-green-600 via-emerald-600 to-teal-600'
      iconShadow='shadow-green-500/50'
      pageBg='via-green-50/30 to-emerald-50/30'
      pageBgDark='dark:via-green-950/20 dark:to-emerald-950/20'
      labelColor='text-green-600 dark:text-green-400'
      sparkleColor='text-green-500'
    />
  )
}
