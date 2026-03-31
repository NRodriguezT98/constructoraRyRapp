// ============================================
// SCRIPT: Migración de Documentos de Viviendas
// ============================================
// Mueve archivos de documentos-proyectos → documentos-viviendas
// y actualiza url_storage en la BD
// ============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Extraer bucket y path de una URL completa de Supabase Storage
 */
function parsearUrlStorage(url) {
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return null // Ya es path relativo
  }

  const parts = url.split('/object/public/')
  if (!parts[1]) return null

  const pathSegments = parts[1].split('/')
  const bucket = pathSegments[0]
  const path = pathSegments.slice(1).join('/')

  return { bucket, path }
}

/**
 * Copiar archivo entre buckets
 */
async function copiarArchivo(bucketOrigen, pathOrigen, bucketDestino, pathDestino) {
  try {
    // 1. Descargar del bucket origen
    const { data: archivoData, error: downloadError } = await supabase.storage
      .from(bucketOrigen)
      .download(pathOrigen)

    if (downloadError) {
      throw new Error(`Error al descargar: ${downloadError.message}`)
    }

    // 2. Subir al bucket destino
    const { error: uploadError } = await supabase.storage
      .from(bucketDestino)
      .upload(pathDestino, archivoData, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Error al subir: ${uploadError.message}`)
    }

    return true
  } catch (error) {
    throw error
  }
}

/**
 * Eliminar archivo de storage
 */
async function eliminarArchivo(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    console.warn(`⚠️ No se pudo eliminar ${path} de ${bucket}: ${error.message}`)
  }
}

// ============================================
// MIGRACIÓN PRINCIPAL
// ============================================

async function migrarDocumentosViviendas() {
  console.log('🚀 Iniciando migración de documentos de viviendas...\n')

  try {
    // 1. Obtener todos los documentos de viviendas
    const { data: documentos, error: queryError } = await supabase
      .from('documentos_vivienda')
      .select('id, vivienda_id, url_storage, nombre_archivo')
      .order('fecha_creacion', { ascending: true })

    if (queryError) {
      throw new Error(`Error al consultar documentos: ${queryError.message}`)
    }

    console.log(`📊 Total documentos encontrados: ${documentos.length}\n`)

    let migrados = 0
    let yaCorrectos = 0
    let errores = 0

    // 2. Procesar cada documento
    for (const doc of documentos) {
      console.log(`\n📄 Procesando: ${doc.nombre_archivo}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   URL actual: ${doc.url_storage}`)

      // Parsear URL actual
      const parsed = parsearUrlStorage(doc.url_storage)

      // Si ya es path relativo o ya está en bucket correcto
      if (!parsed) {
        console.log('   ✅ Ya tiene formato correcto (path relativo)')
        yaCorrectos++
        continue
      }

      if (parsed.bucket === 'documentos-viviendas') {
        console.log('   ✅ Ya está en bucket correcto')
        // Actualizar a path relativo si tiene URL completa
        const { error: updateError } = await supabase
          .from('documentos_vivienda')
          .update({ url_storage: parsed.path })
          .eq('id', doc.id)

        if (updateError) {
          console.error(`   ❌ Error al actualizar: ${updateError.message}`)
          errores++
        } else {
          console.log(`   ✅ URL actualizada a path relativo`)
          yaCorrectos++
        }
        continue
      }

      // 3. Migrar archivo
      console.log(`   🔄 Migrando de '${parsed.bucket}' → 'documentos-viviendas'...`)

      try {
        // Path destino: vivienda_id/categoría/nombre_archivo
        const pathDestino = parsed.path // Mantener misma estructura

        // Copiar archivo
        await copiarArchivo(parsed.bucket, parsed.path, 'documentos-viviendas', pathDestino)
        console.log(`   ✅ Archivo copiado exitosamente`)

        // 4. Actualizar BD con nueva ruta (path relativo)
        const { error: updateError } = await supabase
          .from('documentos_vivienda')
          .update({ url_storage: pathDestino })
          .eq('id', doc.id)

        if (updateError) {
          throw new Error(`Error al actualizar BD: ${updateError.message}`)
        }

        console.log(`   ✅ Base de datos actualizada`)

        // 5. Eliminar archivo original (comentar si quieres mantener backup)
        await eliminarArchivo(parsed.bucket, parsed.path)
        console.log(`   ✅ Archivo original eliminado`)

        migrados++
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`)
        errores++
      }
    }

    // 6. Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Migrados exitosamente: ${migrados}`)
    console.log(`✓  Ya estaban correctos: ${yaCorrectos}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📝 Total procesados: ${documentos.length}`)
    console.log('='.repeat(60))

    if (errores > 0) {
      console.log('\n⚠️ Revisa los errores anteriores para documentos que no se migraron')
    } else {
      console.log('\n🎉 ¡Migración completada exitosamente!')
    }
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message)
    process.exit(1)
  }
}

// ============================================
// EJECUCIÓN
// ============================================

console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║  MIGRACIÓN DE DOCUMENTOS DE VIVIENDAS                    ║')
console.log('║  documentos-proyectos → documentos-viviendas             ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

migrarDocumentosViviendas()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error)
    process.exit(1)
  })
