require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarEnTodasLasTablas() {
  const TITULO_BUSCAR = '%Carta%Aprobación%Subsidio%Caja%'

  console.log('🔍 Buscando en TODAS las tablas de documentos...\n')

  // 1. documentos_proyecto
  const { data: docsProyecto } = await supabase
    .from('documentos_proyecto')
    .select('id, proyecto_id, titulo, metadata')
    .ilike('titulo', TITULO_BUSCAR)

  console.log(`📁 documentos_proyecto: ${docsProyecto?.length || 0} encontrado(s)`)
  if (docsProyecto && docsProyecto.length > 0) {
    docsProyecto.forEach(doc => {
      console.log(`   - ${doc.titulo}`)
      console.log(`     ID: ${doc.id}`)
      console.log(`     Metadata:`, doc.metadata)
    })
  }

  // 2. documentos_cliente
  const { data: docsCliente } = await supabase
    .from('documentos_cliente')
    .select('id, cliente_id, titulo, metadata')
    .ilike('titulo', TITULO_BUSCAR)

  console.log(`\n👤 documentos_cliente: ${docsCliente?.length || 0} encontrado(s)`)
  if (docsCliente && docsCliente.length > 0) {
    docsCliente.forEach(doc => {
      console.log(`   - ${doc.titulo}`)
      console.log(`     ID: ${doc.id}`)
      console.log(`     Metadata:`, doc.metadata)
    })
  }

  // 3. documentos_vivienda
  const { data: docsVivienda } = await supabase
    .from('documentos_vivienda')
    .select('id, vivienda_id, titulo, metadata')
    .ilike('titulo', TITULO_BUSCAR)

  console.log(`\n🏠 documentos_vivienda: ${docsVivienda?.length || 0} encontrado(s)`)
  if (docsVivienda && docsVivienda.length > 0) {
    docsVivienda.forEach(doc => {
      console.log(`   - ${doc.titulo}`)
      console.log(`     ID: ${doc.id}`)
      console.log(`     Metadata:`, doc.metadata)
    })
  }

  // 4. Buscar por "juan carlos" en el título
  console.log('\n\n🔍 Buscando por "juan carlos" en el título...\n')

  const { data: porNombre } = await supabase
    .from('documentos_cliente')
    .select('id, cliente_id, titulo, metadata')
    .ilike('titulo', '%juan%carlos%')

  console.log(`👤 documentos_cliente con "juan carlos": ${porNombre?.length || 0}`)
  if (porNombre && porNombre.length > 0) {
    porNombre.forEach((doc, i) => {
      console.log(`\n${i + 1}. Título: ${doc.titulo}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Cliente ID: ${doc.cliente_id}`)
      console.log(`   Metadata:`, JSON.stringify(doc.metadata, null, 2))
    })
  }
}

buscarEnTodasLasTablas()
