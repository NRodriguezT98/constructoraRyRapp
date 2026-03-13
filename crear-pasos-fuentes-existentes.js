/**
 * ============================================
 * SCRIPT: Crear pasos de validación para fuentes existentes
 * ============================================
 *
 * Este script crea pasos de validación para todas las fuentes de pago
 * que requieren validación pero no tienen pasos asociados.
 *
 * Uso:
 * node crear-pasos-fuentes-existentes.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuración de requisitos por tipo de fuente
const REQUISITOS_POR_TIPO = {
  'Crédito Hipotecario': [
    {
      paso: 1,
      titulo: 'Carta de aprobación del crédito',
      descripcion: 'Carta oficial de la entidad financiera aprobando el crédito hipotecario',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Carta de Aprobación',
      categoria_documento_requerida: 'Cartas de Aprobación',
    },
    {
      paso: 2,
      titulo: 'Cédula del titular del crédito',
      descripcion: 'Documento de identidad del titular del crédito hipotecario',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Cédula',
      categoria_documento_requerida: 'Documentos de Identidad',
    },
    {
      paso: 3,
      titulo: 'Extracto bancario reciente',
      descripcion: 'Extracto de cuenta donde se depositará el desembolso',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Extracto Bancario',
      categoria_documento_requerida: 'Documentos Financieros',
    },
    {
      paso: 4,
      titulo: 'Certificado de tradición de la vivienda',
      descripcion: 'Certificado de tradición actualizado del inmueble',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Certificado de Tradición',
      categoria_documento_requerida: 'Documentos Legales',
    },
  ],
  'Subsidio Mi Casa Ya': [
    {
      paso: 1,
      titulo: 'Carta de asignación del subsidio',
      descripcion: 'Carta oficial de asignación del subsidio Mi Casa Ya',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Carta de Asignación',
      categoria_documento_requerida: 'Cartas de Asignación',
    },
    {
      paso: 2,
      titulo: 'Cédula del beneficiario',
      descripcion: 'Documento de identidad del beneficiario del subsidio',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Cédula',
      categoria_documento_requerida: 'Documentos de Identidad',
    },
    {
      paso: 3,
      titulo: 'Certificado de elegibilidad SISBEN',
      descripcion: 'Certificado vigente de SISBEN o equivalente',
      nivel_validacion: 'DOCUMENTO_OPCIONAL',
      tipo_documento_requerido: 'Certificado SISBEN',
      categoria_documento_requerida: 'Documentos Financieros',
    },
  ],
  'Subsidio Caja Compensación': [
    {
      paso: 1,
      titulo: 'Carta de asignación del subsidio',
      descripcion: 'Carta oficial de asignación del subsidio de la caja',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Carta de Asignación',
      categoria_documento_requerida: 'Cartas de Asignación',
    },
    {
      paso: 2,
      titulo: 'Cédula del afiliado',
      descripcion: 'Documento de identidad del afiliado a la caja',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Cédula',
      categoria_documento_requerida: 'Documentos de Identidad',
    },
    {
      paso: 3,
      titulo: 'Certificado de afiliación vigente',
      descripcion: 'Certificado de afiliación activa a la caja de compensación',
      nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_requerido: 'Certificado Afiliación',
      categoria_documento_requerida: 'Documentos Laborales',
    },
  ],
}

async function main() {
  console.log('🚀 Iniciando creación de pasos de validación...\n')

  // Obtener todas las fuentes de pago sin pasos
  const { data: fuentes, error: errorFuentes } = await supabase
    .from('fuentes_pago')
    .select('id, tipo, negociacion_id, monto_aprobado, entidad')
    .in('tipo', Object.keys(REQUISITOS_POR_TIPO))

  if (errorFuentes) {
    console.error('❌ Error obteniendo fuentes:', errorFuentes)
    return
  }

  console.log(`📊 Encontradas ${fuentes?.length || 0} fuentes que requieren validación\n`)

  if (!fuentes || fuentes.length === 0) {
    console.log('✅ No hay fuentes que requieran pasos')
    return
  }

  let creados = 0
  let omitidos = 0
  let errores = 0

  for (const fuente of fuentes) {
    console.log(`\n📝 Procesando fuente: ${fuente.tipo} (${fuente.id})`)

    // Verificar si ya tiene pasos
    const { data: pasosExistentes } = await supabase
      .from('pasos_fuente_pago')
      .select('id')
      .eq('fuente_pago_id', fuente.id)
      .limit(1)

    if (pasosExistentes && pasosExistentes.length > 0) {
      console.log(`   ℹ️  Ya tiene pasos, omitiendo...`)
      omitidos++
      continue
    }

    // Obtener requisitos para este tipo
    const requisitos = REQUISITOS_POR_TIPO[fuente.tipo as keyof typeof REQUISITOS_POR_TIPO]

    if (!requisitos) {
      console.log(`   ⚠️  Sin configuración de requisitos`)
      continue
    }

    // Crear pasos
    const pasosParaCrear = requisitos.map((req) => ({
      fuente_pago_id: fuente.id,
      ...req,
    }))

    const { error: errorPasos } = await supabase.from('pasos_fuente_pago').insert(pasosParaCrear)

    if (errorPasos) {
      console.error(`   ❌ Error creando pasos:`, errorPasos.message)
      errores++
    } else {
      console.log(`   ✅ ${requisitos.length} pasos creados`)
      creados++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Fuentes procesadas: ${creados}`)
  console.log(`   ℹ️  Fuentes omitidas (ya tenían pasos): ${omitidos}`)
  console.log(`   ❌ Errores: ${errores}`)
  console.log('='.repeat(50))
  console.log('\n✨ Proceso completado')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
