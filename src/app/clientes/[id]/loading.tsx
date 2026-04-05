'use client'

import { User } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={User}
      label='Cargando perfil del cliente...'
      ringColors='border-t-cyan-500 border-r-blue-500'
      ringBg='from-cyan-500/20 to-blue-500/20'
      iconGradient='from-cyan-600 via-blue-600 to-indigo-600'
      iconShadow='shadow-cyan-500/50'
      pageBg='via-cyan-50/30 to-blue-50/30'
      pageBgDark='dark:via-cyan-950/20 dark:to-blue-950/20'
      labelColor='text-cyan-600 dark:text-cyan-400'
      sparkleColor='text-cyan-500'
    />
  )
}
