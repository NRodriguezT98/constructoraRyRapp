/**
 * 🔗 UTILIDADES: GENERACIÓN Y RESOLUCIÓN DE SLUGS
 *
 * Convierte UUIDs en URLs amigables para mejor UX y SEO.
 *
 * Ejemplos:
 * - UUID: 3af5d98c-2747-441e-8114-224d37a7c050
 * - Slug: maria-garcia-lopez-3af5d98c
 * - URL: /clientes/maria-garcia-lopez-3af5d98c
 */

import { createClient } from '@/lib/supabase/client'

// ===================================
// GENERACIÓN DE SLUGS
// ===================================

/**
 * Normaliza texto para slug (quita tildes, convierte a minúsculas, etc.)
 */
function normalizarTexto(texto: string): string {
  if (!texto) return ''
  return texto
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Quitar marcas diacríticas (tildes)
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Quitar guiones al inicio/final
    .trim()
}

/**
 * Extrae los primeros 8 caracteres del UUID para el slug
 */
function extraerShortId(uuid: string): string {
  if (!uuid) {
    console.error('extraerShortId: UUID es undefined o vacío')
    return 'no-id'
  }
  return uuid.split('-')[0]
}

/**
 * Genera slug para cliente: nombres-apellidos-shortid
 *
 * @example
 * generarSlugCliente({ nombres: 'María José', apellidos: 'García López', id: '3af5d98c-...' })
 * // Returns: 'maria-jose-garcia-lopez-3af5d98c'
 */
export function generarSlugCliente(cliente: {
  nombres: string
  apellidos: string
  id: string
}): string {
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`
  const nombreNormalizado = normalizarTexto(nombreCompleto)
  const shortId = extraerShortId(cliente.id)

  return `${nombreNormalizado}-${shortId}`
}

/**
 * Genera slug para proyecto: nombre-shortid
 */
export function generarSlugProyecto(proyecto: {
  nombre: string
  id: string
}): string {
  const nombreNormalizado = normalizarTexto(proyecto.nombre)
  const shortId = extraerShortId(proyecto.id)

  return `${nombreNormalizado}-${shortId}`
}

/**
 * Genera slug para vivienda: proyecto-manzana-numero-shortid
 */
export function generarSlugVivienda(vivienda: {
  numero: string
  id: string
}, manzana?: string, proyecto?: string): string {
  const partes: string[] = []

  // Solo agregar partes si existen y no están vacías
  if (proyecto) {
    const proyectoNorm = normalizarTexto(proyecto)
    if (proyectoNorm) partes.push(proyectoNorm)
  }
  if (manzana) {
    const manzanaNorm = normalizarTexto(manzana)
    if (manzanaNorm) partes.push(manzanaNorm)
  }

  // Número es obligatorio
  const numeroNorm = normalizarTexto(vivienda.numero)
  if (numeroNorm) partes.push(numeroNorm)

  // Short ID siempre al final
  partes.push(extraerShortId(vivienda.id))

  return partes.join('-')
}

// ===================================
// RESOLUCIÓN DE SLUGS
// ===================================

/**
 * Verifica si un string es un UUID válido
 */
export function esUUID(valor: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(valor)
}

/**
 * Extrae el UUID de un slug
 *
 * @example
 * extraerUUIDDeSlug('maria-garcia-lopez-3af5d98c')
 * // Returns: '3af5d98c' (short ID para buscar en DB)
 */
export function extraerShortIDDeSlug(slug: string): string {
  const partes = slug.split('-')
  const ultimaParte = partes[partes.length - 1]

  // Verificar que sea un short ID válido (8 caracteres hexadecimales)
  if (/^[0-9a-f]{8}$/i.test(ultimaParte)) {
    return ultimaParte
  }

  throw new Error(`Slug inválido: ${slug}`)
}

/**
 * Resuelve un slug o UUID a un UUID completo consultando la BD
 *
 * @param slugOUUID - Puede ser un slug (maria-garcia-3af5d98c) o UUID completo
 * @param tabla - Tabla de la base de datos a consultar
 * @returns UUID completo del registro
 */
export async function resolverSlugAUUID(
  slugOUUID: string,
  tabla: 'clientes' | 'proyectos' | 'viviendas' | 'negociaciones'
): Promise<string | null> {
  // Si ya es un UUID completo, retornarlo directamente
  if (esUUID(slugOUUID)) {
    return slugOUUID
  }

  try {
    // Extraer el short ID del slug
    const shortId = extraerShortIDDeSlug(slugOUUID)

    // Buscar en la base de datos por coincidencia del inicio del UUID
    const supabase = createClient()

    // Obtener todos los registros y filtrar en cliente
    // Esto es más eficiente que una query LIKE que puede no estar soportada por RLS
    const { data, error } = await supabase
      .from(tabla)
      .select('id')

    if (error) {
      console.error(`❌ Error al buscar en ${tabla}:`, error)
      return null
    }

    if (!data || data.length === 0) {
      console.error(`❌ No hay registros en tabla: ${tabla}`)
      return null
    }

    // Filtrar en cliente por UUID que empiece con el short ID
    const registro = data.find((item: any) =>
      item.id.toLowerCase().startsWith(shortId.toLowerCase())
    )

    if (!registro) {
      console.error(`❌ No se encontró registro con short ID: ${shortId} en tabla: ${tabla}`)
      return null
    }

    return registro.id
  } catch (error) {
    console.error('❌ Error al resolver slug:', error)
    return null
  }
}

/**
 * Hook para resolver slug en componentes de cliente
 */
export async function resolverSlugCliente(slugOUUID: string): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'clientes')
}

/**
 * Hook para resolver slug de proyecto
 */
export async function resolverSlugProyecto(slugOUUID: string): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'proyectos')
}

/**
 * Hook para resolver slug de vivienda
 */
export async function resolverSlugVivienda(slugOUUID: string): Promise<string | null> {
  return resolverSlugAUUID(slugOUUID, 'viviendas')
}

// ===================================
// UTILIDADES PARA LINKS
// ===================================

/**
 * Construye URL de cliente con slug
 * Acepta nombres/apellidos separados o nombre_completo
 */
export function construirURLCliente(cliente: {
  id: string
  nombres?: string
  apellidos?: string
  nombre_completo?: string
}): string {
  let slug: string

  if (cliente.nombres && cliente.apellidos) {
    // Usar nombres y apellidos separados
    slug = generarSlugCliente({
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      id: cliente.id
    })
  } else if (cliente.nombre_completo) {
    // Usar nombre completo y normalizarlo
    const nombreNormalizado = normalizarTexto(cliente.nombre_completo)
    const shortId = cliente.id.split('-')[0]
    slug = `${nombreNormalizado}-${shortId}`
  } else {
    // Fallback: solo usar el ID
    const shortId = cliente.id.split('-')[0]
    slug = `cliente-${shortId}`
  }

  return `/clientes/${slug}`
}

/**
 * Construye URL de proyecto con slug
 */
export function construirURLProyecto(proyecto: {
  nombre: string
  id: string
}): string {
  const slug = generarSlugProyecto(proyecto)
  return `/proyectos/${slug}`
}

/**
 * Construye URL de vivienda con slug
 */
export function construirURLVivienda(
  vivienda: {
    numero: string
    id: string
  },
  manzana?: string,
  proyecto?: string
): string {
  const slug = generarSlugVivienda(vivienda, manzana, proyecto)
  return `/viviendas/${slug}`
}
