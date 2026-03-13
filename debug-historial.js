/**
 * Debug: Ver qué hay en negociaciones_historial
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debug() {
  console.log('\n🔍 DEBUG HISTORIAL\n')

  // Obtener negociación de Luis David
  const { data: negociacion } = await supabase
    .from('negociaciones')
    .select('id')
    .eq('cliente_id', '65e60e24-3dc6-4910-9c52-ae12e0aa484a')
    .single()

  console.log('Negociación ID:', negociacion?.id, '\n')

  // Ver QUÉ HAY en negociaciones_historial
  const { data: historial, error } = await supabase
    .from('negociaciones_historial')
    .select('*')
    .eq('negociacion_id', negociacion?.id)
    .order('version', { ascending: false })

  console.log('Error:', error)
  console.log('Total registros:', historial?.length)
  console.log('\nDatos completos:')
  console.log(JSON.stringify(historial, null, 2))
}

debug().catch(console.error)
