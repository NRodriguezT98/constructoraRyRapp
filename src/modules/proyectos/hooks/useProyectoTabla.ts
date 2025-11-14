/**
 * useProyectoTabla - Hook con lógica de negocio para tabla de proyectos
 * ✅ Cálculos optimizados con useMemo
 * ✅ Lógica reutilizable y testeable
 * ✅ Separación de responsabilidades
 */

import { useMemo } from 'react'
import type { Proyecto } from '../types'

export function useProyectoTabla(proyecto: Proyecto) {
  const estadisticas = useMemo(() => {
    const totalViviendas = proyecto.manzanas.reduce(
      (sum, m) => sum + m.totalViviendas,
      0
    )
    
    const totalVendidas = proyecto.manzanas.reduce(
      (sum, m) => sum + m.viviendasVendidas,
      0
    )
    
    // TODO: Query real para asignadas (con cliente_id pero no vendidas)
    const totalAsignadas = 0
    
    const totalDisponibles = totalViviendas - totalVendidas - totalAsignadas
    
    const porcentajeVendidas = totalViviendas > 0 
      ? (totalVendidas / totalViviendas) * 100 
      : 0
      
    const porcentajeAsignadas = totalViviendas > 0 
      ? (totalAsignadas / totalViviendas) * 100 
      : 0
    
    return {
      totalViviendas,
      totalVendidas,
      totalAsignadas,
      totalDisponibles,
      porcentajeVendidas,
      porcentajeAsignadas,
    }
  }, [proyecto.manzanas])
  
  return estadisticas
}
