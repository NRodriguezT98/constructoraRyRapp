require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarTablas() {
  console.log('🔍 Verificando qué tablas de documentos tienen datos...\n')

  // Lista de posibles tablas
  const tablas = [
    'documentos_proyecto',
    'documentos_cliente',
    'documentos_vivienda',
    'documentos',
  ]

  for (const tabla of tablas) {
    try {
      const { count, error } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${tabla}: ${error.message}`)
      } else {
        console.log(`✅ ${tabla}: ${count} registros`)

        if (count && count > 0) {
          // Mostrar los últimos 5
          const { data } = await supabase
            .from(tabla)
            .select('id, titulo')
            .order('fecha_creacion', { ascending: false })
            .limit(5)

          if (data) {
            data.forEach((doc, i) => {
              console.log(`   ${i + 1}. ${doc.titulo || 'Sin título'}`)
            })
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${tabla}: tabla no existe`)
    }
    console.log('')
  }
}

verificarTablas()
