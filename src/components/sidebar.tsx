'use client'

import { useAuth } from '@/contexts/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import {
    BarChart3,
    Building2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FileText,
    FileX,
    Home,
    LogOut,
    Search,
    Settings,
    Shield,
    Sparkles,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSidebar } from './useSidebar'

// Agrupación de módulos por categorías
const navigationGroups = [
  {
    title: 'Gestión Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: BarChart3,
        color: 'from-blue-500 to-blue-600',
        description: 'Panel principal',
      },
      {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-emerald-500 to-emerald-600',
        description: 'Gestión de proyectos',
      },
      {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-cyan-500 to-cyan-600',
        description: 'Administrar viviendas',
      },
    ],
  },
  {
    title: 'Clientes & Ventas',
    items: [
      {
        name: 'Clientes',
        href: '/clientes',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
        description: 'Base de clientes y negociaciones',
      },
      {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-orange-500 to-orange-600',
        description: 'Gestión de pagos',
      },
      {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-red-500 to-red-600',
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
        color: 'from-violet-500 to-violet-600',
        description: 'Gestión de usuarios',
      },
      {
        name: 'Administración',
        href: '/admin',
        icon: Shield,
        color: 'from-indigo-500 to-indigo-600',
        description: 'Panel admin',
      },
      {
        name: 'Procesos',
        href: '/admin/procesos',
        icon: Settings,
        color: 'from-blue-500 to-indigo-600',
        description: 'Gestión de procesos',
      },
      {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        color: 'from-gray-500 to-gray-600',
        description: 'Informes y reportes',
      },
    ],
  },
]

