import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarPermisosGerente() {
  console.log('\n🔍 Verificando permisos de Gerente...\n')

  // 1. Contar permisos por rol
  const { data: conteo, error: errorConteo } = await supabase
    .from('permisos_rol')
    .select('rol', { count: 'exact' })

  if (errorConteo) {
    console.error('❌ Error al contar:', errorConteo)
    return
  }

  // Agrupar manualmente
  const conteoManual = await supabase
    .from('permisos_rol')
    .select('rol')

  const grupos = {}
  conteoManual.data?.forEach(item => {
    grupos[item.rol] = (grupos[item.rol] || 0) + 1
  })

  console.log('📊 Permisos por rol:')
  Object.entries(grupos).forEach(([rol, count]) => {
    console.log(`  ${rol}: ${count}`)
  })

  // 2. Obtener permisos de Gerente
  const { data: permisosGerente, error: errorGerente } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Gerente')
    .limit(10)

  console.log(`\n✅ Permisos de Gerente (primeros 10):`)
  if (permisosGerente && permisosGerente.length > 0) {
    permisosGerente.forEach(p => {
      console.log(`  • ${p.modulo}.${p.accion}`)
    })
  } else {
    console.log('  ⚠️  NO HAY PERMISOS PARA GERENTE')
  }

  // 3. Verificar si existe "Gerencia"
  const { data: permisosGerencia, error: errorGerencia } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', 'Gerencia')

  console.log(`\n❌ Permisos de "Gerencia" (debe ser 0): ${permisosGerencia?.length || 0}`)

  if (permisosGerencia && permisosGerencia.length > 0) {
    console.log('\n⚠️  PROBLEMA: Todavía existen permisos con rol "Gerencia"')
    console.log('   Estos deben migrarse a "Gerente"\n')
  }
}

verificarPermisosGerente()
