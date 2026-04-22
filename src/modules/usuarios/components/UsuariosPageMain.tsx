/**
 * UsuariosPageMain — Orquestador principal del módulo de usuarios
 * ✅ Componente Client-side que consume useUsuariosList
 * ✅ Renderiza: Header → Métricas → Filtros → Tabla
 * ✅ Vista tabla (similar a vista anterior)
 */

'use client'

import { useUsuariosList } from '../hooks/useUsuariosList'
import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'

import { UsuariosHeaderPremium } from './UsuariosHeaderPremium'
import { UsuariosListaFiltros } from './UsuariosListaFiltros'
import { UsuariosMetricasPremium } from './UsuariosMetricasPremium'
import { UsuariosTabla } from './UsuariosTabla'
import { UsuariosTabs } from './UsuariosTabs'

interface UsuariosPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  isAdmin?: boolean
}

export function UsuariosPageMain({
  canCreate = false,
  canEdit = false,
  isAdmin = false,
}: UsuariosPageMainProps) {
  const {
    usuarios,
    estadisticas,
    cargandoUsuarios,
    cargandoEstadisticas,
    estadoFiltro,
    setEstadoFiltro,
    busqueda,
    setBusqueda,
    rolFiltro,
    setRolFiltro,
    hayFiltrosActivos,
    limpiarFiltros,
  } = useUsuariosList()

  const puedeCrear = canCreate || isAdmin
  const puedeEditar = canEdit || isAdmin

  /** Contenido del tab "Usuarios": filtros + tabla */
  const listaContent = (
    <>
      {/* Filtros */}
      <UsuariosListaFiltros
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        rolFiltro={rolFiltro}
        onRolFiltroChange={setRolFiltro}
        estadoFiltro={estadoFiltro}
        onEstadoFiltroChange={setEstadoFiltro}
        totalResultados={usuarios?.length ?? 0}
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Tabla */}
      <UsuariosTabla
        usuarios={usuarios ?? []}
        cargando={cargandoUsuarios}
        hayFiltrosActivos={hayFiltrosActivos}
        canEdit={puedeEditar}
      />
    </>
  )

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* Header */}
        <UsuariosHeaderPremium
          totalUsuarios={estadisticas?.total ?? 0}
          canCreate={puedeCrear}
        />

        {/* Métricas */}
        {!cargandoEstadisticas ? (
          <UsuariosMetricasPremium estadisticas={estadisticas} />
        ) : null}

        {/* Tabs (solo admin ve "Permisos RBAC") o listado directo */}
        {isAdmin ? <UsuariosTabs>{listaContent}</UsuariosTabs> : listaContent}
      </div>
    </div>
  )
}
