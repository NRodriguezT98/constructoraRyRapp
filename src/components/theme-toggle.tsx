'use client'

import * as React from 'react'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ThemeToggleProps {
  className?: string
  /** Clases para el ícono Sol (estado claro) */
  sunClassName?: string
  /** Clases para el ícono Luna (estado oscuro) */
  moonClassName?: string
}

export function ThemeToggle({
  className,
  sunClassName,
  moonClassName,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={
        className ??
        'inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      }
    >
      <Sun
        className={
          sunClassName ??
          'h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
        }
      />
      <Moon
        className={
          moonClassName ??
          'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
        }
      />
      <span className='sr-only'>Cambiar tema</span>
    </button>
  )
}
