/**
 * Verificación del estado del sistema después de limpieza
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarSistema() {
  console.log('🔍 VERIFICACIÓN FINAL DEL SISTEMA\n')
  console.log('='.repeat(60))

  // 1. Base de datos
  console.log('\n📊 BASE DE DATOS:\n')

  const tablas = [
    { nombre: 'proyectos', descripcion: 'Proyectos' },
    { nombre: 'manzanas', descripcion: 'Manzanas' },
    { nombre: 'viviendas', descripcion: 'Viviendas' },
    { nombre: 'clientes', descripcion: 'Clientes' },
    { nombre: 'negociaciones', descripcion: 'Negociaciones' },
    { nombre: 'documentos_vivienda', descripcion: 'Documentos de viviendas' },
    { nombre: 'renuncias', descripcion: 'Renuncias' },
    { nombre: 'plantillas_proceso', descripcion: 'Plantillas de proceso (PRESERVADO)' },
    { nombre: 'categorias_documento', descripcion: 'Categorías de documentos (SISTEMA)' },
  ]

  for (const tabla of tablas) {
    const { count, error } = await supabase
      .from(tabla.nombre)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`⚠️  ${tabla.descripcion}: Error - ${error.message}`)
    } else {
      const icono = count === 0 ? '✅' : '📊'
      const estado = count === 0 ? 'LIMPIO' : `${count} registros`
      console.log(`${icono} ${tabla.descripcion.padEnd(40)} ${estado}`)
    }
  }

  // Detalles de plantillas
  const { data: plantillas } = await supabase
    .from('plantillas_proceso')
    .select('*')

  if (plantillas && plantillas.length > 0) {
    console.log('\n📋 PLANTILLAS PRESERVADAS:')
    plantillas.forEach(p => {
      console.log(`   • ${p.nombre}`)
    })
  }

  // Detalles de categorías
  const { data: categorias } = await supabase
    .from('categorias_documento')
    .select('nombre, es_sistema')
    .order('nombre')

  if (categorias && categorias.length > 0) {
    console.log('\n📁 CATEGORÍAS DE DOCUMENTOS:')
    categorias.forEach(c => {
      const tipo = c.es_sistema ? '[SISTEMA]' : '[CUSTOM]'
      console.log(`   • ${c.nombre.padEnd(30)} ${tipo}`)
    })
  }

  // 2. Storage
  console.log('\n📦 STORAGE:\n')

  const buckets = ['documentos-viviendas', 'documentos-proyectos']

  for (const bucket of buckets) {
    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 })

    if (error) {
      console.log(`⚠️  ${bucket}: Error - ${error.message}`)
    } else {
      let totalArchivos = 0

      if (items) {
        for (const item of items) {
          if (item.id) {
            const { data: files } = await supabase.storage
              .from(bucket)
              .list(item.name)
            totalArchivos += files?.length || 0
          }
        }
      }

      const icono = totalArchivos === 0 ? '✅' : '📦'
      const estado = totalArchivos === 0 ? 'LIMPIO' : `${totalArchivos} archivos`
      console.log(`${icono} ${bucket.padEnd(30)} ${estado}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n🎉 SISTEMA LISTO PARA DATOS FRESCOS')
  console.log('\n✅ Próximos pasos:')
  console.log('   1. Crear primer proyecto')
  console.log('   2. Agregar manzanas y viviendas')
  console.log('   3. Registrar clientes')
  console.log('   4. Subir documentos\n')
}

verificarSistema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
