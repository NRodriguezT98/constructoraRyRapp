/**
 * UsuariosTabs — Navegación por tabs del módulo de usuarios
 * ✅ Tab "Usuarios": listado y gestión
 * ✅ Tab "Permisos": matriz RBAC (solo Admin)
 * ✅ Estilos v2: indigo/púrpura, glassmorphism
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Shield, Users } from 'lucide-react'

import { PermisosView } from './PermisosView'

type TabType = 'usuarios' | 'permisos'

const TABS: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'permisos', label: 'Permisos RBAC', icon: Shield },
]

interface UsuariosTabsProps {
  /** Contenido del tab de usuarios (listado + filtros + tabla) */
  children: React.ReactNode
}

export function UsuariosTabs({ children }: UsuariosTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('usuarios')

  return (
    <div className='space-y-4'>
      {/* ── Barra de tabs ──────────────────────────────────────────────── */}
      <div className='flex gap-1 rounded-xl border border-gray-200/50 bg-white/80 p-1 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400'
              } `}
            >
              <Icon className='h-4 w-4' />
              <span>{tab.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      {activeTab === 'usuarios' ? <>{children}</> : <PermisosView />}
    </div>
  )
}
