'use client'

/**
 * ============================================
 * COMPONENTE: Contenido de Gestión de Usuarios (Premium Design)
 * ============================================
 *
 * Contenido del módulo de usuarios con:
 * - Header hero con glassmorphism
 * - Stats cards premium
 * - Tabla moderna con badges gradientes
 * - Modales de crear/editar
 */

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus, Search, UserPlus } from 'lucide-react'

import {
  EstadisticasUsuariosPremium,
  ModalCrearUsuario,
  ModalEditarUsuario,
  usuariosPremiumStyles as styles,
  UsuariosHeader
} from '@/modules/usuarios/components'
import { useUsuarios } from '@/modules/usuarios/hooks'
import { ESTADOS_USUARIO, ROLES, type UsuarioCompleto } from '@/modules/usuarios/types'


interface UsuariosContentProps {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
}

export default function UsuariosContent({
  canView,
  canCreate,
  canEdit,
  canDelete,
  isAdmin,
}: UsuariosContentProps) {
  console.log('👥 [USUARIOS CONTENT] Props recibidos:', {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
  })

  const {
    usuarios,
    estadisticas,
    cargando,
    error,
    filtros,
    aplicarFiltros,
    limpiarFiltros,
    crearUsuario,
    actualizarUsuario,
  } = useUsuarios()

  // Estado de modales
  const [modalCrear, setModalCrear] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<UsuarioCompleto | null>(null)

  // Solo admins pueden ver esta página
  if (!canView || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a este módulo
          </p>
        </div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className={styles.loading.spinner} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:px-4 lg:px-6">
      {/* Header Hero */}
      <UsuariosHeader totalUsuarios={estadisticas?.total || 0} />

      {/* Estadísticas */}
      {estadisticas && (
        <EstadisticasUsuariosPremium estadisticas={estadisticas} />
      )}

      {/* 🎈 FAB SUPERIOR DERECHO (Solo si tiene permiso de crear) */}
      {canCreate && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className={styles.fab.container}
        >
          <button
            type="button"
            onClick={() => setModalCrear(true)}
            className={styles.fab.button}
          >
            <div className={styles.fab.buttonGlow} />
            <div className={styles.fab.buttonContent}>
              <Plus className={styles.fab.icon} />
              <span className={styles.fab.text}>Crear Usuario</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Filtros */}
      <div className={styles.filtros.container}>
        <div className={styles.filtros.wrapper}>
          {/* Búsqueda */}
          <div className={styles.filtros.searchWrapper}>
            <Search className={styles.filtros.searchIconLeft} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              className={styles.filtros.searchInput}
              value={filtros.busqueda || ''}
              onChange={(e) =>
                aplicarFiltros({ ...filtros, busqueda: e.target.value })
              }
            />
          </div>

          {/* Filtro Rol */}
          <select
            className={styles.filtros.select}
            value={filtros.rol || ''}
            onChange={(e) =>
              aplicarFiltros({
                ...filtros,
                rol: e.target.value ? (e.target.value as any) : undefined,
              })
            }
          >
            <option value="">Todos los roles</option>
            {ROLES.map((rol) => (
              <option key={rol.value} value={rol.value}>
                {rol.label}
              </option>
            ))}
          </select>

          {/* Filtro Estado */}
          <select
            className={styles.filtros.select}
            value={filtros.estado || ''}
            onChange={(e) =>
              aplicarFiltros({
                ...filtros,
                estado: e.target.value ? (e.target.value as any) : undefined,
              })
            }
          >
            <option value="">Todos los estados</option>
            {ESTADOS_USUARIO.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>

          {/* Limpiar Filtros */}
          {(filtros.busqueda || filtros.rol || filtros.estado) && (
            <button onClick={limpiarFiltros} className={styles.filtros.clearButton}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className={styles.tabla.container}>
        {error && (
          <div className="m-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {usuarios.length === 0 ? (
          <div className={styles.empty.wrapper}>
            <UserPlus className={styles.empty.icon} />
            <h3 className={styles.empty.title}>No hay usuarios</h3>
            <p className={styles.empty.description}>
              {filtros.busqueda || filtros.rol || filtros.estado
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'Comienza creando tu primer usuario'}
            </p>
          </div>
        ) : (
          <div className={styles.tabla.wrapper}>
            <table className={styles.tabla.table}>
              <thead className={styles.tabla.thead}>
                <tr>
                  <th className={styles.tabla.th}>Usuario</th>
                  <th className={styles.tabla.th}>Email</th>
                  <th className={styles.tabla.th}>Rol</th>
                  <th className={styles.tabla.th}>Estado</th>
                  <th className={styles.tabla.th}>Último Acceso</th>
                  {canEdit && <th className={styles.tabla.th}>Acciones</th>}
                </tr>
              </thead>
              <tbody className={styles.tabla.tbody}>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className={styles.tabla.tr}>
                    {/* Usuario */}
                    <td className={styles.tabla.td}>
                      <div className={styles.tabla.avatarCell}>
                        <div
                          className={`${styles.tabla.avatar} ${
                            styles.tabla.avatar.split(' ')[0]
                          } ${
                            ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-pink-500 to-rose-600', 'from-green-500 to-emerald-600', 'from-orange-500 to-amber-600', 'from-red-500 to-rose-600'][
                              usuario.email.charCodeAt(0) % 6
                            ]
                          }`}
                        >
                          {usuario.nombres.charAt(0).toUpperCase()}
                          {usuario.apellidos.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.tabla.avatarInfo}>
                          <div className={styles.tabla.avatarNombre}>
                            {usuario.nombres} {usuario.apellidos}
                          </div>
                          {usuario.debe_cambiar_password && (
                            <div className={styles.tabla.avatarWarning}>
                              Debe cambiar contraseña
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={styles.tabla.td}>
                      <div className={styles.tabla.email}>{usuario.email}</div>
                    </td>

                    {/* Rol */}
                    <td className={styles.tabla.td}>
                      <span
                        className={`${styles.tabla.badgeBase} ${
                          styles.tabla.badgeRol[usuario.rol]
                        }`}
                      >
                        {usuario.rol}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className={styles.tabla.td}>
                      <span
                        className={`${styles.tabla.badgeBase} ${
                          styles.tabla.badgeEstado[usuario.estado]
                        }`}
                      >
                        {usuario.estado}
                      </span>
                    </td>

                    {/* Último Acceso */}
                    <td className={styles.tabla.td}>
                      <div className={styles.tabla.email}>
                        {usuario.ultimo_acceso
                          ? new Date(usuario.ultimo_acceso).toLocaleDateString(
                              'es-CO',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : 'Nunca'}
                      </div>
                    </td>

                    {/* Acciones */}
                    {canEdit && (
                      <td className={styles.tabla.td}>
                        <button
                          className={styles.tabla.actionButton}
                          title="Editar usuario"
                          onClick={() => setUsuarioEditar(usuario)}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {canCreate && (
        <ModalCrearUsuario
          isOpen={modalCrear}
          onClose={() => setModalCrear(false)}
          onCrear={crearUsuario}
        />
      )}

      {canEdit && usuarioEditar && (
        <ModalEditarUsuario
          isOpen={!!usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
          usuario={usuarioEditar}
          onActualizar={actualizarUsuario}
        />
      )}
    </div>
  )
}
