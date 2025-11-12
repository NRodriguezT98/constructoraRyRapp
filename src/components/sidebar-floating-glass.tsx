'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    BarChart3,
    Building2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Crown,
    FileText,
    FileX,
    Home,
    LogOut,
    Search,
    Settings,
    Shield,
    Trash2,
    Users,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'


import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { useSidebar } from './useSidebar'

// Agrupación de módulos por categorías
const navigationGroups = [
  {
    title: 'Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: BarChart3,
        color: 'from-blue-500 to-indigo-500',
        description: 'Panel principal',
      },
      {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-green-500 to-emerald-500',
        description: 'Gestión de proyectos',
      },
      {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-orange-500 to-amber-500',
        description: 'Administrar viviendas',
      },
    ],
  },
  {
    title: 'Clientes',
    items: [
      {
        name: 'Clientes',
        href: '/clientes',
        icon: Users,
        color: 'from-cyan-500 to-blue-500',
        description: 'Base de clientes',
      },
      {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-purple-500 to-pink-500',
        description: 'Gestión de pagos',
      },
      {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-red-500 to-rose-500',
        description: 'Cancelaciones',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Usuarios',
        href: '/usuarios',
        icon: Users,
        color: 'from-violet-500 to-purple-500',
        description: 'Gestión de usuarios',
      },
      {
        name: 'Auditorías',
        href: '/auditorias',
        icon: Activity,
        color: 'from-teal-500 to-cyan-500',
        description: 'Registro de actividad',
      },
      {
        name: 'Papelera',
        href: '/documentos/eliminados',
        icon: Trash2,
        color: 'from-red-500 to-rose-500',
        description: 'Documentos eliminados',
        adminOnly: true,
      },
      {
        name: 'Plantillas Proceso',
        href: '/admin/procesos',
        icon: ClipboardList,
        color: 'from-rose-500 to-pink-500',
        description: 'Plantillas de negociación',
      },
      {
        name: 'Recargos',
        href: '/administracion/configuracion',
        icon: Settings,
        color: 'from-blue-500 to-indigo-500',
        description: 'Gastos y valores',
      },
      {
        name: 'Administración',
        href: '/admin',
        icon: Shield,
        color: 'from-indigo-500 to-blue-500',
        description: 'Panel admin',
      },
      {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        color: 'from-gray-500 to-slate-500',
        description: 'Informes y análisis',
      },
    ],
  },
]

