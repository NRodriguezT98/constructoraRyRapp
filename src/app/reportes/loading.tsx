'use client'

import { BarChart3 } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={BarChart3}
      label="Cargando reportes..."
      ringColors="border-t-teal-500 border-r-green-500"
      ringBg="from-teal-500/20 to-green-500/20"
      iconGradient="from-teal-600 via-green-600 to-emerald-600"
      iconShadow="shadow-teal-500/50"
      pageBg="via-teal-50/30 to-green-50/30"
      pageBgDark="dark:via-teal-950/20 dark:to-green-950/20"
      labelColor="text-teal-600 dark:text-teal-400"
      sparkleColor="text-teal-500"
    />
  )
}
