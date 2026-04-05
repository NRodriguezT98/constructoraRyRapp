require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function actualizarEntidad() {
  const FUENTE_ID = '68995ee2-04ce-4d1e-b0ca-4f28f7397bc9' // Juan Carlos
  const ENTIDAD = 'COMFANDI' // ← Cambiar si es otra caja

  console.log(`🔧 Actualizando fuente de pago de Juan Carlos...\n`)

  // 1. Actualizar fuente_pago
  const { error: errorFuente } = await supabase
    .from('fuentes_pago')
    .update({ entidad: ENTIDAD })
    .eq('id', FUENTE_ID)

  if (errorFuente) {
    console.error('❌ Error actualizando fuente:', errorFuente)
    return
  }

  console.log(`✅ Fuente actualizada con entidad: ${ENTIDAD}\n`)

  // 2. Actualizar metadata del documento asociado
  const { data: docs, error: errorDocs } = await supabase
    .from('documentos_cliente')
    .select('id, titulo, metadata')
    .contains('metadata', { fuente_pago_id: FUENTE_ID })

  if (errorDocs) {
    console.error('❌ Error buscando documentos:', errorDocs)
    return
  }

  if (docs && docs.length > 0) {
    console.log(`📄 Encontrados ${docs.length} documento(s) asociado(s):\n`)

    for (const doc of docs) {
      console.log(`   - ${doc.titulo}`)

      const nuevoMetadata = {
        ...doc.metadata,
        entidad: ENTIDAD,
      }

      const { error: errorUpdate } = await supabase
        .from('documentos_cliente')
        .update({ metadata: nuevoMetadata })
        .eq('id', doc.id)

      if (errorUpdate) {
        console.error(
          `   ❌ Error actualizando documento ${doc.id}:`,
          errorUpdate
        )
      } else {
        console.log(`   ✅ Metadata actualizado`)
      }
    }
  } else {
    console.log('ℹ️  No se encontraron documentos asociados')
  }

  // 3. Actualizar documentos_pendientes si existen
  const { data: pendientes, error: errorPendientes } = await supabase
    .from('documentos_pendientes')
    .select('id, tipo_documento, metadata')
    .eq('fuente_pago_id', FUENTE_ID)

  if (!errorPendientes && pendientes && pendientes.length > 0) {
    console.log(
      `\n📋 Encontrados ${pendientes.length} documento(s) pendiente(s):\n`
    )

    for (const pend of pendientes) {
      console.log(`   - ${pend.tipo_documento}`)

      const nuevoMetadata = {
        ...pend.metadata,
        entidad: ENTIDAD,
      }

      const { error: errorUpdatePend } = await supabase
        .from('documentos_pendientes')
        .update({ metadata: nuevoMetadata })
        .eq('id', pend.id)

      if (errorUpdatePend) {
        console.error(
          `   ❌ Error actualizando pendiente ${pend.id}:`,
          errorUpdatePend
        )
      } else {
        console.log(`   ✅ Metadata actualizado`)
      }
    }
  }

  console.log('\n🎉 Actualización completada')
}

actualizarEntidad()
