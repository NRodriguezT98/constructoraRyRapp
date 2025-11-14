/**
 * ============================================
 * VACIAR BUCKETS DE STORAGE COMPLETAMENTE
 * ============================================
 * Script para eliminar TODO el contenido de los buckets de Storage
 * Usa SERVICE_ROLE_KEY para bypasear RLS
 * Guarda este script para limpiezas futuras
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // SERVICE ROLE bypasea RLS
)

/**
 * Vaciar completamente un bucket de forma recursiva
 */
async function vaciarBucketCompleto(bucketName) {
  console.log(`\n🗑️  Vaciando bucket: ${bucketName}`)
  console.log('─'.repeat(60))

  try {
    // Función recursiva para eliminar todo el contenido
    async function eliminarTodoEnPath(path = '') {
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(path, {
          limit: 1000,
          offset: 0,
        })

      if (error) {
        console.log(`   ⚠️  Error al listar ${path}: ${error.message}`)
        return
      }

      if (!items || items.length === 0) {
        return
      }

      // Separar archivos y carpetas
      const archivos = []
      const carpetas = []

      for (const item of items) {
        const itemPath = path ? `${path}/${item.name}` : item.name

        if (item.id === null) {
          // Es una carpeta
          carpetas.push(itemPath)
        } else {
          // Es un archivo
          archivos.push(itemPath)
        }
      }

      // Primero eliminar archivos en este nivel
      if (archivos.length > 0) {
        console.log(`   📄 Eliminando ${archivos.length} archivos en: ${path || '(raíz)'}`)

        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(archivos)

        if (deleteError) {
          console.log(`   ❌ Error eliminando archivos: ${deleteError.message}`)
        } else {
          console.log(`   ✅ ${archivos.length} archivos eliminados`)
        }
      }

      // Luego procesar carpetas recursivamente
      for (const carpeta of carpetas) {
        await eliminarTodoEnPath(carpeta)
      }

      // Intentar eliminar la carpeta vacía actual
      if (path) {
        await supabase.storage.from(bucketName).remove([path])
      }
    }

    // Iniciar eliminación desde la raíz
    await eliminarTodoEnPath('')

    // Verificación final
    const { data: remaining } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 })

    const isEmpty = !remaining || remaining.length === 0

    if (isEmpty) {
      console.log(`   ✅ Bucket completamente vacío`)
    } else {
      console.log(`   ⚠️  Quedan ${remaining.length} items (pueden ser carpetas vacías)`)
    }

    return isEmpty

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

/**
 * Vaciar todos los buckets configurados
 */
async function vaciarTodosLosBuckets() {
  console.log('\n' + '═'.repeat(60))
  console.log('   🧹 LIMPIEZA COMPLETA DE STORAGE')
  console.log('═'.repeat(60))

  const buckets = [
    'documentos-viviendas',
    'documentos-proyectos',
  ]

  const resultados = []

  for (const bucket of buckets) {
    const exito = await vaciarBucketCompleto(bucket)
    resultados.push({ bucket, exito })
  }

  // Resumen final
  console.log('\n' + '═'.repeat(60))
  console.log('   📊 RESUMEN DE LIMPIEZA')
  console.log('═'.repeat(60) + '\n')

  for (const { bucket, exito } of resultados) {
    const icono = exito ? '✅' : '⚠️'
    const estado = exito ? 'VACÍO' : 'TIENE ITEMS RESTANTES'
    console.log(`${icono} ${bucket}: ${estado}`)
  }

  const todosVacios = resultados.every(r => r.exito)

  if (todosVacios) {
    console.log('\n✨ Todos los buckets están completamente vacíos')
  } else {
    console.log('\n⚠️  Algunos buckets tienen items restantes (probablemente carpetas vacías)')
    console.log('💡 Puedes eliminarlas manualmente desde Supabase Dashboard')
  }

  console.log('')
}

// Ejecutar
vaciarTodosLosBuckets()
  .then(() => {
    console.log('✅ Proceso completado\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
