/**
 * Limpieza TOTAL - Elimina TODO sin filtros
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function eliminarTodo() {
  console.log('🧹 ELIMINANDO TODO EN STORAGE (sin filtros)\n')

  const bucket = 'documentos-viviendas'
  const carpetas = [
    '66b7afe8-9d05-4c14-902a-eb1988d545e1',
    'bfad4bfd-d602-4bb3-9e16-31b8dd5c89fa'
  ]

  for (const carpeta of carpetas) {
    console.log(`📁 Carpeta: ${carpeta}`)

    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list(carpeta, { limit: 1000 })

    if (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
      continue
    }

    console.log(`   Items encontrados: ${items.length}`)

    if (items.length === 0) {
      console.log(`   ✅ Vacía\n`)
      continue
    }

    // Mostrar todos los items
    items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name} - ${item.id ? 'CARPETA' : 'ARCHIVO'}`)
    })

    // Eliminar TODOS los items (sin filtrar)
    const paths = items.map(item => `${carpeta}/${item.name}`)

    console.log(`\n   🗑️  Eliminando ${paths.length} items...`)

    const { data, error: deleteError } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (deleteError) {
      console.log(`   ❌ Error al eliminar: ${deleteError.message}`)
      console.log(`   Detalles:`, deleteError)
    } else {
      console.log(`   ✅ Eliminados exitosamente`)
      if (data) {
        console.log(`   Resultado:`, data)
      }
    }

    console.log('')
  }

  // Ahora eliminar las carpetas raíz
  console.log('🗑️  Eliminando carpetas raíz...\n')

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(carpetas)

  if (error) {
    console.log(`❌ Error: ${error.message}`)
  } else {
    console.log(`✅ Carpetas raíz eliminadas`)
    if (data) {
      console.log(`Resultado:`, data)
    }
  }

  // Verificación final
  console.log('\n📊 VERIFICACIÓN FINAL:\n')

  const { data: finalCheck } = await supabase.storage
    .from(bucket)
    .list('', { limit: 1000 })

  console.log(`Items en bucket: ${finalCheck?.length || 0}`)

  if (finalCheck && finalCheck.length > 0) {
    finalCheck.forEach(item => {
      console.log(`   - ${item.name}`)
    })
  } else {
    console.log('✅ BUCKET COMPLETAMENTE VACÍO')
  }
}

eliminarTodo()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
