/**
 * Script de verificación: Sistema de filtrado de entidades por fuente de pago
 *
 * Verifica que:
 * 1. get_entidades_por_tipo_fuente() funciona correctamente
 * 2. Las entidades tienen tipos_fuentes_aplicables configurados
 * 3. El filtrado es correcto para cada tipo de fuente
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarSistemaFiltrado() {
  console.log(
    '\n🔍 VERIFICACIÓN: Sistema de filtrado de entidades por fuente de pago\n'
  )
  console.log('='.repeat(80))

  // 1. Verificar tipos de fuentes de pago activas
  console.log('\n📋 1. TIPOS DE FUENTES DE PAGO ACTIVAS:')
  const { data: tiposFuentes, error: errorTipos } = await supabase
    .from('tipos_fuentes_pago')
    .select('id, nombre, activo, requiere_entidad')
    .eq('activo', true)
    .order('orden')

  if (errorTipos) {
    console.error('❌ Error:', errorTipos.message)
    return
  }

  tiposFuentes.forEach(tipo => {
    console.log(`   ${tipo.requiere_entidad ? '🏦' : '📄'} ${tipo.nombre}`)
    console.log(`      ID: ${tipo.id}`)
    console.log(
      `      Requiere entidad: ${tipo.requiere_entidad ? 'Sí' : 'No'}`
    )
  })

  // 2. Verificar entidades y sus fuentes aplicables
  console.log('\n\n🏛️  2. ENTIDADES FINANCIERAS Y SUS FUENTES APLICABLES:')
  const { data: entidades, error: errorEntidades } = await supabase
    .from('entidades_financieras')
    .select('id, nombre, tipo, activo, tipos_fuentes_aplicables')
    .eq('activo', true)
    .order('tipo')
    .order('nombre')

  if (errorEntidades) {
    console.error('❌ Error:', errorEntidades.message)
    return
  }

  const entidadesPorTipo = {
    Banco: [],
    'Caja de Compensación': [],
    Cooperativa: [],
    Otro: [],
  }

  entidades.forEach(entidad => {
    entidadesPorTipo[entidad.tipo].push(entidad)
  })

  for (const [tipo, lista] of Object.entries(entidadesPorTipo)) {
    if (lista.length === 0) continue

    console.log(`\n   ${tipo}:`)
    lista.forEach(entidad => {
      const numFuentes = entidad.tipos_fuentes_aplicables?.length || 0
      console.log(`      • ${entidad.nombre}`)
      console.log(`        Fuentes aplicables: ${numFuentes}`)
      if (numFuentes > 0) {
        console.log(
          `        IDs: ${entidad.tipos_fuentes_aplicables.slice(0, 2).join(', ')}${numFuentes > 2 ? '...' : ''}`
        )
      }
    })
  }

  // 3. Probar función SQL get_entidades_por_tipo_fuente()
  console.log(
    '\n\n🧪 3. PRUEBAS DE FUNCIÓN SQL get_entidades_por_tipo_fuente():'
  )

  // Buscar IDs de fuentes específicas
  const creditoHipotecario = tiposFuentes.find(
    t => t.nombre === 'Crédito Hipotecario'
  )
  const subsidioCaja = tiposFuentes.find(
    t => t.nombre === 'Subsidio Caja Compensación'
  )

  if (creditoHipotecario) {
    console.log(`\n   🏦 Crédito Hipotecario (${creditoHipotecario.id}):`)
    const { data: bancosCredito, error: errorBancosCredito } =
      await supabase.rpc('get_entidades_por_tipo_fuente', {
        p_tipo_fuente_id: creditoHipotecario.id,
        p_solo_activas: true,
      })

    if (errorBancosCredito) {
      console.error('      ❌ Error:', errorBancosCredito.message)
    } else {
      const bancosFiltrados = bancosCredito.filter(e => e.tipo === 'Banco')
      console.log(`      ✅ ${bancosFiltrados.length} banco(s) encontrado(s):`)
      bancosFiltrados.forEach(banco => {
        console.log(`         • ${banco.nombre} (${banco.tipo})`)
      })

      if (bancosFiltrados.length === 0) {
        console.log(
          '      ⚠️  ADVERTENCIA: No hay bancos marcados para Crédito Hipotecario'
        )
        console.log(
          '      💡 Solución: Ir a Panel Admin → Entidades Financieras'
        )
        console.log(
          '         y marcar las entidades aplicables para esta fuente'
        )
      }
    }
  }

  if (subsidioCaja) {
    console.log(`\n   🏛️  Subsidio Caja Compensación (${subsidioCaja.id}):`)
    const { data: cajasSubsidio, error: errorCajasSubsidio } =
      await supabase.rpc('get_entidades_por_tipo_fuente', {
        p_tipo_fuente_id: subsidioCaja.id,
        p_solo_activas: true,
      })

    if (errorCajasSubsidio) {
      console.error('      ❌ Error:', errorCajasSubsidio.message)
    } else {
      const cajasFiltradas = cajasSubsidio.filter(
        e => e.tipo === 'Caja de Compensación'
      )
      console.log(`      ✅ ${cajasFiltradas.length} caja(s) encontrada(s):`)
      cajasFiltradas.forEach(caja => {
        console.log(`         • ${caja.nombre} (${caja.tipo})`)
      })

      if (cajasFiltradas.length === 0) {
        console.log(
          '      ⚠️  ADVERTENCIA: No hay cajas marcadas para Subsidio Caja'
        )
        console.log(
          '      💡 Solución: Ir a Panel Admin → Entidades Financieras'
        )
        console.log(
          '         y marcar las entidades aplicables para esta fuente'
        )
      }
    }
  }

  // 4. Verificar índice GIN
  console.log('\n\n⚡ 4. VERIFICACIÓN DE ÍNDICE GIN:')
  const { data: indices, error: errorIndices } = await supabase.rpc(
    'exec_sql',
    {
      sql: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'entidades_financieras'
          AND indexdef LIKE '%tipos_fuentes_aplicables%'
      `,
    }
  )

  if (errorIndices || !indices) {
    console.log('      ℹ️  No se pudo verificar índice (requiere permisos)')
  } else {
    if (indices.length > 0) {
      console.log('      ✅ Índice GIN encontrado:')
      indices.forEach(idx => {
        console.log(`         ${idx.indexname}`)
      })
    } else {
      console.log(
        '      ⚠️  No se encontró índice GIN para tipos_fuentes_aplicables'
      )
    }
  }

  // 5. Resumen y recomendaciones
  console.log('\n\n📊 RESUMEN:')
  console.log('='.repeat(80))
  const totalEntidades = entidades.length
  const entidadesConFuentes = entidades.filter(
    e => e.tipos_fuentes_aplicables && e.tipos_fuentes_aplicables.length > 0
  ).length

  console.log(`   • Total de entidades activas: ${totalEntidades}`)
  console.log(`   • Entidades con fuentes configuradas: ${entidadesConFuentes}`)
  console.log(
    `   • Entidades sin fuentes: ${totalEntidades - entidadesConFuentes}`
  )

  if (entidadesConFuentes === 0) {
    console.log('\n⚠️  ACCIÓN REQUERIDA:')
    console.log('   No hay entidades con fuentes de pago configuradas.')
    console.log('   Los selectores de banco/caja estarán vacíos.')
    console.log('\n📝 PASOS PARA CONFIGURAR:')
    console.log('   1. Ir a Panel Admin → Entidades Financieras')
    console.log('   2. Editar cada banco/caja')
    console.log('   3. Marcar las fuentes de pago aplicables')
    console.log('   4. Guardar cambios')
  } else if (entidadesConFuentes < totalEntidades) {
    console.log(
      `\n⚠️  ${totalEntidades - entidadesConFuentes} entidad(es) sin fuentes configuradas`
    )
    console.log('   Estas no aparecerán en los formularios de asignación.')
  } else {
    console.log('\n✅ Todas las entidades tienen fuentes configuradas')
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Verificación completada\n')
}

verificarSistemaFiltrado().catch(console.error)