export function Sidebar() {
  const { user, perfil, signOut } = useAuth()
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

  // Obtener nombre completo para mostrar
  const getDisplayName = () => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres} ${perfil.apellidos}`
    }
    if (perfil?.nombres) {
      return perfil.nombres
    }
    if (user?.email) {
      // Extraer nombre del email (parte antes del @)
      return user.email.split('@')[0].replace(/[._-]/g, ' ')
    }
    return 'Usuario'
  }

  // Obtener color según rol
  const getRolColor = () => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'from-red-500 to-pink-600'
      case 'Gerente':
        return 'from-orange-500 to-amber-600'
      case 'Vendedor':
        return 'from-blue-500 to-indigo-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Obtener badge color según rol
  const getRolBadgeColor = () => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Gerente':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'Vendedor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
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
            className='fixed inset-0 z-40 bg-black/50 lg:hidden'
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white/95 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 ${
          isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : ''
        }`}
      >
        {/* Header */}
        <div className='border-b border-gray-200 p-3 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <AnimatePresence mode='wait'>
              {isExpanded ? (
                <motion.div
                  key='expanded-logo'
                  variants={contentVariants}
                  initial='collapsed'
                  animate='expanded'
                  exit='collapsed'
                  transition={{ duration: 0.2 }}
                  className='flex items-center space-x-3'
                >
                  <div className='relative'>
                    <div className='rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 shadow-md'>
                      <Building2 className='h-5 w-5 text-white' />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className='absolute -right-0.5 -top-0.5'
                    >
                      <Sparkles className='h-2.5 w-2.5 text-yellow-500' />
                    </motion.div>
                  </div>
                  <div>
                    <h1 className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-base font-bold text-transparent dark:from-blue-400 dark:to-indigo-400'>
                      RyR Constructora
                    </h1>
                    <p className='-mt-0.5 text-[10px] text-gray-500 dark:text-gray-400'>
                      Sistema de Gestión
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key='collapsed-logo'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className='relative mx-auto'
                >
                  <div className='rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 shadow-md'>
                    <Building2 className='h-5 w-5 text-white' />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='absolute -right-0.5 -top-0.5'
                  >
                    <Sparkles className='h-2.5 w-2.5 text-yellow-500' />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSidebar}
              className='rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              {isExpanded ? (
                <ChevronLeft className='h-3.5 w-3.5' />
              ) : (
                <ChevronRight className='h-3.5 w-3.5' />
              )}
            </Button>
          </div>

          {/* Search - Solo cuando está expandido */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={contentVariants}
                initial='collapsed'
                animate='expanded'
                exit='collapsed'
                transition={{ duration: 0.2, delay: 0.1 }}
                className='mt-3'
              >
                <div className='relative'>
                  <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    placeholder='Buscar módulos...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='h-8 border-gray-200 bg-gray-50 pl-8 text-xs dark:border-gray-700 dark:bg-gray-800'
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 py-3'>
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {/* Group Title - Solo cuando está expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    variants={contentVariants}
                    initial='collapsed'
                    animate='expanded'
                    exit='collapsed'
                    transition={{ duration: 0.2 }}
                    className='mb-2 px-2'
                  >
                    <h3 className='text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                      {group.title}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Items */}
              <div className='space-y-1'>
                {group.items
                  .filter(
                    item =>
                      !searchQuery ||
                      item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      item.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((item, index) => {
                    const active = isActive(item.href)
                    return (
                      <Link key={item.href} href={item.href} prefetch={true}>
                        <motion.div
                          whileHover={{ scale: 1.01, x: 1 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative flex items-center rounded-lg px-2.5 py-2 transition-all duration-200 ${
                            active
                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg border-l-4 border-white/30`
                              : 'text-gray-700 hover:bg-white/5 dark:text-gray-300 dark:hover:bg-white/5'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 ${isExpanded ? 'mr-2.5' : 'mx-auto'}`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${
                                active
                                  ? 'text-white'
                                  : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                              }`}
                            />
                          </div>

                          {/* Content - Solo cuando está expandido */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                variants={contentVariants}
                                initial='collapsed'
                                animate='expanded'
                                exit='collapsed'
                                transition={{ duration: 0.2 }}
                                className='flex flex-1 items-center justify-between'
                              >
                                <div>
                                  <div
                                    className={`text-xs font-medium ${
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
                                </div>

                                {/* Notifications Badge - REMOVIDO */}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Tooltip para modo colapsado */}
                          {!isExpanded && (
                            <div className='pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700'>
                              {item.name}
                            </div>
                          )}

                          {/* Active indicator */}
                          {active && (
                            <motion.div
                              layoutId='sidebar-indicator'
                              className='absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 transform rounded-r-full bg-white'
                              transition={{
                                type: 'spring',
                                stiffness: 300,
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
        <div className='space-y-2 border-t border-gray-200 p-3 dark:border-gray-700'>
          {/* Theme Toggle & Settings */}
          <div
            className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={contentVariants}
                  initial='collapsed'
                  animate='expanded'
                  exit='collapsed'
                  transition={{ duration: 0.2 }}
                  className='flex items-center space-x-1.5'
                >
                  <ThemeToggle />
                  <Button variant='ghost' size='sm' className='p-1.5'>
                    <Settings className='h-3.5 w-3.5' />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className='flex flex-col space-y-1.5'>
                <ThemeToggle />
                <Button
                  variant='ghost'
                  size='sm'
                  className='p-1.5'
                  title='Configuración'
                >
                  <Settings className='h-3.5 w-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20'
                  onClick={handleSignOut}
                  title='Cerrar sesión'
                >
                  <LogOut className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400' />
                </Button>
              </div>
            )}
          </div>

          {/* User Info - Solo cuando está expandido */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={contentVariants}
                initial='collapsed'
                animate='expanded'
                exit='collapsed'
                transition={{ duration: 0.2 }}
                className='rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-2.5 shadow-sm dark:from-gray-800 dark:to-gray-800/50'
              >
                <div className='flex items-start space-x-2.5'>
                  {/* Avatar con gradiente según rol */}
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getRolColor()} shadow-md`}>
                    <span className='text-sm font-bold text-white'>{getUserInitials()}</span>
                  </div>

                  {/* Info del usuario */}
                  <div className='flex-1 min-w-0 space-y-1'>
                    {/* Nombre completo */}
                    <div className='text-xs font-semibold text-gray-900 dark:text-gray-100 truncate'>
                      {getDisplayName()}
                    </div>

                    {/* Email */}
                    <div className='text-[10px] text-gray-500 dark:text-gray-400 truncate'>
                      {user?.email || 'usuario@ryr.com'}
                    </div>

                    {/* Badge de Rol */}
                    <div className='flex items-center'>
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium ${getRolBadgeColor()}`}>
                        {perfil?.rol || 'Sin rol'}
                      </span>
                    </div>
                  </div>

                  {/* Botón logout */}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='flex-shrink-0 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20'
                    onClick={handleSignOut}
                    title='Cerrar sesión'
                  >
                    <LogOut className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400' />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}
