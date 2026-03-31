const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://zhqecllcqwfdmmfthfwq.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocWVjbGxjcXdmZG1tZnRoZndxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY1MDU3NywiZXhwIjoyMDQ2MjI2NTc3fQ.WVHdSvfHSDrfkIcDZDNaUJcqMN-P8XrFd2s_z8hAKy0'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function mostrarEstado() {
  console.log('\n📊 ESTADO ANTES DE MODIFICAR\n')

  // Versión actual
  const { data: neg } = await supabase
    .from('negociaciones')
    .select('version_actual, version_lock')
    .eq('id', '105f3121-8d56-4b29-adac-380cebdc1faf')
    .single()

  console.log('✅ Versión actual:', neg?.version_actual)
  console.log('   Lock:', neg?.version_lock)

  // Últimas versiones
  const { data: versiones } = await supabase
    .from('negociaciones_historial')
    .select('version, tipo_cambio, razon_cambio')
    .eq('negociacion_id', '105f3121-8d56-4b29-adac-380cebdc1faf')
    .order('version', { ascending: false })
    .limit(5)

  console.log('\n📜 Últimas 5 versiones:')
  versiones?.forEach(v => {
    console.log(`   v${v.version}: ${v.tipo_cambio} - ${v.razon_cambio?.substring(0, 40)}`)
  })

  // Fuentes activas
  const { data: fuentes, count } = await supabase
    .from('fuentes_pago')
    .select('*', { count: 'exact' })
    .eq('negociacion_id', '105f3121-8d56-4b29-adac-380cebdc1faf')
    .eq('estado_fuente', 'activa')

  console.log('\n💰 Fuentes activas:', count)

  // Total versiones
  const { count: total } = await supabase
    .from('negociaciones_historial')
    .select('*', { count: 'exact', head: true })
    .eq('negociacion_id', '105f3121-8d56-4b29-adac-380cebdc1faf')

  console.log('📦 Total versiones:', total)
  console.log('\n✅ Estado capturado - Ahora MODIFICA las fuentes en la UI\n')
}

mostrarEstado().catch(console.error)
