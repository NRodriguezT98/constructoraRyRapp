'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import type { NavigationItem } from '@/shared/config/navigation.config'
import { PAPELERA_NAV_NAME } from '@/shared/config/navigation.config'

import { contentFadeVariants } from './sidebar.styles'

interface SidebarNavItemRowProps {
  item: NavigationItem
  isExpanded: boolean
  isSubmenuOpen: boolean
  isModuleActive: boolean
  hasChildren: boolean
  papeleraCount: number
}

export function SidebarNavItemRow({
  item,
  isExpanded,
  isSubmenuOpen,
  isModuleActive,
  hasChildren,
  papeleraCount,
}: SidebarNavItemRowProps) {
  const rowBg =
    isModuleActive && !hasChildren
      ? `bg-gradient-to-r ${item.color} shadow-lg`
      : isModuleActive && hasChildren
        ? 'bg-gray-100/80 dark:bg-gray-800/80'
        : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60'

  const iconColor =
    isModuleActive && !hasChildren
      ? 'text-white drop-shadow-md'
      : isModuleActive && hasChildren
        ? 'text-gray-700 dark:text-gray-200'
        : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200'

  const titleColor =
    isModuleActive && !hasChildren
      ? 'text-white'
      : 'text-gray-900 dark:text-gray-100'

  const descColor =
    isModuleActive && !hasChildren
      ? 'text-white/80'
      : 'text-gray-500 dark:text-gray-400'

  const isPapelera = item.name === PAPELERA_NAV_NAME

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 1 }}
      whileTap={{ scale: 0.98 }}
      aria-current={undefined}
      className={`group relative flex cursor-pointer items-center rounded-lg transition-all duration-200 ${
        isExpanded ? 'px-2.5 py-2' : 'px-2 py-3'
      } ${rowBg}`}
    >
      {/* Ícono */}
      <div className={`flex-shrink-0 ${isExpanded ? 'mr-2.5' : 'mx-auto'}`}>
        <item.icon
          className={`${isExpanded ? 'h-4 w-4' : 'h-5 w-5'} ${iconColor}`}
        />
      </div>

      {/* Contenido — solo en modo expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentFadeVariants}
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            transition={{ duration: 0.2 }}
            className='flex flex-1 items-center justify-between'
          >
            <div className='flex flex-col'>
              <span className={`text-xs font-semibold ${titleColor}`}>
                {item.name}
              </span>
              <span className={`text-[10px] ${descColor}`}>
                {item.description}
              </span>
            </div>

            {/* Chevron para submenús */}
            {hasChildren ? (
              <motion.div
                animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 ${
                    isModuleActive
                      ? 'text-gray-700 dark:text-gray-200'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </motion.div>
            ) : null}

            {/* Badge Papelera */}
            {isPapelera && papeleraCount > 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isModuleActive
                    ? 'bg-white text-red-600'
                    : 'bg-red-500 text-white'
                }`}
              >
                {papeleraCount > 99 ? '99+' : papeleraCount}
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Papelera modo colapsado */}
      {!isExpanded && isPapelera && papeleraCount > 0 ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className='absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold text-white shadow-lg dark:border-gray-900'
        >
          {papeleraCount > 99 ? '99+' : papeleraCount}
        </motion.div>
      ) : null}

      {/* Tooltip modo colapsado */}
      {!isExpanded ? (
        <div className='pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700'>
          {item.name}
          {isPapelera && papeleraCount > 0 ? (
            <span className='ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white'>
              {papeleraCount}
            </span>
          ) : null}
          <div className='absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900 dark:bg-gray-700' />
        </div>
      ) : null}

      {/* Punto indicador activo (solo items sin hijos) */}
      {!hasChildren && isModuleActive ? (
        <motion.div
          layoutId='sidebar-indicator'
          className='absolute right-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-md'
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      ) : null}
    </motion.div>
  )
}
