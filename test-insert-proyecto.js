// Verificar permisos RLS de proyectos
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jqfbnggglbdiqbqtkubu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ'
)

async function testInsert() {
  console.log('\n=== PROBANDO INSERT DE PROYECTO ===\n')

  const testProyecto = {
    nombre: 'Proyecto Test RLS',
    descripcion: 'Test de permisos',
    ubicacion: 'Test',
    fecha_inicio: new Date().toISOString(),
    estado: 'Activo',
    tipo: 'Vivienda'
  }

  console.log('Intentando insertar:', testProyecto.nombre)

  const { data, error } = await supabase
    .from('proyectos')
    .insert(testProyecto)
    .select()

  if (error) {
    console.log('\n❌ ERROR AL INSERTAR:')
    console.log('  Mensaje:', error.message)
    console.log('  Código:', error.code)
    console.log('  Detalles:', error.details)
    console.log('  Hint:', error.hint)
  } else {
    console.log('\n✅ PROYECTO CREADO EXITOSAMENTE:')
    console.log('  ID:', data[0].id)
    console.log('  Nombre:', data[0].nombre)

    // Limpiar
    await supabase.from('proyectos').delete().eq('id', data[0].id)
    console.log('  (Proyecto test eliminado)')
  }

  console.log('\n====================================\n')
}

testInsert()
