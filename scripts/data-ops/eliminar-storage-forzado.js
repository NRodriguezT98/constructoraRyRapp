/**
 * Eliminación forzada de archivos en Storage
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function eliminarTodoForzado() {
  console.log('🔥 Eliminación FORZADA de Storage\n')

  const buckets = [
    'documentos-viviendas',
    'documentos-proyectos',
  ]

  for (const bucket of buckets) {
    console.log(`📦 Procesando: ${bucket}`)

    try {
      // Listar TODO
      const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 })

      if (error) {
        console.log(`   ❌ Error al listar: ${error.message}\n`)
        continue
      }

      if (!items || items.length === 0) {
        console.log(`   ✅ Bucket vacío\n`)
        continue
      }

      console.log(`   Encontrados: ${items.length} items`)

      // Eliminar TODOS los items encontrados
      const paths = items.map(item => item.name)

      console.log(`   Intentando eliminar: ${paths.join(', ')}`)

      const { data: deleted, error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(paths)

      if (deleteError) {
        console.log(`   ⚠️ Error al eliminar: ${deleteError.message}`)

        // Intentar eliminar uno por uno
        console.log(`   🔄 Intentando eliminación individual...`)

        for (const path of paths) {
          const { error: singleError } = await supabase.storage
            .from(bucket)
            .remove([path])

          if (singleError) {
            console.log(`      ❌ ${path}: ${singleError.message}`)
          } else {
            console.log(`      ✅ ${path}: Eliminado`)
          }
        }
      } else {
        console.log(`   ✅ ${deleted?.length || paths.length} items eliminados`)
      }

      // Verificar carpetas con contenido
      for (const item of items) {
        if (item.id) {
          console.log(`   📁 Verificando carpeta: ${item.name}`)

          const { data: files } = await supabase.storage
            .from(bucket)
            .list(item.name, { limit: 1000 })

          if (files && files.length > 0) {
            console.log(`      Archivos dentro: ${files.length}`)

            const filePaths = files.map(f => `${item.name}/${f.name}`)

            const { error: delError } = await supabase.storage
              .from(bucket)
              .remove(filePaths)

            if (delError) {
              console.log(`      ❌ Error: ${delError.message}`)
            } else {
              console.log(`      ✅ ${files.length} archivos eliminados`)
            }
          }
        }
      }

      console.log(`   ✅ Bucket limpio\n`)

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
    }
  }

  // Verificación final
  console.log('\n📊 VERIFICACIÓN FINAL:\n')

  for (const bucket of buckets) {
    const { data: items } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 })

    const icono = !items || items.length === 0 ? '✅' : '⚠️'
    console.log(`${icono} ${bucket}: ${items?.length || 0} items`)
  }
}

eliminarTodoForzado()
  .then(() => {
    console.log('\n✅ Eliminación forzada completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
