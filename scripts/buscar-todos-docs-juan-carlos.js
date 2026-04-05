require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarTodosDocumentosJuanCarlos() {
  console.log('🔍 Buscando TODOS los documentos de Juan Carlos...\n')

  const CLIENTE_ID = 'ac0d0b96-a7f8-411c-8c29-adbf59e72efe'

  const { data: docs, error } = await supabase
    .from('documentos_cliente')
    .select('id, titulo, metadata, fecha_creacion')
    .eq('cliente_id', CLIENTE_ID)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📄 Total documentos: ${docs.length}\n`)

  for (const doc of docs) {
    console.log(`─────────────────────────────────────`)
    console.log(`ID: ${doc.id}`)
    console.log(`Título: ${doc.titulo}`)
    console.log(`Fecha: ${doc.fecha_creacion}`)
    console.log(`Metadata:`, JSON.stringify(doc.metadata, null, 2))

    // Si tiene fuente_pago_id en metadata, actualizar
    if (
      doc.metadata?.fuente_pago_id === '68995ee2-04ce-4d1e-b0ca-4f28f7397bc9'
    ) {
      console.log('\n🎯 ¡Este documento está vinculado a la fuente de pago!')

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
        console.log('✅ Metadata actualizado con entidad: COMFANDI')
      }
    }
    console.log('')
  }
}

buscarTodosDocumentosJuanCarlos()
