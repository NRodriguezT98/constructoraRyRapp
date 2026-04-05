require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  // Simulate what the RPC returns by creating a simple test function
  const { data, error } = await supabase.rpc('registrar_renuncia_completa', {
    p_negociacion_id: '00000000-0000-0000-0000-000000000000', // Fake ID to trigger validation error
    p_motivo: 'test',
  })

  console.log('=== RPC RESULT ===')
  console.log('data:', JSON.stringify(data))
  console.log('type of data:', typeof data)
  console.log('error:', error ? JSON.stringify(error) : 'null')

  if (data) {
    console.log('data.renuncia_id:', data.renuncia_id)
    console.log('data.success:', data.success)
  }
}

check()
