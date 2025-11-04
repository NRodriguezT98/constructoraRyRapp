'use client'

import { useAuth } from '@/contexts/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    BarChart3,
    Building2,
    ChevronDown,
    CreditCard,
    FileText,
    FileX,
    Home,
    LogOut,
    Menu,
    Settings,
    Shield,
    Users,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/**
 * ============================================
 * SIDEBAR MODERNA - OPCIÓN 3: COMPACT FLOATING
 * ============================================
 *
 * Características:
 * - Diseño ultra compacto con iconos grandes
 * - Tooltips flotantes en hover
 * - Modo colapsado por defecto
 * - Expandible con animación suave
 * - Cards de navegación agrupados
 * - Botones de acción rápida en el footer
 */

const navigation = [
  {
    group: 'Principal',
    icon: Zap,
    color: 'blue',
    items: [
      { name: 'Dashboard', href: '/', icon: BarChart3, color: 'blue' },
      { name: 'Proyectos', href: '/proyectos', icon: Building2, color: 'emerald' },
      { name: 'Viviendas', href: '/viviendas', icon: Home, color: 'cyan' },
      { name: 'Clientes', href: '/clientes', icon: Users, color: 'purple' },
    ],
  },
  {
    group: 'Financiero',
    icon: CreditCard,
    color: 'orange',
    items: [
      { name: 'Abonos', href: '/abonos', icon: CreditCard, color: 'orange' },
      { name: 'Renuncias', href: '/renuncias', icon: FileX, color: 'red' },
      { name: 'Reportes', href: '/reportes', icon: FileText, color: 'gray' },
    ],
  },
  {
    group: 'Sistema',
    icon: Shield,
    color: 'violet',
    items: [
      { name: 'Usuarios', href: '/usuarios', icon: Users, color: 'violet' },
      { name: 'Auditorías', href: '/auditorias', icon: Activity, color: 'teal' },
      { name: 'Admin', href: '/admin', icon: Shield, color: 'indigo' },
    ],
  },
]

const colorMap: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  cyan: 'from-cyan-500 to-cyan-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  gray: 'from-gray-500 to-gray-600',
  violet: 'from-violet-500 to-violet-600',
  teal: 'from-teal-500 to-teal-600',
  indigo: 'from-indigo-500 to-indigo-600',
}

export function SidebarCompact() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Principal'])
  const pathname = usePathname()
  const router = useRouter()
  const { user, perfil, signOut } = useAuth()

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )
  }

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

  const sidebarWidth = isExpanded ? 280 : 72

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl bg-white dark:bg-gray-900 p-3 shadow-xl border border-gray-200 dark:border-gray-800"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          shadow-xl
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-6"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white">RyR Constructora</h1>
                  <p className="text-[10px] text-gray-500">Sistema de Gestión</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
              >
                <Building2 className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.group} className="px-3">
                {/* Group Header */}
                {isExpanded ? (
                  <button
                    onClick={() => toggleGroup(section.group)}
                    className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {section.group}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform ${
                        expandedGroups.includes(section.group) ? '' : '-rotate-90'
                      }`}
                    />
                  </button>
                ) : (
                  <div className="h-10 flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <section.icon className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                )}

                {/* Group Items */}
                <AnimatePresence>
                  {(isExpanded ? expandedGroups.includes(section.group) : true) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      {section.items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link key={item.href} href={item.href}>
                            <div className="relative group">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                                  transition-all duration-200
                                  ${isActive
                                    ? `bg-gradient-to-r ${colorMap[item.color as keyof typeof colorMap]} text-white shadow-lg`
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }
                                `}
                              >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {isExpanded && (
                                  <span className="text-sm font-medium truncate">{item.name}</span>
                                )}
                              </motion.div>

                              {/* Tooltip cuando está colapsado */}
                              {!isExpanded && (
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                  {item.name}
                                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                                </div>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          {isExpanded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {perfil?.nombres || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{perfil?.rol || 'Sin rol'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <ThemeToggle />
                <button className="flex-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Settings className="w-4 h-4 mx-auto text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <LogOut className="w-4 h-4 mx-auto text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative group">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-0.5 right-1/2 translate-x-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  <p className="font-semibold">{perfil?.nombres || 'Usuario'}</p>
                  <p className="text-gray-300">{perfil?.rol || 'Sin rol'}</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <ThemeToggle />
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative">
                  <Settings className="w-4 h-4 mx-auto text-gray-600 dark:text-gray-400" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Configuración
                  </div>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors group relative"
                >
                  <LogOut className="w-4 h-4 mx-auto text-red-600 dark:text-red-400" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Cerrar sesión
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
