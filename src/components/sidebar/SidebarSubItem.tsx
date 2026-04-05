'use client'

import { motion } from 'framer-motion'

import Link from 'next/link'

import type { NavigationSubItem } from '@/shared/config/navigation.config'

interface SidebarSubItemProps {
  child: NavigationSubItem
  pathname: string
  itemColor: string
  isMobile?: boolean
  onCloseSidebar?: () => void
}

export function SidebarSubItem({
  child,
  pathname,
  itemColor,
  isMobile,
  onCloseSidebar,
}: SidebarSubItemProps) {
  const childActive = pathname === child.href

  return (
    <Link
      href={child.href}
      prefetch={true}
      aria-current={childActive ? 'page' : undefined}
      onClick={isMobile ? onCloseSidebar : undefined}
    >
      <motion.div
        whileHover={{ scale: 1.01, x: 1 }}
        whileTap={{ scale: 0.98 }}
        className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-200 ${
          childActive
            ? `bg-gradient-to-r ${itemColor} shadow-md`
            : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
      >
        <child.icon
          className={`h-3.5 w-3.5 flex-shrink-0 ${
            childActive
              ? 'text-white'
              : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
          }`}
        />
        <div className='flex flex-col'>
          <span
            className={`text-[11px] font-semibold ${
              childActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {child.name}
          </span>
          <span
            className={`text-[9px] ${
              childActive ? 'text-white/75' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {child.description}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
