require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarPermisos() {
  console.log('🔍 Verificando permisos de Contador en módulo proyectos...\n')

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .eq('modulo', 'proyectos')
    .order('accion')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Permisos encontrados: ${data.length}\n`)

  data.forEach(permiso => {
    const icono = permiso.permitido ? '✅' : '❌'
    console.log(`${icono} proyectos.${permiso.accion}: ${permiso.permitido}`)
  })

  // Verificar específicamente el permiso 'ver'
  const permisoVer = data.find(p => p.accion === 'ver')
  console.log(`\n🎯 Permiso crítico para sidebar:`)
  console.log(`   proyectos.ver = ${permisoVer?.permitido ? 'TRUE ✅' : 'FALSE ❌'}`)

  process.exit(0)
}

verificarPermisos()
