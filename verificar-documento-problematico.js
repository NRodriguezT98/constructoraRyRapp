/**
 * Script para ver URL completa de documento problemático
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const documentoId = '4d50a9d5-ccfd-4386-9cdf-0ce1e0a6b392'

async function verificarDocumento() {
  const { data: doc, error } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .eq('id', documentoId)
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('📄 Documento completo:\n')
  console.log('ID:', doc.id)
  console.log('Vivienda ID:', doc.vivienda_id)
  console.log('Nombre archivo (BD):', doc.nombre_archivo)
  console.log('Nombre original:', doc.nombre_original)
  console.log('URL Storage completa:', doc.url_storage)
  console.log('Versión:', doc.version)
  console.log('\n')

  // Intentar extraer nombre real desde URL
  console.log('🔍 Extrayendo nombre desde URL...\n')

  const viviendaId = doc.vivienda_id

  // Método 1: Split por vivienda_id
  if (doc.url_storage.includes(`/${viviendaId}/`)) {
    const parts = doc.url_storage.split(`/${viviendaId}/`)
    if (parts.length > 1) {
      const nombreReal = decodeURIComponent(parts[1])
      console.log('✅ Nombre real en Storage:', nombreReal)
      console.log('\n')

      // Verificar si existe
      const { data, error: checkError } = await supabase.storage
        .from('documentos-viviendas')
        .list(viviendaId)

      if (!checkError && data) {
        const existe = data.some(f => f.name === nombreReal)
        console.log(`Existe en Storage: ${existe ? '✅ SÍ' : '❌ NO'}`)

        if (!existe) {
          console.log('\n📂 Archivos similares en Storage:')
          data.forEach(f => {
            if (f.name.includes('certificado') || f.name.includes('MAT')) {
              console.log(`  - ${f.name}`)
            }
          })
        }
      }
    }
  }
}

verificarDocumento()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
