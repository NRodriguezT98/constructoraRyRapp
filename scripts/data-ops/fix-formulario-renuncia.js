require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const RENUNCIA_ID = 'b9976124-aec9-41f0-80a1-6ef4d08cc0b0'

async function uploadFormulario() {
  // Test with a real PDF-like upload (using proper MIME type)
  const testContent = Buffer.from('%PDF-1.4 test content')
  const filePath = `${RENUNCIA_ID}/formulario-renuncia.pdf`

  console.log('Uploading test formulario to:', filePath)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('renuncias-comprobantes')
    .upload(filePath, testContent, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    console.error('Upload ERROR:', uploadError.message)
    return
  }
  console.log('Upload SUCCESS:', uploadData.path)

  // Update the renuncia record
  const { data: updateData, error: updateError } = await supabase
    .from('renuncias')
    .update({ formulario_renuncia_url: filePath })
    .eq('id', RENUNCIA_ID)
    .select('id, formulario_renuncia_url')
    .single()

  if (updateError) {
    console.error('Update ERROR:', updateError.message)
    return
  }
  console.log('DB Update SUCCESS:', JSON.stringify(updateData))

  // Verify signed URL works
  const { data: signedData, error: signedError } = await supabase.storage
    .from('renuncias-comprobantes')
    .createSignedUrl(filePath, 3600)

  if (signedError) {
    console.error('SignedURL ERROR:', signedError.message)
    return
  }
  console.log('Signed URL generated:', signedData.signedUrl.substring(0, 80) + '...')

  console.log('\n✅ Formulario uploaded and linked successfully!')
  console.log('Note: This is a placeholder PDF. User should re-upload the actual formulario.')
}

uploadFormulario()
