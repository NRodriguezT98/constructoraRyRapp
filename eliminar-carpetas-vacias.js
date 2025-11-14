/**
 * Verificar y eliminar carpetas vacías en Storage
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function eliminarCarpetasVacias() {
  console.log('🗑️ Eliminando carpetas vacías...\n')

  const bucket = 'documentos-proyectos'

  // Listar items
  const { data: items, error } = await supabase.storage
    .from(bucket)
    .list('', { limit: 1000 })

  if (error) {
    console.log(`❌ Error: ${error.message}`)
    return
  }

  console.log(`Encontrados: ${items?.length || 0} items\n`)

  for (const item of items || []) {
    console.log(`\nProcesando: ${item.name}`)
    console.log(`  ID: ${item.id || 'NULL'}`)
    console.log(`  Metadata:`, item.metadata)

    // Intentar listar contenido (si es carpeta)
    const { data: contenido, error: errorContenido } = await supabase.storage
      .from(bucket)
      .list(item.name, { limit: 1 })

    if (!errorContenido && contenido) {
      console.log(`  Contenido: ${contenido.length} archivos`)

      if (contenido.length === 0) {
        console.log(`  ⚠️ Carpeta vacía detectada`)

        // Intentar crear archivo temporal y eliminar carpeta
        const tempPath = `${item.name}/.temp`

        // Crear archivo temporal
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(tempPath, new Blob(['temp']), { upsert: true })

        if (!uploadError) {
          console.log(`  ✓ Archivo temporal creado`)

          // Eliminar archivo temporal
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([tempPath])

          if (!deleteError) {
            console.log(`  ✓ Archivo temporal eliminado`)
          }
        }

        // Intentar eliminar la carpeta vacía directamente
        const { error: delError } = await supabase.storage
          .from(bucket)
          .remove([item.name])

        if (delError) {
          console.log(`  ❌ No se pudo eliminar: ${delError.message}`)
        } else {
          console.log(`  ✅ Carpeta eliminada`)
        }
      } else {
        // Eliminar todos los archivos dentro
        const filePaths = contenido.map(f => `${item.name}/${f.name}`)
        console.log(`  Eliminando: ${filePaths.join(', ')}`)

        const { error: delError } = await supabase.storage
          .from(bucket)
          .remove(filePaths)

        if (delError) {
          console.log(`  ❌ Error: ${delError.message}`)
        } else {
          console.log(`  ✅ Archivos eliminados`)

          // Ahora eliminar la carpeta
          const { error: delFolderError } = await supabase.storage
            .from(bucket)
            .remove([item.name])

          if (!delFolderError) {
            console.log(`  ✅ Carpeta eliminada`)
          }
        }
      }
    }
  }

  // Verificación final
  console.log('\n\n📊 Verificación final...')
  const { data: final } = await supabase.storage
    .from(bucket)
    .list('', { limit: 1000 })

  console.log(`\nItems restantes: ${final?.length || 0}`)

  if (final && final.length > 0) {
    console.log('\n⚠️ Items que aún permanecen:')
    for (const item of final) {
      console.log(`  - ${item.name}`)
    }
  } else {
    console.log('\n✅ Bucket completamente vacío')
  }
}

eliminarCarpetasVacias()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
