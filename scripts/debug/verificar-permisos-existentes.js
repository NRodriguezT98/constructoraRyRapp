import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarPermisosExistentes() {
  console.log('\n🔍 Permisos únicos existentes en la BD:\n')

  const { data: permisos } = await supabase
    .from('permisos_rol')
    .select('modulo, accion')
    .order('modulo', { ascending: true })
    .order('accion', { ascending: true })

  // Agrupar por módulo
  const porModulo = {}
  permisos?.forEach(p => {
    if (!porModulo[p.modulo]) porModulo[p.modulo] = new Set()
    porModulo[p.modulo].add(p.accion)
  })

  Object.entries(porModulo).forEach(([modulo, acciones]) => {
    console.log(`📁 ${modulo}:`)
    Array.from(acciones).forEach(accion => {
      console.log(`   • ${accion}`)
    })
    console.log('')
  })
}

verificarPermisosExistentes()
