/**
 * ============================================
 * SERVICE: Gestión de Usuarios v2
 * ============================================
 *
 * Funciones puras para CRUD de usuarios.
 * Patrón: logger.error() + throw Error (Regla #4)
 * No usa clase — funciones exportadas directamente.
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarUsuarioData,
  CrearUsuarioData,
  CrearUsuarioRespuesta,
  EstadisticasUsuarios,
  EstadoUsuario,
  FiltrosUsuarios,
  Rol,
  UsuarioCompleto,
} from '../types'

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Genera una contraseña temporal criptográficamente segura (12 chars).
 * Garantiza al menos 1 mayúscula, 1 minúscula, 1 número y 1 especial.
 */
function generarPasswordTemporal(): string {
  const length = 12
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

  const randomIndex = (max: number): number => {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % max
  }

  let password =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[randomIndex(26)] +
    'abcdefghijklmnopqrstuvwxyz'[randomIndex(26)] +
    '0123456789'[randomIndex(10)] +
    '!@#$%^&*'[randomIndex(8)]

  for (let i = password.length; i < length; i++) {
    password += charset[randomIndex(charset.length)]
  }

  // Fisher-Yates shuffle con crypto
  const chars = password.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// ============================================
// QUERIES
// ============================================

/**
 * Obtiene la lista de usuarios con filtros opcionales.
 */
export async function obtenerUsuarios(
  filtros?: FiltrosUsuarios
): Promise<UsuarioCompleto[]> {
  let query = supabase.from('vista_usuarios_completos').select('*')

  if (filtros?.busqueda) {
    const b = `%${filtros.busqueda}%`
    query = query.or(`nombres.ilike.${b},apellidos.ilike.${b},email.ilike.${b}`)
  }
  if (filtros?.rol) {
    query = query.eq('rol', filtros.rol)
  }
  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  const { data, error } = await query.order('fecha_creacion', {
    ascending: false,
  })

  if (error) {
    logger.error('❌ [USUARIOS] Error obteniendo usuarios:', error)
    throw new Error(`Error al obtener usuarios: ${error.message}`)
  }

  return (data ?? []) as unknown as UsuarioCompleto[]
}

/**
 * Obtiene un usuario por ID. Retorna null si no existe.
 */
export async function obtenerUsuarioPorId(
  id: string
): Promise<UsuarioCompleto | null> {
  const { data, error } = await supabase
    .from('vista_usuarios_completos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error('❌ [USUARIOS] Error obteniendo usuario por ID:', error)
    throw new Error(`Error al obtener usuario: ${error.message}`)
  }

  return data as unknown as UsuarioCompleto
}

/**
 * Calcula estadísticas del módulo de usuarios.
 * Nota: Carga todos los usuarios una sola vez para calcular en cliente.
 */
export async function obtenerEstadisticasUsuarios(): Promise<EstadisticasUsuarios> {
  const usuarios = await obtenerUsuarios()

  const stats: EstadisticasUsuarios = {
    total: usuarios.length,
    activos: 0,
    inactivos: 0,
    bloqueados: 0,
    activos_hoy: 0,
    por_rol: {
      Administrador: 0,
      Contabilidad: 0,
      'Administrador de Obra': 0,
      Gerencia: 0,
    },
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (const u of usuarios) {
    stats.por_rol[u.rol]++

    if (u.estado === 'Activo') stats.activos++
    else if (u.estado === 'Inactivo') stats.inactivos++
    else if (u.estado === 'Bloqueado') stats.bloqueados++

    if (u.ultimo_acceso && new Date(u.ultimo_acceso) >= hoy) {
      stats.activos_hoy++
    }
  }

  return stats
}

// ============================================
// MUTACIONES
// ============================================

/**
 * Crea un nuevo usuario en auth + perfil.
 * Requiere que el usuario actual sea Administrador.
 */
export async function crearUsuario(
  datos: CrearUsuarioData
): Promise<CrearUsuarioRespuesta> {
  const passwordTemporal = datos.password ?? generarPasswordTemporal()
  const passwordProporcionado = !!datos.password

  // Verificar que el usuario actual es administrador
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser()

  if (!adminUser) {
    throw new Error('No autenticado')
  }

  const { data: adminPerfil, error: adminError } = await supabase
    .from('usuarios')
    .select('rol, estado')
    .eq('id', adminUser.id)
    .single()

  if (
    adminError ||
    adminPerfil?.rol !== 'Administrador' ||
    adminPerfil?.estado !== 'Activo'
  ) {
    throw new Error('No tienes permisos para crear usuarios')
  }

  // Crear en auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: datos.email,
    password: passwordTemporal,
    options: {
      data: {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        rol: datos.rol,
      },
      emailRedirectTo: undefined,
    },
  })

  if (authError || !authData.user) {
    logger.error('❌ [USUARIOS] Error creando usuario en auth:', authError)
    throw new Error(
      `Error al crear usuario: ${authError?.message ?? 'Sin respuesta de auth'}`
    )
  }

  // Esperar al trigger handle_new_user (crea perfil automáticamente)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Actualizar datos adicionales del perfil
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({
      telefono: datos.telefono ?? null,
      creado_por: adminUser.id,
      debe_cambiar_password: !passwordProporcionado,
    })
    .eq('id', authData.user.id)

  if (updateError) {
    logger.error(
      '⚠️ [USUARIOS] Error actualizando perfil (no crítico):',
      updateError
    )
  }

  const usuarioCreado = await obtenerUsuarioPorId(authData.user.id)

  if (!usuarioCreado) {
    throw new Error('Usuario creado pero no se pudo obtener el perfil')
  }

  return {
    usuario: usuarioCreado,
    password_temporal: passwordProporcionado ? undefined : passwordTemporal,
    invitacion_enviada: datos.enviar_invitacion ?? false,
  }
}

/**
 * Actualiza los datos de un usuario existente.
 */
export async function actualizarUsuario(
  id: string,
  datos: ActualizarUsuarioData
): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update(datos as Record<string, unknown>)
    .eq('id', id)

  if (error) {
    logger.error('❌ [USUARIOS] Error actualizando usuario:', error)
    throw new Error(`Error al actualizar usuario: ${error.message}`)
  }
}

/**
 * Cambia el estado de un usuario (Activo, Inactivo, Bloqueado).
 */
export async function cambiarEstadoUsuario(
  id: string,
  nuevoEstado: EstadoUsuario
): Promise<void> {
  await actualizarUsuario(id, { estado: nuevoEstado })
}

/**
 * Cambia el rol de un usuario.
 */
export async function cambiarRolUsuario(
  id: string,
  nuevoRol: Rol
): Promise<void> {
  await actualizarUsuario(id, { rol: nuevoRol })
}

/**
 * Desbloquea un usuario reseteando sus intentos fallidos.
 */
export async function desbloquearUsuario(id: string): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update({ estado: 'Activo', intentos_fallidos: 0, bloqueado_hasta: null })
    .eq('id', id)

  if (error) {
    logger.error('❌ [USUARIOS] Error desbloqueando usuario:', error)
    throw new Error(`Error al desbloquear usuario: ${error.message}`)
  }
}
