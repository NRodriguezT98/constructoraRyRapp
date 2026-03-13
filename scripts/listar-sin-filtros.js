require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listarTodosDirecto() {
  console.log('📋 Listando TODOS los documentos_cliente...\n')

  const { data, error, count } = await supabase
    .from('documentos_cliente')
    .select('id, titulo, metadata', { count: 'exact' })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Total de registros: ${count}`)
  console.log('')

  if (data && data.length > 0) {
    data.forEach((doc, i) => {
      console.log(`${i + 1}. ID: ${doc.id}`)
      console.log(`   Título: ${doc.titulo}`)
      console.log(`   Metadata:`, JSON.stringify(doc.metadata, null, 2))
      console.log('')
    })
  } else {
    console.log('⚠️ No se pudieron recuperar los documentos (posible problema de RLS)')
  }
}

listarTodosDirecto()
