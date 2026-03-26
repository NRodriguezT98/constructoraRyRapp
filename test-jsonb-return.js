require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testRpcReturn() {
  // Create a temp function that returns JSONB like the real one
  const createFn = `
    CREATE OR REPLACE FUNCTION test_jsonb_return()
    RETURNS JSONB
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      RETURN jsonb_build_object(
        'success', true,
        'renuncia_id', 'b9976124-aec9-41f0-80a1-6ef4d08cc0b0'::uuid
      );
    END;
    $fn$;
  `

  // Create the function using ejecutar-sql approach
  const res1 = await supabase.rpc('exec_sql', { sql_query: createFn })
  if (res1.error) {
    // Try direct approach
    console.log('exec_sql not available, trying direct...')
  }

  // Call it
  const { data, error } = await supabase.rpc('test_jsonb_return')
  console.log('=== RPC JSONB Return Test ===')
  console.log('data:', data)
  console.log('typeof data:', typeof data)

  if (data) {
    console.log('data.success:', data.success)
    console.log('data.renuncia_id:', data.renuncia_id)
    console.log('typeof renuncia_id:', typeof data.renuncia_id)

    // Test the same extraction as mutation code
    const rpcResult = data
    const renunciaId = rpcResult?.renuncia_id
    console.log('\n=== Mutation Code Simulation ===')
    console.log('renunciaId:', renunciaId)
    console.log('truthiness:', !!renunciaId)
  }

  if (error) console.log('Error:', error.message)

  // Cleanup
  await supabase.rpc('exec_sql', { sql_query: 'DROP FUNCTION IF EXISTS test_jsonb_return()' })
}

testRpcReturn()