export function SidebarFloatingGlass() {
  const { user, perfil, signOut } = useAuth()
  const { theme, systemTheme } = useTheme()
  const router = useRouter()
  const {
    isExpanded,
    isMobile,
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    closeSidebar,
    isActive,
  } = useSidebar()

  // State para evitar hydration mismatch con el tema
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres.charAt(0)}${perfil.apellidos.charAt(0)}`.toUpperCase()
    }
    if (perfil?.nombres) {
      return perfil.nombres.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Obtener nombre completo
  const getDisplayName = () => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres} ${perfil.apellidos}`
    }
    if (perfil?.nombres) {
      return perfil.nombres
    }
    if (user?.email) {
      return user.email.split('@')[0].replace(/[._-]/g, ' ')
    }
    return 'Usuario'
  }

  // Verificar si es administrador (para mostrar la corona 👑)
  const isAdmin = perfil?.rol === 'Administrador'

  // Obtener color según rol
  const getRolColor = () => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'from-amber-500 via-yellow-500 to-orange-500' // Dorado para el rey 👑
      case 'Gerente':
        return 'from-blue-500 to-indigo-500'
      case 'Vendedor':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  // Obtener badge color según rol
  const getRolBadgeColor = () => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50'
      case 'Gerente':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Vendedor':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 72 },
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  }

  // Determinar qué logo usar según el tema (con protección hydration)
  const getLogo = (expanded: boolean) => {
    // Si no está montado, usar logo claro por defecto (match con SSR)
    if (!mounted) {
      return expanded ? '/images/logo1.png' : '/images/logo2.png'
    }

    // Determinar tema actual (respetando 'system')
    const currentTheme = theme === 'system' ? systemTheme : theme

    if (expanded) {
      return currentTheme === 'dark' ? '/images/logo1-dark.png' : '/images/logo1.png'
    }
    return currentTheme === 'dark' ? '/images/logo2-dark.png' : '/images/logo2.png'
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container con padding para efecto flotante */}
      <div
        className={`fixed left-0 top-0 z-50 h-full ${
          isMobile ? (isExpanded ? 'w-full' : 'w-0') : ''
        }`}
      >
        <motion.aside
          variants={sidebarVariants}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full ${
            isMobile
              ? isExpanded
                ? 'translate-x-0'
                : '-translate-x-full'
              : 'm-3 h-[calc(100vh-24px)] rounded-3xl'
          } relative flex flex-col border border-white/20 bg-white/80 shadow-2xl shadow-gray-900/10 backdrop-blur-2xl dark:border-gray-700/30 dark:bg-gray-900/80 dark:shadow-black/20`}
        >
          {/* Header */}
          <div className="border-b border-gray-200/50 p-3 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div
                    key="expanded-logo"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <Image
                      src={getLogo(true)}
                      alt="RyR Constructora"
                      width={140}
                      height={40}
                      className="h-auto w-auto"
                      priority
                      suppressHydrationWarning
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed-logo"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative mx-auto flex items-center justify-center"
                    style={{ width: '48px', height: '48px' }}
                  >
                    {/* Usar img nativo para control total del tamaño */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getLogo(false)}
                      alt="RyR"
                      className="block"
                      style={{
                        width: '48px',
                        height: '48px',
                        maxWidth: '48px',
                        maxHeight: '48px',
                        minWidth: '48px',
                        minHeight: '48px',
                        objectFit: 'contain'
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                title={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
                className={`rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 ${
                  isExpanded ? 'p-1.5' : 'p-2 mx-auto'
                }`}
              >
                {isExpanded ? (
                  <ChevronLeft className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search - Solo cuando está expandido */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="mt-3"
                >
                  <div className="group relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                    <input
                      placeholder="Buscar módulos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full rounded-lg border border-gray-200/50 bg-gray-50/50 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 py-3">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {/* Group Title */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2 }}
                      className="mb-2 px-2.5"
                    >
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {group.title}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {group.items
                    .filter(
                      (item) =>
                        // Filtro de búsqueda
                        (!searchQuery ||
                          item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          item.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())) &&
                        // 🔒 Filtro adminOnly
                        (!(item as any).adminOnly || perfil?.rol === 'Administrador')
                    )
                    .map((item) => {
                      const active = isActive(item.href)
                      return (
                        <Link key={item.href} href={item.href} prefetch={true}>
                          <motion.div
                            whileHover={{ scale: 1.01, x: 1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative flex items-center rounded-lg transition-all duration-200 ${
                              isExpanded ? 'px-2.5 py-2' : 'px-2 py-3'
                            } ${
                              active
                                ? `bg-gradient-to-r ${item.color} shadow-lg`
                                : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                            }`}
                          >
                            {/* Icon */}
                            <div
                              className={`flex-shrink-0 ${
                                isExpanded ? 'mr-2.5' : 'mx-auto'
                              }`}
                            >
                              <item.icon
                                className={`${
                                  isExpanded ? 'h-4 w-4' : 'h-5 w-5'
                                } ${
                                  active
                                    ? 'text-white drop-shadow-md'
                                    : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200'
                                }`}
                              />
                            </div>

                            {/* Content - Solo cuando está expandido */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  variants={contentVariants}
                                  initial="collapsed"
                                  animate="expanded"
                                  exit="collapsed"
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-1 flex-col"
                                >
                                  <div
                                    className={`text-xs font-semibold ${
                                      active
                                        ? 'text-white'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {item.name}
                                  </div>
                                  <div
                                    className={`text-[10px] ${
                                      active
                                        ? 'text-white/80'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                  >
                                    {item.description}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Tooltip para modo colapsado */}
                            {!isExpanded && (
                              <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700">
                                {item.name}
                                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900 dark:bg-gray-700" />
                              </div>
                            )}

                            {/* Active indicator dot */}
                            {active && (
                              <motion.div
                                layoutId="sidebar-indicator"
                                className="absolute right-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-md"
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="space-y-2 border-t border-gray-200/50 p-3 dark:border-gray-700/30">
            {/* User Profile Card - Solo cuando está expandido */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ duration: 0.2 }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-50 p-2.5 shadow-md shadow-gray-900/5 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800"
                >
                  {/* Glow effect para admin */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 opacity-50" />
                  )}

                  <div className="relative flex items-start gap-2">
                    {/* Avatar con gradiente según rol */}
                    <div className="relative flex-shrink-0">
                      {/* Corona para administrador 👑 */}
                      {isAdmin && (
                        <motion.div
                          initial={{ y: -20, opacity: 0, rotate: -20 }}
                          animate={{ y: 0, opacity: 1, rotate: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2"
                        >
                          <motion.div
                            animate={{
                              y: [0, -2, 0],
                              rotate: [-5, 5, -5],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          >
                            <Crown className="h-4 w-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                          </motion.div>
                        </motion.div>
                      )}

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${getRolColor()} shadow-md ${
                          isAdmin ? 'shadow-amber-500/40 ring-2 ring-amber-400/20' : ''
                        }`}
                      >
                        <span className="text-sm font-bold text-white drop-shadow-md">
                          {getUserInitials()}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {/* Nombre */}
                      <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {getDisplayName()}
                      </div>

                      {/* Email */}
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {user?.email || 'usuario@ryr.com'}
                      </div>

                      {/* Badge de Rol */}
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${getRolBadgeColor()}`}
                        >
                          {isAdmin && <Crown className="h-2.5 w-2.5" />}
                          {perfil?.rol || 'Sin rol'}
                        </span>
                      </div>
                    </div>

                    {/* Botón logout */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 rounded-lg p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20"
                      onClick={handleSignOut}
                      title="Cerrar sesión"
                    >
                      <LogOut className="h-3.5 w-3.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed User Avatar */}
            {!isExpanded && (
              <div className="relative mx-auto w-fit">
                {/* Corona para administrador en modo colapsado */}
                {isAdmin && (
                  <motion.div
                    initial={{ y: -20, opacity: 0, rotate: -20 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2"
                  >
                    <motion.div
                      animate={{
                        y: [0, -2, 0],
                        rotate: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Crown className="h-4 w-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                    </motion.div>
                  </motion.div>
                )}

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${getRolColor()} shadow-md ${
                    isAdmin ? 'shadow-amber-500/40 ring-2 ring-amber-400/20' : ''
                  }`}
                >
                  <span className="text-base font-bold text-white drop-shadow-md">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
            )}

            {/* Theme Toggle & Settings */}
            <div
              className={`flex items-center ${
                isExpanded ? 'justify-between gap-1.5' : 'flex-col gap-2'
              }`}
            >
              <ThemeToggle />
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              )}
              {!isExpanded && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                    title="Configuración"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={handleSignOut}
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </>
  )
}
