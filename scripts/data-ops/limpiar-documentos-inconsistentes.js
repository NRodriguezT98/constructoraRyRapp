/**
 * Script para limpiar documentos inconsistentes de la BD
 * ELIMINA documentos que apuntan a buckets incorrectos
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiarDocumentosInconsistentes() {
  console.log('🧹 Iniciando limpieza de documentos inconsistentes...\n')

  // 1. Ver documentos inconsistentes ANTES de eliminar
  console.log('📊 PASO 1: Identificando documentos inconsistentes...\n')

  const { data: documentosInconsistentes, error: fetchError } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .not('url_storage', 'like', '%/documentos-viviendas/%')
    .order('fecha_creacion', { ascending: false })

  if (fetchError) {
    console.error('❌ Error al buscar documentos:', fetchError)
    return
  }

  console.log(`⚠️  Documentos a eliminar: ${documentosInconsistentes.length}\n`)

  if (documentosInconsistentes.length === 0) {
    console.log('✅ No hay documentos inconsistentes. Base de datos limpia.')
    return
  }

  // Mostrar detalles
  documentosInconsistentes.forEach((doc, index) => {
    console.log(`${index + 1}. ID: ${doc.id}`)
    console.log(`   Vivienda: ${doc.vivienda_id}`)
    console.log(`   Versión: ${doc.version}`)
    console.log(`   Archivo: ${doc.nombre_original}`)
    console.log(`   URL: ${doc.url_storage}`)
    console.log('')
  })

  // 2. ELIMINAR documentos inconsistentes
  console.log('🗑️  PASO 2: Eliminando documentos inconsistentes...\n')

  const { error: deleteError } = await supabase
    .from('documentos_vivienda')
    .delete()
    .not('url_storage', 'like', '%/documentos-viviendas/%')

  if (deleteError) {
    console.error('❌ Error al eliminar documentos:', deleteError)
    return
  }

  console.log(`✅ ${documentosInconsistentes.length} documentos eliminados correctamente\n`)

  // 3. Verificar resultado
  console.log('📊 PASO 3: Verificando estado final...\n')

  const { data: stats, error: statsError } = await supabase
    .from('documentos_vivienda')
    .select('vivienda_id')

  if (statsError) {
    console.error('❌ Error al obtener estadísticas:', statsError)
    return
  }

  const totalDocumentos = stats.length
  const viviendasConDocs = new Set(stats.map(d => d.vivienda_id)).size

  console.log('📈 ESTADÍSTICAS FINALES:')
  console.log(`   Total de documentos: ${totalDocumentos}`)
  console.log(`   Viviendas con documentos: ${viviendasConDocs}`)
  console.log('')

  // 4. Mostrar documentos restantes agrupados por vivienda
  const { data: porVivienda, error: groupError } = await supabase
    .from('documentos_vivienda')
    .select('vivienda_id, nombre_original, version')
    .order('vivienda_id')

  if (!groupError && porVivienda) {
    const grouped = porVivienda.reduce((acc, doc) => {
      if (!acc[doc.vivienda_id]) {
        acc[doc.vivienda_id] = []
      }
      acc[doc.vivienda_id].push(doc)
      return acc
    }, {})

    console.log('📂 DOCUMENTOS POR VIVIENDA:')
    Object.entries(grouped).forEach(([viviendaId, docs]) => {
      console.log(`\n   Vivienda: ${viviendaId}`)
      console.log(`   Total: ${docs.length} documento(s)`)
      docs.forEach(doc => {
        console.log(`      - v${doc.version}: ${doc.nombre_original}`)
      })
    })
  }

  console.log('\n✅ LIMPIEZA COMPLETADA EXITOSAMENTE')
}

limpiarDocumentosInconsistentes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
