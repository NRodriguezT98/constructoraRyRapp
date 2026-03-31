/**
 * Script para limpiar archivos huérfanos en Storage
 * Elimina archivos que no tienen referencia en la BD
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiarArchivosHuerfanos() {
  console.log('🧹 Limpiando archivos huérfanos en Storage...\n')

  // 1. Obtener todos los documentos válidos de la BD
  console.log('📊 PASO 1: Obteniendo documentos válidos de BD...\n')

  const { data: documentos, error: dbError } = await supabase
    .from('documentos_vivienda')
    .select('vivienda_id, nombre_archivo, url_storage')

  if (dbError) {
    console.error('❌ Error al obtener documentos:', dbError)
    return
  }

  console.log(`✅ Documentos en BD: ${documentos.length}\n`)

  // Crear Set de archivos válidos (vivienda_id/nombre_archivo)
  const archivosValidos = new Set(
    documentos.map(d => `${d.vivienda_id}/${d.nombre_archivo}`)
  )

  console.log('📂 Archivos válidos en BD:')
  archivosValidos.forEach(archivo => console.log(`   - ${archivo}`))
  console.log('')

  // 2. Listar TODAS las viviendas que tienen carpetas en Storage
  console.log('📦 PASO 2: Escaneando Storage...\n')

  const { data: carpetas, error: listError } = await supabase.storage
    .from('documentos-viviendas')
    .list()

  if (listError) {
    console.error('❌ Error al listar carpetas:', listError)
    return
  }

  console.log(`✅ Carpetas encontradas: ${carpetas.length}\n`)

  let totalArchivosEnStorage = 0
  let archivosAEliminar = []

  // 3. Escanear cada carpeta de vivienda
  for (const carpeta of carpetas) {
    if (!carpeta.id) continue // Saltar si no es carpeta

    const viviendaId = carpeta.name

    // Listar archivos en esta carpeta
    const { data: archivos, error: filesError } = await supabase.storage
      .from('documentos-viviendas')
      .list(viviendaId)

    if (filesError) {
      console.error(`❌ Error al listar archivos de ${viviendaId}:`, filesError)
      continue
    }

    totalArchivosEnStorage += archivos.length

    // Verificar cada archivo
    archivos.forEach(archivo => {
      const pathCompleto = `${viviendaId}/${archivo.name}`

      if (!archivosValidos.has(pathCompleto)) {
        archivosAEliminar.push(pathCompleto)
        console.log(`⚠️  Huérfano: ${pathCompleto}`)
      }
    })
  }

  console.log(`\n📈 RESUMEN:`)
  console.log(`   Archivos en Storage: ${totalArchivosEnStorage}`)
  console.log(`   Archivos válidos (en BD): ${archivosValidos.size}`)
  console.log(`   Archivos huérfanos a eliminar: ${archivosAEliminar.length}`)
  console.log('')

  if (archivosAEliminar.length === 0) {
    console.log('✅ No hay archivos huérfanos. Storage limpio.')
    return
  }

  // 4. Eliminar archivos huérfanos
  console.log('🗑️  PASO 3: Eliminando archivos huérfanos...\n')

  const { data: deleteResult, error: deleteError } = await supabase.storage
    .from('documentos-viviendas')
    .remove(archivosAEliminar)

  if (deleteError) {
    console.error('❌ Error al eliminar archivos:', deleteError)
    return
  }

  console.log(`✅ ${archivosAEliminar.length} archivos huérfanos eliminados\n`)
  console.log('✅ LIMPIEZA DE STORAGE COMPLETADA')
}

limpiarArchivosHuerfanos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
