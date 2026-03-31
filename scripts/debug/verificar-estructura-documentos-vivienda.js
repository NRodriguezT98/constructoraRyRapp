const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarEstructura() {
  console.log('🔍 Verificando estructura de documentos_vivienda...\n')

  const { data, error } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  if (data && data.length > 0) {
    console.log('📊 Columnas encontradas:')
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col]
      const type = typeof value
      console.log(`  - ${col}: ${type} (ejemplo: ${value === null ? 'NULL' : JSON.stringify(value).substring(0, 50)})`)
    })
  } else {
    console.log('⚠️ No hay datos en la tabla')
  }
}

verificarEstructura()
