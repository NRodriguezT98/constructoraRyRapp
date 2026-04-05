// Verificar registros históricos sin email
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role para acceso total
)

async function verificarEmailsHistoricos() {
  console.log('🔍 Verificando emails en negociaciones_historial...\n')

  const { data: registros, error } = await supabase
    .from('negociaciones_historial')
    .select('id, version, usuario_id, usuario_email, fecha_cambio')
    .order('fecha_cambio', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  const conEmail = registros.filter(r => r.usuario_email)
  const sinEmail = registros.filter(r => !r.usuario_email)

  console.log(`📊 Total de registros: ${registros.length}`)
  console.log(`✅ Con email: ${conEmail.length}`)
  console.log(`⚠️  Sin email: ${sinEmail.length}\n`)

  if (sinEmail.length > 0) {
    console.log('📋 Registros sin email:')
    sinEmail.forEach(r => {
      console.log(
        `  - v${r.version} | ${r.fecha_cambio} | usuario_id: ${r.usuario_id || 'NULL'}`
      )
    })
  }

  // Verificar si hay registros con NULL que la migración debió poblar
  const { data: verificacion } = await supabase.rpc('exec', {
    sql: `
      SELECT
        COUNT(*) FILTER (WHERE nh.usuario_email IS NULL) as sin_email,
        COUNT(*) FILTER (WHERE nh.usuario_email IS NOT NULL) as con_email
      FROM negociaciones_historial nh
    `,
  })

  console.log('\n✅ Verificación completa')
}

verificarEmailsHistoricos()
