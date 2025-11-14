/**
 * ============================================
 * COMPONENTE: Matriz de Permisos
 * ============================================
 *
 * Componente administrativo para gestionar permisos por rol.
 * Muestra matriz visual rol × módulo × acción.
 *
 * CARACTERÍSTICAS:
 * - Solo visible para Administrador
 * - Switch para activar/desactivar permisos
 * - Actualización en tiempo real
 * - Agrupación por módulo
 */

'use client'

import { motion } from 'framer-motion'
import { Check, Loader2, Lock, Shield, X } from 'lucide-react'
import { useState } from 'react'

import {
    useActualizarPermisoMutation,
    usePermisosQuery,
    useTodosLosPermisosQuery,
} from '../hooks'
import type { Rol } from '../types'

export function PermisosMatrix() {
  const { esAdmin } = usePermisosQuery()
  const { data: permisos = [], isLoading } = useTodosLosPermisosQuery()
  const actualizarPermisoMutation = useActualizarPermisoMutation()

  const [filtroRol, setFiltroRol] = useState<Rol | 'todos'>('todos')

  // Si no es admin, no mostrar nada
  if (!esAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Lock className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Acceso Denegado
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Solo administradores pueden gestionar permisos
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando permisos...
          </p>
        </div>
      </div>
    )
  }

  // Agrupar permisos por rol y módulo
  const permisosPorRol: Record<Rol, Record<string, typeof permisos>> = {
    Administrador: {},
    Contador: {},
    Supervisor: {},
    Gerente: {},
  }

  permisos.forEach(permiso => {
    const rol = permiso.rol as Rol
    const modulo = permiso.modulo

    if (!permisosPorRol[rol]) permisosPorRol[rol] = {}
    if (!permisosPorRol[rol][modulo]) permisosPorRol[rol][modulo] = []
    permisosPorRol[rol][modulo].push(permiso)
  })

  const roles: Rol[] = ['Administrador', 'Contador', 'Supervisor', 'Gerente']
  const modulos = Array.from(new Set(permisos.map(p => p.modulo)))

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Permisos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configura permisos por rol de forma granular
            </p>
          </div>
        </div>

        {/* Filtro de Rol */}
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value as Rol | 'todos')}
          className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        >
          <option value="todos">Todos los roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Contador">Contador</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Gerente">Gerente</option>
        </select>
      </div>

      {/* Matriz de Permisos */}
      <div className="space-y-6">
        {roles
          .filter(rol => filtroRol === 'todos' || filtroRol === rol)
          .map(rol => (
            <motion.div
              key={rol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-4"
            >
              {/* Header del Rol */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    rol === 'Administrador'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : rol === 'Contador'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : rol === 'Supervisor'
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      rol === 'Administrador'
                        ? 'text-red-600 dark:text-red-400'
                        : rol === 'Contador'
                          ? 'text-blue-600 dark:text-blue-400'
                          : rol === 'Supervisor'
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-purple-600 dark:text-purple-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {rol}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {permisos.filter(p => p.rol === rol && p.permitido).length}{' '}
                    permisos activos
                  </p>
                </div>
              </div>

              {/* Módulos */}
              <div className="space-y-3">
                {modulos.map(modulo => {
                  const permisosModulo = permisosPorRol[rol]?.[modulo] || []

                  if (permisosModulo.length === 0) return null

                  return (
                    <div
                      key={modulo}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2"
                    >
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                        {modulo}
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {permisosModulo.map(permiso => (
                          <motion.button
                            key={permiso.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleTogglePermiso(permiso.id, permiso.permitido)
                            }
                            disabled={
                              rol === 'Administrador' ||
                              actualizarPermisoMutation.isPending
                            }
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              permiso.permitido
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                            } ${
                              rol === 'Administrador'
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:shadow-md'
                            }`}
                          >
                            {permiso.permitido ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            {permiso.accion}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
      </div>

      {/* Info Administrador */}
      {filtroRol === 'todos' || filtroRol === 'Administrador' ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            <strong>Nota:</strong> El rol Administrador tiene acceso total
            automático (bypass). Los permisos se muestran solo como referencia.
          </p>
        </div>
      ) : null}
    </div>
  )
}
