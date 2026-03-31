const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function compararEstructuras() {
  console.log('🔍 Comparando estructuras documentos_proyecto vs documentos_vivienda...\n')

  // Proyectos
  const { data: proyecto } = await supabase
    .from('documentos_proyecto')
    .select('*')
    .limit(1)

  // Viviendas
  const { data: vivienda } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .limit(1)

  if (proyecto && proyecto.length > 0) {
    const subidoPorProyecto = proyecto[0].subido_por
    console.log('📊 PROYECTOS - subido_por:')
    console.log(`  Tipo: ${typeof subidoPorProyecto}`)
    console.log(`  Valor: ${subidoPorProyecto}`)
  }

  if (vivienda && vivienda.length > 0) {
    const subidoPorVivienda = vivienda[0].subido_por
    console.log('\n📊 VIVIENDAS - subido_por:')
    console.log(`  Tipo: ${typeof subidoPorVivienda}`)
    console.log(`  Valor: ${subidoPorVivienda}`)
  }

  // Test query con FK en proyectos
  const { data: testProyecto, error: errorProyecto } = await supabase
    .from('documentos_proyecto')
    .select(`
      id,
      titulo,
      usuario:usuarios!subido_por (nombres, apellidos)
    `)
    .limit(1)

  console.log('\n✅ Query proyectos con usuarios!subido_por:', errorProyecto ? `❌ ${errorProyecto.message}` : '✓ OK')

  // Test query con FK en viviendas
  const { data: testVivienda, error: errorVivienda } = await supabase
    .from('documentos_vivienda')
    .select(`
      id,
      titulo,
      usuario:usuarios!subido_por (nombres, apellidos)
    `)
    .limit(1)

  console.log('✅ Query viviendas con usuarios!subido_por:', errorVivienda ? `❌ ${errorVivienda.message}` : '✓ OK')
}

compararEstructuras()
