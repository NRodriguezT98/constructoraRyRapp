import { useState } from 'react'

import { logger } from '@/lib/utils/logger'

import {
  obtenerEstadoCategoriasPorModulo,
  verificarCategoriasPorModulo,
} from '../services/categorias-sistema.service'

export type Modulo = 'clientes' | 'proyectos' | 'viviendas'

export interface ResultadoModulo {
  tipo: 'success' | 'error' | 'info' | null
  mensaje: string
  categorias?: Array<{ categoria_nombre: string; accion: string }>
}

export interface ModuloConfig {
  nombre: string
  expectedCount: number
}

const MODULOS_CONFIG: Record<Modulo, ModuloConfig> = {
  clientes: { nombre: 'Clientes', expectedCount: 6 },
  proyectos: { nombre: 'Proyectos', expectedCount: 5 },
  viviendas: { nombre: 'Viviendas', expectedCount: 8 },
}

export function useCategoriasSistema() {
  const [verificandoModulo, setVerificandoModulo] = useState<Modulo | null>(
    null
  )
  const [resultados, setResultados] = useState<Record<Modulo, ResultadoModulo>>(
    {
      clientes: { tipo: null, mensaje: '' },
      proyectos: { tipo: null, mensaje: '' },
      viviendas: { tipo: null, mensaje: '' },
    }
  )

  const verificarModulo = async (modulo: Modulo) => {
    setVerificandoModulo(modulo)
    setResultados(prev => ({
      ...prev,
      [modulo]: {
        tipo: 'info',
        mensaje: `Verificando categorías de ${MODULOS_CONFIG[modulo].nombre}...`,
      },
    }))

    try {
      // Obtener estado actual
      const estado = await obtenerEstadoCategoriasPorModulo(modulo)
      const expected = MODULOS_CONFIG[modulo].expectedCount

      if (estado.activas === expected) {
        setResultados(prev => ({
          ...prev,
          [modulo]: {
            tipo: 'success',
            mensaje: `✅ Todas las categorías están activas (${estado.activas}/${expected})`,
          },
        }))
        setVerificandoModulo(null)
        return
      }

      // Si faltan categorías, ejecutar verificación y creación
      const response = await verificarCategoriasPorModulo(modulo)

      if (response.success) {
        setResultados(prev => ({
          ...prev,
          [modulo]: {
            tipo: 'success',
            mensaje: response.mensaje,
            categorias: response.categorias,
          },
        }))
      } else {
        setResultados(prev => ({
          ...prev,
          [modulo]: {
            tipo: 'error',
            mensaje: response.error || 'Error al verificar categorías',
          },
        }))
      }
    } catch (error) {
      logger.error(`Error al verificar categorías de ${modulo}:`, error)
      setResultados(prev => ({
        ...prev,
        [modulo]: {
          tipo: 'error',
          mensaje: 'Error inesperado al verificar categorías',
        },
      }))
    } finally {
      setVerificandoModulo(null)
    }
  }

  return {
    verificandoModulo,
    resultados,
    verificarModulo,
  }
}
