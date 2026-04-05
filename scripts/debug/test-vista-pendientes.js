/**
 * ============================================
 * TEST: Vista Documentos Pendientes en Tiempo Real
 * ============================================
 *
 * Prueba la nueva vista para verificar que:
 * 1. Muestra TODOS los requisitos pendientes
 * 2. Agrupa correctamente por fuente
 * 3. Incluye metadata JSON con info de fuente/vivienda/cliente
 * 4. Calcula correctamente obligatorios vs opcionales
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ndnqpfjnxqfwjqjcnjwz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbnFwZmpueHFmd2pxamNuand6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MTI3MDEsImV4cCI6MjA0OTk4ODcwMX0.rSNODQr-kMzR7P-OXzliFcMLkWAmlGBDOGa8Y5T7d-g'
)

async function testVistaPendientes() {
  console.log('\n🔍 TEST: Vista Documentos Pendientes\n')

  // ✅ Usar cliente de Pedrito (ya sabemos que tiene fuentes activas)
  const clienteId = '02e5c0bd-f43f-413f-ac5b-b0a9a26c5c36'

  try {
    // ✅ Query a la vista en tiempo real
    const { data: pendientes, error } = await supabase
      .from('vista_documentos_pendientes_fuentes')
      .select('*')
      .eq('cliente_id', clienteId)

    if (error) {
      console.error('❌ Error consultando vista:', error)
      return
    }

    console.log(
      `✅ Documentos pendientes encontrados: ${pendientes?.length || 0}\n`
    )

    if (!pendientes || pendientes.length === 0) {
      console.log('⚠️ No hay documentos pendientes para este cliente')

      // Verificar fuentes activas
      const { data: fuentes } = await supabase
        .from('fuentes_pago')
        .select(
          `
          id,
          tipo,
          entidad,
          estado,
          negociacion_id
        `
        )
        .eq('estado', 'Activa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      console.log('\n📌 Fuente activa más reciente:')
      console.log(JSON.stringify(fuentes, null, 2))

      if (fuentes) {
        // Verificar requisitos para ese tipo
        const { data: requisitos } = await supabase
          .from('requisitos_fuentes_pago_config')
          .select('*')
          .eq('tipo_fuente', fuentes.tipo)
          .eq('activo', true)

        console.log(
          `\n📋 Requisitos configurados para tipo "${fuentes.tipo}": ${requisitos?.length || 0}`
        )
        requisitos?.forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.titulo} (${req.nivel_validacion})`)
        })

        // Verificar documentos subidos para esa fuente
        const { data: docs } = await supabase
          .from('documentos_cliente')
          .select('id, titulo, tipo_documento')
          .eq('fuente_pago_relacionada', fuentes.id)

        console.log(
          `\n📄 Documentos ya subidos para esta fuente: ${docs?.length || 0}`
        )
        docs?.forEach((doc, i) => {
          console.log(`  ${i + 1}. ${doc.titulo} (${doc.tipo_documento})`)
        })
      }

      return
    }

    // ✅ Agrupar por fuente
    const porFuente = pendientes.reduce((acc, p) => {
      if (!acc[p.fuente_pago_id]) {
        acc[p.fuente_pago_id] = {
          tipo: p.metadata?.tipo_fuente || 'Sin tipo',
          entidad: p.metadata?.entidad_fuente || 'Sin entidad',
          pendientes: [],
        }
      }
      acc[p.fuente_pago_id].pendientes.push(p)
      return acc
    }, {})

    console.log('📊 RESUMEN POR FUENTE:\n')

    Object.entries(porFuente).forEach(([fuenteId, info], i) => {
      console.log(`${i + 1}. 🏦 ${info.tipo} - ${info.entidad}`)
      console.log(`   Fuente ID: ${fuenteId.substring(0, 8)}...`)
      console.log(`   Documentos pendientes: ${info.pendientes.length}\n`)

      info.pendientes.forEach((p, j) => {
        const icono =
          p.nivel_validacion === 'DOCUMENTO_OBLIGATORIO' ? '🔴' : '🔵'
        console.log(`   ${icono} ${j + 1}. ${p.tipo_documento}`)
        console.log(`      Nivel: ${p.nivel_validacion}`)
        console.log(`      Prioridad: ${p.prioridad}`)

        // Mostrar metadata relevante
        if (p.metadata?.vivienda_numero) {
          console.log(
            `      Vivienda: ${p.metadata.manzana_nombre}${p.metadata.vivienda_numero}`
          )
        }
        console.log('')
      })
    })

    // ✅ Resumen final
    const totalObligatorios = pendientes.filter(
      p => p.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
    ).length
    const totalOpcionales = pendientes.filter(
      p => p.nivel_validacion === 'DOCUMENTO_OPCIONAL'
    ).length

    console.log('─'.repeat(60))
    console.log(`\n📈 TOTALES:`)
    console.log(`   🔴 Obligatorios: ${totalObligatorios}`)
    console.log(`   🔵 Opcionales: ${totalOpcionales}`)
    console.log(`   📦 Total: ${pendientes.length}\n`)
  } catch (error) {
    console.error('❌ Error en test:', error)
  }
}

// Ejecutar test
testVistaPendientes()
