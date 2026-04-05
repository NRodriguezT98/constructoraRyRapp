'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import Image from 'next/image'

import { Button } from '@/shared/components/ui/button'

import { contentFadeVariants, sidebarStyles } from './sidebar.styles'

interface SidebarHeaderProps {
  isExpanded: boolean
  logoSrc: string
  logoCollapsedSrc: string
  toggleSidebar: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function SidebarHeader({
  isExpanded,
  logoSrc,
  logoCollapsedSrc,
  toggleSidebar,
  searchQuery,
  setSearchQuery,
}: SidebarHeaderProps) {
  return (
    <div className='border-b border-gray-200/50 p-3 dark:border-gray-700/30'>
      <div className='flex items-center justify-between'>
        <AnimatePresence mode='wait'>
          {isExpanded ? (
            <motion.div
              key='expanded-logo'
              variants={contentFadeVariants}
              initial='collapsed'
              animate='expanded'
              exit='collapsed'
              transition={{ duration: 0.2 }}
              className='flex items-center'
            >
              <Image
                src={logoSrc}
                alt='RyR Constructora'
                width={140}
                height={40}
                className='h-auto w-auto'
                priority
                suppressHydrationWarning
              />
            </motion.div>
          ) : (
            <motion.div
              key='collapsed-logo'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className='relative mx-auto flex h-12 w-12 items-center justify-center'
            >
              <Image
                src={logoCollapsedSrc}
                alt='RyR'
                width={48}
                height={48}
                className='object-contain'
                suppressHydrationWarning
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant='ghost'
          size='sm'
          onClick={toggleSidebar}
          title={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
          className={`rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 ${
            isExpanded ? 'p-1.5' : 'mx-auto p-2'
          }`}
        >
          {isExpanded ? (
            <ChevronLeft className='h-3.5 w-3.5' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </Button>
      </div>

      {/* Search — solo visible en modo expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentFadeVariants}
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            transition={{ duration: 0.2, delay: 0.1 }}
            className='mt-3'
          >
            <div className='group relative'>
              <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500' />
              <input
                placeholder='Buscar módulos...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={sidebarStyles.searchInput}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
