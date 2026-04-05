require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarDocumentoJuanCarlos() {
  console.log(
    '🔍 Buscando documentos de Juan Carlos con Subsidio Caja Compensación...\n'
  )

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .ilike('nombre_completo', '%Juan%Carlos%')
    .single()

  if (!cliente) {
    console.log('❌ Cliente no encontrado')
    return
  }

  console.log(`✅ Cliente ID: ${cliente.id}\n`)

  const { data: docs, error } = await supabase
    .from('documentos_cliente')
    .select('id, titulo, metadata')
    .eq('cliente_id', cliente.id)
    .ilike('titulo', '%Caja%Compensación%')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📄 Documentos encontrados: ${docs.length}\n`)

  for (const doc of docs) {
    console.log(`ID: ${doc.id}`)
    console.log(`Título: ${doc.titulo}`)
    console.log(`Metadata actual:`, JSON.stringify(doc.metadata, null, 2))

    // Actualizar metadata
    const nuevoMetadata = {
      ...doc.metadata,
      entidad: 'COMFANDI',
    }

    const { error: errorUpdate } = await supabase
      .from('documentos_cliente')
      .update({ metadata: nuevoMetadata })
      .eq('id', doc.id)

    if (errorUpdate) {
      console.error('❌ Error actualizando:', errorUpdate)
    } else {
      console.log('✅ Metadata actualizado con entidad: COMFANDI\n')
    }
  }
}

buscarDocumentoJuanCarlos()
