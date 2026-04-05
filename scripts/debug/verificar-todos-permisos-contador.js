require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarTodosPermisos() {
  console.log('🔍 Verificando TODOS los permisos de Contador...\n')

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .order('modulo, accion')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Total de permisos: ${data.length}\n`)

  // Agrupar por módulo
  const porModulo = {}
  data.forEach(permiso => {
    if (!porModulo[permiso.modulo]) {
      porModulo[permiso.modulo] = []
    }
    porModulo[permiso.modulo].push(permiso)
  })

  // Mostrar por módulo
  Object.keys(porModulo)
    .sort()
    .forEach(modulo => {
      console.log(`\n📁 ${modulo}:`)
      porModulo[modulo].forEach(permiso => {
        const icono = permiso.permitido ? '✅' : '❌'
        console.log(`   ${icono} ${permiso.accion}: ${permiso.permitido}`)
      })
    })

  process.exit(0)
}

verificarTodosPermisos()
