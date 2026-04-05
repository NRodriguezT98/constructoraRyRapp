/**
 * Script para extraer categorías actuales de clientes desde Supabase
 * Genera archivo TypeScript con UUIDs fijos para auto-seeding
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://swyjhwgvkfcfdtemkyad.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function extraerCategoriasClientes() {
  console.log('🔍 Extrayendo categorías del módulo clientes...\n')

  const { data, error } = await supabase
    .from('categorias_documento')
    .select('*')
    .contains('modulos_permitidos', ['clientes'])
    .order('orden', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No se encontraron categorías para el módulo clientes')
    return
  }

  console.log(`✅ ${data.length} categorías encontradas:\n`)

  // Generar código TypeScript
  const categorias = data.map(cat => {
    console.log(`  - ${cat.nombre} (${cat.id})`)

    return {
      id: cat.id,
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      color: cat.color,
      icono: cat.icono,
      orden: cat.orden,
      es_sistema: cat.es_sistema,
      modulos_permitidos: cat.modulos_permitidos,
    }
  })

  console.log('\n📋 Código TypeScript generado:\n')
  console.log('='.repeat(80))
  console.log(generarCodigoTypeScript(categorias))
  console.log('='.repeat(80))
}

function generarCodigoTypeScript(categorias) {
  const categoriasCode = categorias
    .map(cat => {
      return `  {
    id: '${cat.id}',
    nombre: '${cat.nombre}',
    descripcion: ${cat.descripcion ? `'${cat.descripcion}'` : 'null'},
    color: '${cat.color}',
    icono: '${cat.icono}',
    orden: ${cat.orden},
    es_sistema: ${cat.es_sistema},
    modulos_permitidos: ['clientes']
  }`
    })
    .join(',\n')

  return `/**
 * Categorías del sistema para módulo CLIENTES
 * ⚠️ UUIDs FIJOS: NO modificar, usados en triggers y validaciones
 *
 * Estas categorías se crean automáticamente si no existen.
 * Se recrean con los mismos UUIDs si se eliminan.
 */
export const CATEGORIAS_SISTEMA_CLIENTES = [
${categoriasCode}
] as const

// ✅ IDs tipados para usar en código
export const CATEGORIA_IDS = {
${categorias
  .map(cat => {
    const key = cat.nombre
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, '_')
    return `  ${key}: '${cat.id}' as const`
  })
  .join(',\n')}
} as const`
}

extraerCategoriasClientes().catch(console.error)
