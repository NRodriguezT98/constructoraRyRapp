require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function actualizarDocumentoCarta() {
  console.log('🔍 Buscando documento exacto...\n')

  const { data: docs, error } = await supabase
    .from('documentos_cliente')
    .select('*')
    .eq(
      'titulo',
      'Carta de Aprobación Subsidio Caja Compensación - A2 Juan carlos'
    )

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!docs || docs.length === 0) {
    console.log('❌ Documento no encontrado')
    return
  }

  const doc = docs[0]

  console.log('📄 Documento encontrado:')
  console.log(`   ID: ${doc.id}`)
  console.log(`   Título: ${doc.titulo}`)
  console.log(`   Metadata actual:`, JSON.stringify(doc.metadata, null, 2))
  console.log('')

  // Actualizar metadata
  const nuevoMetadata = {
    ...doc.metadata,
    entidad: 'COMFANDI',
  }

  console.log('🔧 Actualizando metadata con entidad: COMFANDI...\n')

  const { error: errorUpdate } = await supabase
    .from('documentos_cliente')
    .update({ metadata: nuevoMetadata })
    .eq('id', doc.id)

  if (errorUpdate) {
    console.error('❌ Error actualizando:', errorUpdate)
    return
  }

  console.log('✅ ¡Documento actualizado exitosamente!')
  console.log('\n📝 Nuevo metadata:')
  console.log(JSON.stringify(nuevoMetadata, null, 2))
  console.log('\n🎉 Ahora el documento mostrará "Entidad Financiera: COMFANDI"')
  console.log('💡 Recarga la página para ver los cambios')
}

actualizarDocumentoCarta()
