const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function listarCategorias() {
  const { data, error } = await supabase
    .from('categorias_documento')
    .select('*')
    .order('nombre')

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('\n📁 CATEGORÍAS DE DOCUMENTOS DISPONIBLES:\n')
  data.forEach(c => {
    console.log(`   ${c.nombre}`)
    console.log(`   ID: ${c.id}`)
    console.log(`   Módulo: ${c.modulo}`)
    console.log('')
  })
}

listarCategorias().then(() => process.exit(0))
