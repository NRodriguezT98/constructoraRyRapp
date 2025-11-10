/**
 * Script para listar archivos de una vivienda en Storage
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const viviendaId = '66b7afe8-9d05-4c14-902a-eb1988d545e1'

async function listarArchivos() {
  console.log(`📂 Listando archivos en Storage para vivienda: ${viviendaId}\n`)

  // Listar archivos en el folder de la vivienda
  const { data: archivos, error } = await supabase.storage
    .from('documentos-viviendas')
    .list(viviendaId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('❌ Error al listar archivos:', error)
    return
  }

  console.log(`✅ Total de archivos encontrados: ${archivos.length}\n`)

  archivos.forEach((archivo, index) => {
    console.log(`${index + 1}. ${archivo.name}`)
    console.log(`   Tamaño: ${(archivo.metadata.size / 1024).toFixed(2)} KB`)
    console.log(`   Creado: ${new Date(archivo.created_at).toLocaleString('es-CO')}`)
    console.log('')
  })

  // Ahora comparar con BD
  console.log('\n📊 Comparando con base de datos...\n')

  const { data: documentos, error: dbError } = await supabase
    .from('documentos_vivienda')
    .select('id, nombre_archivo, nombre_original, version, url_storage')
    .eq('vivienda_id', viviendaId)
    .order('version', { ascending: true })

  if (dbError) {
    console.error('❌ Error al obtener documentos de BD:', dbError)
    return
  }

  console.log(`✅ Documentos en BD: ${documentos.length}\n`)

  const archivosEnStorage = new Set(archivos.map(a => a.name))

  documentos.forEach((doc, index) => {
    const existe = archivosEnStorage.has(doc.nombre_archivo)
    const icono = existe ? '✅' : '❌'

    console.log(`${icono} Versión ${doc.version}:`)
    console.log(`   ID: ${doc.id}`)
    console.log(`   Nombre en BD: ${doc.nombre_archivo}`)
    console.log(`   Original: ${doc.nombre_original}`)
    console.log(`   Existe en Storage: ${existe ? 'SÍ' : 'NO'}`)

    if (!existe) {
      // Intentar extraer nombre desde URL
      const urlParts = doc.url_storage.split(`/${viviendaId}/`)
      if (urlParts.length > 1) {
        const nombreEnUrl = decodeURIComponent(urlParts[1])
        console.log(`   ⚠️  Nombre en URL: ${nombreEnUrl}`)
        const existeEnUrl = archivosEnStorage.has(nombreEnUrl)
        console.log(`   ⚠️  Existe con nombre de URL: ${existeEnUrl ? 'SÍ' : 'NO'}`)
      }
    }
    console.log('')
  })
}

listarArchivos()
  .then(() => {
    console.log('✅ Listado completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
