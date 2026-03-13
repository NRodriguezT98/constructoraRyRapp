/**
 * Script para verificar historial de versiones de negociaciones
 * Ejecutar: node verificar-historial.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarHistorial() {
  console.log('\n🔍 VERIFICANDO HISTORIAL DE VERSIONES\n')

  // 1. Obtener negociación de Luis David
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombres, apellidos')
    .order('fecha_creacion', { ascending: false })
    .limit(10)

  console.log('📋 Últimos clientes:')
  clientes?.forEach(c => console.log(`   - ${c.nombres} ${c.apellidos} (${c.id})`))
  console.log('')

  const cliente = clientes?.[0]

  if (!cliente) {
    console.log('❌ Cliente no encontrado')
    return
  }

  console.log(`✅ Cliente: ${cliente.nombres} ${cliente.apellidos}`)
  console.log(`   ID: ${cliente.id}\n`)

  // 2. Obtener negociación
  const { data: negociacion } = await supabase
    .from('negociaciones')
    .select('id, version_actual, version_lock, fecha_ultima_modificacion, estado')
    .eq('cliente_id', cliente.id)
    .limit(1)
    .single()

  if (!negociacion) {
    console.log('❌ Negociación no encontrada')
    return
  }

  console.log('📊 ESTADO ACTUAL DE LA NEGOCIACIÓN:')
  console.log(`   ID: ${negociacion.id}`)
  console.log(`   Estado: ${negociacion.estado}`)
  console.log(`   Version Actual: ${negociacion.version_actual}`)
  console.log(`   Version Lock: ${negociacion.version_lock}`)
  console.log(`   Última Modificación: ${negociacion.fecha_ultima_modificacion}\n`)

  // 3. Obtener historial de snapshots
  const { data: historial } = await supabase
    .from('negociaciones_historial')
    .select('version, tipo_cambio, razon_cambio, fecha_cambio, campos_modificados')
    .eq('negociacion_id', negociacion.id)
    .order('version', { ascending: false })

  console.log(`📚 HISTORIAL DE VERSIONES (${historial?.length || 0} snapshots):\n`)

  if (historial && historial.length > 0) {
    historial.forEach((h, i) => {
      console.log(`   ${i + 1}. Version ${h.version}`)
      console.log(`      Tipo: ${h.tipo_cambio}`)
      console.log(`      Razón: ${h.razon_cambio}`)
      console.log(`      Fecha: ${new Date(h.fecha_cambio).toLocaleString('es-CO')}`)
      console.log(`      Campos: ${h.campos_modificados?.join(', ') || 'N/A'}`)
      console.log('')
    })
  } else {
    console.log('   ⚠️  No hay snapshots registrados aún')
  }

  // 4. Obtener fuentes de pago (activas e inactivas)
  const { data: fuentes } = await supabase
    .from('fuentes_pago')
    .select('tipo, monto_aprobado, monto_recibido, estado_fuente, fecha_creacion, razon_inactivacion')
    .eq('negociacion_id', negociacion.id)
    .order('fecha_creacion', { ascending: false })

  console.log(`💰 FUENTES DE PAGO (${fuentes?.length || 0} total):\n`)

  if (fuentes && fuentes.length > 0) {
    fuentes.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.tipo}`)
      console.log(`      Monto: $${f.monto_aprobado.toLocaleString('es-CO')}`)
      console.log(`      Recibido: $${f.monto_recibido.toLocaleString('es-CO')}`)
      console.log(`      Estado: ${f.estado_fuente}`)
      console.log(`      Fecha Creación: ${new Date(f.fecha_creacion).toLocaleString('es-CO')}`)
      if (f.razon_inactivacion) {
        console.log(`      Razón Inactivación: ${f.razon_inactivacion}`)
      }
      console.log('')
    })
  }

  console.log('✅ Verificación completa\n')
}

verificarHistorial().catch(console.error)
