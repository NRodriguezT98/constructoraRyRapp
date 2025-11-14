/**
 * ============================================
 * COMPONENTE: Matriz de Permisos Compacta (UX Moderno)
 * ============================================
 *
 * ✨ Inspirado en Auth0, AWS IAM, Firebase Console
 *
 * Características:
 * - Vista de tabla compacta tipo spreadsheet
 * - Filtros inteligentes (rol, módulo, búsqueda)
 * - Checkboxes visuales (verde/gris)
 * - Responsive (colapsa columnas en móvil)
 * - Edición en línea sin modales
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckSquare, Info, Search, Shield, Square } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useActualizarPermisoMutation, useTodosLosPermisosQuery } from '../hooks'
import type { Rol } from '../types'

export function PermisosMatrixCompact() {
  const { data: permisos = [], isLoading, error } = useTodosLosPermisosQuery()
  const actualizarPermisoMutation = useActualizarPermisoMutation()

  // Estados de filtros
  const [filtroRol, setFiltroRol] = useState<Rol | 'todos'>('todos')
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Roles disponibles
  const roles: Rol[] = ['Administrador', 'Contador', 'Supervisor', 'Gerente']

  // Extraer módulos y acciones únicas
  const modulos = useMemo(() =>
    Array.from(new Set(permisos.map(p => p.modulo))).sort(),
    [permisos]
  )

  // Agrupar permisos: { rol: { modulo: { accion: permiso } } }
  const permisosPorRolModulo = useMemo(() => {
    const result: Record<string, Record<string, Record<string, any>>> = {}

    permisos.forEach(permiso => {
      if (!result[permiso.rol]) result[permiso.rol] = {}
      if (!result[permiso.rol][permiso.modulo]) result[permiso.rol][permiso.modulo] = {}
      result[permiso.rol][permiso.modulo][permiso.accion] = permiso
    })

    // Debug: mostrar roles encontrados
    console.log('🔍 Roles en permisos:', Object.keys(result))
    console.log('📊 Total permisos:', permisos.length)

    return result
  }, [permisos])

  // Permisos filtrados
  const permisosFiltrados = useMemo(() => {
    let filtered = permisos

    if (filtroRol !== 'todos') {
      filtered = filtered.filter(p => p.rol === filtroRol)
    }

    if (filtroModulo !== 'todos') {
      filtered = filtered.filter(p => p.modulo === filtroModulo)
    }

    if (busqueda) {
      const search = busqueda.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.modulo.toLowerCase().includes(search) ||
          p.accion.toLowerCase().includes(search) ||
          p.descripcion?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [permisos, filtroRol, filtroModulo, busqueda])

  const handleTogglePermiso = async (id: string, permitidoActual: boolean) => {
    try {
      await actualizarPermisoMutation.mutateAsync({
        id,
        permitido: !permitidoActual,
      })
    } catch (error) {
      console.error('Error actualizando permiso:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error al cargar permisos</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Matriz de Permisos
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {permisosFiltrados.length} de {permisos.length} permisos
            </p>
          </div>
        </div>

        {/* Info Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Click para activar/desactivar
          </span>
        </div>
      </div>

      {/* Filtros Horizontales Compactos */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar módulo, acción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {/* Filtro Rol */}
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value as Rol | 'todos')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        >
          <option value="todos">📋 Todos los roles</option>
          <option value="Administrador">👑 Administrador</option>
          <option value="Contador">📊 Contador</option>
          <option value="Supervisor">👁️ Supervisor</option>
          <option value="Gerente">💼 Gerente</option>
        </select>

        {/* Filtro Módulo */}
        <select
          value={filtroModulo}
          onChange={e => setFiltroModulo(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        >
          <option value="todos">📁 Todos los módulos</option>
          {modulos.map(mod => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>

        {/* Limpiar Filtros */}
        {(filtroRol !== 'todos' || filtroModulo !== 'todos' || busqueda) && (
          <button
            onClick={() => {
              setFiltroRol('todos')
              setFiltroModulo('todos')
              setBusqueda('')
            }}
            className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla Compacta Estilo AWS IAM / Auth0 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  Módulo
                </th>
                <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider" style={{ left: '140px' }}>
                  Acción
                </th>
                {(filtroRol === 'todos' ? roles : [filtroRol as Rol]).map(rol => (
                  <th
                    key={rol}
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {rol === 'Administrador' && '👑'}
                      {rol === 'Contador' && '📊'}
                      {rol === 'Supervisor' && '👁️'}
                      {rol === 'Gerente' && '💼'}
                      <span className="hidden md:inline">{rol}</span>
                      <span className="md:hidden">{rol.slice(0, 4)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {modulos
                .filter(mod => filtroModulo === 'todos' || filtroModulo === mod)
                .map(modulo => {
                  const accionesDelModulo = Array.from(
                    new Set(
                      permisosFiltrados
                        .filter(p => p.modulo === modulo)
                        .map(p => p.accion)
                    )
                  ).sort()

                  if (accionesDelModulo.length === 0) return null

                  return accionesDelModulo.map((accion, idx) => (
                    <motion.tr
                      key={`${modulo}-${accion}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Columna Módulo (merged) */}
                      {idx === 0 && (
                        <td
                          rowSpan={accionesDelModulo.length}
                          className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 align-top"
                        >
                          <div className="flex items-center gap-2">
                            <span>📁</span>
                            <span>{modulo}</span>
                          </div>
                        </td>
                      )}

                      {/* Columna Acción */}
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {accion}
                      </td>

                      {/* Columnas de Roles con Checkboxes */}
                      {(filtroRol === 'todos' ? roles : [filtroRol as Rol]).map(rol => {
                        const permiso = permisosPorRolModulo[rol]?.[modulo]?.[accion]
                        const isAdmin = rol === 'Administrador'

                        return (
                          <td key={rol} className="px-4 py-3 text-center">
                            {permiso ? (
                              <button
                                onClick={() =>
                                  !isAdmin && handleTogglePermiso(permiso.id, permiso.permitido)
                                }
                                disabled={isAdmin || actualizarPermisoMutation.isPending}
                                className={`
                                  inline-flex items-center justify-center w-6 h-6 rounded transition-all
                                  ${
                                    permiso.permitido
                                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                  }
                                  ${
                                    isAdmin
                                      ? 'opacity-60 cursor-not-allowed'
                                      : 'cursor-pointer hover:scale-110'
                                  }
                                `}
                                title={
                                  isAdmin
                                    ? 'Administrador tiene acceso total'
                                    : permiso.descripcion || `${accion} en ${modulo}`
                                }
                              >
                                {permiso.permitido ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-700">-</span>
                            )}
                          </td>
                        )
                      })}
                    </motion.tr>
                  ))
                })}
            </tbody>
          </table>
        </div>

        {/* Footer con leyenda */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-green-500" />
              Permitido
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5 text-gray-400" />
              Denegado
            </span>
          </div>
          <span className="flex items-center gap-1">
            <span>👑</span>
            <span>Administrador tiene control total (no editable)</span>
          </span>
        </div>
      </div>
    </div>
  )
}
