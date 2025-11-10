/**
 * LIMPIEZA COMPLETA DE BASE DE DATOS Y STORAGE
 * Elimina TODOS los datos excepto plantillas de proceso
 *
 * ⚠️ ESTE SCRIPT ES DESTRUCTIVO - Solo para desarrollo
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiezaCompleta() {
  console.log('🧹 LIMPIEZA COMPLETA DE BASE DE DATOS Y STORAGE')
  console.log('⚠️  Esta acción NO se puede deshacer\n')
  console.log('📋 Se preservarán:')
  console.log('   ✅ Plantillas de proceso')
  console.log('   ✅ Usuarios y autenticación')
  console.log('   ✅ Categorías del sistema\n')
  console.log('🗑️  Se eliminarán:')
  console.log('   ❌ Proyectos y manzanas')
  console.log('   ❌ Viviendas')
  console.log('   ❌ Clientes')
  console.log('   ❌ Negociaciones y abonos')
  console.log('   ❌ Documentos')
  console.log('   ❌ Archivos en Storage')
  console.log('   ❌ Auditorías\n')

  // PASO 1: Limpiar Storage
  console.log('🗄️  PASO 1: Limpiando Storage...\n')
  await limpiarStorage()

  // PASO 2: Limpiar tablas relacionadas (orden importante por FKs)
  console.log('\n🗄️  PASO 2: Limpiando base de datos...\n')
  await limpiarBaseDatos()

  console.log('\n✅ LIMPIEZA COMPLETA FINALIZADA')
  console.log('🎯 Sistema listo para datos frescos\n')
}

async function limpiarStorage() {
  const buckets = [
    'documentos-viviendas',
    'documentos-proyectos',
    'documentos-negociaciones',
    'documentos-clientes'
  ]

  for (const bucket of buckets) {
    console.log(`📦 Limpiando bucket: ${bucket}`)

    try {
      // Listar todas las carpetas
      const { data: folders, error: listError } = await supabase.storage
        .from(bucket)
        .list()

      if (listError) {
        console.log(`   ⚠️  Error al listar: ${listError.message}`)
        continue
      }

      if (!folders || folders.length === 0) {
        console.log(`   ✓ Bucket vacío`)
        continue
      }

      let totalEliminados = 0

      // Eliminar archivos de cada carpeta
      for (const folder of folders) {
        if (!folder.id) continue

        const { data: files } = await supabase.storage
          .from(bucket)
          .list(folder.name)

        if (files && files.length > 0) {
          const paths = files.map(f => `${folder.name}/${f.name}`)

          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(paths)

          if (!deleteError) {
            totalEliminados += files.length
          }
        }
      }

      console.log(`   ✓ ${totalEliminados} archivos eliminados`)
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`)
    }
  }
}

async function limpiarBaseDatos() {
  const tablas = [
    // Orden importante: primero las dependientes
    { nombre: 'auditoria', descripcion: 'Auditorías' },
    { nombre: 'documentos_vivienda', descripcion: 'Documentos de viviendas' },
    { nombre: 'documentos_negociacion', descripcion: 'Documentos de negociaciones' },
    { nombre: 'abonos', descripcion: 'Abonos' },
    { nombre: 'recargos', descripcion: 'Recargos' },
    { nombre: 'negociaciones', descripcion: 'Negociaciones' },
    { nombre: 'renuncias', descripcion: 'Renuncias' },
    { nombre: 'viviendas', descripcion: 'Viviendas' },
    { nombre: 'manzanas', descripcion: 'Manzanas' },
    { nombre: 'proyectos', descripcion: 'Proyectos' },
    { nombre: 'clientes', descripcion: 'Clientes' },
  ]

  for (const tabla of tablas) {
    console.log(`🗑️  Eliminando: ${tabla.descripcion}`)

    try {
      const { error, count } = await supabase
        .from(tabla.nombre)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos

      if (error) {
        console.log(`   ⚠️  Error: ${error.message}`)
      } else {
        console.log(`   ✓ Tabla limpia`)
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`)
    }
  }

  // Limpiar categorías NO del sistema
  console.log(`🗑️  Eliminando: Categorías personalizadas`)
  try {
    const { error } = await supabase
      .from('categorias_documento')
      .delete()
      .eq('es_sistema', false)

    if (error) {
      console.log(`   ⚠️  Error: ${error.message}`)
    } else {
      console.log(`   ✓ Categorías personalizadas eliminadas`)
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`)
  }
}

// Estadísticas finales
async function mostrarEstadisticas() {
  console.log('\n📊 ESTADÍSTICAS FINALES:\n')

  const tablas = [
    'proyectos',
    'manzanas',
    'viviendas',
    'clientes',
    'negociaciones',
    'abonos',
    'documentos_vivienda',
    'plantillas_proceso',
    'categorias_documento'
  ]

  for (const tabla of tablas) {
    const { count } = await supabase
      .from(tabla)
      .select('*', { count: 'exact', head: true })

    const icono = count === 0 ? '✅' : '📊'
    console.log(`${icono} ${tabla}: ${count || 0} registros`)
  }

  // Verificar Storage
  console.log('\n📦 STORAGE:')
  const buckets = ['documentos-viviendas', 'documentos-proyectos']

  for (const bucket of buckets) {
    const { data: folders } = await supabase.storage
      .from(bucket)
      .list()

    let totalArchivos = 0
    if (folders) {
      for (const folder of folders) {
        if (folder.id) {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(folder.name)
          totalArchivos += files?.length || 0
        }
      }
    }

    const icono = totalArchivos === 0 ? '✅' : '📦'
    console.log(`${icono} ${bucket}: ${totalArchivos} archivos`)
  }
}

// Ejecutar limpieza
limpiezaCompleta()
  .then(() => mostrarEstadisticas())
  .then(() => {
    console.log('\n🎉 Sistema limpio y listo para usar')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
