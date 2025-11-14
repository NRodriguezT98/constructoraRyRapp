/**
 * ============================================
 * COMPONENTE: Tabs de Gestión de Usuarios
 * ============================================
 *
 * Pestañas para organizar el módulo de usuarios:
 * - Listado: Tabla de usuarios
 * - Permisos: Matriz de permisos (solo Admin)
 */

'use client'

import { motion } from 'framer-motion'
import { Settings, Shield, Users } from 'lucide-react'
import { useState } from 'react'

import { usePermisosQuery } from '../hooks'
import { PermisosMatrixCompact } from './PermisosMatrixCompact'; // ⭐ NUEVO: Vista compacta

type TabType = 'usuarios' | 'permisos' | 'configuracion'

interface UsuariosTabsProps {
  children: React.ReactNode // Contenido del tab de usuarios
}

export function UsuariosTabs({ children }: UsuariosTabsProps) {
  const { esAdmin } = usePermisosQuery()
  const [activeTab, setActiveTab] = useState<TabType>('usuarios')

  const tabs: Array<{ id: TabType; label: string; icon: any; adminOnly?: boolean }> = [
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'permisos', label: 'Permisos', icon: Shield, adminOnly: true },
    { id: 'configuracion', label: 'Configuración', icon: Settings, adminOnly: true },
  ]

  // Filtrar tabs según permisos
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || esAdmin)

  return (
    <div className="space-y-6">
      {/* Tabs Header - Con z-index alto para estar sobre el header hero */}
      <div className="relative z-50 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-2 shadow-lg">
        <div className="flex gap-2">
          {visibleTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.adminOnly && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    Admin
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        {activeTab === 'usuarios' && children}

        {activeTab === 'permisos' && esAdmin && <PermisosMatrixCompact />}

        {activeTab === 'configuracion' && esAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center space-y-3">
              <Settings className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Configuración
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Próximamente: Configuración avanzada del sistema
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
