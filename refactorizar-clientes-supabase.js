/**
 * 🔧 SCRIPT DE REFACTORIZACIÓN AUTOMÁTICA
 * Reemplaza createBrowserClient de @supabase/ssr por el cliente singleton estándar
 *
 * OBJETIVO: Unificar TODOS los clientes de Supabase en Client Components
 * SEGURIDAD: Solo modifica archivos .ts y .tsx (no .md)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Archivos a refactorizar (encontrados con grep)
const archivosParaRefactorizar = [
  'src/modules/admin/procesos/services/plantilla-reload.service.ts',
  'src/modules/admin/procesos/services/documentos-proceso.service.ts',
  'src/modules/admin/procesos/hooks/useProgresoCliente.ts',
  'src/modules/admin/procesos/hooks/useTimelineProceso.ts',
  'src/modules/admin/procesos/services/procesos.service.ts',
  'src/modules/admin/procesos/components/paso-plantilla-item.tsx',
  'src/modules/abonos/services/validacion-desembolsos.service.ts',
  'src/lib/utils/slug.utils.ts',
  'src/app/clientes/[id]/tabs/actividad-tab.tsx',
]

const reporte = {
  total: 0,
  exitosos: 0,
  fallidos: 0,
  detalles: [],
}

console.log('🔍 INICIANDO REFACTORIZACIÓN AUTOMÁTICA DE CLIENTES SUPABASE\n')
console.log('═'.repeat(70))

archivosParaRefactorizar.forEach((archivoRelativo) => {
  const rutaCompleta = path.join(__dirname, archivoRelativo)
  reporte.total++

  console.log(`\n📄 Procesando: ${archivoRelativo}`)

  try {
    // Verificar que existe
    if (!fs.existsSync(rutaCompleta)) {
      throw new Error('Archivo no encontrado')
    }

    // Leer contenido
    let contenido = fs.readFileSync(rutaCompleta, 'utf-8')
    const contenidoOriginal = contenido

    // Contador de cambios
    let cambios = 0

    // 1. Reemplazar import
    if (contenido.includes("import { createBrowserClient } from '@supabase/ssr'")) {
      contenido = contenido.replace(
        /import { createBrowserClient } from '@supabase\/ssr'/g,
        "import { createClient } from '@/lib/supabase/client'"
      )
      cambios++
      console.log('  ✓ Import reemplazado')
    }

    // 2. Reemplazar creación de cliente (patrón 1: const supabase = createBrowserClient(...))
    const patronCliente1 = /const supabase = createBrowserClient\([^)]*\)/g
    if (patronCliente1.test(contenido)) {
      contenido = contenido.replace(
        /const supabase = createBrowserClient\([^)]*\)/g,
        'const supabase = createClient()'
      )
      cambios++
      console.log('  ✓ Creación de cliente reemplazada (patrón directo)')
    }

    // 3. Reemplazar creación de cliente (patrón 2: multi-línea)
    const patronCliente2 = /const supabase = createBrowserClient\(\s*process\.env[^)]*\s*\)/gs
    if (patronCliente2.test(contenido)) {
      contenido = contenido.replace(
        /const supabase = createBrowserClient\(\s*process\.env[^)]*\s*\)/gs,
        'const supabase = createClient()'
      )
      cambios++
      console.log('  ✓ Creación de cliente reemplazada (patrón multi-línea)')
    }

    // 4. Reemplazar import dinámico (useProgresoCliente.ts)
    if (contenido.includes("const { createBrowserClient } = await import('@supabase/ssr')")) {
      contenido = contenido.replace(
        /const { createBrowserClient } = await import\('@supabase\/ssr'\)/g,
        "const { createClient } = await import('@/lib/supabase/client')"
      )
      cambios++
      console.log('  ✓ Import dinámico reemplazado')
    }

    // Verificar si hubo cambios
    if (contenido === contenidoOriginal) {
      console.log('  ⚠️  No se detectaron patrones para reemplazar')
      reporte.detalles.push({
        archivo: archivoRelativo,
        estado: 'sin_cambios',
        cambios: 0,
      })
    } else {
      // Guardar archivo modificado
      fs.writeFileSync(rutaCompleta, contenido, 'utf-8')
      console.log(`  ✅ Archivo refactorizado exitosamente (${cambios} cambios)`)
      reporte.exitosos++
      reporte.detalles.push({
        archivo: archivoRelativo,
        estado: 'exitoso',
        cambios,
      })
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
    reporte.fallidos++
    reporte.detalles.push({
      archivo: archivoRelativo,
      estado: 'fallido',
      error: error.message,
    })
  }
})

// Reporte final
console.log('\n')
console.log('═'.repeat(70))
console.log('📊 REPORTE FINAL DE REFACTORIZACIÓN')
console.log('═'.repeat(70))
console.log(`Total de archivos: ${reporte.total}`)
console.log(`✅ Exitosos: ${reporte.exitosos}`)
console.log(`❌ Fallidos: ${reporte.fallidos}`)
console.log(`⚠️  Sin cambios: ${reporte.total - reporte.exitosos - reporte.fallidos}`)

if (reporte.exitosos > 0) {
  console.log('\n🎉 REFACTORIZACIÓN COMPLETADA')
  console.log('\n⚠️  SIGUIENTES PASOS:')
  console.log('1. Verifica que la app compile: npm run build')
  console.log('2. Prueba las funcionalidades afectadas')
  console.log('3. Haz commit de los cambios')
}

// Generar archivo de log
const logPath = path.join(__dirname, 'refactorizacion-supabase-cliente.log.json')
fs.writeFileSync(logPath, JSON.stringify(reporte, null, 2))
console.log(`\n📄 Log guardado en: refactorizacion-supabase-cliente.log.json`)
