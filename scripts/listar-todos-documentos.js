require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listarTodosLosDocumentosCliente() {
  console.log('📋 Listando TODOS los documentos_cliente ordenados por fecha...\n')

  const { data: docs, error } = await supabase
    .from('documentos_cliente')
    .select('id, cliente_id, titulo, metadata, fecha_creacion')
    .order('fecha_creacion', { ascending: false })
    .limit(50)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📄 Total documentos: ${docs.length}\n`)

  docs.forEach((doc, i) => {
    console.log(`─────────────────────────────────────`)
    console.log(`${i + 1}. Título: ${doc.titulo}`)
    console.log(`   ID: ${doc.id}`)
    console.log(`   Cliente ID: ${doc.cliente_id}`)
    console.log(`   Fecha: ${doc.fecha_creacion}`)
    console.log(`   Metadata:`, JSON.stringify(doc.metadata, null, 2))
    console.log('')
  })

  // Buscar específicamente el de Juan Carlos
  const juanCarlosDocs = docs.filter(d =>
    d.titulo.toLowerCase().includes('juan') && d.titulo.toLowerCase().includes('carlos')
  )

  if (juanCarlosDocs.length > 0) {
    console.log('\n🎯 DOCUMENTOS DE JUAN CARLOS ENCONTRADOS:\n')
    juanCarlosDocs.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.titulo}`)
      console.log(`   ID para actualizar: ${doc.id}`)
      console.log(`   Entidad actual: ${doc.metadata?.entidad || 'SIN ENTIDAD'}`)
      console.log('')
    })
  }
}

listarTodosLosDocumentosCliente()
