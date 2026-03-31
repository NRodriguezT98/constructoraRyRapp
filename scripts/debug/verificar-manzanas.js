// Verificar manzanas en DB
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jqfbnggglbdiqbqtkubu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ'
)

async function verificar() {
  console.log('\n=== VERIFICANDO MANZANAS EN DB ===\n')

  // Obtener proyectos
  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('*')
    .order('fecha_creacion', { ascending: false })
    .limit(5)

  console.log('Proyectos encontrados:', proyectos?.length || 0)

  if (proyectos && proyectos.length > 0) {
    for (const p of proyectos) {
      console.log(`\nProyecto: ${p.nombre} (${p.id})`)

      // Obtener manzanas del proyecto
      const { data: manzanas } = await supabase
        .from('manzanas')
        .select('*')
        .eq('proyecto_id', p.id)

      console.log(`  Manzanas: ${manzanas?.length || 0}`)

      if (manzanas && manzanas.length > 0) {
        manzanas.forEach(m => {
          console.log(`    - ${m.nombre}: ${m.numero_viviendas} viviendas (ID: ${m.id})`)
        })
      } else {
        console.log('    ⚠️ SIN MANZANAS GUARDADAS')
      }
    }
  }

  console.log('\n=================================\n')
}

verificar()
