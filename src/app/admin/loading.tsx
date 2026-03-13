'use client'

import { Settings } from 'lucide-react'

import { ModuleLoadingScreen } from '@/shared/components/ui/ModuleLoadingScreen'

export default function Loading() {
  return (
    <ModuleLoadingScreen
      Icon={Settings}
      label="Cargando administración..."
      ringColors="border-t-slate-500 border-r-gray-500"
      ringBg="from-slate-500/20 to-gray-500/20"
      iconGradient="from-slate-600 via-gray-600 to-zinc-600"
      iconShadow="shadow-slate-500/50"
      pageBg="via-slate-50/30 to-gray-50/30"
      pageBgDark="dark:via-slate-950/20 dark:to-gray-950/20"
      labelColor="text-slate-600 dark:text-slate-400"
      sparkleColor="text-slate-500"
    />
  )
}
