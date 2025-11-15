require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarPermisosDirecto() {
  console.log('🔍 Consultando directamente la tabla permisos_rol...\n')

  // Consultar todos los permisos de Contador
  const { data: todosPermisos, error: error1 } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')

  if (error1) {
    console.error('❌ Error consultando permisos:', error1)
    return
  }

  console.log(`📊 Total permisos de Contador en BD: ${todosPermisos?.length || 0}`)

  // Verificar específicamente proyectos.ver
  const { data: permisoVer, error: error2 } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .eq('modulo', 'proyectos')
    .eq('accion', 'ver')
    .single()

  if (error2) {
    console.error('❌ Error consultando proyectos.ver:', error2)
  } else {
    console.log('\n🎯 Permiso proyectos.ver para Contador:')
    console.log(JSON.stringify(permisoVer, null, 2))
  }

  process.exit(0)
}

verificarPermisosDirecto()
