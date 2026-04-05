require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const RENUNCIA_ID = 'b9976124-aec9-41f0-80a1-6ef4d08cc0b0'

async function check() {
  // 1. Test upload with SERVICE ROLE KEY (bypasses RLS)
  console.log('=== TEST 1: Upload with SERVICE ROLE KEY ===')
  const testContent = Buffer.from('test file content')
  const filePath = `${RENUNCIA_ID}/test-upload.txt`

  const { data: d1, error: e1 } = await supabase.storage
    .from('renuncias-comprobantes')
    .upload(filePath, testContent, {
      contentType: 'text/plain',
      upsert: true,
    })
  console.log('Service Role Upload:', d1 ? 'SUCCESS' : 'FAILED')
  if (e1) console.log('Error:', e1.message)

  // Clean up test file
  if (d1) {
    await supabase.storage.from('renuncias-comprobantes').remove([filePath])
    console.log('Cleaned up test file')
  }

  // 2. Check what anon key can do (simulate frontend)
  console.log('\n=== TEST 2: Upload with ANON KEY (simulates frontend) ===')
  // First need to sign in as the user... Skip this for now

  // 3. Let me check what the frontend client actually is
  console.log('\n=== TEST 3: Check supabase client import ===')

  // 4. Most importantly - check if the RPC result has renuncia_id
  // Let me check what registrarRenuncia actually returned
  // Since I can't re-run the RPC, let me check the mutation code more carefully

  // Check if renuncia was created correctly
  const { data: renuncia } = await supabase
    .from('renuncias')
    .select('id, estado, formulario_renuncia_url, motivo')
    .eq('id', RENUNCIA_ID)
    .single()
  console.log('\n=== Renuncia record ===')
  console.log(JSON.stringify(renuncia, null, 2))

  // Check if there are any files in the bucket at all
  const { data: allFiles } = await supabase.storage
    .from('renuncias-comprobantes')
    .list('', { limit: 20 })
  console.log('\n=== All files/folders in bucket ===')
  console.log(JSON.stringify(allFiles, null, 2))
}

check()
