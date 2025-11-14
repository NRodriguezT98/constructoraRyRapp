/**
 * Verificar contenido completo de Storage
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarStorage() {
  console.log('🔍 Verificando Storage...\n')

  const buckets = [
    'documentos-viviendas',
    'documentos-proyectos',
  ]

  for (const bucket of buckets) {
    console.log(`📦 Bucket: ${bucket}`)
    console.log('─'.repeat(50))

    try {
      // Listar TODO el contenido recursivamente
      const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        console.log(`   ❌ Error: ${error.message}\n`)
        continue
      }

      console.log(`   Items en raíz: ${items?.length || 0}`)

      if (!items || items.length === 0) {
        console.log(`   ✅ Bucket vacío\n`)
        continue
      }

      let totalArchivos = 0

      for (const item of items) {
        console.log(`\n   📁 ${item.name}`)
        console.log(`      ID: ${item.id || 'N/A'}`)
        console.log(`      Metadata: ${JSON.stringify(item.metadata || {})}`)

        // Si es una carpeta (tiene id), listar su contenido
        if (item.id) {
          const { data: subItems } = await supabase.storage
            .from(bucket)
            .list(item.name, { limit: 1000 })

          if (subItems && subItems.length > 0) {
            console.log(`      Archivos dentro: ${subItems.length}`)
            totalArchivos += subItems.length

            for (const file of subItems) {
              console.log(`         📄 ${file.name}`)
              console.log(`            Tamaño: ${(file.metadata?.size / 1024).toFixed(2)} KB`)
              console.log(`            Creado: ${file.created_at}`)
            }
          } else {
            console.log(`      ⚠️ Carpeta vacía`)
          }
        } else {
          // Es un archivo en raíz
          totalArchivos++
          console.log(`      📄 Archivo directo en raíz`)
        }
      }

      console.log(`\n   📊 Total archivos: ${totalArchivos}\n`)

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
    }
  }

  console.log('\n✅ Verificación completada')
}

verificarStorage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
