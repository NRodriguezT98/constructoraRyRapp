'use client'

import { useAuth } from '@/contexts/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    BarChart3,
    Building2,
    ChevronRight,
    ClipboardList,
    CreditCard,
    FileText,
    FileX,
    Home,
    LogOut,
    Menu,
    Shield,
    Users,
    X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/**
 * ============================================
 * SIDEBAR MODERNA - OPCIÓN 1: MINIMAL CLEAN
 * ============================================
 *
 * Características:
 * - Diseño minimalista y limpio
 * - Navegación por categorías con iconos flotantes
 * - Avatar del usuario con estado online
 * - Indicador de ruta activa con animación suave
 * - Modo responsive con overlay
 * - Hover effects modernos
 */

const navigationGroups = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: BarChart3 },
      { name: 'Proyectos', href: '/proyectos', icon: Building2 },
      { name: 'Viviendas', href: '/viviendas', icon: Home },
      { name: 'Clientes', href: '/clientes', icon: Users },
    ],
  },
  {
    title: 'Financiero',
    items: [
      { name: 'Abonos', href: '/abonos', icon: CreditCard },
      { name: 'Renuncias', href: '/renuncias', icon: FileX },
      { name: 'Reportes', href: '/reportes', icon: FileText },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Plantillas Proceso', href: '/admin/procesos', icon: ClipboardList },
      { name: 'Usuarios', href: '/usuarios', icon: Users },
      { name: 'Auditorías', href: '/auditorias', icon: Activity },
      { name: 'Admin', href: '/admin', icon: Shield },
    ],
  },
]

export function SidebarMinimal() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, perfil, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres[0]}${perfil.apellidos[0]}`.toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl bg-white/90 dark:bg-gray-900/90 p-3 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          lg:translate-x-0 lg:static
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">RyR</h1>
              <p className="text-[10px] text-gray-500">Constructora</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-colors relative group
                          ${isActive
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-blue-50 dark:bg-blue-950 rounded-lg"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon className="w-4 h-4 relative z-10" />
                        <span className="text-sm font-medium relative z-10">{item.name}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                        )}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="h-24 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {perfil?.nombres || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {perfil?.rol || 'Sin rol'}
              </p>
            </div>
            <div className="flex gap-1">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
