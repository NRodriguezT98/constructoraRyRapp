/**
 * Script temporal para eliminar documento de CESAR con es_documento_identidad=false
 * Para poder volver a subirlo correctamente marcado
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function eliminarDocumentoCesar() {
  try {
    console.log('🔍 Listando TODOS los documentos de clientes...')

    // 1. Buscar TODOS los documentos
    const { data: documentos, error: searchError } = await supabase
      .from('documentos_cliente')
      .select('id, titulo, es_documento_identidad, estado, cliente_id')
      .limit(10)

    if (searchError) {
      console.error('❌ Error al buscar:', searchError)
      return
    }

    if (!documentos || documentos.length === 0) {
      console.log('ℹ️  No hay documentos en la tabla documentos_cliente')
      console.log('ℹ️  Esto es normal si recién eliminaste el documento desde la UI')
      return
    }

    console.log(`✅ Encontrado ${documentos.length} documento(s):`)
    documentos.forEach(doc => {
      console.log(`   - ID: ${doc.id}`)
      console.log(`   - Título: ${doc.titulo}`)
      console.log(`   - es_documento_identidad: ${doc.es_documento_identidad}`)
      console.log(`   - Estado: ${doc.estado}`)
      console.log(`   - Cliente: ${doc.cliente_id}`)
      console.log('')
    })

    // 2. Confirmar eliminación
    const doc = documentos[0]
    console.log('🗑️  Eliminando documento (soft delete - estado = Eliminado)...')

    const { error: deleteError } = await supabase
      .from('documentos_cliente')
      .update({ estado: 'Eliminado' })
      .eq('id', doc.id)

    if (deleteError) {
      console.error('❌ Error al eliminar:', deleteError)
      return
    }

    console.log('✅ Documento movido a papelera exitosamente')
    console.log('ℹ️  Ahora puedes volver a subirlo marcando el checkbox de documento de identidad')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

eliminarDocumentoCesar()
