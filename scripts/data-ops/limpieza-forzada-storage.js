/**
 * Limpieza FORZADA de todos los archivos en Storage
 * Elimina TODO recursivamente
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiezaForzada() {
  console.log('🧹 LIMPIEZA FORZADA DE STORAGE\n')

  const bucket = 'documentos-viviendas'

  // Carpeta específica que viste en la imagen
  const carpetas = [
    '66b7afe8-9d05-4c14-902a-eb1988d545e1',
    'bfad4bfd-d602-4bb3-9e16-31b8dd5c89fa'
  ]

  for (const carpeta of carpetas) {
    console.log(`📁 Procesando carpeta: ${carpeta}`)

    // Listar TODOS los archivos en la carpeta
    const { data: archivos, error: listError } = await supabase.storage
      .from(bucket)
      .list(carpeta, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.log(`   ❌ Error al listar: ${listError.message}\n`)
      continue
    }

    if (!archivos || archivos.length === 0) {
      console.log(`   ✅ Carpeta vacía\n`)
      continue
    }

    console.log(`   📦 Archivos encontrados: ${archivos.length}`)

    // Crear array de paths completos
    const pathsAEliminar = archivos
      .filter(a => !a.id) // Solo archivos, no subcarpetas
      .map(a => `${carpeta}/${a.name}`)

    console.log(`   🗑️  Eliminando ${pathsAEliminar.length} archivos...`)

    if (pathsAEliminar.length > 0) {
      // Eliminar en lotes de 50 (límite de Supabase)
      const BATCH_SIZE = 50
      let eliminados = 0

      for (let i = 0; i < pathsAEliminar.length; i += BATCH_SIZE) {
        const batch = pathsAEliminar.slice(i, i + BATCH_SIZE)

        const { data, error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(batch)

        if (deleteError) {
          console.log(`   ⚠️  Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${deleteError.message}`)
        } else {
          eliminados += batch.length
          console.log(`   ✓ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} archivos eliminados`)
        }
      }

      console.log(`   ✅ Total eliminado: ${eliminados} archivos\n`)
    }
  }

  // Verificación final
  console.log('📊 VERIFICACIÓN FINAL:\n')

  for (const carpeta of carpetas) {
    const { data: archivos } = await supabase.storage
      .from(bucket)
      .list(carpeta, { limit: 1000 })

    const total = archivos?.filter(a => !a.id).length || 0
    const icono = total === 0 ? '✅' : '⚠️'
    console.log(`${icono} ${carpeta}: ${total} archivos restantes`)
  }

  // Intentar eliminar las carpetas vacías
  console.log('\n🗑️  Intentando eliminar carpetas vacías...\n')

  const { error: removeFoldersError } = await supabase.storage
    .from(bucket)
    .remove(carpetas)

  if (removeFoldersError) {
    console.log(`⚠️  No se pudieron eliminar carpetas: ${removeFoldersError.message}`)
  } else {
    console.log('✅ Carpetas eliminadas')
  }
}

limpiezaForzada()
  .then(() => {
    console.log('\n✅ Limpieza forzada completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
