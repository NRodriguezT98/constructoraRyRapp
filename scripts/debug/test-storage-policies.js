require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  // Check all storage policies
  const sql = `
    SELECT policyname, cmd, qual::text, with_check::text
    FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
    ORDER BY policyname
  `
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
  console.log('All storage policies:')
  if (typeof data === 'string') {
    console.log(data)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
  if (error) console.log('Error:', error.message)
}
check()
