import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const glassMorphismVariants = cva(
  'relative overflow-hidden backdrop-blur-lg border transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'bg-white/10 dark:bg-gray-900/10 border-white/20 dark:border-gray-700/20',
        card: 'bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl',
        hero: 'bg-gradient-to-br from-white/20 to-gray-100/20 dark:from-gray-900/20 dark:to-gray-800/20 border-white/30 dark:border-gray-600/30',
      },
      size: {
        default: 'p-6 rounded-xl',
        sm: 'p-4 rounded-lg',
        lg: 'p-8 rounded-2xl',
        xl: 'p-12 rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassMorphismVariants> {
  asChild?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        className={cn(glassMorphismVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassCard.displayName = 'GlassCard'

export { GlassCard, glassMorphismVariants }
