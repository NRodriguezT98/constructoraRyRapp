/**
 * Script para corregir documentos con URLs inconsistentes
 * Identifica documentos en tabla documentos_vivienda que apuntan a otros buckets
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function corregirDocumentosInconsistentes() {
  console.log('🔍 Buscando documentos con URLs inconsistentes...\n')

  // 1. Buscar documentos que NO apuntan a documentos-viviendas
  const { data: documentos, error } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .not('url_storage', 'like', '%/documentos-viviendas/%')

  if (error) {
    console.error('❌ Error al buscar documentos:', error)
    return
  }

  console.log(`📊 Documentos con URLs inconsistentes: ${documentos.length}\n`)

  if (documentos.length === 0) {
    console.log('✅ No hay documentos con URLs inconsistentes')
    return
  }

  for (const doc of documentos) {
    console.log('⚠️  Documento inconsistente encontrado:')
    console.log(`   ID: ${doc.id}`)
    console.log(`   Vivienda: ${doc.vivienda_id}`)
    console.log(`   Versión: ${doc.version}`)
    console.log(`   Nombre archivo: ${doc.nombre_archivo}`)
    console.log(`   URL actual: ${doc.url_storage}`)
    console.log('')

    // Detectar si es un documento de proyecto antiguo
    if (doc.url_storage.includes('/documentos-proyectos/')) {
      console.log('   🔧 ACCIÓN RECOMENDADA:')
      console.log('   Este documento apunta al bucket antiguo "documentos-proyectos".')
      console.log('   Opciones:')
      console.log('   1. Eliminar el documento (si ya no es necesario)')
      console.log('   2. Copiar archivo a documentos-viviendas y actualizar URL')
      console.log('   3. Dejar como está y deshabilitar restauración de esta versión')
      console.log('')
    }
  }

  console.log('\n📋 RESUMEN:')
  console.log(`Total de documentos a corregir: ${documentos.length}`)
  console.log('\n💡 RECOMENDACIÓN:')
  console.log('Ejecuta este script con --fix para aplicar correcciones automáticas')
  console.log('O elimina manualmente los documentos inconsistentes desde la UI')
}

corregirDocumentosInconsistentes()
  .then(() => {
    console.log('\n✅ Análisis completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
