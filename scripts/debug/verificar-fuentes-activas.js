require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificar() {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('id, nombre, activo, orden')
    .order('orden')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('\n📋 TODAS las fuentes en BD:\n')
  console.table(data)

  console.log('\n✅ Fuentes ACTIVAS (activo = true):\n')
  const activas = data.filter(f => f.activo === true)
  console.table(activas)

  console.log('\n❌ Fuentes INACTIVAS (activo = false):\n')
  const inactivas = data.filter(f => f.activo === false)
  console.table(inactivas)
}

verificar()
