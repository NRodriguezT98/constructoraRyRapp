// Limpiar Storage de Supabase
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jqfbnggglbdiqbqtkubu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ'
)

async function limpiarStorage() {
  console.log('\nLimpiando Storage...\n')

  // Bucket documentos - eliminar TODO
  console.log('Bucket: documentos')
  const { data: files1 } = await supabase.storage.from('documentos').list()

  if (files1 && files1.length > 0) {
    const paths1 = files1.map(f => f.name)
    const { error: e1 } = await supabase.storage.from('documentos').remove(paths1)
    if (e1) console.log('  Error:', e1.message)
    else console.log(`  Eliminados ${paths1.length} archivos`)
  } else {
    console.log('  Ya esta vacio')
  }

  // Bucket procesos - eliminar SOLO archivos que NO sean plantillas
  console.log('\nBucket: procesos')
  const { data: files2 } = await supabase.storage.from('procesos').list()

  if (files2 && files2.length > 0) {
    // Filtrar archivos protegidos
    const archivosBorrar = files2.filter(f =>
      !f.name.includes('plantilla') &&
      !f.name.includes('template')
    )

    if (archivosBorrar.length > 0) {
      const paths2 = archivosBorrar.map(f => f.name)
      const { error: e2 } = await supabase.storage.from('procesos').remove(paths2)
      if (e2) console.log('  Error:', e2.message)
      else console.log(`  Eliminados ${paths2.length} archivos`)
    } else {
      console.log('  Solo hay plantillas protegidas')
    }

    const protegidos = files2.length - archivosBorrar.length
    if (protegidos > 0) {
      console.log(`  Protegidos: ${protegidos} archivos (plantillas)`)
    }
  } else {
    console.log('  Ya esta vacio')
  }

  console.log('\nStorage limpiado!\n')
}

limpiarStorage()
