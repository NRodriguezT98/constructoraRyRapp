/**
 * ============================================
 * VERIFICAR: Sistema de Versionado Integrado
 * ============================================
 * Prueba que todo esté conectado correctamente
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarSistema() {
  console.log('🔍 VERIFICANDO SISTEMA DE VERSIONADO...\n')

  try {
    // 1. Verificar que no hay triggers automáticos
    console.log('1️⃣ Verificando triggers...')
    const { data: triggers } = await supabase.rpc('pg_catalog.pg_get_triggerdef', {})
    const triggersActivos = triggers?.filter(t => t?.includes('fuentes_pago')) || []

    if (triggersActivos.length === 0) {
      console.log('✅ No hay triggers automáticos en fuentes_pago (correcto)')
    } else {
      console.log('⚠️ Triggers encontrados:', triggersActivos)
    }

    // 2. Verificar últimos snapshots
    console.log('\n2️⃣ Últimos 5 snapshots creados...')
    const { data: snapshots, error } = await supabase
      .from('negociaciones_historial')
      .select('version, tipo_cambio, razon_cambio, datos_nuevos, fecha_cambio')
      .order('fecha_cambio', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error consultando snapshots:', error)
      return
    }

    if (snapshots.length === 0) {
      console.log('ℹ️ No hay snapshots aún (normal si es primera vez)')
    } else {
      snapshots.forEach((s, i) => {
        console.log(`\nSnapshot ${i + 1}:`)
        console.log(`  v${s.version} | ${s.tipo_cambio}`)
        console.log(`  Razón: ${s.razon_cambio}`)

        if (s.datos_nuevos?.motivo_usuario) {
          console.log(`  ✅ Motivo del usuario: "${s.datos_nuevos.motivo_usuario}"`)
        }

        if (s.datos_nuevos?.resumen) {
          console.log(`  📊 Resumen:`, s.datos_nuevos.resumen)
        }

        console.log(`  📅 ${new Date(s.fecha_cambio).toLocaleString('es-CO')}`)
      })
    }

    // 3. Verificar versiones secuenciales
    console.log('\n3️⃣ Verificando secuencia de versiones...')
    const { data: negociaciones } = await supabase
      .from('negociaciones')
      .select('id, version_actual')
      .not('version_actual', 'is', null)
      .order('version_actual', { ascending: false })
      .limit(5)

    if (negociaciones && negociaciones.length > 0) {
      console.log('✅ Negociaciones con versiones:')
      negociaciones.forEach(n => {
        console.log(`  ID: ${n.id.substring(0, 8)}... | Versión actual: v${n.version_actual}`)
      })
    }

    // 4. Verificar estructura de datos_nuevos
    console.log('\n4️⃣ Verificando estructura de datos_nuevos...')
    const ultimoSnapshot = snapshots[0]
    if (ultimoSnapshot?.datos_nuevos) {
      const estructura = {
        tiene_motivo_usuario: !!ultimoSnapshot.datos_nuevos.motivo_usuario,
        tiene_resumen: !!ultimoSnapshot.datos_nuevos.resumen,
        tiene_fuentes_finales: !!ultimoSnapshot.datos_nuevos.fuentes_finales,
      }

      console.log('Estructura del snapshot:')
      console.log(estructura)

      if (estructura.tiene_motivo_usuario && estructura.tiene_resumen) {
        console.log('✅ Estructura correcta con motivo y resumen')
      } else {
        console.log('⚠️ Falta motivo_usuario o resumen (puede ser snapshot antiguo)')
      }
    }

    console.log('\n✅ VERIFICACIÓN COMPLETA')

  } catch (error) {
    console.error('❌ Error en verificación:', error)
  }
}

verificarSistema()
