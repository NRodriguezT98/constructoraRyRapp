// ============================================
// SCRIPT: Verificar ubicación de documentos de viviendas
// ============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarStorageViviendas() {
  console.log('🔍 Verificando ubicación de archivos en storage...\n')

  const { data: documentos, error } = await supabase
    .from('documentos_vivienda')
    .select('id, url_storage, nombre_archivo')

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log(`📊 Total documentos: ${documentos.length}\n`)

  for (const doc of documentos) {
    console.log(`📄 ${doc.nombre_archivo}`)
    console.log(`   Path: ${doc.url_storage}`)

    // Verificar en documentos-viviendas
    const { data: exists1, error: error1 } = await supabase.storage
      .from('documentos-viviendas')
      .list(doc.url_storage.split('/').slice(0, -1).join('/'), {
        limit: 100,
        search: doc.url_storage.split('/').pop(),
      })

    // Verificar en documentos-proyectos
    const { data: exists2, error: error2 } = await supabase.storage
      .from('documentos-proyectos')
      .list(doc.url_storage.split('/').slice(0, -1).join('/'), {
        limit: 100,
        search: doc.url_storage.split('/').pop(),
      })

    const enViviendas = exists1 && exists1.length > 0
    const enProyectos = exists2 && exists2.length > 0

    if (enViviendas) {
      console.log('   ✅ Está en: documentos-viviendas')
    }
    if (enProyectos) {
      console.log('   ⚠️ También está en: documentos-proyectos')
    }
    if (!enViviendas && !enProyectos) {
      console.log('   ❌ NO ENCONTRADO en ningún bucket')
    }
    console.log()
  }
}

verificarStorageViviendas()
