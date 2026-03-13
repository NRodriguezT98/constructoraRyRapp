require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarYActualizarDocumento() {
  console.log('🔍 Buscando documento "Carta de Aprobación Subsidio Caja Compensación"...\n')

  // Buscar por título exacto
  const { data: docs, error } = await supabase
    .from('documentos_cliente')
    .select('id, cliente_id, titulo, metadata')
    .ilike('titulo', '%Carta%Aprobación%Subsidio%Caja%Compensación%')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📄 Documentos encontrados: ${docs.length}\n`)

  if (docs.length === 0) {
    console.log('⚠️ No se encontró el documento. Probando búsqueda más amplia...\n')

    // Búsqueda más amplia
    const { data: docsAmplia } = await supabase
      .from('documentos_cliente')
      .select('id, cliente_id, titulo, metadata')
      .or('titulo.ilike.%Subsidio Caja%,titulo.ilike.%Compensación%')
      .limit(20)

    console.log(`📄 Documentos con "Subsidio" o "Compensación": ${docsAmplia?.length || 0}\n`)

    if (docsAmplia && docsAmplia.length > 0) {
      docsAmplia.forEach((doc, i) => {
        console.log(`${i + 1}. ${doc.titulo}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   Metadata:`, doc.metadata)
        console.log('')
      })
    }
    return
  }

  for (const doc of docs) {
    console.log(`─────────────────────────────────────`)
    console.log(`ID: ${doc.id}`)
    console.log(`Cliente ID: ${doc.cliente_id}`)
    console.log(`Título: ${doc.titulo}`)
    console.log(`Metadata actual:`, JSON.stringify(doc.metadata, null, 2))

    // Actualizar metadata con entidad correcta
    const nuevoMetadata = {
      ...doc.metadata,
      entidad: 'COMFANDI'
    }

    console.log(`\n🔧 Actualizando metadata...`)

    const { error: errorUpdate } = await supabase
      .from('documentos_cliente')
      .update({ metadata: nuevoMetadata })
      .eq('id', doc.id)

    if (errorUpdate) {
      console.error('❌ Error actualizando:', errorUpdate)
    } else {
      console.log('✅ Metadata actualizado exitosamente')
      console.log('Nuevo metadata:', JSON.stringify(nuevoMetadata, null, 2))
    }
    console.log('')
  }
}

buscarYActualizarDocumento()
