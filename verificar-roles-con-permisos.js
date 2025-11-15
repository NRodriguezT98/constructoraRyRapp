require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarRolesConPermisos() {
  console.log('🔍 Verificando qué roles tienen permisos...\n')

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('rol')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  // Contar por rol
  const conteo = {}
  data.forEach(permiso => {
    conteo[permiso.rol] = (conteo[permiso.rol] || 0) + 1
  })

  console.log(`📊 Permisos por rol:\n`)
  Object.entries(conteo).sort().forEach(([rol, cantidad]) => {
    console.log(`   ${rol}: ${cantidad} permisos`)
  })

  console.log(`\n📌 Total de registros en permisos_rol: ${data.length}`)

  process.exit(0)
}

verificarRolesConPermisos()
