/**
 * Script: Ejecutar migración de documentos a carpetas
 * Ejecutar: node migrar-documentos-carpetas.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('\n=======================================================')
  console.log('   📂 MIGRAR DOCUMENTOS A CARPETAS')
  console.log('=======================================================\n')

  // 1. Verificar estado antes de migración
  console.log('→ Verificando documentos antes de migración...')
  const { data: docsBefore, error: errorBefore } = await supabase
    .from('documentos_vivienda')
    .select('id, vivienda_id, carpeta_id, titulo')
    .is('carpeta_id', null)

  if (errorBefore) {
    console.error('❌ Error:', errorBefore.message)
    return
  }

  console.log(`✓ Documentos sin carpeta: ${docsBefore?.length || 0}\n`)

  if (!docsBefore || docsBefore.length === 0) {
    console.log('✅ No hay documentos para migrar\n')
    return
  }

  // Mostrar algunos ejemplos
  console.log('📄 Ejemplos de documentos a migrar:')
  docsBefore.slice(0, 5).forEach((doc, i) => {
    console.log(`  ${i + 1}. ${doc.titulo}`)
  })
  console.log('')

  // 2. Ejecutar función de migración
  console.log('→ Ejecutando migración...')
  const { data: resultados, error: errorMigrar } = await supabase
    .rpc('migrar_documentos_a_carpetas')

  if (errorMigrar) {
    console.error('❌ Error ejecutando migración:', errorMigrar.message)
    console.error('   Detalles:', errorMigrar)
    return
  }

  console.log('✓ Migración ejecutada\n')

  // 3. Mostrar resultados por vivienda
  if (resultados && resultados.length > 0) {
    console.log('📊 Resultados por vivienda:\n')

    let totalMigrados = 0
    let totalSinCarpeta = 0

    resultados.forEach((r, i) => {
      console.log(`  ${i + 1}. Vivienda: ${r.vivienda_id}`)
      console.log(`     ✓ Migrados: ${r.documentos_migrados}`)
      console.log(`     ⚠️  Sin carpeta: ${r.documentos_sin_carpeta}`)
      console.log('')

      totalMigrados += r.documentos_migrados || 0
      totalSinCarpeta += r.documentos_sin_carpeta || 0
    })

    console.log('=======================================================')
    console.log(`   TOTAL MIGRADOS: ${totalMigrados}`)
    console.log(`   TOTAL SIN CARPETA: ${totalSinCarpeta}`)
    console.log('=======================================================\n')
  }

  // 4. Verificar documentos después de migración
  console.log('→ Verificando resultado final...')
  const { data: docsAfter, error: errorAfter } = await supabase
    .from('documentos_vivienda')
    .select('id, carpeta_id')

  if (errorAfter) {
    console.error('❌ Error:', errorAfter.message)
    return
  }

  const conCarpeta = docsAfter?.filter(d => d.carpeta_id !== null).length || 0
  const sinCarpeta = docsAfter?.filter(d => d.carpeta_id === null).length || 0

  console.log(`✓ Documentos CON carpeta: ${conCarpeta}`)
  console.log(`⚠️  Documentos SIN carpeta: ${sinCarpeta}\n`)

  // 5. Mostrar distribución por carpeta
  console.log('→ Distribución por carpeta...')
  const { data: distribucion, error: errorDist } = await supabase
    .from('documentos_vivienda')
    .select(`
      carpeta_id,
      carpeta:carpetas_documentos_viviendas(nombre, color)
    `)
    .not('carpeta_id', 'is', null)

  if (errorDist) {
    console.error('❌ Error:', errorDist.message)
  } else if (distribucion) {
    // Agrupar por carpeta
    const grupos = distribucion.reduce((acc, doc) => {
      const nombreCarpeta = doc.carpeta?.nombre || 'Desconocida'
      if (!acc[nombreCarpeta]) {
        acc[nombreCarpeta] = 0
      }
      acc[nombreCarpeta]++
      return acc
    }, {})

    console.log('\n📁 Documentos por carpeta:\n')
    Object.entries(grupos)
      .sort(([, a], [, b]) => b - a)
      .forEach(([nombre, cantidad]) => {
        console.log(`  ${nombre}: ${cantidad} documento(s)`)
      })
  }

  console.log('\n=======================================================')
  console.log('   ✅ MIGRACIÓN COMPLETADA')
  console.log('=======================================================\n')
  console.log('💡 Siguiente paso: Integrar UI de carpetas en la aplicación\n')
}

main()
  .catch(error => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
