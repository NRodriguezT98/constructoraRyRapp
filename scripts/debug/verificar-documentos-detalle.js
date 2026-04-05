/**
 * Verificar documentos en tabla documentos_vivienda
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarDocumentos() {
  console.log('🔍 Verificando tabla documentos_vivienda...\n')

  const { data, error } = await supabase.from('documentos_vivienda').select('*')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Total de documentos en BD: ${data.length}\n`)

  if (data.length > 0) {
    console.log('⚠️ DOCUMENTOS ENCONTRADOS (deberían estar eliminados):\n')
    data.forEach((doc, index) => {
      console.log(`${index + 1}. ID: ${doc.id}`)
      console.log(`   Vivienda: ${doc.vivienda_id}`)
      console.log(`   Archivo: ${doc.nombre_original}`)
      console.log(`   URL: ${doc.url_storage}`)
      console.log(`   Fecha: ${doc.fecha_creacion}`)
      console.log('')
    })

    // Intentar eliminar de nuevo
    console.log('🗑️ Intentando eliminar de nuevo...\n')

    const { error: deleteError } = await supabase
      .from('documentos_vivienda')
      .delete()
      .in(
        'id',
        data.map(d => d.id)
      )

    if (deleteError) {
      console.error('❌ Error al eliminar:', deleteError)
    } else {
      console.log('✅ Documentos eliminados correctamente')
    }
  } else {
    console.log('✅ Tabla documentos_vivienda está vacía')
  }

  // Verificar Storage
  console.log('\n📦 Verificando Storage...\n')

  const { data: items, error: storageError } = await supabase.storage
    .from('documentos-viviendas')
    .list('', { limit: 1000 })

  if (storageError) {
    console.error('❌ Error al listar Storage:', storageError)
    return
  }

  console.log(`📊 Items en Storage: ${items.length}\n`)

  if (items.length > 0) {
    console.log('⚠️ ARCHIVOS/CARPETAS EN STORAGE:\n')

    for (const item of items) {
      if (item.id) {
        // Es una carpeta
        const { data: files } = await supabase.storage
          .from('documentos-viviendas')
          .list(item.name, { limit: 1000 })

        console.log(`📁 ${item.name}/`)
        if (files && files.length > 0) {
          console.log(`   Archivos: ${files.length}`)
          files.forEach(f => {
            console.log(
              `   - ${f.name} (${(f.metadata.size / 1024).toFixed(2)} KB)`
            )
          })
        } else {
          console.log(`   (vacía)`)
        }
      } else {
        // Es un archivo
        console.log(`📄 ${item.name}`)
      }
      console.log('')
    }
  } else {
    console.log('✅ Storage documentos-viviendas está vacío')
  }
}

verificarDocumentos()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
