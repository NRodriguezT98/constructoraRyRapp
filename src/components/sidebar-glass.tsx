'use client'

import { useAuth } from '@/contexts/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    BarChart3,
    Building2,
    CreditCard,
    FileText,
    FileX,
    Home,
    LogOut,
    Menu,
    Search,
    Settings,
    Shield,
    Users,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

/**
 * ============================================
 * SIDEBAR MODERNA - OPCIÓN 2: GLASSMORPHISM PRO
 * ============================================
 *
 * Características:
 * - Diseño glassmorphism con efectos de transparencia
 * - Cards flotantes para cada categoría
 * - Buscador integrado con animación
 * - Gradientes sutiles y sombras profundas
 * - Iconos con efectos hover únicos
 * - Badge de notificaciones (opcional)
 */

const navigationItems = [
  {
    category: 'Gestión',
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'Dashboard', href: '/', icon: BarChart3, badge: null },
      { name: 'Proyectos', href: '/proyectos', icon: Building2, badge: '3' },
      { name: 'Viviendas', href: '/viviendas', icon: Home, badge: null },
      { name: 'Clientes', href: '/clientes', icon: Users, badge: '12' },
    ],
  },
  {
    category: 'Financiero',
    color: 'from-emerald-500 to-teal-500',
    items: [
      { name: 'Abonos', href: '/abonos', icon: CreditCard, badge: null },
      { name: 'Renuncias', href: '/renuncias', icon: FileX, badge: null },
      { name: 'Reportes', href: '/reportes', icon: FileText, badge: null },
    ],
  },
  {
    category: 'Sistema',
    color: 'from-violet-500 to-purple-500',
    items: [
      { name: 'Usuarios', href: '/usuarios', icon: Users, badge: null },
      { name: 'Auditorías', href: '/auditorias', icon: Activity, badge: null },
      { name: 'Admin', href: '/admin', icon: Shield, badge: null },
    ],
  },
]

export function SidebarGlass() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
        className="fixed top-4 left-4 z-50 lg:hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 p-3 shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
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
          fixed top-0 left-0 z-50 h-screen w-80
          bg-gradient-to-b from-gray-50/95 via-white/95 to-gray-50/95
          dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-950/95
          backdrop-blur-2xl
          border-r border-gray-200/50 dark:border-gray-700/50
          shadow-2xl
          lg:translate-x-0 lg:static
        `}
      >
        {/* Header con gradiente */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10" />
          <div className="relative h-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  RyR Constructora
                </h1>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Sistema de Gestión</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden rounded-xl p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 custom-scrollbar">
          {navigationItems.map((section) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200/30 dark:border-gray-700/30 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${section.color}`} />
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {section.category}
                </h3>
              </div>
              <div className="space-y-1">
                {section.items
                  .filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-200
                            ${isActive
                              ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }
                          `}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                          <span className="text-sm font-medium flex-1">{item.name}</span>
                          {item.badge && (
                            <span className={`
                              px-2 py-0.5 rounded-full text-[10px] font-bold
                              ${isActive
                                ? 'bg-white/30 text-white'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}
              </div>
            </motion.div>
          ))}
        </nav>

        {/* Footer con usuario */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {getUserInitials()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {perfil?.nombres || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {perfil?.rol || 'Sin rol'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Settings className="w-4 h-4" />
              <span className="text-xs">Config</span>
            </button>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
