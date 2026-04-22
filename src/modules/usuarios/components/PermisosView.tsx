/**
 * PermisosView — Administración de permisos RBAC
 *
 * Componente presentacional que muestra la matriz de permisos
 * por módulo x acción x rol, con toggles editables en línea.
 *
 * - Sin emojis
 * - Sin datos hardcodeados (todo viene de la BD via hook)
 * - Administrador siempre tiene acceso total (no editable)
 * - Diseño v2: glassmorphism + indigo/purple
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Check, Minus, Search, Shield, X } from 'lucide-react'

import {
  ETIQUETA_ACCION,
  ETIQUETA_MODULO,
  ETIQUETA_ROL,
  usePermisosAdmin,
} from '../hooks/usePermisosAdmin'
import type { Rol } from '../types'

import { permisosViewStyles as s } from './PermisosView.styles'

export function PermisosView() {
  const {
    permisosFiltrados,
    matriz,
    modulosFiltrados,
    rolesFiltrados,
    isLoading,
    error,
    isSaving,
    filtroRol,
    filtroModulo,
    busqueda,
    hayFiltrosActivos,
    modulosTodos,
    setFiltroRol,
    setFiltroModulo,
    setBusqueda,
    limpiarFiltros,
    handleToggle,
  } = usePermisosAdmin()

  // ── Estado: Cargando ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={s.loadingWrapper}>
        <div className={s.loadingSpinner} />
      </div>
    )
  }

  // ── Estado: Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={s.errorWrapper}>
        <div className={s.errorInner}>
          <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-500' />
          <div>
            <p className={s.errorTitle}>Error al cargar permisos</p>
            <p className={s.errorText}>{(error as Error).message}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Estado: Sin datos ────────────────────────────────────────────────────
  if (modulosTodos.length === 0) {
    return (
      <div className={s.emptyWrapper}>
        <Shield className='mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600' />
        <p className={s.emptyText}>
          No hay permisos configurados en el sistema
        </p>
      </div>
    )
  }

  return (
    <div className={s.container}>
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className={s.header.wrapper}>
        <div className={s.header.left}>
          <div className={s.header.iconWrapper}>
            <Shield className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className={s.header.title}>Permisos por Rol</h2>
            <p className={s.header.subtitle}>
              {permisosFiltrados.length} de {moduleActionsTotal(matriz)}{' '}
              permisos configurables
            </p>
          </div>
        </div>

        <div className={s.header.badge}>
          <Check className='h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400' />
          <span className={s.header.badgeText}>
            Cambios guardados automáticamente
          </span>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className={s.filtros.wrapper}>
        {/* Búsqueda */}
        <div className={s.filtros.searchWrapper}>
          <Search className={s.filtros.searchIcon} />
          <input
            type='text'
            placeholder='Buscar módulo o acción...'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={s.filtros.searchInput}
            aria-label='Buscar permisos'
          />
        </div>

        {/* Filtro por rol */}
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value as Rol | 'todos')}
          className={s.filtros.select}
          aria-label='Filtrar por rol'
        >
          <option value='todos'>Todos los roles</option>
          <option value='Contabilidad'>Contabilidad</option>
          <option value='Administrador de Obra'>Adm. de Obra</option>
          <option value='Gerencia'>Gerencia</option>
        </select>

        {/* Filtro por módulo */}
        <select
          value={filtroModulo}
          onChange={e => setFiltroModulo(e.target.value)}
          className={s.filtros.select}
          aria-label='Filtrar por módulo'
        >
          <option value='todos'>Todos los módulos</option>
          {modulosTodos.map(mod => (
            <option key={mod} value={mod}>
              {ETIQUETA_MODULO[mod] ?? mod}
            </option>
          ))}
        </select>

        {/* Limpiar filtros */}
        {hayFiltrosActivos ? (
          <button
            onClick={limpiarFiltros}
            className={s.filtros.clearButton}
            aria-label='Limpiar filtros'
          >
            <span className='flex items-center gap-1'>
              <X className='h-3 w-3' />
              Limpiar
            </span>
          </button>
        ) : null}
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className={s.tabla.wrapper}>
        <div className={s.tabla.overflow}>
          <table className={s.tabla.table}>
            {/* Encabezado */}
            <thead className={s.tabla.thead}>
              <tr>
                <th className={s.tabla.thModulo}>Módulo</th>
                <th className={s.tabla.thAccion}>Acción</th>

                {/* Columna Administrador (siempre, no filtrable) */}
                <th className={s.tabla.thAdmin}>
                  <span className='block'>Administrador</span>
                  <span className='mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-indigo-400/70 dark:text-indigo-500/60'>
                    Acceso total
                  </span>
                </th>

                {/* Columnas de roles editables */}
                {rolesFiltrados.map(rol => (
                  <th key={rol} className={s.tabla.thRol}>
                    {ETIQUETA_ROL[rol]}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Cuerpo */}
            <tbody className={s.tabla.tbody}>
              {modulosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + rolesFiltrados.length}
                    className='py-10 text-center text-sm text-gray-400 dark:text-gray-500'
                  >
                    Sin resultados para los filtros aplicados
                  </td>
                </tr>
              ) : null}

              {modulosFiltrados.map(modulo => {
                const accionesDelModulo = Object.keys(
                  matriz[modulo] ?? {}
                ).sort()

                return accionesDelModulo.map((accion, idx) => (
                  <motion.tr
                    key={`${modulo}-${accion}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className={s.tabla.tr}
                  >
                    {/* Módulo — solo en la primera fila del grupo */}
                    {idx === 0 ? (
                      <td
                        rowSpan={accionesDelModulo.length}
                        className={s.tabla.tdModulo}
                      >
                        {ETIQUETA_MODULO[modulo] ?? modulo}
                      </td>
                    ) : null}

                    {/* Acción */}
                    <td className={s.tabla.tdAccion}>
                      {ETIQUETA_ACCION[accion] ?? accion}
                    </td>

                    {/* Celda Administrador — siempre activo, no editable */}
                    <td className={s.tabla.tdCell}>
                      <span
                        className={s.tabla.toggleAdmin}
                        title='Administrador tiene acceso total'
                        aria-label='Administrador — acceso total'
                      >
                        <Check className='h-3.5 w-3.5' />
                      </span>
                    </td>

                    {/* Celdas de roles editables */}
                    {rolesFiltrados.map(rol => {
                      const permiso = matriz[modulo]?.[accion]?.[rol]

                      if (!permiso) {
                        return (
                          <td key={rol} className={s.tabla.tdCell}>
                            <span
                              className={s.tabla.toggleEmpty}
                              title='No aplica'
                            >
                              <Minus className='h-3.5 w-3.5' />
                            </span>
                          </td>
                        )
                      }

                      return (
                        <td key={rol} className={s.tabla.tdCell}>
                          <button
                            onClick={() =>
                              handleToggle(
                                permiso.id,
                                permiso.permitido,
                                rol,
                                modulo,
                                accion
                              )
                            }
                            disabled={isSaving}
                            className={
                              permiso.permitido
                                ? s.tabla.toggleOn
                                : s.tabla.toggleOff
                            }
                            title={
                              permiso.descripcion ||
                              `${ETIQUETA_ACCION[accion] ?? accion} en ${ETIQUETA_MODULO[modulo] ?? modulo} — ${ETIQUETA_ROL[rol]}`
                            }
                            aria-label={`${permiso.permitido ? 'Desactivar' : 'Activar'} permiso ${accion} en ${modulo} para ${rol}`}
                            aria-pressed={permiso.permitido}
                          >
                            {permiso.permitido ? (
                              <Check className='h-3.5 w-3.5' />
                            ) : (
                              <X className='h-3.5 w-3.5' />
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </motion.tr>
                ))
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        <div className={s.footer.wrapper}>
          <div className={s.footer.legend}>
            <span className={s.footer.legendItemActive}>
              <span className='flex h-4 w-4 items-center justify-center rounded bg-indigo-500'>
                <Check className='h-2.5 w-2.5 text-white' />
              </span>
              Permitido
            </span>
            <span className={s.footer.legendItem}>
              <span className='flex h-4 w-4 items-center justify-center rounded bg-gray-200 dark:bg-gray-700'>
                <X className='h-2.5 w-2.5' />
              </span>
              Denegado
            </span>
            <span className={s.footer.legendItem}>
              <Minus className='h-3.5 w-3.5' />
              No aplica
            </span>
          </div>
          <span className={s.footer.adminNote}>
            Administrador siempre tiene acceso total (no editable)
          </span>
        </div>
      </div>
    </div>
  )
}

/** Helper: total de permisos configurables (excluye Administrador) */
function moduleActionsTotal(
  matriz: Record<string, Record<string, Record<string, unknown>>>
) {
  let total = 0
  Object.values(matriz).forEach(acciones => {
    Object.values(acciones).forEach(roles => {
      // Contar solo roles que no sean Administrador
      total += Object.keys(roles).filter(r => r !== 'Administrador').length
    })
  })
  return total
}
