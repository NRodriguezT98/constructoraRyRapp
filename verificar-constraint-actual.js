require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarConstraint() {
  console.log('🔍 Verificando constraint actual de permisos_rol...\n')

  // Query para obtener la definición del constraint
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT conname, pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint
      WHERE conrelid = 'permisos_rol'::regclass
      AND contype = 'c';
    `
  })

  if (error) {
    console.error('❌ Error:', error.message)

    // Intento alternativo: consultar directamente
    const { data: rows, error: err2 } = await supabase
      .from('permisos_rol')
      .select('*')
      .limit(1)

    if (err2) {
      console.error('❌ Error alternativo:', err2.message)
      console.log('\n💡 El constraint actual no permite insertar algunos roles.')
      console.log('Necesitas ejecutar la migración 027 primero para actualizar el constraint.')
    } else {
      console.log('✅ Tabla existe y es accesible')
    }
  } else {
    console.log('📊 Constraints encontrados:')
    console.log(JSON.stringify(data, null, 2))
  }

  // Verificar qué roles existen actualmente
  const { data: roles, error: roleError } = await supabase
    .from('permisos_rol')
    .select('rol')
    .limit(100)

  if (!roleError && roles) {
    const uniqueRoles = [...new Set(roles.map(r => r.rol))]
    console.log('\n📌 Roles actuales en la tabla:')
    console.log(uniqueRoles.length > 0 ? uniqueRoles : '(vacía)')
  }
}

verificarConstraint()
