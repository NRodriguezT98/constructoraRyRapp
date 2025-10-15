'use client'

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
import { ThemeToggle } from './theme-toggle'
import { Badge } from './ui/badge'
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
        notifications: 0,
      },
      {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-emerald-500 to-emerald-600',
        description: 'Gestión de proyectos',
        notifications: 3,
      },
      {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-cyan-500 to-cyan-600',
        description: 'Administrar viviendas',
        notifications: 0,
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
        description: 'Base de clientes',
        notifications: 2,
      },
      {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-orange-500 to-orange-600',
        description: 'Gestión de pagos',
        notifications: 5,
      },
      {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-red-500 to-red-600',
        description: 'Cancelaciones',
        notifications: 1,
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Administración',
        href: '/admin',
        icon: Shield,
        color: 'from-indigo-500 to-indigo-600',
        description: 'Panel admin',
        notifications: 0,
      },
      {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        color: 'from-gray-500 to-gray-600',
        description: 'Informes y reportes',
        notifications: 0,
      },
    ],
  },
]

export function Sidebar() {
  const {
    isExpanded,
    isMobile,
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    closeSidebar,
    isActive,
  } = useSidebar()

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
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
        <div className='border-b border-gray-200 p-4 dark:border-gray-700'>
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
                    <div className='rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-lg'>
                      <Building2 className='h-6 w-6 text-white' />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className='absolute -right-1 -top-1'
                    >
                      <Sparkles className='h-3 w-3 text-yellow-500' />
                    </motion.div>
                  </div>
                  <div>
                    <h1 className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent dark:from-blue-400 dark:to-indigo-400'>
                      RyR Constructora
                    </h1>
                    <p className='-mt-1 text-xs text-gray-500 dark:text-gray-400'>
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
                  <div className='rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-lg'>
                    <Building2 className='h-6 w-6 text-white' />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='absolute -right-1 -top-1'
                  >
                    <Sparkles className='h-3 w-3 text-yellow-500' />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSidebar}
              className='rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              {isExpanded ? (
                <ChevronLeft className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
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
                className='mt-4'
              >
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    placeholder='Buscar módulos...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='h-9 border-gray-200 bg-gray-50 pl-10 dark:border-gray-700 dark:bg-gray-800'
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className='custom-scrollbar flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-4'>
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
                    className='mb-3 px-3'
                  >
                    <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
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
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                            active
                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`}
                          >
                            <item.icon
                              className={`h-5 w-5 ${
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
                                    className={`text-sm font-medium ${
                                      active
                                        ? 'text-white'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {item.name}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      active
                                        ? 'text-white/80'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                  >
                                    {item.description}
                                  </div>
                                </div>

                                {/* Notifications Badge */}
                                {item.notifications > 0 && (
                                  <Badge
                                    variant={active ? 'secondary' : 'default'}
                                    className={`ml-2 flex h-5 w-5 items-center justify-center p-0 text-xs ${
                                      active
                                        ? 'border-white/30 bg-white/20 text-white'
                                        : 'border-red-600 bg-red-500 text-white'
                                    }`}
                                  >
                                    {item.notifications}
                                  </Badge>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Tooltip para modo colapsado */}
                          {!isExpanded && (
                            <div className='pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700'>
                              {item.name}
                              {item.notifications > 0 && (
                                <span className='ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                                  {item.notifications}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Active indicator */}
                          {active && (
                            <motion.div
                              layoutId='sidebar-indicator'
                              className='absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 transform rounded-r-full bg-white'
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
        <div className='space-y-2 border-t border-gray-200 p-4 dark:border-gray-700'>
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
                  className='flex items-center space-x-2'
                >
                  <ThemeToggle />
                  <Button variant='ghost' size='sm' className='p-2'>
                    <Settings className='h-4 w-4' />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className='flex flex-col space-y-2'>
                <ThemeToggle />
                <Button variant='ghost' size='sm' className='p-2'>
                  <Settings className='h-4 w-4' />
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
                className='flex items-center space-x-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600'>
                  <span className='text-sm font-medium text-white'>U</span>
                </div>
                <div className='flex-1'>
                  <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    Usuario Admin
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    admin@ryr.com
                  </div>
                </div>
                <Button variant='ghost' size='sm' className='p-1'>
                  <LogOut className='h-4 w-4' />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}
