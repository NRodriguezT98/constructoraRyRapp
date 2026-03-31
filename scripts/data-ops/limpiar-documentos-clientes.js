/**
 * Limpieza completa de documentos de clientes
 * ─────────────────────────────────────────────
 * 1. Lista y elimina TODOS los archivos del bucket 'documentos-clientes'
 * 2. Elimina TODOS los registros de documentos_cliente en la BD
 *
 * Propósito: Empezar limpio con el nuevo sistema de FK (requisito_config_id)
 * sin datos legacy que puedan interferir con las pruebas.
 *
 * ⚠️  IRREVERSIBLE. Solo usar en desarrollo/staging.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET = 'documentos-clientes'

// ─────────────────────────────────────────────
// Listar archivos recursivamente (un nivel de subcarpetas)
// ─────────────────────────────────────────────
async function listarTodosLosArchivos() {
  const paths = []

  // Nivel raíz: carpetas = UUIDs de clientes
  const { data: carpetasRaiz, error: e1 } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 1000 })

  if (e1) throw new Error(`Error listando raíz: ${e1.message}`)
  if (!carpetasRaiz?.length) return paths

  for (const carpetaCliente of carpetasRaiz) {
    const clienteId = carpetaCliente.name

    // Nivel 2: subcarpetas = categorías
    const { data: subcarpetas, error: e2 } = await supabase.storage
      .from(BUCKET)
      .list(clienteId, { limit: 1000 })

    if (e2 || !subcarpetas?.length) continue

    for (const subcarpeta of subcarpetas) {
      // ¿Es archivo directo en carpeta cliente?
      if (!subcarpeta.id) {
        // Es subcarpeta (categoría)
        const categoriaPath = `${clienteId}/${subcarpeta.name}`

        const { data: archivos, error: e3 } = await supabase.storage
          .from(BUCKET)
          .list(categoriaPath, { limit: 1000 })

        if (e3 || !archivos?.length) continue

        for (const archivo of archivos) {
          paths.push(`${categoriaPath}/${archivo.name}`)
        }
      } else {
        // Archivo directo
        paths.push(`${clienteId}/${subcarpeta.name}`)
      }
    }
  }

  return paths
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function limpiar() {
  console.log('🧹 LIMPIEZA COMPLETA DE DOCUMENTOS DE CLIENTES')
  console.log('='.repeat(50))
  console.log(`Bucket: ${BUCKET}\n`)

  // ── 1. Storage ──────────────────────────────
  console.log('📦 PASO 1: Limpiando storage...')

  let paths
  try {
    paths = await listarTodosLosArchivos()
  } catch (err) {
    console.error('❌ Error listando storage:', err.message)
    process.exit(1)
  }

  if (paths.length === 0) {
    console.log('   ✅ Storage ya estaba vacío.\n')
  } else {
    console.log(`   Archivos encontrados: ${paths.length}`)

    // Eliminar en lotes de 100 (límite de Supabase Storage)
    const BATCH = 100
    let eliminados = 0

    for (let i = 0; i < paths.length; i += BATCH) {
      const lote = paths.slice(i, i + BATCH)
      const { error } = await supabase.storage.from(BUCKET).remove(lote)

      if (error) {
        console.error(`   ❌ Error en lote ${i / BATCH + 1}: ${error.message}`)
      } else {
        eliminados += lote.length
        console.log(`   🗑️  Eliminados ${eliminados}/${paths.length}`)
      }
    }

    console.log(`   ✅ Storage limpio (${eliminados} archivos eliminados).\n`)
  }

  // ── 2. Base de datos ─────────────────────────
  console.log('🗄️  PASO 2: Limpiando documentos_cliente (BD)...')

  const { count: countAntes } = await supabase
    .from('documentos_cliente')
    .select('*', { count: 'exact', head: true })

  console.log(`   Registros actuales: ${countAntes ?? '?'}`)

  if ((countAntes ?? 0) === 0) {
    console.log('   ✅ Tabla ya estaba vacía.\n')
  } else {
    // Eliminar todos — usamos .neq para que PostgREST no rechace sin WHERE
    const { error } = await supabase
      .from('documentos_cliente')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // DELETE * con filtro tautológico

    if (error) {
      console.error('❌ Error al eliminar registros:', error.message)
      console.error('   Detalle:', error)
      process.exit(1)
    }

    const { count: countDespues } = await supabase
      .from('documentos_cliente')
      .select('*', { count: 'exact', head: true })

    console.log(`   ✅ BD limpia. Registros restantes: ${countDespues ?? 0}\n`)
  }

  // ── Resumen ──────────────────────────────────
  console.log('='.repeat(50))
  console.log('✅ LIMPIEZA COMPLETA')
  console.log('')
  console.log('   Ahora puedes subir documentos desde el banner.')
  console.log('   Todos usarán requisito_config_id (FK) desde cero.')
}

limpiar().catch(err => {
  console.error('💥 Error inesperado:', err)
  process.exit(1)
})
