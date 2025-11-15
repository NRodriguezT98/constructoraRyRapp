require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Usar SERVICE_ROLE para bypasear RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarPermisosConServiceRole() {
  console.log('🔍 Consultando permisos_rol con SERVICE_ROLE (bypass RLS)...\n')

  // Contar permisos por rol
  const { data: counts, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT rol, COUNT(*) as cantidad
        FROM permisos_rol
        GROUP BY rol
        ORDER BY rol
      `
    })

  if (error) {
    // Intento directo
    const { data: todosPermisos, error: err2 } = await supabase
      .from('permisos_rol')
      .select('rol')

    if (err2) {
      console.error('❌ Error:', err2.message)
      return
    }

    console.log(`📊 Total permisos en tabla: ${todosPermisos?.length || 0}`)

    // Agrupar manualmente
    const grouped = {}
    todosPermisos?.forEach(p => {
      grouped[p.rol] = (grouped[p.rol] || 0) + 1
    })

    console.log('\n👥 Permisos por rol:')
    Object.entries(grouped).forEach(([rol, count]) => {
      console.log(`  ${rol}: ${count} permisos`)
    })
  } else {
    console.log('📊 Resultado:', counts)
  }

  // Verificar específicamente Contador
  const { data: contador, error: err3 } = await supabase
    .from('permisos_rol')
    .select('modulo, accion, permitido')
    .eq('rol', 'Contador')
    .order('modulo, accion')

  if (err3) {
    console.error('\n❌ Error consultando Contador:', err3.message)
  } else {
    console.log(`\n📋 Permisos de Contador: ${contador?.length || 0}`)
    if (contador && contador.length > 0) {
      console.log('\nPrimeros 5 permisos:')
      contador.slice(0, 5).forEach(p => {
        console.log(`  ${p.modulo}.${p.accion}: ${p.permitido ? '✅' : '❌'}`)
      })
    }
  }
}

verificarPermisosConServiceRole()
