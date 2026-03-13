'use client'

import { ClipboardList } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={ClipboardList}
      label="Cargando auditorías..."
      ringColors="border-t-blue-500 border-r-indigo-500"
      ringBg="from-blue-500/20 to-indigo-500/20"
      iconGradient="from-blue-600 via-indigo-600 to-purple-600"
      iconShadow="shadow-blue-500/50"
      pageBg="via-blue-50/30 to-indigo-50/30"
      pageBgDark="dark:via-blue-950/20 dark:to-indigo-950/20"
      labelColor="text-blue-600 dark:text-blue-400"
      sparkleColor="text-blue-500"
    />
  )
}
