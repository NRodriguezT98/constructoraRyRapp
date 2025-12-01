/**
 * useClienteCard - Hook con lógica de negocio para ClienteCardCompacta
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * ✅ Manejo de eventos
 * ✅ Cálculos y transformaciones
 */

import {
    Home,
    UserCheck,
    UserPlus,
    UserX,
} from 'lucide-react'
import { useMemo } from 'react'

import type { ClienteResumen } from '../types'

interface UseClienteCardProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

// Iconos por estado
const IconosPorEstado = {
  Interesado: UserPlus,
  Activo: UserCheck,
  Inactivo: UserX,
  Propietario: Home,
  'En Proceso de Renuncia': UserX,
}

// Configuración de colores por estado
const estadoConfig: Record<string, {
  gradient: string
  bg: string
  glow: string
  shadow: string
}> = {
  Interesado: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    glow: 'from-blue-500/5 via-cyan-500/5 to-blue-500/5',
    shadow: 'shadow-blue-500/30',
  },
  Activo: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    glow: 'from-emerald-500/5 via-teal-500/5 to-emerald-500/5',
    shadow: 'shadow-emerald-500/30',
  },
  Inactivo: {
    gradient: 'from-gray-500 to-slate-500',
    bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
    glow: 'from-gray-500/5 via-slate-500/5 to-gray-500/5',
    shadow: 'shadow-gray-500/30',
  },
  Propietario: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    glow: 'from-purple-500/5 via-pink-500/5 to-purple-500/5',
    shadow: 'shadow-purple-500/30',
  },
  'En Proceso de Renuncia': {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-gradient-to-r from-orange-500 to-red-500',
    glow: 'from-orange-500/5 via-red-500/5 to-orange-500/5',
    shadow: 'shadow-orange-500/30',
  },
}

export function useClienteCard({
  cliente,
  onVer,
  onEditar,
  onEliminar,
}: UseClienteCardProps) {
  // Configuración de colores
  const config = useMemo(
    () => estadoConfig[cliente.estado] || estadoConfig.Interesado,
    [cliente.estado]
  )

  // Indicadores booleanos
  const tieneNegociacionActiva = useMemo(
    () => cliente.estadisticas.negociaciones_activas > 0,
    [cliente.estadisticas.negociaciones_activas]
  )

  const esInteresadoSinNegociacion = useMemo(
    () => cliente.estado === 'Interesado' && !tieneNegociacionActiva,
    [cliente.estado, tieneNegociacionActiva]
  )

  // Label del estado para badge
  const estadoLabel = useMemo(
    () => cliente.estado === 'En Proceso de Renuncia' ? 'RENUNCIA' : cliente.estado.toUpperCase(),
    [cliente.estado]
  )

  // Handlers
  const handleVer = () => {
    if (onVer) onVer(cliente)
  }

  const handleEditar = () => {
    if (onEditar) onEditar(cliente)
  }

  const handleEliminar = () => {
    if (onEliminar) onEliminar(cliente)
  }

  return {
    config,
    tieneNegociacionActiva,
    esInteresadoSinNegociacion,
    estadoLabel,
    handleVer,
    handleEditar,
    handleEliminar,
  }
}

// Función helper para obtener el icono según el estado
export function obtenerIconoEstado(estado: string) {
  const iconos: Record<string, typeof UserPlus> = {
    Interesado: UserPlus,
    Activo: UserCheck,
    Inactivo: UserX,
    Propietario: Home,
    'En Proceso de Renuncia': UserX,
  }
  return iconos[estado] || UserPlus
}
