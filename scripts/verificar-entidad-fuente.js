require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEntidad() {
  console.log('🔍 Consultando fuentes de pago Subsidio Caja Compensación...\n')

  const { data, error } = await supabase
    .from('fuentes_pago')
    .select(
      `
      id,
      tipo,
      entidad,
      monto_aprobado,
      negociaciones:negociacion_id (
        cliente_id,
        clientes:cliente_id (
          nombre_completo
        )
      )
    `
    )
    .eq('tipo', 'Subsidio Caja Compensación')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Total encontradas: ${data.length}\n`)

  data.forEach((fuente, i) => {
    console.log(`${i + 1}. ID: ${fuente.id}`)
    console.log(
      `   Cliente: ${fuente.negociaciones?.clientes?.nombre_completo || 'N/A'}`
    )
    console.log(`   Entidad: "${fuente.entidad || '(vacío)'}"`)
    console.log(`   Monto: $${fuente.monto_aprobado?.toLocaleString('es-CO')}`)
    console.log('')
  })
}

verificarEntidad()
