// Script para limpiar base de datos usando Supabase SDK
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jqfbnggglbdiqbqtkubu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function limpiarBaseDatos() {
  console.log('\n🧹 LIMPIANDO BASE DE DATOS...\n')

  // Orden correcto (de hijos a padres)
  const tablas = [
    'auditoria_errores',
    'auditoria_cambios',
    'auditoria_acciones',
    'documentos',
    'abonos',
    'renuncias',
    'negociaciones',
    'viviendas',
    'manzanas',
    'proyectos',
    'clientes',
    'categorias_documentos'
  ]

  for (const tabla of tablas) {
    try {
      process.stdout.write(`Limpiando ${tabla}...`)
      const { error } = await supabase.from(tabla).delete().neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error
      console.log(' ✅')
    } catch (error) {
      console.log(` ❌ ${error.message}`)
    }
  }

  console.log('\n✅ LIMPIEZA COMPLETADA!\n')
  console.log('Todas las tablas han sido vaciadas.')
  console.log('La estructura de la base de datos se mantiene intacta.\n')
}

limpiarBaseDatos()
