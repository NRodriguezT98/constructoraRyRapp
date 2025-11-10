/**
 * Script de diagnóstico para verificar integridad de documentos en Storage
 * Verifica que url_storage y nombre_archivo sean consistentes
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function diagnosticar() {
  console.log('🔍 Iniciando diagnóstico de documentos...\n')

  // 1. Obtener todos los documentos
  const { data: documentos, error } = await supabase
    .from('documentos_vivienda')
    .select('id, vivienda_id, nombre_archivo, nombre_original, url_storage, version')
    .order('fecha_creacion', { ascending: false })
    .limit(100)

  if (error) {
    console.error('❌ Error al obtener documentos:', error)
    return
  }

  console.log(`📊 Total de documentos a verificar: ${documentos.length}\n`)

  const problemas = []

  for (const doc of documentos) {
    // Extraer nombre de archivo desde URL
    let nombreEnUrl = null

    if (doc.url_storage.includes('/documentos-viviendas/')) {
      const parts = doc.url_storage.split('/documentos-viviendas/')
      if (parts.length > 1) {
        const pathCompleto = parts[1]
        // Extraer solo el nombre del archivo (después del vivienda_id/)
        const pathParts = pathCompleto.split('/')
        if (pathParts.length > 1) {
          nombreEnUrl = decodeURIComponent(pathParts[1])
        }
      }
    }

    // Verificar si coinciden
    if (nombreEnUrl && nombreEnUrl !== doc.nombre_archivo) {
      problemas.push({
        id: doc.id,
        version: doc.version,
        vivienda_id: doc.vivienda_id,
        nombre_bd: doc.nombre_archivo,
        nombre_url: nombreEnUrl,
        url_completa: doc.url_storage
      })

      console.log(`⚠️  Inconsistencia encontrada:`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Versión: ${doc.version}`)
      console.log(`   Vivienda: ${doc.vivienda_id}`)
      console.log(`   Nombre en BD: ${doc.nombre_archivo}`)
      console.log(`   Nombre en URL: ${nombreEnUrl}`)
      console.log(`   URL: ${doc.url_storage}`)
      console.log('')
    }
  }

  // Resumen
  console.log('\n📋 RESUMEN:')
  console.log(`✅ Documentos correctos: ${documentos.length - problemas.length}`)
  console.log(`⚠️  Documentos con inconsistencias: ${problemas.length}`)

  if (problemas.length > 0) {
    console.log('\n🔧 SOLUCIÓN RECOMENDADA:')
    console.log('Ejecutar script de corrección para actualizar campo nombre_archivo')
    console.log('con el valor extraído de url_storage\n')

    // Guardar problemas en archivo JSON
    const fs = await import('fs')
    fs.writeFileSync(
      'documentos-inconsistentes.json',
      JSON.stringify(problemas, null, 2)
    )
    console.log('💾 Problemas guardados en: documentos-inconsistentes.json')
  }
}

diagnosticar()
  .then(() => {
    console.log('\n✅ Diagnóstico completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en diagnóstico:', error)
    process.exit(1)
  })
