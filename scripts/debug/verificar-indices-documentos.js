/**
 * Script para verificar índices de optimización de documentos
 * Muestra todos los índices creados y su uso
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarIndices() {
  console.log('🔍 VERIFICANDO ÍNDICES DE DOCUMENTOS\n')
  console.log('='.repeat(80))

  try {
    // Consultar índices de las 3 tablas
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
          AND indexname LIKE 'idx_docs_%'
        ORDER BY tablename, indexname;
      `,
    })

    if (error) {
      console.error('❌ Error:', error.message)

      // Método alternativo usando SQL directo
      console.log('\n📋 Usando método alternativo...\n')

      const query = `
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
          AND indexname LIKE 'idx_docs_%'
        ORDER BY tablename, indexname;
      `

      console.log('Ejecuta esta query en Supabase SQL Editor:')
      console.log(query)
      return
    }

    // Agrupar por tabla
    const indicesPorTabla = {}
    data.forEach(idx => {
      if (!indicesPorTabla[idx.tablename]) {
        indicesPorTabla[idx.tablename] = []
      }
      indicesPorTabla[idx.tablename].push(idx)
    })

    // Mostrar resultados
    Object.keys(indicesPorTabla)
      .sort()
      .forEach(tabla => {
        console.log(`\n📊 ${tabla.toUpperCase()}`)
        console.log('-'.repeat(80))

        indicesPorTabla[tabla].forEach((idx, i) => {
          console.log(`\n${i + 1}. ${idx.indexname}`)
          console.log(`   ${idx.indexdef}`)
        })

        console.log(`\n✅ Total: ${indicesPorTabla[tabla].length} índices`)
      })

    console.log('\n' + '='.repeat(80))
    console.log(
      `\n🎉 TOTAL: ${data.length} índices de optimización encontrados\n`
    )
  } catch (err) {
    console.error('❌ Error ejecutando verificación:', err)
  }
}

verificarIndices()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
