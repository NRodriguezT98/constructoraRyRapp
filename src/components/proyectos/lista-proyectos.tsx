'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Edit,
    Eye,
    MapPin,
    MoreVertical,
    Trash2
} from 'lucide-react'
import { useProyectosStore } from '../../store/proyectos-store'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const estadoColors = {
  en_planificacion:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  en_construccion:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pausado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

const estadoLabels = {
  en_planificacion: 'En Planificación',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

interface ListaProyectosProps {
  filtro?: string
  vistaGrid?: boolean
}

export function ListaProyectos({
  filtro = '',
  vistaGrid = true,
}: ListaProyectosProps) {
  const { proyectos, eliminarProyecto } = useProyectosStore()

  const proyectosFiltrados = proyectos.filter(
    proyecto =>
      proyecto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      proyecto.ubicacion.toLowerCase().includes(filtro.toLowerCase()) ||
      proyecto.descripcion.toLowerCase().includes(filtro.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      },
    },
  }

  if (proyectosFiltrados.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='py-12 text-center'
      >
        <Building2 className='mx-auto mb-4 h-16 w-16 text-gray-400' />
        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
          {filtro ? 'No se encontraron proyectos' : 'No hay proyectos creados'}
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          {filtro
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Comienza creando tu primer proyecto de construcción'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className={`grid gap-6 ${
        vistaGrid ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      }`}
    >
      {proyectosFiltrados.map(proyecto => (
        <motion.div key={proyecto.id} variants={itemVariants}>
          <Card className='group overflow-hidden border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:bg-gray-800/80 dark:hover:border-blue-800'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                    {proyecto.nombre}
                  </CardTitle>
                  <div className='mt-2 flex items-center gap-2'>
                    <Badge className={estadoColors[proyecto.estado]}>
                      {estadoLabels[proyecto.estado]}
                    </Badge>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {proyecto.progreso}% completado
                    </span>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='opacity-0 transition-opacity group-hover:opacity-100'
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              {/* Descripción */}
              <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-300'>
                {proyecto.descripcion}
              </p>

              {/* Información básica */}
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <MapPin className='h-4 w-4 flex-shrink-0' />
                  <span className='truncate'>{proyecto.ubicacion}</span>
                </div>

                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <Building2 className='h-4 w-4 flex-shrink-0' />
                  <span>
                    {proyecto.manzanas.length} manzana
                    {proyecto.manzanas.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <Calendar className='h-4 w-4 flex-shrink-0' />
                  <span>
                    Creado{' '}
                    {format(new Date(proyecto.fechaCreacion), 'dd MMM yyyy', {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className='space-y-1'>
                <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400'>
                  <span>Progreso</span>
                  <span>{proyecto.progreso}%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${proyecto.progreso}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600'
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className='flex gap-2 pt-2 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Eye className='mr-2 h-4 w-4' />
                  Ver
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Edit className='mr-2 h-4 w-4' />
                  Editar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                  onClick={() => eliminarProyecto(proyecto.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
