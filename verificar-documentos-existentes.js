/**
 * Script para verificar documentos existentes en la BD
 * Ejecutar con: node verificar-documentos-existentes.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarDocumentos() {
  console.log('\n🔍 Verificando documentos en la base de datos...\n')

  try {
    // 1. Documentos de proyectos
    const { data: docProyectos, error: errorProyectos } = await supabase
      .from('documentos_proyecto')
      .select('id, titulo, proyecto_id, estado, es_version_actual, fecha_creacion')
      .order('fecha_creacion', { ascending: false })
      .limit(10)

    console.log('📁 DOCUMENTOS DE PROYECTOS:')
    if (errorProyectos) {
      console.error('❌ Error:', errorProyectos.message)
    } else {
      console.log(`   Total encontrados (últimos 10): ${docProyectos?.length || 0}`)
      if (docProyectos && docProyectos.length > 0) {
        docProyectos.forEach(doc => {
          console.log(`   - ${doc.titulo}`)
          console.log(`     ID: ${doc.id}`)
          console.log(`     Proyecto: ${doc.proyecto_id}`)
          console.log(`     Estado: ${doc.estado}`)
          console.log(`     Versión actual: ${doc.es_version_actual}`)
          console.log(`     Fecha: ${doc.fecha_creacion}`)
          console.log('')
        })
      } else {
        console.log('   ⚠️ No hay documentos de proyectos\n')
      }
    }

    // 2. Documentos de viviendas
    const { data: docViviendas, error: errorViviendas } = await supabase
      .from('documentos_vivienda')
      .select('id, titulo, vivienda_id, estado, es_version_actual, fecha_creacion')
      .order('fecha_creacion', { ascending: false })
      .limit(10)

    console.log('🏠 DOCUMENTOS DE VIVIENDAS:')
    if (errorViviendas) {
      console.error('❌ Error:', errorViviendas.message)
    } else {
      console.log(`   Total encontrados (últimos 10): ${docViviendas?.length || 0}`)
      if (docViviendas && docViviendas.length > 0) {
        docViviendas.forEach(doc => {
          console.log(`   - ${doc.titulo}`)
          console.log(`     ID: ${doc.id}`)
          console.log(`     Vivienda: ${doc.vivienda_id}`)
          console.log(`     Estado: ${doc.estado}`)
          console.log(`     Versión actual: ${doc.es_version_actual}`)
          console.log(`     Fecha: ${doc.fecha_creacion}`)
          console.log('')
        })
      } else {
        console.log('   ⚠️ No hay documentos de viviendas\n')
      }
    }

    // 3. Resumen por estado
    console.log('📊 RESUMEN POR ESTADO (Proyectos):')
    const { data: estadosProyectos } = await supabase
      .from('documentos_proyecto')
      .select('estado')

    if (estadosProyectos) {
      const conteo = estadosProyectos.reduce((acc, doc) => {
        acc[doc.estado] = (acc[doc.estado] || 0) + 1
        return acc
      }, {})

      Object.entries(conteo).forEach(([estado, cantidad]) => {
        console.log(`   ${estado}: ${cantidad}`)
      })
    }

    console.log('\n✅ Verificación completada\n')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

verificarDocumentos()
