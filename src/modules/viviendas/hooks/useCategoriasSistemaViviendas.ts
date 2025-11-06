/**
 * @file useCategoriasSistemaViviendas.ts
 * @description Hook para acceder a categorías predefinidas del sistema para viviendas
 * ✅ AUTO-SEED: Crea categorías automáticamente si no existen
 * @module viviendas/hooks
 */

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

interface CategoriaSistema {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  color: string
  icono: string
  orden: number
  es_sistema: boolean
  es_global: boolean
  modulos_permitidos: string[]
  fecha_creacion: string
}

/**
 * Datos de las 8 categorías predefinidas para viviendas
 */
const CATEGORIAS_SISTEMA_VIVIENDAS = [
  {
    nombre: 'Certificado de Tradición',
    descripcion: 'Certificados de tradición y libertad de la propiedad',
    color: '#3B82F6',
    icono: 'FileText',
    orden: 1,
  },
  {
    nombre: 'Escrituras Públicas',
    descripcion: 'Escrituras de compraventa y documentos notariales',
    color: '#8B5CF6',
    icono: 'FileSignature',
    orden: 2,
  },
  {
    nombre: 'Planos Arquitectónicos',
    descripcion: 'Planos, diseños y renders de la vivienda',
    color: '#10B981',
    icono: 'Ruler',
    orden: 3,
  },
  {
    nombre: 'Licencias y Permisos',
    descripcion: 'Licencias de construcción y permisos municipales',
    color: '#F59E0B',
    icono: 'Shield',
    orden: 4,
  },
  {
    nombre: 'Avalúos Comerciales',
    descripcion: 'Avalúos y valoraciones de la propiedad',
    color: '#EF4444',
    icono: 'DollarSign',
    orden: 5,
  },
  {
    nombre: 'Fotos de Progreso',
    descripcion: 'Fotografías del avance y estado de la obra',
    color: '#06B6D4',
    icono: 'Camera',
    orden: 6,
  },
  {
    nombre: 'Contrato de Promesa',
    descripcion: 'Contratos de promesa de compraventa',
    color: '#EC4899',
    icono: 'FileContract',
    orden: 7,
  },
  {
    nombre: 'Recibos de Servicios',
    descripcion: 'Recibos de servicios públicos y pagos',
    color: '#14B8A6',
    icono: 'Receipt',
    orden: 8,
  },
]

/**
 * Función para crear las categorías del sistema si no existen
 */
async function seedCategoriasSistema(supabase: any, userId: string) {
  console.log('🌱 Seeding categorías del sistema para viviendas...')

  const categorias = CATEGORIAS_SISTEMA_VIVIENDAS.map((cat) => ({
    user_id: userId,
    nombre: cat.nombre,
    descripcion: cat.descripcion,
    color: cat.color,
    icono: cat.icono,
    orden: cat.orden,
    es_sistema: true,
    es_global: true,
    modulos_permitidos: ['viviendas'],
  }))

  const { error } = await supabase
    .from('categorias_documento')
    .insert(categorias)

  if (error) {
    console.error('❌ Error al crear categorías del sistema:', error)
    throw new Error(`Error al crear categorías: ${error.message}`)
  }

  console.log('✅ Categorías del sistema creadas correctamente')
}

/**
 * Hook para obtener categorías del sistema para viviendas
 * ✅ AUTO-SEED: Crea automáticamente las categorías si no existen
 */
