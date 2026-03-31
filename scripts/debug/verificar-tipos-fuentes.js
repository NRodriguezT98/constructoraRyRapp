require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarTiposFuentes() {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('id, nombre, codigo, icono, color, activo, orden')
    .order('orden')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('\n🔍 TIPOS DE FUENTES DE PAGO EN BD:\n')

  data.forEach((tipo, i) => {
    console.log(`${i + 1}. ${tipo.nombre}`)
    console.log(`   Código: ${tipo.codigo}`)
    console.log(`   Icono: ${tipo.icono || 'NULL ⚠️'}`)
    console.log(`   Color: ${tipo.color || 'NULL ⚠️'}`)
    console.log(`   Orden: ${tipo.orden}`)
    console.log(`   Activo: ${tipo.activo}`)
    console.log(`   ID: ${tipo.id}`)
    console.log()
  })

  // Verificar si hay iconos inválidos
  const iconosValidos = ['Wallet', 'Building2', 'Home', 'Shield', 'CreditCard', 'Landmark', 'BadgeDollarSign', 'DollarSign', 'Banknote', 'HandCoins']
  const coloresValidos = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'pink', 'indigo', 'yellow', 'emerald']

  const problemasIcono = data.filter(t => !iconosValidos.includes(t.icono))
  const problemasColor = data.filter(t => !coloresValidos.includes(t.color))

  if (problemasIcono.length > 0) {
    console.log('⚠️  PROBLEMAS CON ICONOS:')
    problemasIcono.forEach(t => console.log(`   - ${t.nombre}: icono="${t.icono}" (no válido)`))
    console.log()
  }

  if (problemasColor.length > 0) {
    console.log('⚠️  PROBLEMAS CON COLORES:')
    problemasColor.forEach(t => console.log(`   - ${t.nombre}: color="${t.color}" (no válido)`))
    console.log()
  }

  if (problemasIcono.length === 0 && problemasColor.length === 0) {
    console.log('✅ Todos los registros tienen iconos y colores válidos')
  }
}

verificarTiposFuentes()
