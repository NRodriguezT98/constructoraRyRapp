/**
 * Eliminar carpetas vacías de Storage
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function eliminarCarpetasVacias() {
  console.log('🗑️ Eliminando carpetas vacías de Storage...\n')

  const buckets = ['documentos-viviendas', 'documentos-proyectos']

  for (const bucket of buckets) {
    console.log(`📦 Procesando bucket: ${bucket}`)

    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 })

    if (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
      continue
    }

    if (!items || items.length === 0) {
      console.log(`   ✅ Ya está vacío\n`)
      continue
    }

    console.log(`   Carpetas/archivos encontrados: ${items.length}`)

    // Eliminar cada item
    for (const item of items) {
      const itemName = item.name

      // Si es carpeta, primero verificar si tiene contenido
      if (item.id) {
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(itemName, { limit: 1000 })

        if (files && files.length > 0) {
          console.log(`   📁 ${itemName}/ tiene ${files.length} archivos, eliminando...`)

          // Eliminar archivos primero
          const filePaths = files.map(f => `${itemName}/${f.name}`)
          const { error: delFilesError } = await supabase.storage
            .from(bucket)
            .remove(filePaths)

          if (delFilesError) {
            console.log(`      ❌ Error al eliminar archivos: ${delFilesError.message}`)
          } else {
            console.log(`      ✅ ${files.length} archivos eliminados`)
          }
        }

        // Ahora eliminar la carpeta (intentar eliminar como archivo)
        const { error: delFolderError } = await supabase.storage
          .from(bucket)
          .remove([itemName])

        if (delFolderError) {
          console.log(`   ⚠️ No se pudo eliminar carpeta ${itemName}: ${delFolderError.message}`)
        } else {
          console.log(`   ✅ Carpeta ${itemName} eliminada`)
        }
      } else {
        // Es un archivo
        const { error: delError } = await supabase.storage
          .from(bucket)
          .remove([itemName])

        if (!delError) {
          console.log(`   ✅ Archivo ${itemName} eliminado`)
        }
      }
    }

    console.log('')
  }

  // Verificación final
  console.log('📊 VERIFICACIÓN FINAL:\n')

  for (const bucket of buckets) {
    const { data: items } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 })

    const total = items?.length || 0
    const icono = total === 0 ? '✅' : '⚠️'
    console.log(`${icono} ${bucket}: ${total} items restantes`)
  }
}

eliminarCarpetasVacias()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