export function useCategoriasSistemaViviendas() {
  const supabase = createClient()

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias-sistema-viviendas'],
    queryFn: async () => {
      // 1. Intentar obtener categorías existentes
      const { data, error } = await supabase
        .from('categorias_documento')
        .select('id, user_id, nombre, descripcion, color, icono, orden, es_global, modulos_permitidos, fecha_creacion')
        .contains('modulos_permitidos', ['viviendas'])
        .eq('es_sistema', true)
        .order('orden', { ascending: true })

      if (error) {
        console.error('❌ Error al cargar categorías de sistema:', error)
        throw new Error(`Error al cargar categorías: ${error.message}`)
      }

      // 2. Si NO hay categorías, crear las predefinidas
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron categorías del sistema. Creando automáticamente...')

        // Obtener usuario actual (necesario para user_id)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.error('❌ No hay usuario autenticado para crear categorías')
          return []
        }

        // Crear categorías del sistema
        await seedCategoriasSistema(supabase, user.id)

        // Re-fetch después de crear
        const { data: newData, error: refetchError } = await supabase
          .from('categorias_documento')
          .select('id, user_id, nombre, descripcion, color, icono, orden, es_global, modulos_permitidos, fecha_creacion')
          .contains('modulos_permitidos', ['viviendas'])
          .eq('es_sistema', true)
          .order('orden', { ascending: true })

        if (refetchError) {
          console.error('❌ Error al recargar categorías:', refetchError)
          return []
        }

        console.log(`✅ ${newData?.length || 0} categorías del sistema cargadas`)
        return (newData || []).map((cat) => ({ ...cat, es_sistema: true })) as CategoriaSistema[]
      }

      // 3. Categorías encontradas, retornar
      console.log(`✅ ${data.length} categorías del sistema encontradas`)
      return data.map((cat) => ({ ...cat, es_sistema: true })) as CategoriaSistema[]
    },
    staleTime: Infinity, // Las categorías del sistema nunca cambian
    gcTime: Infinity, // Mantener en caché indefinidamente
  })

  // Helpers para acceder a categorías específicas por nombre
  const obtenerPorNombre = (nombre: string) => {
    return categorias.find((c) => c.nombre === nombre)
  }

  // Helper para detectar categoría por nombre de archivo
  const obtenerCategoriaPorNombre = (nombreArchivo: string) => {
    const nombreLower = nombreArchivo.toLowerCase()

    // Mapeo de palabras clave a categorías
    const mapeo: Record<string, string> = {
      'tradicion': 'Certificado de Tradición',
      'certificado': 'Certificado de Tradición',
      'escritura': 'Escrituras Públicas',
      'plano': 'Planos Arquitectónicos',
      'licencia': 'Licencias y Permisos',
      'permiso': 'Licencias y Permisos',
      'avaluo': 'Avalúos Comerciales',
      'avalúo': 'Avalúos Comerciales',
      'foto': 'Fotos de Progreso',
      'imagen': 'Fotos de Progreso',
      'contrato': 'Contrato de Promesa',
      'promesa': 'Contrato de Promesa',
      'recibo': 'Recibos de Servicios',
      'servicio': 'Recibos de Servicios',
    }

    // Buscar coincidencia
    for (const [keyword, categoriaNombre] of Object.entries(mapeo)) {
      if (nombreLower.includes(keyword)) {
        return obtenerPorNombre(categoriaNombre)
      }
    }

    return undefined
  }

  return {
    // Data
    categoriasSistema: categorias,
    categorias, // Alias para compatibilidad
    isLoading,

    // Categorías específicas (las más comunes)
    certificadoTradicion: obtenerPorNombre('Certificado de Tradición'),
    escriturasPublicas: obtenerPorNombre('Escrituras Públicas'),
    planosArquitectonicos: obtenerPorNombre('Planos Arquitectónicos'),
    licenciasPermisos: obtenerPorNombre('Licencias y Permisos'),
    avaluosComerciales: obtenerPorNombre('Avalúos Comerciales'),
    fotosProgreso: obtenerPorNombre('Fotos de Progreso'),
    contratoPromesa: obtenerPorNombre('Contrato de Promesa'),
    recibosServicios: obtenerPorNombre('Recibos de Servicios'),

    // Helpers
    obtenerPorNombre,
    obtenerCategoriaPorNombre,
    existeCategoria: (nombre: string) => !!obtenerPorNombre(nombre),
  }
}
