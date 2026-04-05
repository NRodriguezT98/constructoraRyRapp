const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarFK() {
  console.log('🔍 Verificando foreign key de documentos_vivienda...\n')

  // Test 1: Query simple
  const { data: test1, error: error1 } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .limit(1)

  console.log('✅ Query simple:', error1 ? `❌ ${error1.message}` : '✓ OK')

  // Test 2: Con FK subido_por
  const { data: test2, error: error2 } = await supabase
    .from('documentos_vivienda')
    .select(
      `
      *,
      usuario:usuarios!subido_por (nombres, apellidos, email)
    `
    )
    .limit(1)

  console.log(
    '✅ FK usuarios!subido_por:',
    error2 ? `❌ ${error2.message}` : '✓ OK'
  )

  // Test 3: Con nombre completo de FK
  const { data: test3, error: error3 } = await supabase
    .from('documentos_vivienda')
    .select(
      `
      *,
      usuario:usuarios!fk_documentos_vivienda_subido_por (nombres, apellidos, email)
    `
    )
    .limit(1)

  console.log(
    '✅ FK usuarios!fk_documentos_vivienda_subido_por:',
    error3 ? `❌ ${error3.message}` : '✓ OK'
  )

  // Test 4: Sin alias
  const { data: test4, error: error4 } = await supabase
    .from('documentos_vivienda')
    .select(
      `
      *,
      usuarios!subido_por (nombres, apellidos, email)
    `
    )
    .limit(1)

  console.log(
    '✅ FK usuarios!subido_por (sin alias):',
    error4 ? `❌ ${error4.message}` : '✓ OK'
  )

  console.log(
    '\n📊 Resultado del test exitoso:',
    test2 || test3 || test4 || 'Ninguno funcionó'
  )
}

verificarFK()
