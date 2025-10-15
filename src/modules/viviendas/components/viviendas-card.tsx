'use client'

import { motion } from 'framer-motion'
import { Edit, Home, MapPin, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Tables } from '@/lib/supabase/database.types'
import { cardHoverVariants, itemVariants } from '../styles/animations'
import { viviendaCardStyles } from '../styles/classes'

type Vivienda = Tables<'viviendas'>

interface ViviendasCardProps {
  vivienda: Vivienda
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: string) => void
  onView?: (vivienda: Vivienda) => void
}

const estadoColors = {
  disponible: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  reservada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  vendida: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  en_construccion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
} as const

const estadoLabels = {
  disponible: 'Disponible',
  reservada: 'Reservada',
  vendida: 'Vendida',
  en_construccion: 'En Construcción',
} as const

export function ViviendasCard({
  vivienda,
  onEdit,
  onDelete,
  onView,
}: ViviendasCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value)
  }

  return (
    <motion.div
      className={viviendaCardStyles.card}
      variants={itemVariants}
      whileHover="hover"
      initial="initial"
      animate="initial"
      onClick={() => onView?.(vivienda)}
    >
      <motion.div variants={cardHoverVariants}>
        {/* Header */}
        <div className={viviendaCardStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Vivienda #{vivienda.numero}</h3>
            </div>
            <Badge className={`${viviendaCardStyles.badge} ${estadoColors[vivienda.estado]}`}>
              {estadoLabels[vivienda.estado]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className={viviendaCardStyles.content}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Área: {vivienda.area} m²</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Habitaciones:</span>
              <span className="font-medium">{vivienda.habitaciones || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Baños:</span>
              <span className="font-medium">{vivienda.banos || 'N/A'}</span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(vivienda.precio)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={viviendaCardStyles.footer}>
          <div className="text-xs text-muted-foreground">
            ID: {vivienda.id.slice(0, 8)}...
          </div>

          <div className={viviendaCardStyles.actions}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className={viviendaCardStyles.button}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(vivienda)
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className={`${viviendaCardStyles.button} hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400`}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(vivienda.id)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
