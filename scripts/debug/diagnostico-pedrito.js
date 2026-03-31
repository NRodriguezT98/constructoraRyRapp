/**
 * Diagnóstico de Pedrito para sistema de documentos pendientes
 */
import pkg from 'pg'
const { Client } = pkg

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.swyjhwgvkfcfdtemkyad',
  password: 'zkSaUTzPfKjlmwOH',
  ssl: { rejectUnauthorized: false }
})

async function diagnosticarPedrito() {
  try {
    await client.connect()
    console.log('✅ Conectado\n')

    // 1. Buscar Pedrito
    const pedrito = await client.query(`
      SELECT id, nombres, apellidos, numero_documento
      FROM clientes
      WHERE numero_documento = '1233333'
    `)

    if (pedrito.rows.length === 0) {
      console.log('❌ No se encontró Pedrito')
      return
    }

    const cliente = pedrito.rows[0]
    console.log(`👤 ${cliente.nombres} ${cliente.apellidos} (CC: ${cliente.numero_documento})`)
    console.log(`   ID: ${cliente.id}\n`)

    // 2. Fuentes (TODAS, sin filtrar por estado)
    console.log('🏦 FUENTES DE PAGO (TODAS):\n')
    const fuentes = await client.query(`
      SELECT
        fp.id,
        fp.tipo,
        fp.entidad,
        fp.monto_aprobado,
        fp.estado,
        n.id as negociacion_id
      FROM fuentes_pago fp
      JOIN negociaciones n ON n.id = fp.negociacion_id
      WHERE n.cliente_id = $1
      ORDER BY fp.estado DESC, fp.tipo
    `, [cliente.id])

    if (fuentes.rows.length === 0) {
      console.log('   ⚠️ No tiene fuentes de pago registradas\n')
    } else {
      fuentes.rows.forEach((f, i) => {
        const estadoEmoji = f.estado === 'En Proceso' || f.estado === 'Completada' ? '✅' : '⚠️'
        console.log(`   ${estadoEmoji} ${i + 1}. ${f.tipo} - ${f.entidad || 'Sin entidad'}`)
        console.log(`      Monto: $${f.monto_aprobado?.toLocaleString() || '0'}`)
        console.log(`      Estado: ${f.estado}`)
        console.log(`      ID: ${f.id.substring(0, 8)}...\n`)
      })
    }

    // 3. Para cada fuente, ver requisitos y documentos subidos
    for (const fuente of fuentes.rows) {
      console.log(`📋 REQUISITOS PARA: ${fuente.tipo}\n`)

      const requisitos = await client.query(`
        SELECT
          titulo,
          tipo_documento_sugerido,
          nivel_validacion,
          orden
        FROM requisitos_fuentes_pago_config
        WHERE tipo_fuente = $1
          AND activo = true
        ORDER BY orden
      `, [fuente.tipo])

      if (requisitos.rows.length === 0) {
        console.log(`   ❌ No hay requisitos configurados para "${fuente.tipo}"\n`)
        continue
      }

      console.log(`   Total requisitos configurados: ${requisitos.rows.length}\n`)

      for (const req of requisitos.rows) {
        // Verificar si ya subió este documento
        const docSubido = await client.query(`
          SELECT id, titulo, tipo_documento
          FROM documentos_cliente
          WHERE fuente_pago_relacionada = $1
            AND cliente_id = $2
            AND (tipo_documento = $3 OR tipo_documento = $4)
            AND estado = 'Activo'
          LIMIT 1
        `, [fuente.id, cliente.id, req.tipo_documento_sugerido, req.titulo])

        const icono = req.nivel_validacion === 'DOCUMENTO_OBLIGATORIO' ? '🔴' : '🔵'

        if (docSubido.rows.length > 0) {
          console.log(`   ✅ ${icono} ${req.titulo}`)
          console.log(`      Ya subido: "${docSubido.rows[0].titulo}"`)
        } else {
          console.log(`   ⏳ ${icono} ${req.titulo}`)
          console.log(`      PENDIENTE (${req.nivel_validacion})`)
        }
        console.log('')
      }
    }

    // 4. Vista de pendientes
    console.log('─'.repeat(60))
    console.log('\n📊 RESULTADO DE LA VISTA (documentos_pendientes_fuentes):\n')

    const vistaResult = await client.query(`
      SELECT
        tipo_documento,
        tipo_fuente,
        entidad,
        nivel_validacion,
        prioridad
      FROM vista_documentos_pendientes_fuentes
      WHERE cliente_id = $1
      ORDER BY nivel_validacion, tipo_fuente
    `, [cliente.id])

    if (vistaResult.rows.length === 0) {
      console.log('   ✅ SIN PENDIENTES - Todos los documentos requeridos están subidos\n')
    } else {
      console.log(`   Total pendientes: ${vistaResult.rows.length}\n`)
      vistaResult.rows.forEach((p, i) => {
        const icono = p.nivel_validacion === 'DOCUMENTO_OBLIGATORIO' ? '🔴' : '🔵'
        console.log(`   ${i + 1}. ${icono} ${p.tipo_documento}`)
        console.log(`      Fuente: ${p.tipo_fuente} - ${p.entidad}`)
        console.log(`      Prioridad: ${p.prioridad}\n`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

diagnosticarPedrito()
