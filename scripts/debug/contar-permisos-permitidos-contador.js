require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Usar SERVICE_ROLE para bypasear RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function contarPermisosPermitidos() {
  console.log('📊 Contando permisos con permitido=true para Contador...\n')

  // Total permisos
  const { data: todos, error: e1 } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')

  // Solo permitidos
  const { data: permitidos, error: e2 } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .eq('permitido', true)

  // Solo no permitidos
  const { data: noPermitidos, error: e3 } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Contador')
    .eq('permitido', false)

  if (e1 || e2 || e3) {
    console.error('❌ Error:', e1?.message || e2?.message || e3?.message)
    return
  }

  console.log(`Total permisos de Contador: ${todos?.length || 0}`)
  console.log(`  ✅ Permitidos (true): ${permitidos?.length || 0}`)
  console.log(`  ❌ No permitidos (false): ${noPermitidos?.length || 0}`)

  // Verificar proyectos.ver específicamente
  const proyectosVer = permitidos?.find(p => p.modulo === 'proyectos' && p.accion === 'ver')
  console.log(`\n🎯 proyectos.ver existe: ${proyectosVer ? '✅ SÍ' : '❌ NO'}`)
  if (proyectosVer) {
    console.log(`   permitido: ${proyectosVer.permitido}`)
  }

  // Listar módulos con permiso 'ver'
  const permisosVer = permitidos?.filter(p => p.accion === 'ver').map(p => p.modulo) || []
  console.log(`\n📋 Módulos con permiso 'ver' para Contador:`)
  permisosVer.forEach(modulo => {
    console.log(`   - ${modulo}`)
  })
}

contarPermisosPermitidos()
