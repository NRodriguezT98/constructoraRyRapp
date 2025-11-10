/**
 * Limpieza agresiva de Storage - Elimina TODO
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiarStorageCompleto() {
  console.log('🧹 Limpieza AGRESIVA de Storage\n')

  const buckets = [
    'documentos-viviendas',
    'documentos-proyectos',
  ]

  for (const bucket of buckets) {
    console.log(`📦 Procesando: ${bucket}`)

    try {
      // Método 1: Listar carpetas raíz
      const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 1000,
          offset: 0,
        })

      if (error) {
        console.log(`   ⚠️  Error al listar: ${error.message}`)
        continue
      }

      console.log(`   Encontrados: ${items.length} items`)

      if (items.length === 0) {
        console.log(`   ✓ Bucket vacío\n`)
        continue
      }

      // Procesar cada item
      for (const item of items) {
        const path = item.name

        // Si es carpeta, listar su contenido
        if (item.id) {
          console.log(`   📁 Carpeta: ${path}`)

          const { data: files } = await supabase.storage
            .from(bucket)
            .list(path, { limit: 1000 })

          if (files && files.length > 0) {
            console.log(`      Archivos: ${files.length}`)

            const filePaths = files.map(f => `${path}/${f.name}`)

            const { error: delError } = await supabase.storage
              .from(bucket)
              .remove(filePaths)

            if (delError) {
              console.log(`      ⚠️  Error al eliminar: ${delError.message}`)
            } else {
              console.log(`      ✓ ${files.length} archivos eliminados`)
            }
          }
        } else {
          // Es un archivo en raíz
          const { error: delError } = await supabase.storage
            .from(bucket)
            .remove([path])

          if (!delError) {
            console.log(`   ✓ Archivo eliminado: ${path}`)
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

    let totalArchivos = 0

    if (items) {
      for (const item of items) {
        if (item.id) {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(item.name)
          totalArchivos += files?.length || 0
        }
      }
    }

    const icono = totalArchivos === 0 ? '✅' : '⚠️'
    console.log(`${icono} ${bucket}: ${totalArchivos} archivos restantes`)
  }
}

limpiarStorageCompleto()
  .then(() => {
    console.log('\n✅ Limpieza de Storage completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
