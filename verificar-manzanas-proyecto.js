// Verificar manzanas del proyecto específico
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jqfbnggglbdiqbqtkubu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ'
)

async function verificar() {
  console.log('\n=== VERIFICANDO MANZANAS DEL PROYECTO "Las Américas 2" ===\n')

  const proyectoId = 'ffc43d0-2588-47fd-b606-08802060f66e'

  // Obtener proyecto
  const { data: proyecto, error: errorProyecto } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', proyectoId)
    .single()

  if (errorProyecto) {
    console.log('❌ Error al obtener proyecto:', errorProyecto.message)
    return
  }

  console.log('✅ Proyecto encontrado:', proyecto.nombre)
  console.log('   Descripción:', proyecto.descripcion)
  console.log('   Ubicación:', proyecto.ubicacion)
  console.log('   ID:', proyecto.id)

  // Obtener manzanas
  console.log('\n📦 Buscando manzanas asociadas...\n')

  const { data: manzanas, error: errorManzanas } = await supabase
    .from('manzanas')
    .select('*')
    .eq('proyecto_id', proyectoId)

  if (errorManzanas) {
    console.log('❌ Error al obtener manzanas:', errorManzanas.message)
    return
  }

  if (!manzanas || manzanas.length === 0) {
    console.log('⚠️ NO SE ENCONTRARON MANZANAS PARA ESTE PROYECTO')
    console.log('\n🔍 Esto confirma que el problema está en crearProyecto():')
    console.log('   - El proyecto SÍ se guardó')
    console.log('   - Las manzanas NO se guardaron')
    console.log('   - El INSERT de manzanas está fallando silenciosamente')
  } else {
    console.log(`✅ Se encontraron ${manzanas.length} manzanas:\n`)
    manzanas.forEach((m, idx) => {
      console.log(`   ${idx + 1}. Manzana "${m.nombre}"`)
      console.log(`      - ID: ${m.id}`)
      console.log(`      - Viviendas planificadas: ${m.numero_viviendas}`)
      console.log(`      - Fecha creación: ${m.fecha_creacion}`)
      console.log('')
    })
  }

  console.log('=========================================================\n')
}

verificar()
