/**
 * UsuariosTabla — Vista tabla del módulo de usuarios
 * ✅ Columnas: Avatar+Nombre | Email | Rol | Estado | Último acceso | Acciones
 * ✅ Badges de rol/estado con colores del sistema
 * ✅ Hover por fila con botón de edición
 * ✅ Skeleton loader y empty state
 */

'use client'

import { motion } from 'framer-motion'
import { Pencil, UserPlus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import type { UsuarioCompleto } from '../types'
import {
  getEstadoUI,
  getIniciales,
  getNombreCompleto,
  getRolUI,
} from '../types'

interface UsuariosTablaProps {
  usuarios: UsuarioCompleto[]
  cargando: boolean
  hayFiltrosActivos: boolean
  canEdit: boolean
}

export function UsuariosTabla({
  usuarios,
  cargando,
  hayFiltrosActivos,
  canEdit,
}: UsuariosTablaProps) {
  const router = useRouter()

  if (cargando) {
    return <SkeletonTabla />
  }

  if (usuarios.length === 0) {
    return (
      <EmptyState
        hayFiltrosActivos={hayFiltrosActivos}
        canCreate={canEdit}
        onNuevo={() => router.push('/usuarios/nueva')}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className={styles.tabla.container}
    >
      <div className={styles.tabla.wrapper}>
        <table className={styles.tabla.table}>
          <thead className={styles.tabla.thead}>
            <tr>
              <th className={styles.tabla.th}>Usuario</th>
              <th className={styles.tabla.th}>Email</th>
              <th className={styles.tabla.th}>Rol</th>
              <th className={styles.tabla.th}>Estado</th>
              <th className={styles.tabla.th}>Último login</th>
              <th className={styles.tabla.th}>Último acceso</th>
              {canEdit ? (
                <th className={styles.tabla.thRight}>Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody className={styles.tabla.tbody}>
            {usuarios.map(usuario => (
              <FilaUsuario
                key={usuario.id}
                usuario={usuario}
                canEdit={canEdit}
                onEditar={() => router.push(`/usuarios/${usuario.id}/editar`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ── Fila individual ────────────────────────────────────────────────────────

interface FilaUsuarioProps {
  usuario: UsuarioCompleto
  canEdit: boolean
  onEditar: () => void
}

function FilaUsuario({ usuario, canEdit, onEditar }: FilaUsuarioProps) {
  const rolUI = getRolUI(usuario.rol)
  const estadoUI = getEstadoUI(usuario.estado)
  const iniciales = getIniciales(usuario)
  const nombreCompleto = getNombreCompleto(usuario)

  return (
    <tr className={styles.tabla.tr}>
      {/* Avatar + Nombre */}
      <td className={styles.tabla.td}>
        <div className={styles.tabla.avatarCell}>
          <div className={styles.tabla.avatar}>{iniciales}</div>
          <div>
            <p className={styles.tabla.avatarName}>{nombreCompleto}</p>
            {usuario.debe_cambiar_password ? (
              <p className={styles.tabla.avatarWarning}>
                Debe cambiar contraseña
              </p>
            ) : null}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.email}>{usuario.email}</span>
      </td>

      {/* Rol */}
      <td className={styles.tabla.td}>
        <span className={`${styles.tabla.badge} ${rolUI.badgeClass}`}>
          {rolUI.label}
        </span>
      </td>

      {/* Estado */}
      <td className={styles.tabla.td}>
        <span className={`${styles.tabla.badge} ${estadoUI.badgeClass}`}>
          {estadoUI.label}
        </span>
      </td>

      {/* Último login */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.fecha}>
          {usuario.ultimo_login
            ? formatDateCompact(usuario.ultimo_login)
            : 'Nunca'}
        </span>
      </td>

      {/* Último acceso */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.fecha}>
          {usuario.ultimo_acceso
            ? formatDateCompact(usuario.ultimo_acceso)
            : 'Nunca'}
        </span>
      </td>

      {/* Acciones */}
      {canEdit ? (
        <td className={styles.tabla.tdRight}>
          <button
            onClick={onEditar}
            className={styles.tabla.actionButton}
            title={`Editar ${nombreCompleto}`}
            aria-label={`Editar ${nombreCompleto}`}
          >
            <Pencil className='h-4 w-4' />
          </button>
        </td>
      ) : null}
    </tr>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonTabla() {
  return (
    <div className={styles.tabla.container}>
      <div className={styles.tabla.wrapper}>
        <table className={styles.tabla.table}>
          <thead className={styles.tabla.thead}>
            <tr>
              {['Usuario', 'Email', 'Rol', 'Estado', 'Último acceso', ''].map(
                h => (
                  <th key={h} className={styles.tabla.th}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className={styles.tabla.tbody}>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className={styles.tabla.tr}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className={styles.tabla.td}>
                    <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hayFiltrosActivos: boolean
  canCreate: boolean
  onNuevo?: () => void
}

function EmptyState({
  hayFiltrosActivos,
  canCreate,
  onNuevo,
}: EmptyStateProps) {
  return (
    <div className={styles.empty.container}>
      <div className={styles.empty.iconWrapper}>
        <UserPlus className={styles.empty.icon} />
      </div>
      <p className={styles.empty.title}>
        {hayFiltrosActivos ? 'Sin resultados' : 'No hay usuarios'}
      </p>
      <p className={styles.empty.subtitle}>
        {hayFiltrosActivos
          ? 'Ningún usuario coincide con los filtros actuales.'
          : 'Aún no hay usuarios registrados en el sistema.'}
      </p>
      {!hayFiltrosActivos && canCreate && onNuevo ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevo}
          className='mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-purple-700'
        >
          <UserPlus className='h-4 w-4' />
          Crear primer usuario
        </motion.button>
      ) : null}
    </div>
  )
}
